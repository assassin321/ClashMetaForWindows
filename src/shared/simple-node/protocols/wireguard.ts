import type { SimpleNodeField, SimpleNodeType } from '../types'
import { amneziaWgOption, ipStackField } from '../fields/tunnel'

export const wireGuardPeers: SimpleNodeField = {
  key: 'peers',
  label: '对端',
  kind: 'list',
  hint: 'peer配置',
  children: [
    { key: 'server', label: '服务器', kind: 'text' },
    { key: 'port', label: '端口', kind: 'number' },
    { key: 'public-key', label: '公钥', kind: 'text' },
    { key: 'pre-shared-key', label: '预共享密钥', kind: 'password', secret: true },
    { key: 'reserved', label: 'Reserved', kind: 'list' },
    { key: 'allowed-ips', label: '允许的 IP', kind: 'list' }
  ]
}

export const wireguard: SimpleNodeType = {
  type: 'wireguard',
  label: 'WireGuard',
  schemes: ['wireguard'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'ip', label: 'IP', kind: 'text' },
    { key: 'ipv6', label: 'IPv6', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', required: true, secret: true },
    { key: 'workers', label: 'Workers', kind: 'number' },
    { key: 'mtu', label: 'MTU', kind: 'number' },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'persistent-keepalive', label: '持久保活间隔', kind: 'number' },
    ipStackField,
    amneziaWgOption,
    wireGuardPeers,
    { key: 'remote-dns-resolve', label: '远程 DNS 解析', kind: 'bool' },
    { key: 'dns', label: 'DNS', kind: 'list' },
    { key: 'refresh-server-ip-interval', label: '刷新服务器 IP 间隔', kind: 'number' }
  ]
}
