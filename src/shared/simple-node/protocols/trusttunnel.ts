import type { SimpleNodeType } from '../types'
import { BBR_PROFILES, FINGERPRINTS, TLS_ALPN } from '../options'
import { echOpts } from '../fields/tls'

export const trusttunnel: SimpleNodeType = {
  type: 'trusttunnel',
  label: 'TrustTunnel',
  schemes: ['trusttunnel'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'username', label: '用户名', kind: 'text' },
    { key: 'password', label: '密码', kind: 'password', secret: true },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'sni', label: 'SNI', kind: 'text' },
    echOpts,
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'health-check', label: '健康检查', kind: 'bool' },
    { key: 'quic', label: 'QUIC', kind: 'bool' },
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
    { key: 'max-connections', label: '最大连接数', kind: 'number' },
    { key: 'min-streams', label: '最小流数', kind: 'number' },
    { key: 'max-streams', label: '最大流数', kind: 'number' }
  ]
}
