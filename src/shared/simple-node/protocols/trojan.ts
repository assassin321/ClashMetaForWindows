import type { SimpleNodeType } from '../types'
import { FINGERPRINTS, TLS_ALPN, TROJAN_NETWORKS, TROJAN_SS_METHODS } from '../options'
import { echOpts, jlsOpts, realityOpts, restlsOpts, shadowTlsOpts } from '../fields/tls'
import { grpcOpts, wsOpts } from '../fields/transport'

export const trojan: SimpleNodeType = {
  type: 'trojan',
  label: 'Trojan',
  schemes: ['trojan'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'password', label: '密码', kind: 'password', required: true, secret: true },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'sni', label: 'SNI', kind: 'text' },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    {
      key: 'network',
      label: '传输方式',
      kind: 'select',
      options: TROJAN_NETWORKS,
      hint: '传输协议'
    },
    echOpts,
    shadowTlsOpts,
    restlsOpts,
    jlsOpts,
    realityOpts,
    grpcOpts,
    wsOpts,
    {
      key: 'ss-opts',
      label: 'Shadowsocks 参数',
      kind: 'object',
      children: [
        { key: 'enabled', label: '启用 Shadowsocks', kind: 'bool' },
        { key: 'method', label: '加密方法', kind: 'select', options: TROJAN_SS_METHODS },
        { key: 'password', label: '密码', kind: 'password', secret: true }
      ]
    },
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS }
  ]
}
