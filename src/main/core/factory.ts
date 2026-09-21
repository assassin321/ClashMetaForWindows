import { copyFile, mkdir, readFile, stat } from 'fs/promises'
import vm from 'vm'
import { existsSync, writeFileSync } from 'fs'
import path from 'path'
import { isIP } from 'net'
import {
  getControledMihomoConfig,
  getProfileConfig,
  getProfile,
  getProfileItem,
  getOverride,
  getOverrideItem,
  getOverrideConfig,
  getAppConfig
} from '../config'
import {
  mihomoProfileWorkDir,
  mihomoWorkConfigPath,
  mihomoWorkDir,
  overridePath,
  rulePath
} from '../utils/dirs'
import { parse, stringify } from '../utils/yaml'
import { deepMerge } from '../utils/merge'
import { createLogger } from '../utils/logger'
import { decryptAgeContent } from '../utils/age'
import { DEFAULT_CONTROL_DNS, DEFAULT_CONTROL_SNIFF } from '../../shared/appConfig'
import { atomicWriteFile } from '../utils/safeFile'
import { evaluateDnsOverrideGuard, type DnsOverrideGuardResult } from './dnsOverrideGuard'

const factoryLogger = createLogger('Factory')

let runtimeConfigStr: string = ''
let runtimeConfig: IMihomoConfig = {} as IMihomoConfig

interface GenerateProfileOptions {
  profileId?: string
  baseProfile?: IMihomoConfig
  ageSecretKey?: string
  profileOverrideIds?: string[]
  // 调用方已读取的全局 override id 集合：给出时不再自行读取，生成所用的集合与调用方记录的完全一致
  //（插件订阅校验用它把"参与校验的集合"绑定到校验本身）
  globalOverrideIds?: string[]
  outputPath?: string
  updateRuntimeConfig?: boolean
}

export interface GenerateProfileResult {
  profileId: string | undefined
  // 随本次配置成功应用后同步。
  dnsGuard: DnsOverrideGuardResult
}

export async function globalOverrideIdsNow(): Promise<string[]> {
  const { items = [] } = (await getOverrideConfig()) || {}
  return items.filter((item) => item.global).map((item) => item.id)
}

// 辅助函数：处理带偏移量的规则
function processRulesWithOffset(ruleStrings: string[], currentRules: string[], isAppend = false) {
  const normalRules: string[] = []
  const rules = [...currentRules]

  ruleStrings.forEach((ruleStr) => {
    const parts = ruleStr.split(',')
    const firstPartIsNumber =
      !isNaN(Number(parts[0])) && parts[0].trim() !== '' && parts.length >= 3

    if (firstPartIsNumber) {
      const offset = parseInt(parts[0])
      const rule = parts.slice(1).join(',')

      if (isAppend) {
        // 后置规则的插入位置计算
        const insertPosition = Math.max(0, rules.length - Math.min(offset, rules.length))
        rules.splice(insertPosition, 0, rule)
      } else {
        // 前置规则的插入位置计算
        const insertPosition = Math.min(offset, rules.length)
        rules.splice(insertPosition, 0, rule)
      }
    } else {
      normalRules.push(ruleStr)
    }
  })

  return { normalRules, insertRules: rules }
}

async function applyRuleOverride(
  current: string | undefined,
  profile: IMihomoConfig
): Promise<IMihomoConfig> {
  try {
    const ruleFilePath = rulePath(current || 'default')
    if (!existsSync(ruleFilePath)) {
      return profile
    }

    const ruleFileContent = await readFile(ruleFilePath, 'utf-8')
    const ruleData = parse(ruleFileContent) as {
      prepend?: string[]
      append?: string[]
      delete?: string[]
    } | null

    if (!ruleData || typeof ruleData !== 'object') {
      return profile
    }

    if (!profile.rules) {
      profile.rules = [] as unknown as []
    }

    let rules = [...profile.rules] as unknown as string[]

    if (ruleData.prepend?.length) {
      const { normalRules: prependRules, insertRules } = processRulesWithOffset(
        ruleData.prepend,
        rules
      )
      rules = [...prependRules, ...insertRules]
    }

    if (ruleData.append?.length) {
      const { normalRules: appendRules, insertRules } = processRulesWithOffset(
        ruleData.append,
        rules,
        true
      )
      rules = [...insertRules, ...appendRules]
    }

    if (ruleData.delete?.length) {
      const deleteSet = new Set(ruleData.delete)
      rules = rules.filter((rule) => {
        const ruleStr = Array.isArray(rule) ? rule.join(',') : rule
        return !deleteSet.has(ruleStr)
      })
    }

    profile.rules = rules as unknown as []
    return profile
  } catch (error) {
    factoryLogger.error('Failed to read or apply rule file', error)
    return profile
  }
}

