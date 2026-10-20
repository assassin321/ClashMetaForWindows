import type { SimpleObject } from '../simple-config'
import type { SimpleNodeField, SimpleNodeType } from './types'
import { SIMPLE_NODE_COMMON_FIELDS } from './common'
import { SIMPLE_NODE_PROTOCOLS } from './protocols'

export interface SimpleNodeFieldEntry {
  field: SimpleNodeField
  path: string
  labels: readonly string[]
  required: boolean
}

export function getSimpleNodeType(type: string): SimpleNodeType | undefined {
  return SIMPLE_NODE_PROTOCOLS[type]
}

export function getSimpleNodeFields(type: string): readonly SimpleNodeField[] {
  return getSimpleNodeType(type)?.fields ?? []
}

export function listSimpleNodeFields(type: string): SimpleNodeFieldEntry[] {
  const entries: SimpleNodeFieldEntry[] = []
  const visit = (
    fields: readonly SimpleNodeField[],
    prefix: string,
    labels: readonly string[]
  ): void => {
    for (const field of fields) {
      const path = prefix ? `${prefix}.${field.key}` : field.key
      const nextLabels = [...labels, field.label]
      entries.push({ field, path, labels: nextLabels, required: field.required === true })
      if (field.children?.length) visit(field.children, path, nextLabels)
    }
  }
  visit(getSimpleNodeFields(type), '', [])
  visit(SIMPLE_NODE_COMMON_FIELDS, '', [])
  return entries
}

export function listRequiredSimpleNodeFields(type: string): SimpleNodeFieldEntry[] {
  return listSimpleNodeFields(type).filter((entry) => entry.required && !entry.field.hidden)
}

export function listOptionalSimpleNodeFields(type: string): SimpleNodeFieldEntry[] {
  return listSimpleNodeFields(type).filter((entry) => !entry.required && !entry.field.hidden)
}

export interface SimpleNodeOptionEntry {
  value: string
  label: string
}

export function listSimpleNodeOptions(field: SimpleNodeField): SimpleNodeOptionEntry[] {
  return (field.options ?? []).map((option) =>
    typeof option === 'string'
      ? { value: option, label: option }
      : { value: option.value, label: option.label ?? option.value }
  )
}

export function listVisibleSimpleNodeFields(type: string, added: readonly string[]): Set<string> {
  const paths = new Set(added)
  const ancestors = (path: string): string[] => {
    const parts = path.split('.')
    return parts.slice(1).map((_, index) => parts.slice(0, index + 1).join('.'))
  }
  const result = new Set<string>()
  for (const entry of listSimpleNodeFields(type)) {
    if (entry.field.hidden) continue
    if (
      entry.required ||
      paths.has(entry.path) ||
      ancestors(entry.path).some((item) => paths.has(item)) ||
      added.some((item) => item.startsWith(`${entry.path}.`))
    ) {
      result.add(entry.path)
    }
  }
  return result
}

export function isSimpleNodeValueEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export function readSimpleNodeValue(node: SimpleObject, path: string): unknown {
  const segments = path.split('.')
  let current: unknown = node
  for (const segment of segments) {
    if (current === null || typeof current !== 'object' || Array.isArray(current)) return undefined
    current = (current as SimpleObject)[segment]
  }
  return current
}

export function writeSimpleNodeValue(
  node: SimpleObject,
  path: string,
  value: unknown
): SimpleObject {
  const [head, ...rest] = path.split('.')
  if (!rest.length) {
    const next = { ...node }
    if (value === undefined) delete next[head]
    else next[head] = value
    return next
  }
  const child = node[head]
  const base = child !== null && typeof child === 'object' && !Array.isArray(child) ? child : {}
  return { ...node, [head]: writeSimpleNodeValue(base as SimpleObject, rest.join('.'), value) }
}

export function removeSimpleNodeValue(node: SimpleObject, path: string): SimpleObject {
  const [head, ...rest] = path.split('.')
  if (!rest.length) {
    const next = { ...node }
    delete next[head]
    return next
  }
  const child = node[head]
  if (child === null || typeof child !== 'object' || Array.isArray(child)) return node
  const nextChild = removeSimpleNodeValue(child as SimpleObject, rest.join('.'))
  const next = { ...node }
  if (Object.keys(nextChild).length) next[head] = nextChild
  else delete next[head]
  return next
}

export function pruneSimpleNode(node: SimpleObject, type: string): SimpleObject {
  const required = new Set(listRequiredSimpleNodeFields(type).map((entry) => entry.path))
  const prune = (value: SimpleObject, prefix: string): SimpleObject => {
    const next: SimpleObject = {}
    for (const [key, entry] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key
      if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
        const child = prune(entry as SimpleObject, path)
        if (Object.keys(child).length || required.has(path)) next[key] = child
        continue
      }
      if (required.has(path) || !isSimpleNodeValueEmpty(entry)) next[key] = entry
    }
    return next
  }
  return prune(node, '')
}
