import path from 'path'
import axios from 'axios'
import { app, dialog } from 'electron'
import { parse, stringify } from '../utils/yaml'
import { atomicWriteFile } from '../utils/safeFile'
import { deepMerge } from '../utils/merge'
import {
  SIMPLE_BUILTIN_OUTBOUNDS,
  SIMPLE_GENERAL_CONFIG_KEYS,
  SIMPLE_MODULES,
  SIMPLE_SHARED_CONFIG_KEYS,
  type SimpleDraft,
  type SimplePreview,
  type SimpleObject,
  type SimpleProxyGroupEditor,
  type SimpleRuleChange,
  type SimpleRuleEditor,
  type SimpleSource,
  type SimpleSubscriptionOptions
} from '../../shared/simple-config'
import { cleanupSimpleDraft, removedSimpleResources } from './references'
import {
  getSimpleState,
  commitSimpleState,
  saveSimpleState,
  compileAndWriteSimple,
  simpleWriteQueue
} from './store'
import { compileSimpleConfig, type SimpleSharedConfig } from './compiler'
import { patchSimpleDraft } from './patch'
import { normalizeSimpleProviderOptions } from './providers'
import { replaceSimpleSource, resolveSimpleDraft } from './subscriptions'
import {
  addSimpleNodes,
  readSimpleNodes,
  removeSimpleNode as removeSimpleNodeFromDraft,
  updateSimpleNode
} from './nodes'
import {
  addSimpleGroup,
  readSimpleGroups,
  reorderSimpleGroups,
  updateSimpleGroup,
  removeSimpleGroup
} from './groups'
import {
  changeSimpleRules,
  changeSimpleRuleProvider,
  readSimpleRules,
  readSimpleRuleProviders
} from './rules'

const sharedModuleNames = ['dns', 'hosts', 'tun', 'sniffer'] as const
const sharedConfigKeys = new Set<string>(SIMPLE_SHARED_CONFIG_KEYS)

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function getSharedConfig(): Promise<SimpleSharedConfig> {
  const { getControledMihomoConfig } = await import('../config/controledMihomo')
  const config = await getControledMihomoConfig(true)
  return Object.fromEntries(
    SIMPLE_SHARED_CONFIG_KEYS.filter((name) => config[name] !== undefined).map((name) => [
      name,
      structuredClone(config[name])
    ])
  ) as SimpleSharedConfig
}

export async function inheritStandardGeneralSettings(): Promise<void> {
  const { getControledMihomoConfig } = await import('../config/controledMihomo')
  const controlledConfig = await getControledMihomoConfig(true)
  let standardConfig: Record<string, unknown> = controlledConfig as Record<string, unknown>
  try {
    const { getProfileConfig, getProfile } = await import('../config/profile')
    const { current } = await getProfileConfig(true)
    const profileConfig = current ? await getProfile(current) : undefined
    if (isRecord(profileConfig)) {
      standardConfig = { ...standardConfig, ...profileConfig }
    }
  } catch {
    // A missing or invalid standard profile must not block mode migration.
  }
  try {
    const { getRuntimeConfig } = await import('../core/factory')
    const runtimeConfig = await getRuntimeConfig()
    if (isRecord(runtimeConfig) && Object.keys(runtimeConfig).length) {
      standardConfig = runtimeConfig
    }
  } catch {
    // The standard runtime may not have been generated yet; controlled values are sufficient.
  }
  await simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    const firstUse = state.revision === 0
    let draftGeneral: unknown
    let publishedGeneral: unknown
    try {
      draftGeneral = parse(state.draft.modules.general)
      publishedGeneral = parse(state.published.modules.general)
    } catch {
      return
    }
    if (!isRecord(draftGeneral) || !isRecord(publishedGeneral)) return

    const draftPreserved = { ...(state.draft.preserved || {}) }
    const publishedPreserved = { ...(state.published.preserved || {}) }
    let changed = false
    for (const key of SIMPLE_GENERAL_CONFIG_KEYS) {
      const value = standardConfig[key]
      if (value === undefined) continue
      if (firstUse || draftGeneral[key] === undefined) {
        draftGeneral[key] = structuredClone(value)
        changed = true
      }
      if (firstUse || publishedGeneral[key] === undefined) {
        publishedGeneral[key] = structuredClone(value)
        changed = true
      }
    }
    for (const [key, value] of Object.entries(standardConfig)) {
      if (Object.hasOwn(SIMPLE_MODULES, key) || sharedConfigKeys.has(key)) continue
      if (firstUse || draftPreserved[key] === undefined) {
        draftPreserved[key] = structuredClone(value)
        changed = true
      }
      if (firstUse || publishedPreserved[key] === undefined) {
        publishedPreserved[key] = structuredClone(value)
        changed = true
      }
    }
    if (!changed) return
    await saveSimpleState({
      ...state,
      revision: state.revision + 1,
      draft: {
        ...state.draft,
        modules: { ...state.draft.modules, general: stringify(draftGeneral) },
        preserved: draftPreserved
      },
      published: {
        ...state.published,
        modules: { ...state.published.modules, general: stringify(publishedGeneral) },
        preserved: publishedPreserved
      }
    })
  })
}

