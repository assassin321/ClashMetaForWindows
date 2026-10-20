import type { SimpleNodeType } from '../types'
import { FINGERPRINTS, TLS_ALPN } from '../options'
import { echOpts, jlsOpts, restlsOpts, shadowTlsOpts } from '../fields/tls'

export const anytls: SimpleNodeType = {
  type: 'anytls',
  label: 'AnyTLS',
  schemes: ['anytls'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'password', label: '密码', kind: 'password', required: true, secret: true },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'sni', label: 'SNI', kind: 'text' },
    echOpts,
    shadowTlsOpts,
    restlsOpts,
    jlsOpts,
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'client-metadata', label: '客户端元数据', kind: 'text' },
    { key: 'idle-session-check-interval', label: '空闲检测间隔', kind: 'number' },
    { key: 'idle-session-timeout', label: '空闲超时', kind: 'number' },
    { key: 'min-idle-session', label: '最小空闲会话', kind: 'number' },
    { key: 'disable-reuse', label: '禁用连接复用', kind: 'bool' }
  ]
}
