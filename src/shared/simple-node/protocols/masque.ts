import type { SimpleNodeType } from '../types'
import { BBR_PROFILES } from '../options'
import { ipStackField } from '../fields/tunnel'

export const masque: SimpleNodeType = {
  type: 'masque',
  label: 'MASQUE',
  schemes: ['masque'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'private-key', label: '私钥', kind: 'password', required: true, secret: true },
    { key: 'public-key', label: '公钥', kind: 'text', required: true },
    { key: 'ip', label: 'IP', kind: 'text' },
    { key: 'ipv6', label: 'IPv6', kind: 'text' },
    { key: 'uri', label: 'URI', kind: 'text' },
    { key: 'sni', label: 'SNI', kind: 'text' },
    { key: 'mtu', label: 'MTU', kind: 'number' },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'handshake-timeout', label: '握手超时', kind: 'number' },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    {
      key: 'network',
      label: '传输方式',
      kind: 'select',
      options: ['h2', 'h3-l4proxy'],
      hint: '传输协议'
    },
    {
      key: 'congestion-controller',
      label: '拥塞控制',
      kind: 'select',
      options: ['cubic', 'new_reno', 'bbr_meta_v1', 'bbr_meta_v2', 'bbr'],
      hint: '拥塞控制算法'
    },
    { key: 'cwnd', label: '拥塞窗口', kind: 'number' },
    {
      key: 'bbr-profile',
      label: 'BBR 配置',
      kind: 'select',
      options: BBR_PROFILES,
      default: 'standard',
      hint: '拥塞控制预设方案'
    },
    ipStackField,
    { key: 'remote-dns-resolve', label: '远程 DNS 解析', kind: 'bool' },
    { key: 'dns', label: 'DNS', kind: 'list' }
  ]
}
