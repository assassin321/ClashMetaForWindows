import type { SimpleNodeType } from '../types'
import { FINGERPRINTS, HYSTERIA_PROTOCOLS, SSR_OBFS, TLS_ALPN } from '../options'
import { echOpts } from '../fields/tls'

export const hysteria: SimpleNodeType = {
  type: 'hysteria',
  label: 'Hysteria',
  schemes: ['hysteria'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'ports', label: '端口范围', kind: 'text' },
    {
      key: 'protocol',
      label: '协议',
      kind: 'select',
      options: HYSTERIA_PROTOCOLS,
      default: 'udp',
      hint: '混淆方法'
    },
    {
      key: 'obfs-protocol',
      label: '混淆协议',
      kind: 'select',
      hidden: true,
      options: HYSTERIA_PROTOCOLS,
      default: 'udp',
      hint: '混淆方法(为兼容Stash引入,优先级高于protocol)'
    },
    { key: 'up', label: '上行', kind: 'text' },
    { key: 'up-speed', label: '上行速率', kind: 'number', hidden: true },
    { key: 'down', label: '下行', kind: 'text' },
    { key: 'down-speed', label: '下行速率', kind: 'number', hidden: true },
    { key: 'auth', label: '认证', kind: 'text', hidden: true },
    { key: 'auth-str', label: '认证字符串', kind: 'text' },
    { key: 'obfs', label: '混淆', kind: 'select', options: SSR_OBFS },
    { key: 'sni', label: 'SNI', kind: 'text' },
    echOpts,
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'recv-window-conn', label: '连接接收窗口', kind: 'number' },
    { key: 'recv-window', label: '流接收窗口', kind: 'number' },
    { key: 'disable-mtu-discovery', label: '禁用 MTU 探测', kind: 'bool' },
    { key: 'fast-open', label: 'TCP Fast Open', kind: 'bool' },
    { key: 'hop-interval', label: '端口跳跃间隔', kind: 'number' }
  ]
}
