import { isDeepStrictEqual } from 'util'
import type { SimpleDraft, SimpleObject, SimpleRuleChange } from '../../shared/simple-config'
import { parseSimpleRule, renameRuleSet } from '../../shared/simple-rules'
import { parse, stringify } from '../utils/yaml'
import { isObject } from './compiler'

export function readSimpleRules(draft: SimpleDraft): string[] {
  const rules = parse(draft.modules.rules)
  if (!Array.isArray(rules) || rules.some((rule) => typeof rule !== 'string'))
    throw new Error('规则配置必须是字符串列表')
  return rules
}

export function readSimpleRuleProviders(draft: SimpleDraft): Record<string, SimpleObject> {
  const providers = parse(draft.modules['rule-providers'])
  if (!isObject(providers) || Object.values(providers).some((provider) => !isObject(provider)))
    throw new Error('规则集配置必须是对象')
  return providers as Record<string, SimpleObject>
}

export function changeSimpleRules(
  draft: SimpleDraft,
  change: SimpleRuleChange,
  expected: string[]
): SimpleDraft {
  const rules = readSimpleRules(draft)
  if (!isDeepStrictEqual(rules, expected))
    throw new Error('规则列表已变化，或草稿尚未发布，请刷新或先处理规则草稿')
  let next = [...rules]
  if (change.action === 'reorder') {
    const order = change.order
    if (
      !Array.isArray(order) ||
      order.length !== rules.length ||
      new Set(order).size !== rules.length ||
      order.some((i) => !Number.isInteger(i) || i < 0 || i >= rules.length)
    )
      throw new Error('规则排序无效')
    next = order.map((i) => rules[i])
  } else {
    if (!['add', 'edit', 'remove'].includes(change.action)) throw new Error('未知规则操作')
    const { index } = change
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index > rules.length ||
      (change.action !== 'add' && index === rules.length)
    )
      throw new Error('规则位置无效')
    if (change.action === 'remove') next.splice(index, 1)
    else {
      if (typeof change.value !== 'string' || !change.value.trim() || /[\r\n]/.test(change.value))
        throw new Error('规则必须是单行非空字符串')
      const { options } = parseSimpleRule(change.value)
      if (options.includes('src') && options.includes('no-resolve'))
        throw new Error('src 与 no-resolve 不能同时设置')
      next.splice(index, change.action === 'add' ? 0 : 1, change.value.trim())
    }
  }
  return { ...draft, modules: { ...draft.modules, rules: stringify(next) } }
}

export function changeSimpleRuleProvider(
  draft: SimpleDraft,
  name: string | undefined,
  nextName: string,
  value: SimpleObject | null,
  expected?: SimpleObject
): SimpleDraft {
  const providers = readSimpleRuleProviders(draft)
  if (name !== undefined) {
    if (!Object.hasOwn(providers, name)) throw new Error('规则集已不存在，请刷新')
    if (expected && !isDeepStrictEqual(providers[name], expected))
      throw new Error('规则集已被修改，请重新打开编辑器')
  }
  nextName = nextName.trim()
  if (value !== null && (!nextName || /[,\r\n]/.test(nextName)))
    throw new Error('规则集名称不能为空或包含逗号、换行')
  if (value !== null && name !== nextName && Object.hasOwn(providers, nextName))
    throw new Error('规则集名称已存在')
  if (value === null && name === undefined) throw new Error('请选择要删除的规则集')
  const next = structuredClone(draft)
  const rules = readSimpleRules(next)
  const subRules = parse(next.modules['sub-rules'])
  if (!isObject(subRules)) throw new Error('子规则配置必须是对象')
  const rewrite = (rule: string): string => {
    if (name === undefined || value === null || name === nextName) return rule
    return renameRuleSet(rule, name, nextName)
  }
  const updatedRules = rules.map(rewrite)
  if (!isDeepStrictEqual(rules, updatedRules)) next.modules.rules = stringify(updatedRules)
  for (const [key, entries] of Object.entries(subRules)) {
    if (!Array.isArray(entries) || entries.some((entry) => typeof entry !== 'string'))
      throw new Error('子规则必须是字符串列表')
    subRules[key] = entries.map(rewrite)
  }
  if (!isDeepStrictEqual(parse(next.modules['sub-rules']), subRules))
    next.modules['sub-rules'] = stringify(subRules)
  const entries = Object.entries(providers).flatMap(([key, provider]) =>
    key === name ? (value === null ? [] : [[nextName, structuredClone(value)]]) : [[key, provider]]
  )
  if (name === undefined && value !== null) entries.push([nextName, structuredClone(value)])
  next.modules['rule-providers'] = stringify(Object.fromEntries(entries))
  return next
}
