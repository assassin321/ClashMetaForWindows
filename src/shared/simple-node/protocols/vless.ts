import type { SimpleNodeType } from '../types'
import { FINGERPRINTS, PACKET_ENCODINGS, TLS_ALPN, VLESS_FLOWS, VLESS_NETWORKS } from '../options'
import { echOpts, jlsOpts, realityOpts, restlsOpts, shadowTlsOpts } from '../fields/tls'
import { grpcOpts, h2Opts, httpOpts, wsOpts, xhttpOpts } from '../fields/transport'

export const vless: SimpleNodeType = {
  type: 'vless',
  label: 'VLESS',
  schemes: ['vless'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'uuid', label: 'UUID', kind: 'password', required: true, secret: true },
    { key: 'flow', label: 'Flow', kind: 'select', options: VLESS_FLOWS, hint: '流量控制方式' },
    { key: 'tls', label: 'TLS', kind: 'bool' },
    { key: 'alpn', label: 'ALPN', kind: 'list', options: TLS_ALPN },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'packet-addr', label: 'Packet Address', kind: 'bool' },
    { key: 'xudp', label: 'XUDP', kind: 'bool' },
    {
      key: 'packet-encoding',
      label: '包编码',
      kind: 'select',
      options: PACKET_ENCODINGS,
      hint: '数据包的编码方式'
    },
    { key: 'encryption', label: '加密', kind: 'text' },
    {
      key: 'network',
      label: '传输方式',
      kind: 'select',
      options: VLESS_NETWORKS,
      hint: '传输协议'
    },
    echOpts,
    shadowTlsOpts,
    restlsOpts,
    jlsOpts,
    realityOpts,
    httpOpts,
    h2Opts,
    grpcOpts,
    wsOpts,
    xhttpOpts,
    { key: 'ws-headers', label: 'WebSocket 请求头', kind: 'map', hidden: true, hint: 'ws请求头' },
    { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
    { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
    { key: 'fingerprint', label: '证书指纹', kind: 'select', options: FINGERPRINTS },
    { key: 'certificate', label: '证书', kind: 'text' },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'servername', label: 'SNI', kind: 'text' },
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS }
  ]
}