function applySharedModules(draft: SimpleDraft, shared: SimpleSharedConfig): SimpleDraft {
  const modules = { ...draft.modules }
  for (const name of sharedModuleNames) {
    if (shared[name] !== undefined) modules[name] = stringify(shared[name])
  }
  return { ...draft, modules }
}

export async function patchSimpleModules(patch: Partial<IMihomoConfig>): Promise<void> {
  await simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    const shared = await getSharedConfig()
    const sharedPatch = Object.fromEntries(
      Object.entries(patch).filter(([key]) => sharedConfigKeys.has(key))
    ) as SimpleSharedConfig
    const otherPatch = Object.fromEntries(
      Object.entries(patch).filter(([key]) => !sharedConfigKeys.has(key))
    )
    deepMerge(shared, sharedPatch)
    if (sharedPatch.hosts) shared.hosts = sharedPatch.hosts
    if (sharedPatch.dns && Object.hasOwn(sharedPatch.dns, 'nameserver-policy')) {
      shared.dns = shared.dns || {}
      shared.dns['nameserver-policy'] = sharedPatch.dns['nameserver-policy'] ?? {}
    }
    const next = {
      ...state,
      revision: state.revision + 1,
      draft: applySharedModules(patchSimpleDraft(state.draft, otherPatch), shared),
      published: applySharedModules(patchSimpleDraft(state.published, otherPatch), shared)
    }
    const result = await commitSimpleState(state, next, { shared })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

function extractProxies(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value))
    return value.filter((item): item is Record<string, unknown> => item && typeof item === 'object')
  if (
    value &&
    typeof value === 'object' &&
    Array.isArray((value as Record<string, unknown>).proxies)
  )
    return extractProxies((value as Record<string, unknown>).proxies)
  return []
}

async function fetchSubscriptionProxies(url: string): Promise<Record<string, unknown>[]> {
  if (!/^https?:$/i.test(new URL(url).protocol)) throw new Error('订阅地址必须使用 http(s)')
  const response = await axios.get<string>(url, { responseType: 'text', timeout: 30000 })
  const proxies = extractProxies(parse(response.data))
  if (proxies.length === 0) throw new Error('订阅中没有找到 proxies 节点')
  return proxies
}
export async function previewSimpleConfig(): Promise<SimplePreview> {
  const state = await getSimpleState()
  const shared = await getSharedConfig()
  return compileSimpleConfig(
    await resolveSimpleDraft(applySharedModules(state.draft, shared)),
    shared
  )
}
export async function getSimpleConfig() {
  await inheritStandardSubscriptions(true)
  const state = await getSimpleState()
  const shared = await getSharedConfig()
  return {
    ...state,
    draft: applySharedModules(state.draft, shared),
    published: applySharedModules(state.published, shared)
  }
}

