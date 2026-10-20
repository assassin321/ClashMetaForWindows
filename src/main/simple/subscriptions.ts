import type { SimpleDraft, SimpleObject, SimpleSource } from '../../shared/simple-config'
import { parse, stringify } from '../utils/yaml'

export interface SimpleProfileSnapshot {
  item: IProfileItem
  config: IMihomoConfig
}

// Resolve linked subscriptions at compile time; profile files remain the only node store.
export async function resolveSimpleDraft(
  draft: SimpleDraft,
  candidate?: SimpleProfileSnapshot
): Promise<SimpleDraft> {
  const { getProfileConfig, getProfile } = await import('../config/profile')
  const { items } = await getProfileConfig()
  const snapshots = new Map<string, Promise<IMihomoConfig>>()
  const sources: SimpleSource[] = []
  for (const source of draft.sources) {
    if (!source.profileId) {
      sources.push(source)
      continue
    }
    const item =
      candidate?.item.id === source.profileId
        ? candidate.item
        : items.find((item) => item.id === source.profileId)
    if (!item) continue
    const mode = source.mode === 'http' && item.type !== 'remote' ? 'inline' : source.mode
    let proxies: SimpleObject[] = []
    if (mode !== 'http') {
      const snapshot =
        snapshots.get(item.id) ??
        (candidate?.item.id === item.id ? Promise.resolve(candidate.config) : getProfile(item.id))
      snapshots.set(item.id, snapshot)
      const profile = await snapshot
      if (!Array.isArray(profile?.proxies) || profile.proxies.length === 0) {
        throw new Error(`订阅 ${item.name}: 没有可导入的 proxies 节点`)
      }
      proxies = structuredClone(profile.proxies) as SimpleObject[]
      for (const node of proxies) {
        if (
          typeof node['dialer-proxy'] === 'string' &&
          source.removedDialerProxies?.[String(node.name)]?.includes(node['dialer-proxy'])
        )
          delete node['dialer-proxy']
      }
    }
    const minutes = Number(item.interval)
    sources.push({
      ...source,
      mode,
      url: item.url,
      interval:
        item.autoUpdate === false
          ? 0
          : Number.isFinite(minutes) && minutes > 0
            ? Math.ceil(minutes * 60)
            : 3600,
      userAgent: item.userAgent,
      authorization: item.authToken,
      ageSecretKey: item.ageSecretKey,
      extra: item.extra,
      updated: item.updated,
      proxies
    })
  }
  return { ...draft, sources }
}

export function replaceSimpleSource(
  draft: SimpleDraft,
  previous: SimpleSource | undefined,
  source: SimpleSource
): SimpleDraft {
  const sources = previous
    ? draft.sources.map((item) => (item.id === previous.id ? source : item))
    : [...draft.sources, source]
  if (!previous) return { ...draft, sources }
  const groups = parse(draft.modules['proxy-groups']) as SimpleObject[]
  if (!Array.isArray(groups)) throw new Error('策略组应为 YAML 列表')
  const oldNodes = new Map(
    previous.proxies.map((node) => [
      `${previous.prefix}${node.name}`,
      `${source.prefix}${node.name}`
    ])
  )
  for (const group of groups) {
    if (group.source === previous.name) group.source = source.name
    if (Array.isArray(group.use) && group.use.includes(previous.name)) {
      group.use = group.use.filter((name) => name !== previous.name)
      if (source.mode === 'extract') {
        group.proxies = [
          ...new Set([
            ...(Array.isArray(group.proxies) ? group.proxies : []),
            ...source.proxies.map((node) => `${source.prefix}${node.name}`)
          ])
        ]
      } else group.use = [...new Set([...(group.use as string[]), source.name])]
    }
    if (previous.mode === 'extract' && Array.isArray(group.proxies)) {
      if (source.mode === 'extract') {
        group.proxies = [...new Set(group.proxies.map((name) => oldNodes.get(name) ?? name))]
      } else if (group.proxies.some((name) => oldNodes.has(name))) {
        group.proxies = group.proxies.filter((name) => !oldNodes.has(name))
        group.use = [...new Set([...(Array.isArray(group.use) ? group.use : []), source.name])]
      }
    }
  }
  return {
    ...draft,
    sources,
    modules: { ...draft.modules, 'proxy-groups': stringify(groups) }
  }
}
