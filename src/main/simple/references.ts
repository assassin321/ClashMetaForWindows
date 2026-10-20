import { isDeepStrictEqual } from 'util'
import type { SimpleDraft, SimpleObject, SimplePreview } from '../../shared/simple-config'
import { parseSimpleRule, ruleSetNames } from '../../shared/simple-rules'
import { parse, stringify } from '../utils/yaml'
import { isObject } from './compiler'

export interface RemovedSimpleResources {
  outbounds: Set<string>
  providers: Set<string>
  ruleProviders: Set<string>
  subRules: Set<string>
  sources: Set<string>
}

export function removedSimpleResources(
  before: SimplePreview,
  after: SimplePreview,
  previous: SimpleDraft,
  next: SimpleDraft
): RemovedSimpleResources {
  // A malformed draft is not a deletion request. Do not cascade from parser fallbacks.
  try {
    for (const key of [
      'proxies',
      'proxy-groups',
      'proxy-providers',
      'rule-providers',
      'sub-rules'
    ] as const) {
      const value = parse(next.modules[key])
      const valid =
        key === 'proxies' || key === 'proxy-groups'
          ? Array.isArray(value) &&
            value.every(
              (entry) => isObject(entry) && typeof entry.name === 'string' && entry.name.trim()
            )
          : isObject(value)
      if (!valid) throw new Error('Invalid resource module')
    }
  } catch {
    return {
      outbounds: new Set(),
      providers: new Set(),
      ruleProviders: new Set(),
      subRules: new Set(),
      sources: new Set()
    }
  }
  const removed = (oldNames: string[], newNames: string[]): Set<string> =>
    new Set(oldNames.filter((name) => !newNames.includes(name)))
  const subRuleNames = (preview: SimplePreview): string[] => {
    const config = parse(preview.yaml)
    return isObject(config) && isObject(config['sub-rules']) ? Object.keys(config['sub-rules']) : []
  }
  return {
    outbounds: removed(before.references.outbounds, after.references.outbounds),
    providers: removed(before.references.proxyProviders, after.references.proxyProviders),
    ruleProviders: removed(before.references.ruleProviders, after.references.ruleProviders),
    subRules: removed(subRuleNames(before), subRuleNames(after)),
    sources: removed(
      previous.sources.map((s) => s.name),
      next.sources.map((s) => s.name)
    )
  }
}

