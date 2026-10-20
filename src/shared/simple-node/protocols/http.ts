import type { SimpleNodeType } from '../types'
import { FINGERPRINTS } from '../options'

export const http: SimpleNodeType = {
  type: 'http',
  label: 'HTTP',
  schemes: ['http', 'https'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'username', label: '用户名', kind: 'text' },
    { key: 'password', label: '密码', kind: 'password', secret: true },
    { key: 'tls', label: 'TLS', kind: 'bool' },
    { key: 'sni', label: 'SNI', kind: 'text' },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'headers', label: '请求头', kind: 'map' }
  ]
}
