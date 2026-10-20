import type { SimpleNodeType } from '../types'
import { BBR_PROFILES, FINGERPRINTS, TLS_ALPN, TUIC_RELAY_MODES } from '../options'
import { echOpts } from '../fields/tls'

export const tuic: SimpleNodeType = {
  type: 'tuic',
  label: 'TUIC',
  schemes: ['tuic'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'token', label: 'Token', kind: 'password', secret: true },
    { key: 'uuid', label: 'UUID', kind: 'password', secret: true },
    { key: 'password', label: '密码', kind: 'password', secret: true },
    { key: 'ip', label: 'IP', kind: 'text' },
    { key: 'heartbeat-interval', label: '心跳间隔', kind: 'number' },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'reduce-rtt', label: '降低 RTT', kind: 'bool' },
    { key: 'request-timeout', label: '请求超时', kind: 'number' },
    {
      key: 'udp-relay-mode',
      label: 'UDP 中继模式',
      kind: 'select',
      options: TUIC_RELAY_MODES,
      default: 'native',
      hint: 'UDP数据包中继模式'
    },
    {
      key: 'congestion-controller',
      label: '拥塞控制',
      kind: 'select',
      options: ['cubic', 'new_reno', 'bbr_meta_v1', 'bbr_meta_v2', 'bbr'],
      hint: '拥塞控制算法'
    },
    { key: 'disable-sni', label: '禁用 SNI', kind: 'bool' },
    { key: 'max-udp-relay-packet-size', label: 'UDP 中继包上限', kind: 'number' },
    { key: 'fast-open', label: 'TCP Fast Open', kind: 'bool' },
    { key: 'max-open-streams', label: '最大并发流', kind: 'number' },
    { key: 'cwnd', label: '拥塞窗口', kind: 'number' },
    {
      key: 'bbr-profile',
      label: 'BBR 配置',
      kind: 'select',
      options: BBR_PROFILES,
      default: 'standard',
      hint: '拥塞控制预设方案'
    },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'recv-window-conn', label: '连接接收窗口', kind: 'number' },
    { key: 'recv-window', label: '流接收窗口', kind: 'number' },
    { key: 'disable-mtu-discovery', label: '禁用 MTU 探测', kind: 'bool' },
    { key: 'max-datagram-frame-size', label: '最大数据报帧', kind: 'number' },
    { key: 'sni', label: 'SNI', kind: 'text' },
    echOpts,
    { key: 'udp-over-stream', label: 'UDP over Stream', kind: 'bool' },
    { key: 'udp-over-stream-version', label: 'UDP over Stream 版本', kind: 'number' }
  ]
}
