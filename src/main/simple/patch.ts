import {
  SIMPLE_MODULES,
  type SimpleDraft,
  type SimpleModule,
  type SimpleObject
} from '../../shared/simple-config'
import { parse, stringify } from '../utils/yaml'
import { isObject } from './compiler'

function merge(target: SimpleObject, patch: SimpleObject): SimpleObject {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete target[key]
    else if (isObject(value)) target[key] = merge(isObject(target[key]) ? target[key] : {}, value)
    else target[key] = value
  }
  return target
}

export function patchSimpleDraft(draft: SimpleDraft, patch: Partial<IMihomoConfig>): SimpleDraft {
  const modules = { ...draft.modules }
  const patches: Partial<Record<SimpleModule, SimpleObject>> = {}
  for (const [key, value] of Object.entries(patch)) {
    if (Object.hasOwn(SIMPLE_MODULES, key)) {
      if (!['dns', 'hosts', 'tun', 'sniffer'].includes(key) || !isObject(value)) {
        throw new Error(`请在 ${key} 模块编辑`)
      }
      patches[key as SimpleModule] = value
    } else {
      patches.general = { ...patches.general, [key]: value }
    }
  }
  for (const module of Object.keys(patches) as SimpleModule[]) {
    const current: unknown = parse(modules[module])
    if (!isObject(current)) throw new Error(`${SIMPLE_MODULES[module]}: 应为 YAML 对象`)
    const value = patches[module]!
    // Hosts and policy editors submit complete maps, including deletions.
    const next = module === 'hosts' ? value : merge(current, value)
    if (module === 'dns' && Object.hasOwn(value, 'nameserver-policy')) {
      next['nameserver-policy'] = value['nameserver-policy'] ?? {}
    }
    modules[module] = stringify(next)
  }
  return { ...draft, modules }
}