export async function inheritStandardSubscriptions(apply = false): Promise<void> {
  const { getProfileConfig } = await import('../config/profile')
  await simpleWriteQueue.run(async () => {
    const profiles = await getProfileConfig()
    const state = await getSimpleState()
    const processed = new Set(state.inheritedProfileIds || [])
    const names = new Set([
      ...state.draft.sources.map((source) => source.name),
      ...state.published.sources.map((source) => source.name),
      ...Object.keys(parse(state.draft.modules['proxy-providers']) || {}),
      ...Object.keys(parse(state.published.modules['proxy-providers']) || {})
    ])
    const inherited: SimpleSource[] = []
    let changed = false
    for (const item of profiles.items) {
      if (item.type !== 'remote' || !item.url) continue
      const linkedDraft = state.draft.sources.filter((source) => source.profileId === item.id)
      const linkedPublished = state.published.sources.filter(
        (source) => source.profileId === item.id
      )
      if (linkedDraft.length || linkedPublished.length) {
        const sync = (source: SimpleSource): SimpleSource => ({
          ...source,
          extra: item.extra,
          updated: item.updated
        })
        const nextDraftSources = state.draft.sources.map((source) =>
          source.profileId === item.id ? sync(source) : source
        )
        const nextPublishedSources = state.published.sources.map((source) =>
          source.profileId === item.id ? sync(source) : source
        )
        if (
          JSON.stringify(nextDraftSources) !== JSON.stringify(state.draft.sources) ||
          JSON.stringify(nextPublishedSources) !== JSON.stringify(state.published.sources)
        ) {
          state.draft.sources = nextDraftSources
          state.published.sources = nextPublishedSources
          changed = true
        }
        processed.add(item.id)
        continue
      }
      if (processed.has(item.id)) continue
      processed.add(item.id)
      changed = true
      if (
        [...state.draft.sources, ...state.published.sources].some(
          (source) => source.profileId === item.id
        )
      )
        continue
      const baseName = item.name.trim() || '订阅'
      let name = baseName
      for (let suffix = 2; names.has(name); suffix++) name = `${baseName} (${suffix})`
      names.add(name)
      const minutes = Number(item.interval)
      inherited.push({
        id: `profile-${item.id}`,
        name,
        mode: 'http',
        url: item.url,
        prefix: `[${name}] `,
        interval:
          item.autoUpdate === false
            ? 0
            : Number.isFinite(minutes) && minutes > 0
              ? Math.ceil(minutes * 60)
              : 3600,
        userAgent: item.userAgent,
        authorization: item.authToken,
        ageSecretKey: item.ageSecretKey,
        proxies: [],
        extra: item.extra,
        updated: item.updated,
        profileId: item.id
      })
    }
    if (!changed) return
    const next = {
      ...state,
      inheritedProfileIds: [...processed],
      draft: { ...state.draft, sources: [...state.draft.sources, ...inherited] },
      published: {
        ...state.published,
        sources: [...state.published.sources, ...structuredClone(inherited)]
      }
    }
    if (apply && inherited.length) {
      const { getAppConfig } = await import('../config/app')
      if ((await getAppConfig()).operationMode === 'simple') {
        const result = await commitSimpleState(state, next)
        if (result.errors.length) throw new Error(result.errors.join('\n'))
        return
      }
    }
    await saveSimpleState(next)
  })
}
export async function saveSimpleDraft(draft: SimpleDraft): Promise<SimplePreview> {
  return simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    const shared = await getSharedConfig()
    let nextDraft = applySharedModules(draft, shared)
    const before = await resolveSimpleDraft(state.draft)
    const after = await resolveSimpleDraft(nextDraft)
    const removed = removedSimpleResources(
      compileSimpleConfig(before, shared),
      compileSimpleConfig(after, shared),
      before,
      after
    )
    if (Object.values(removed).some((names) => names.size))
      nextDraft = cleanupSimpleDraft(after, removed)
    await saveSimpleState({ ...state, draft: nextDraft })
    return compileSimpleConfig(await resolveSimpleDraft(nextDraft), shared)
  })
}
export async function publishSimpleConfig(draft?: SimpleDraft): Promise<SimplePreview> {
  return simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    const shared = await getSharedConfig()
    const nextDraft = applySharedModules(draft || state.draft, shared)
    return commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: nextDraft,
      published: structuredClone(nextDraft)
    })
  })
}
export async function exportSimpleConfig(): Promise<SimplePreview & { path?: string }> {
  const preview = await previewSimpleConfig()
  if (preview.errors.length) return preview
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: '导出简易模式配置',
    defaultPath: path.join(app.getPath('documents'), 'simple-config.yaml'),
    filters: [{ name: 'YAML', extensions: ['yaml', 'yml'] }]
  })
  if (canceled || !filePath) return preview
  await atomicWriteFile(filePath, preview.yaml, { encoding: 'utf8' })
  return { ...preview, path: filePath }
}
export async function compileSimpleRuntime(): Promise<SimplePreview> {
  const state = await getSimpleState()
  const shared = await getSharedConfig()
  const next = {
    ...state,
    draft: applySharedModules(state.draft, shared),
    published: applySharedModules(state.published, shared)
  }
  return compileAndWriteSimple(next, true, shared)
}

