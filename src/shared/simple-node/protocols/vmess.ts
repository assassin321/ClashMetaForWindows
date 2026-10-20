import type { SimpleNodeType } from '../types'
import { FINGERPRINTS, PACKET_ENCODINGS, TLS_ALPN, VMESS_CIPHERS, VMESS_NETWORKS } from '../options'
import {
  echOpts,
  jlsOpts,
  realityOpts,
  restlsOpts,
  shadowTlsOpts,
  tlsMirrorOpts
} from '../fields/tls'
import { grpcOpts, h2Opts, httpOpts, mekyaOpts, mkcpOpts, wsOpts } from '../fields/transport'

export const vmess: SimpleNodeType = {
  type: 'vmess',
  label: 'VMess',
  schemes: ['vmess'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'uuid', label: 'UUID', kind: 'password', required: true, secret: true },
    { key: 'alterId', label: 'AlterId', kind: 'number' },
    { key: 'cipher', label: '加密方式', kind: 'select', options: VMESS_CIPHERS, hint: '加密方法' },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    {
      key: 'network',
      label: '传输方式',
      kind: 'select',
      options: VMESS_NETWORKS,
      hint: '传输协议'
    },
    { key: 'tls', label: 'TLS', kind: 'bool' },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'servername', label: 'SNI', kind: 'text' },
    echOpts,
    shadowTlsOpts,
    restlsOpts,
    jlsOpts,
    realityOpts,
    tlsMirrorOpts,
    mekyaOpts,
    mkcpOpts,
    httpOpts,
    h2Opts,
    grpcOpts,
    wsOpts,
    { key: 'packet-addr', label: 'Packet Address', kind: 'bool' },
    { key: 'xudp', label: 'XUDP', kind: 'bool' },
    {
      key: 'packet-encoding',
      label: '包编码',
      kind: 'select',
      options: PACKET_ENCODINGS,
      hint: '数据包的编码方式'
    },
    { key: 'global-padding', label: '全局填充', kind: 'bool' },
    { key: 'authenticated-length', label: '认证长度', kind: 'bool' },
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS }
  ]
}