async function prepareProfileWorkDir(current: string | undefined): Promise<void> {
  if (!existsSync(mihomoProfileWorkDir(current))) {
    await mkdir(mihomoProfileWorkDir(current), { recursive: true })
  }

  const isSourceNewer = async (sourcePath: string, targetPath: string): Promise<boolean> => {
    try {
      const [sourceStats, targetStats] = await Promise.all([stat(sourcePath), stat(targetPath)])
      return sourceStats.mtime > targetStats.mtime
    } catch {
      return true
    }
  }

  const copy = async (file: string): Promise<void> => {
    const targetPath = path.join(mihomoProfileWorkDir(current), file)
    const sourcePath = path.join(mihomoWorkDir(), file)
    if (!existsSync(sourcePath)) return
    // 复制条件：目标不存在 或 源文件更新
    const shouldCopy = !existsSync(targetPath) || (await isSourceNewer(sourcePath, targetPath))
    if (shouldCopy) {
      await copyFile(sourcePath, targetPath)
    }
  }
  await Promise.all([
    copy('country.mmdb'),
    copy('geoip.metadb'),
    copy('geoip.dat'),
    copy('geosite.dat'),
    copy('ASN.mmdb'),
    copy('BundleMRS.7z'),
    copy('Model.bin')
  ])
}

async function applyOverrides(
  profile: IMihomoConfig,
  overrideIds: string[],
  ageSecretKey: string
): Promise<IMihomoConfig> {
  for (const ov of overrideIds) {
    const item = await getOverrideItem(ov)
    const content = await getOverride(ov, item?.ext || 'js')
    switch (item?.ext) {
      case 'js':
        profile = runOverrideScript(profile, content, item)
        break
      case 'yaml': {
        const decryptedContent = await decryptAgeContent(content, ageSecretKey, `override "${ov}"`)
        let patch = parse(decryptedContent) || {}
        if (typeof patch !== 'object') patch = {}
        profile = deepMerge(profile, patch, true)
        break
      }
    }
  }
  return profile
}

function runOverrideScript(
  profile: IMihomoConfig,
  script: string,
  item: IOverrideItem
): IMihomoConfig {
  const log = (type: string, data: string, flag = 'a'): void => {
    writeFileSync(overridePath(item.id, 'log'), `[${type}] ${data}\n`, {
      encoding: 'utf-8',
      flag
    })
  }
  try {
    const ctx = {
      console: Object.freeze({
        log(data: never) {
          log('log', JSON.stringify(data))
        },
        info(data: never) {
          log('info', JSON.stringify(data))
        },
        error(data: never) {
          log('error', JSON.stringify(data))
        },
        debug(data: never) {
          log('debug', JSON.stringify(data))
        }
      })
    }
    vm.createContext(ctx)
    const code = `${script} main(${JSON.stringify(profile)})`
    log('info', '开始执行脚本', 'w')
    const newProfile = vm.runInContext(code, ctx)
    if (typeof newProfile !== 'object') {
      throw new Error('脚本返回值必须是对象')
    }
    log('info', '脚本执行成功')
    return newProfile
  } catch (e) {
    log('exception', `脚本执行失败：${e}`)
    return profile
  }
}

export async function getRuntimeConfigStr(): Promise<string> {
  return runtimeConfigStr
}

export async function getRuntimeConfig(): Promise<IMihomoConfig> {
  return runtimeConfig
}