export async function getSimpleRulesEditor(): Promise<SimpleRuleEditor> {
  const { draft } = await getSimpleState()
  const preview = compileSimpleConfig(await resolveSimpleDraft(draft), await getSharedConfig())
  const subRules = parse(draft.modules['sub-rules'])
  return {
    rules: readSimpleRules(draft),
    ruleProviders: readSimpleRuleProviders(draft),
    outbounds: preview.references.outbounds,
    subRules: isRecord(subRules) ? Object.keys(subRules) : []
  }
}

export async function saveSimpleRules(change: SimpleRuleChange, expected: string[]): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (!isRecord(change) || !Array.isArray(expected)) throw new Error('规则参数无效')
    const state = await getSimpleState()
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: changeSimpleRules(state.draft, change, expected),
      published: changeSimpleRules(state.published, change, expected)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function saveSimpleRuleProvider(
  name: string | undefined,
  nextName: string,
  value: SimpleObject | null,
  expected?: SimpleObject
): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (
      typeof nextName !== 'string' ||
      (value !== null && !isRecord(value)) ||
      (name !== undefined && (typeof name !== 'string' || !isRecord(expected)))
    )
      throw new Error('规则集参数无效')
    const state = await getSimpleState()
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: changeSimpleRuleProvider(state.draft, name, nextName, value, expected),
      published:
        value === null &&
        name !== undefined &&
        !Object.hasOwn(readSimpleRuleProviders(state.published), name)
          ? state.published
          : changeSimpleRuleProvider(state.published, name, nextName, value)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function getSimpleProxyGroup(name?: string): Promise<SimpleProxyGroupEditor> {
  const state = await getSimpleState()
  const groups = readSimpleGroups(state.draft)
  const group =
    name === undefined
      ? { name: '', type: 'select', proxies: ['DIRECT'] }
      : groups.find((group) => group.name === name)
  if (!group) throw new Error(`找不到代理组：${name}`)
  const draft = await resolveSimpleDraft(state.draft)
  const preview = compileSimpleConfig(draft, await getSharedConfig())
  const config = parse(preview.yaml) as SimpleObject
  const outboundDetails: SimpleProxyGroupEditor['outboundDetails'] = {
    DIRECT: { type: 'Direct' },
    REJECT: { type: 'Reject' },
    'REJECT-DROP': { type: 'RejectDrop' },
    PASS: { type: 'Pass' },
    'PASS-RULE': { type: 'PassRule' },
    COMPATIBLE: { type: 'Compatible' }
  }
  const sources = new Map<string, string>()
  for (const source of draft.sources) {
    if (source.mode !== 'extract') continue
    for (const proxy of source.proxies) {
      if (typeof proxy.name === 'string')
        sources.set(`${source.prefix || ''}${proxy.name}`, source.name)
    }
  }
  for (const key of ['proxies', 'proxy-groups']) {
    const entries = config[key]
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      if (!isRecord(entry) || typeof entry.name !== 'string') continue
      outboundDetails[entry.name] = {
        type: typeof entry.type === 'string' ? entry.type : 'unknown',
        ...(sources.has(entry.name) ? { source: sources.get(entry.name) } : {})
      }
    }
  }
  const providers = config['proxy-providers']
  const providerTypes = Object.fromEntries(
    Object.entries(isRecord(providers) ? providers : {}).map(([name, provider]) => [
      name,
      isRecord(provider) && typeof provider.type === 'string' ? provider.type : 'unknown'
    ])
  )
  return {
    group,
    outbounds: preview.references.outbounds.filter((outbound) => outbound !== name),
    groupNames: groups.map((group) => String(group.name)),
    proxyProviders: preview.references.proxyProviders,
    sources: draft.sources.map((source) => source.name),
    outboundDetails,
    providerTypes
  }
}

