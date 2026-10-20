import { isDeepStrictEqual } from 'util'
import type { SimpleDraft } from '../../shared/simple-config'
import { parse, stringify } from '../utils/yaml'
import { isObject, ruleParts } from './compiler'

export function renameReferences(draft: SimpleDraft, before: string, after: string): SimpleDraft {
  const next = structuredClone(draft)
  const rename = (value: unknown): unknown => (value === before ? after : value)
  const rewriteRule = (value: unknown): unknown => {
    if (typeof value !== 'string') return value
    const parts = ruleParts(value)
    if (parts[0] === 'SUB-RULE') return value
    let index = parts.length - 1
    while (index > 0 && ['no-resolve', 'src'].includes(parts[index])) index--
    if (parts[index] !== before) return value
    parts[index] = after
    return parts.join(',')
  }
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!isObject(value)) return
    for (const [key, entry] of Object.entries(value)) {
      if (['proxy', 'dialer-proxy', 'default-selected'].includes(key)) value[key] = rename(entry)
      else if (key === 'proxies' && Array.isArray(entry)) {
        value[key] = entry.map(rename)
        entry.forEach(visit)
      } else visit(entry)
    }
  }
  for (const key of Object.keys(next.modules)) {
    const value: unknown = parse(next.modules[key])
    let updated = structuredClone(value)
    if (key === 'rules' && Array.isArray(updated)) updated = updated.map(rewriteRule)
    else if (key === 'sub-rules' && isObject(updated)) {
      for (const name of Object.keys(updated)) {
        if (Array.isArray(updated[name])) updated[name] = updated[name].map(rewriteRule)
      }
    } else visit(updated)
    if (!isDeepStrictEqual(value, updated)) next.modules[key] = stringify(updated)
  }
  visit(next.preserved)
  next.sources = next.sources.map((source) => {
    const updated = structuredClone(source)
    visit(updated)
    return updated
  })
  return next
}
