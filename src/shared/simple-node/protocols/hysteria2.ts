import type { SimpleNodeType } from '../types'
import { BBR_PROFILES, FINGERPRINTS, HYSTERIA2_OBFS, TLS_ALPN } from '../options'
import { echOpts } from '../fields/tls'

export const hysteria2: SimpleNodeType = {
  type: 'hysteria2',
  label: 'Hysteria2',
  schemes: ['hysteria2', 'hy2'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'ports', label: '端口范围', kind: 'text' },
    { key: 'hop-interval', label: '端口跳跃间隔', kind: 'text' },
    { key: 'up', label: '上行', kind: 'text' },
    { key: 'down', label: '下行', kind: 'text' },
    { key: 'password', label: '密码', kind: 'password', required: true, secret: true },
    { key: 'obfs', label: '混淆', kind: 'select', options: HYSTERIA2_OBFS, hint: '混淆方式' },
    { key: 'obfs-password', label: '混淆密码', kind: 'password', secret: true },
    { key: 'obfs-min-packet-size', label: '混淆最小包', kind: 'number' },
    { key: 'obfs-max-packet-size', label: '混淆最大包', kind: 'number' },
    { key: 'sni', label: 'SNI', kind: 'text' },
    echOpts,
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'cwnd', label: '拥塞窗口', kind: 'number' },
    {
      key: 'bbr-profile',
      label: 'BBR 配置',
      kind: 'select',
      options: BBR_PROFILES,
      default: 'standard',
      hint: '拥塞控制预设方案'
    },
    { key: 'udp-mtu', label: 'UDP MTU', kind: 'number' },
    { key: 'handshake-timeout', label: '握手超时', kind: 'number' },
    {
      key: 'realm-opts',
      label: 'Realm 参数',
      kind: 'object',
      children: [
        { key: 'enable', label: '启用 Realm', kind: 'bool' },
        { key: 'server-url', label: '服务器 URL', kind: 'text' },
        { key: 'token', label: 'Token', kind: 'password', secret: true },
        { key: 'realm-id', label: 'Realm ID', kind: 'text' },
        { key: 'stun-servers', label: 'STUN 服务器', kind: 'list' },
        { key: 'sni', label: 'SNI', kind: 'text' },
        { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
        { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
        { key: 'fingerprint', label: '证书指纹', kind: 'text' },
        { key: 'certificate', label: '证书', kind: 'text' },
        { key: 'private-key', label: '私钥', kind: 'password', secret: true },
        { key: 'alpn', label: 'ALPN', kind: 'list' }
      ]
    },
    {
      key: 'initial-stream-receive-window',
      label: '初始流接收窗口',
      kind: 'number',
      default: 1572864,
      hint: '单位:bytes'
    },
    {
      key: 'max-stream-receive-window',
      label: '最大流接收窗口',
      kind: 'number',
      default: 15728640,
      hint: '单位:bytes'
    },
    {
      key: 'initial-connection-receive-window',
      label: '初始连接接收窗口',
      kind: 'number',
      default: 6710886,
      hint: '单位:bytes'
    },
    {
      key: 'max-connection-receive-window',
      label: '最大连接接收窗口',
      kind: 'number',
      default: 67108864,
      hint: '单位:bytes'
    }
  ]
}