async function assertSimpleNameAvailable(
  draft: SimpleDraft,
  label: string,
  value: SimpleObject,
  previousName?: string
): Promise<void> {
  if (typeof value.name !== 'string' || !value.name.trim()) throw new Error(`${label}名称不能为空`)
  const name = value.name.trim()
  if (SIMPLE_BUILTIN_OUTBOUNDS.includes(name) || name === 'GLOBAL') {
    throw new Error(`不能使用内置出站或 GLOBAL 名称: ${name}`)
  }
  if (name === previousName) return
  const resolved = await resolveSimpleDraft(draft)
  const { references } = compileSimpleConfig(resolved)
  if (references.outbounds.includes(name))
    throw new Error(`${label}名称与已有节点或代理组冲突: ${name}`)
  if (references.proxyProviders.includes(name))
    throw new Error(`${label}名称与已有代理集合冲突: ${name}`)
}

export async function saveSimpleProxyGroup(
  name: string,
  value: SimpleObject,
  expected: SimpleObject
): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (!isRecord(value) || !isRecord(expected)) throw new Error('代理组参数必须是对象')
    const state = await getSimpleState()
    await assertSimpleNameAvailable(state.draft, '代理组', value, name)
    const draft = updateSimpleGroup(state.draft, name, value, expected)
    const published = updateSimpleGroup(state.published, name, value)
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft,
      published
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function createSimpleProxyGroup(value: SimpleObject): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (!isRecord(value)) throw new Error('代理组参数必须是对象')
    const state = await getSimpleState()
    await assertSimpleNameAvailable(state.draft, '代理组', value)
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: addSimpleGroup(state.draft, value),
      published: addSimpleGroup(state.published, value)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function removeSimpleProxyGroup(name: string, expected: SimpleObject): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (typeof name !== 'string' || !isRecord(expected)) throw new Error('代理组参数无效')
    const state = await getSimpleState()
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: removeSimpleGroup(state.draft, name, expected),
      published: removeSimpleGroup(state.published, name)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function reorderSimpleProxyGroups(names: string[]): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (!Array.isArray(names) || names.some((name) => typeof name !== 'string')) {
      throw new Error('代理组顺序必须是名称列表')
    }
    const state = await getSimpleState()
    const draft = reorderSimpleGroups(state.draft, names)
    const published = reorderSimpleGroups(state.published, names)
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft,
      published
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function getSimpleNode(name?: string): Promise<SimpleObject> {
  const state = await getSimpleState()
  const node =
    name === undefined
      ? { name: '', type: 'ss' }
      : readSimpleNodes(state.draft).find((item) => item.name === name)
  if (!node) throw new Error(`找不到节点：${name}`)
  return node
}

