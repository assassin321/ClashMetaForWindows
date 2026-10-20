import { isDeepStrictEqual } from 'util'
import {
  SIMPLE_BUILTIN_OUTBOUNDS,
  type SimpleDraft,
  type SimpleObject
} from '../../shared/simple-config'
import {
  getSimpleNodeType,
  listRequiredSimpleNodeFields,
  listSimpleNodeFields,
  pruneSimpleNode,
  readSimpleNodeValue,
  writeSimpleNodeValue
} from '../../shared/simple-node'
import { parse, stringify } from '../utils/yaml'
import { isObject } from './compiler'
import { renameReferences } from './rename'

export function readSimpleNodes(draft: SimpleDraft): SimpleObject[] {
  const nodes: unknown = parse(draft.modules.proxies)
  if (!Array.isArray(nodes) || !nodes.every(isObject)) {
    throw new Error('节点配置必须是对象列表')
  }
  return nodes
}

function writeSimpleNodes(draft: SimpleDraft, nodes: SimpleObject[]): SimpleDraft {
  return { ...draft, modules: { ...draft.modules, proxies: stringify(nodes) } }
}

function normalizeSimpleNode(value: SimpleObject): SimpleObject {
  if (!isObject(value)) throw new Error('节点参数必须是对象')
  const type = value.type
  if (typeof type !== 'string' || !type.trim()) throw new Error('节点类型不能为空')
  const definition = getSimpleNodeType(type)
  if (!definition) throw new Error(`未知节点类型：${type}`)
  let node = pruneSimpleNode(structuredClone(value), type)
  const name = typeof node.name === 'string' ? node.name.trim() : ''
  if (!name) throw new Error('节点名称不能为空')
  if (SIMPLE_BUILTIN_OUTBOUNDS.includes(name) || name === 'GLOBAL') {
    throw new Error(`不能使用内置出站或 GLOBAL 名称：${name}`)
  }
  node.name = name
  node.type = type
  for (const entry of listRequiredSimpleNodeFields(type)) {
    const current = readSimpleNodeValue(node, entry.path)
    if (current === undefined || current === null || current === '') {
      throw new Error(`${definition.label} 缺少必填项：${entry.field.label}`)
    }
  }
  for (const entry of listSimpleNodeFields(type)) {
    const current = readSimpleNodeValue(node, entry.path)
    if (current === undefined || current === null || current === '' || typeof current === 'boolean')
      continue
    if (entry.field.kind !== 'number') continue
    const number = Number(current)
    if (!Number.isFinite(number)) throw new Error(`${entry.field.label} 必须是数字`)
    if (
      entry.field.key === 'port' &&
      (!Number.isSafeInteger(number) || number < 1 || number > 65535)
    ) {
      throw new Error('端口必须是 1 到 65535 的整数')
    }
    if (typeof current === 'string') node = writeSimpleNodeValue(node, entry.path, number)
  }
  return node
}

export function addSimpleNodes(draft: SimpleDraft, values: SimpleObject[]): SimpleDraft {
  const nodes = readSimpleNodes(draft)
  const names = new Set(nodes.map((node) => String(node.name)))
  const added = values.map((value) => {
    const node = normalizeSimpleNode(value)
    if (names.has(String(node.name))) throw new Error(`节点名称已存在：${node.name}`)
    names.add(String(node.name))
    return node
  })
  return writeSimpleNodes(draft, [...nodes, ...added])
}

export function updateSimpleNode(
  draft: SimpleDraft,
  name: string,
  value: SimpleObject,
  expected?: SimpleObject
): SimpleDraft {
  const nodes = readSimpleNodes(draft)
  const index = nodes.findIndex((node) => node.name === name)
  if (index < 0) throw new Error(`节点 ${name} 已不存在，请重新打开编辑器`)
  if (expected && !isDeepStrictEqual(nodes[index], expected)) {
    throw new Error(`节点 ${name} 已被修改，请重新打开编辑器`)
  }
  const node = normalizeSimpleNode(value)
  const nextName = String(node.name)
  if (nodes.some((item, i) => i !== index && item.name === nextName)) {
    throw new Error(`节点名称已存在：${nextName}`)
  }
  nodes[index] = node
  const next = writeSimpleNodes(draft, nodes)
  return nextName === name ? next : renameReferences(next, name, nextName)
}

export function removeSimpleNode(
  draft: SimpleDraft,
  name: string,
  expected?: SimpleObject
): SimpleDraft {
  const nodes = readSimpleNodes(draft)
  const current = nodes.find((node) => node.name === name)
  if (expected && (!current || !isDeepStrictEqual(current, expected))) {
    throw new Error(`节点 ${name} 已变化，请刷新后重新删除`)
  }
  return writeSimpleNodes(
    draft,
    nodes.filter((node) => node.name !== name)
  )
}