export function cleanupSimpleConfig(config: SimpleObject, removed: RemovedSimpleResources): void {
  const gone = (names: Set<string>, value: unknown): boolean =>
    typeof value === 'string' && names.has(value)
  const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
  const field = (object: SimpleObject, key: string, names = removed.outbounds): void => {
    if (gone(names, object[key])) delete object[key]
  }
  const rules = (entries: unknown, targets = true): unknown[] =>
    list(entries).filter((entry) => {
      if (typeof entry !== 'string') return true
      if (ruleSetNames(entry).some((name) => removed.ruleProviders.has(name))) return false
      const { type, target } = parseSimpleRule(entry)
      return !targets || !gone(type === 'SUB-RULE' ? removed.subRules : removed.outbounds, target)
    })
  if (Array.isArray(config.rules)) config.rules = rules(config.rules)
  if (isObject(config['sub-rules'])) {
    for (const [name, entries] of Object.entries(config['sub-rules'])) {
      if (Array.isArray(entries)) config['sub-rules'][name] = rules(entries)
    }
  }
  for (const group of list(config['proxy-groups'])) {
    if (!isObject(group)) continue
    const previous = structuredClone(group)
    if (Array.isArray(group.proxies))
      group.proxies = group.proxies.filter((name) => !gone(removed.outbounds, name))
    if (Array.isArray(group.use))
      group.use = group.use.filter((name) => !gone(removed.providers, name))
    field(group, 'source', removed.sources)
    field(group, 'default-selected')
    if (
      (!isDeepStrictEqual(previous.use, group.use) || previous.source !== group.source) &&
      !list(group.proxies).includes(group['default-selected'])
    )
      delete group['default-selected']
    if (
      !isDeepStrictEqual(previous, group) &&
      !group.source &&
      !group['include-all'] &&
      !group['include-all-proxies'] &&
      !group['include-all-providers'] &&
      !list(group.proxies).length &&
      !list(group.use).length
    )
      group.proxies = ['DIRECT']
  }
  for (const node of list(config.proxies)) {
    if (isObject(node)) field(node, 'dialer-proxy')
  }
  for (const kind of ['proxy-providers', 'rule-providers']) {
    if (!isObject(config[kind])) continue
    for (const provider of Object.values(config[kind])) {
      if (!isObject(provider)) continue
      field(provider, 'proxy')
      if (isObject(provider.override)) field(provider.override, 'dialer-proxy')
      if (kind === 'proxy-providers') {
        const payload = list(provider.payload).filter(isObject)
        const localNames = new Set(payload.map((node) => node.name))
        for (const node of payload) {
          if (!localNames.has(node['dialer-proxy'])) field(node, 'dialer-proxy')
        }
      }
    }
  }
  for (const entry of list(config.listeners)) {
    if (!isObject(entry)) continue
    field(entry, 'proxy')
    field(entry, 'rule', removed.subRules)
  }
  if (Array.isArray(config.tunnels)) {
    config.tunnels = config.tunnels.map((entry) => {
      if (isObject(entry)) field(entry, 'proxy')
      else if (typeof entry === 'string') {
        const parts = entry.split(',')
        if (parts.length === 4 && gone(removed.outbounds, parts[3].trim()))
          return parts.slice(0, 3).join(',')
      }
      return entry
    })
  }
  if (isObject(config.ntp)) field(config.ntp, 'dialer-proxy')
  if (isObject(config.tun)) {
    for (const key of ['route-address-set', 'route-exclude-address-set']) {
      if (Array.isArray(config.tun[key]))
        config.tun[key] = config.tun[key].filter((name) => !gone(removed.ruleProviders, name))
    }
  }
  if (isObject(config.dns)) {
    const dns = config.dns
    const ruleSet = (value: unknown): unknown => {
      if (typeof value !== 'string' || !value.toLowerCase().startsWith('rule-set:')) return value
      const names = value
        .slice(9)
        .split(',')
        .filter((name) => !removed.ruleProviders.has(name))
      return names.length ? `${value.slice(0, 9)}${names.join(',')}` : undefined
    }
    const server = (value: unknown): unknown => {
      if (typeof value !== 'string') return value
      const overlay = /^(?:ts|tailscale|et|easytier):\/\/([^/#?]+)/.exec(value)
      if (overlay && removed.outbounds.has(overlay[1])) return undefined
      // DNS fragments may also name interfaces; only remove known deleted outbounds.
      const index = value.indexOf('#')
      if (index < 0) return value
      const fragments = value.slice(index + 1).split('&')
      const kept = fragments.filter((part) => {
        try {
          return part.includes('=') || !removed.outbounds.has(decodeURIComponent(part))
        } catch {
          return true
        }
      })
      return kept.length === fragments.length
        ? value
        : value.slice(0, index) + (kept.length ? `#${kept.join('&')}` : '')
    }
    const servers = (value: unknown): unknown =>
      Array.isArray(value)
        ? value.map(server).filter((entry) => entry !== undefined)
        : server(value)
    for (const key of [
      'nameserver',
      'fallback',
      'default-nameserver',
      'proxy-server-nameserver',
      'direct-nameserver'
    ]) {
      if (dns[key] !== undefined) dns[key] = servers(dns[key])
    }
    for (const key of ['nameserver-policy', 'proxy-server-nameserver-policy']) {
      if (!isObject(dns[key])) continue
      dns[key] = Object.fromEntries(
        Object.entries(dns[key]).flatMap(([name, value]) => {
          const updated = ruleSet(name)
          const entries = servers(value)
          return updated === undefined ||
            entries === undefined ||
            (Array.isArray(entries) && !entries.length)
            ? []
            : [[updated, entries]]
        })
      )
    }
    if (Array.isArray(dns['fake-ip-filter']))
      dns['fake-ip-filter'] =
        dns['fake-ip-filter-mode'] === 'rule'
          ? rules(dns['fake-ip-filter'], false)
          : dns['fake-ip-filter'].map(ruleSet).filter((value) => value !== undefined)
    if (isObject(dns['fallback-filter'])) {
      for (const key of ['domain', 'ipcidr']) {
        if (Array.isArray(dns['fallback-filter'][key]))
          dns['fallback-filter'][key] = dns['fallback-filter'][key]
            .map(ruleSet)
            .filter((value) => value !== undefined)
      }
    }
  }
}

export function cleanupSimpleDraft(
  draft: SimpleDraft,
  removed: RemovedSimpleResources
): SimpleDraft {
  const next = structuredClone(draft)
  const config = Object.fromEntries(
    Object.entries(next.modules).map(([key, value]) => [key, parse(value)])
  )
  const previous = structuredClone(config)
  cleanupSimpleConfig(config, removed)
  for (const key of Object.keys(next.modules)) {
    if (!isDeepStrictEqual(config[key], previous[key])) next.modules[key] = stringify(config[key])
  }
  if (isObject(config.general)) {
    const general = structuredClone(config.general)
    cleanupSimpleConfig(general, removed)
    if (!isDeepStrictEqual(general, config.general)) next.modules.general = stringify(general)
  }
  if (next.preserved) cleanupSimpleConfig(next.preserved, removed)
  for (const source of next.sources) {
    if (source.proxy && removed.outbounds.has(source.proxy)) delete source.proxy
    if (source.providerOptions)
      cleanupSimpleConfig({ 'proxy-providers': { source: source.providerOptions } }, removed)
    const localNames = new Set(source.proxies.map((node) => node.name))
    for (const node of source.proxies) {
      if (
        !localNames.has(node['dialer-proxy']) &&
        typeof node['dialer-proxy'] === 'string' &&
        removed.outbounds.has(node['dialer-proxy'])
      ) {
        if (source.profileId) {
          source.removedDialerProxies = {
            ...source.removedDialerProxies,
            [String(node.name)]: [
              ...new Set([
                ...(source.removedDialerProxies?.[String(node.name)] || []),
                node['dialer-proxy']
              ])
            ]
          }
        }
        delete node['dialer-proxy']
      }
    }
  }
  return next
}