export async function createSimpleNodes(values: SimpleObject[]): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (!Array.isArray(values) || !values.length) throw new Error('节点参数不能为空')
    const state = await getSimpleState()
    for (const value of values) {
      if (!isRecord(value)) throw new Error('节点参数必须是对象')
      await assertSimpleNameAvailable(state.draft, '节点', value)
    }
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: addSimpleNodes(state.draft, values),
      published: addSimpleNodes(state.published, values)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function saveSimpleNode(
  name: string,
  value: SimpleObject,
  expected: SimpleObject
): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (typeof name !== 'string' || !isRecord(value) || !isRecord(expected)) {
      throw new Error('节点参数必须是对象')
    }
    const state = await getSimpleState()
    await assertSimpleNameAvailable(state.draft, '节点', value, name)
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: updateSimpleNode(state.draft, name, value, expected),
      published: updateSimpleNode(state.published, name, value)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function removeSimpleNode(name: string, expected: SimpleObject): Promise<void> {
  await simpleWriteQueue.run(async () => {
    if (typeof name !== 'string' || !isRecord(expected)) throw new Error('节点参数无效')
    const state = await getSimpleState()
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: removeSimpleNodeFromDraft(state.draft, name, expected),
      published: removeSimpleNodeFromDraft(state.published, name)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function configureSimpleSubscription(
  profileId: string,
  options?: SimpleSubscriptionOptions
): Promise<void> {
  if (options && !['group', 'nodes'].includes(options.mode)) {
    throw new Error('未知订阅导入方式')
  }
  await simpleWriteQueue.run(async () => {
    const { getProfileItem } = await import('../config/profile')
    const item = await getProfileItem(profileId)
    if (!item) throw new Error('找不到订阅')
    const state = await getSimpleState()
    const existing = state.draft.sources.find((source) => source.profileId === profileId)
    const published = state.published.sources.find((source) => source.profileId === profileId)
    const previous = existing || published
    const names = new Set([
      ...state.draft.sources
        .filter((source) => source.profileId !== profileId)
        .map((source) => source.name),
      ...Object.keys(parse(state.draft.modules['proxy-providers']) || {})
    ])
    let name = options?.providerName?.trim() || previous?.name || item.name.trim() || '订阅'
    if (!previous && !options?.providerName?.trim()) {
      const base = name
      for (let suffix = 2; names.has(name); suffix++) name = `${base} (${suffix})`
    }
    const mode = options
      ? options.mode === 'nodes'
        ? 'extract'
        : item.type === 'remote'
          ? 'http'
          : 'inline'
      : previous?.mode || (item.type === 'remote' ? 'http' : 'inline')
    const source: SimpleSource = {
      ...previous,
      id: previous?.id || `profile-${profileId}`,
      profileId,
      name,
      mode,
      prefix: options?.prefix ?? previous?.prefix ?? `[${name}] `,
      providerOptions:
        options?.providerOptions !== undefined
          ? normalizeSimpleProviderOptions(options.providerOptions)
          : previous?.providerOptions,
      interval: previous?.interval ?? 3600,
      proxies: []
    }
    const resolved = await resolveSimpleDraft({ ...state.draft, sources: [source] })
    const nextSource = resolved.sources[0]
    const update = async (draft: SimpleDraft): Promise<SimpleDraft> => {
      const old = draft.sources.find((source) => source.profileId === profileId)
      const oldResolved = old
        ? (await resolveSimpleDraft({ ...draft, sources: [old] })).sources[0]
        : undefined
      return replaceSimpleSource(draft, oldResolved, nextSource)
    }
    const result = await commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      inheritedProfileIds: [...new Set([...(state.inheritedProfileIds || []), profileId])],
      draft: await update(state.draft),
      published: await update(state.published)
    })
    if (result.errors.length) throw new Error(result.errors.join('\n'))
  })
}

export async function importSimpleSubscription(input: {
  name: string
  url?: string
  profileId?: string
  mode: SimpleSource['mode']
  prefix?: string
  interval?: number
}): Promise<{ source: SimpleSource; preview: SimplePreview }> {
  return simpleWriteQueue.run(async () => {
    let url = input.url
    let content: string | undefined
    if (input.profileId) {
      const { getProfile, getProfileItem } = await import('../config/profile')
      const item = await getProfileItem(input.profileId)
      if (!item) throw new Error('找不到通用订阅')
      url = item.url
      if (input.mode !== 'http') content = stringify(await getProfile(input.profileId))
    } else {
      if (!url) throw new Error('订阅地址不能为空')
      try {
        if (!['http:', 'https:'].includes(new URL(url).protocol)) throw new Error()
      } catch {
        throw new Error('订阅地址必须使用 http(s)')
      }
      if (input.mode !== 'http') {
        const response = await axios.get<string>(url, { responseType: 'text', timeout: 30000 })
        content = response.data
      }
    }
    const proxies = content ? extractProxies(parse(content)) : []
    if (input.mode !== 'http' && proxies.length === 0)
      throw new Error('订阅中没有找到 proxies 节点；完整订阅请使用 HTTP Provider')
    const source: SimpleSource = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim() || '订阅',
      mode: input.mode,
      url,
      profileId: input.profileId,
      prefix: input.prefix ?? `[${input.name}] `,
      interval: input.interval ?? 3600,
      proxies,
      updated: Date.now()
    }
    const state = await getSimpleState()
    const draft: SimpleDraft = { ...state.draft, sources: [...state.draft.sources, source] }
    await saveSimpleState({
      ...state,
      draft,
      inheritedProfileIds: input.profileId
        ? [...new Set([...(state.inheritedProfileIds || []), input.profileId])]
        : state.inheritedProfileIds
    })
    return {
      source,
      preview: compileSimpleConfig(await resolveSimpleDraft(draft), await getSharedConfig())
    }
  })
}

