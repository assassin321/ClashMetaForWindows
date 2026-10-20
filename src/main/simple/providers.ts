import type { SimpleObject } from '../../shared/simple-config'
import { isObject } from './compiler'

// Subscription metadata owns the URL, schedule, credentials and node prefix.
export function normalizeSimpleProviderOptions(value: SimpleObject): SimpleObject {
  if (!isObject(value)) throw new Error('代理集合高级参数必须是对象')
  const next = structuredClone(value)
  for (const key of ['type', 'url', 'interval', 'payload', 'age-secret-key']) delete next[key]
  const number = (object: SimpleObject, key: string, label: string): void => {
    if (object[key] === undefined) return
    const value = Number(object[key])
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label}必须是非负整数`)
    object[key] = value
  }
  number(next, 'size-limit', '大小上限')
  if (next['health-check'] !== undefined) {
    const health = next['health-check']
    if (!isObject(health)) throw new Error('健康检查参数必须是对象')
    for (const key of ['interval', 'timeout']) number(health, key, '健康检查间隔或超时')
    if (health.enable === true || health.url) {
      const url = new URL(String(health.url || ''))
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('检测地址必须使用 http(s)')
    }
  }
  if (next.header !== undefined) {
    if (!isObject(next.header)) throw new Error('请求头必须是对象')
    const names = new Set<string>()
    for (const [name, values] of Object.entries(next.header)) {
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) throw new Error(`请求头名称无效：${name}`)
      const lower = name.toLowerCase()
      if (['user-agent', 'authorization'].includes(lower))
        throw new Error('User-Agent 和 Authorization 请在订阅信息中设置')
      if (names.has(lower)) throw new Error('请求头名称不能重复')
      names.add(lower)
      if (!Array.isArray(values) || values.some((v) => typeof v !== 'string' || /[\r\n]/.test(v)))
        throw new Error(`请求头 ${name} 必须是字符串列表，且不能包含换行`)
    }
  }
  if (next.override !== undefined) {
    if (!isObject(next.override)) throw new Error('覆盖参数必须是对象')
    delete next.override['additional-prefix']
    if (!Object.keys(next.override).length) delete next.override
    else number(next.override, 'routing-mark', '路由标记')
  }
  return next
}
