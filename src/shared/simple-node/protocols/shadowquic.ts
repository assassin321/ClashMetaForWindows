import type { SimpleNodeType } from '../types'
import { BBR_PROFILES, TLS_ALPN } from '../options'

export const shadowquic: SimpleNodeType = {
  type: 'shadowquic',
  label: 'ShadowQUIC',
  schemes: ['shadowquic'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'username', label: '用户名', kind: 'text' },
    { key: 'password', label: '密码', kind: 'password', secret: true },
    { key: 'sni', label: 'SNI', kind: 'text' },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'quic-versions', label: 'QUIC 版本', kind: 'list' },
    { key: 'udp-over-stream', label: 'UDP over Stream', kind: 'bool' },
    { key: 'zero-rtt', label: '0-RTT', kind: 'bool' },
    { key: 'keep-alive-interval', label: '保活间隔', kind: 'number' },
    {
      key: 'congestion-controller',
      label: '拥塞控制',
      kind: 'select',
      options: ['cubic', 'new_reno', 'bbr_meta_v1', 'bbr_meta_v2', 'bbr'],
      hint: '拥塞控制算法'
    },
    { key: 'up', label: '上行', kind: 'text' },
    { key: 'down', label: '下行', kind: 'text' },
    { key: 'cwnd', label: '拥塞窗口', kind: 'number' },
    {
      key: 'bbr-profile',
      label: 'BBR 配置',
      kind: 'select',
      options: BBR_PROFILES,
      default: 'standard',
      hint: '拥塞控制预设方案'
    },
    { key: 'recv-window-conn', label: '连接接收窗口', kind: 'number' },
    { key: 'recv-window', label: '流接收窗口', kind: 'number' },
    { key: 'disable-mtu-discovery', label: '禁用 MTU 探测', kind: 'bool' },
    { key: 'max-datagram-frame-size', label: '最大数据报帧', kind: 'number' },
    { key: 'max-open-streams', label: '最大并发流', kind: 'number' }
  ]
}