export async function refreshSimpleSource(id: string): Promise<SimplePreview> {
  return simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    const source = state.draft.sources.find((item) => item.id === id)
    if (!source) throw new Error('找不到订阅来源')
    let proxies: Record<string, unknown>[]
    if (source.profileId) {
      const { getProfile } = await import('../config/profile')
      proxies = extractProxies(await getProfile(source.profileId))
    } else if (source.url) {
      proxies = await fetchSubscriptionProxies(source.url)
    } else {
      throw new Error(`订阅 ${source.name} 没有可刷新的地址`)
    }
    const draft = {
      ...state.draft,
      sources: state.draft.sources.map((item) =>
        item.id === id ? { ...item, proxies, updated: Date.now() } : item
      )
    }
    await saveSimpleState({ ...state, draft })
    return compileSimpleConfig(await resolveSimpleDraft(draft), await getSharedConfig())
  })
}
export async function removeSimpleSource(id: string): Promise<SimplePreview> {
  return simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    const remove = (draft: SimpleDraft): SimpleDraft => ({
      ...draft,
      sources: draft.sources.filter((source) => source.id !== id)
    })
    return commitSimpleState(state, {
      ...state,
      revision: state.revision + 1,
      draft: remove(state.draft),
      published: remove(state.published)
    })
  })
}

export async function withSimpleProfileRemoval<T>(
  profileId: string,
  remove: () => Promise<T>
): Promise<T> {
  return simpleWriteQueue.run(async () => {
    const state = await getSimpleState()
    if (
      [...state.draft.sources, ...state.published.sources].some(
        (source) => source.profileId === profileId
      )
    ) {
      const detach = (draft: SimpleDraft): SimpleDraft => ({
        ...draft,
        sources: draft.sources.filter((source) => source.profileId !== profileId)
      })
      const result = await commitSimpleState(
        state,
        {
          ...state,
          revision: state.revision + 1,
          inheritedProfileIds: [...new Set([...(state.inheritedProfileIds || []), profileId])],
          draft: detach(state.draft),
          published: detach(state.published)
        },
        { allowStandard: true }
      )
      if (result.errors.length) throw new Error(result.errors.join('\n'))
    }
    // Detach before unlinking files. If file cleanup fails, retain the valid detached
    // configuration rather than restoring references to a potentially missing file.
    return remove()
  })
}
