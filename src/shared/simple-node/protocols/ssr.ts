import type { SimpleNodeType } from '../types'
import { SSR_CIPHERS, SSR_OBFS, SSR_PROTOCOLS } from '../options'

export const ssr: SimpleNodeType = {
  type: 'ssr',
  label: 'ShadowsocksR',
  schemes: ['ssr'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'password', label: '密码', kind: 'password', required: true, secret: true },
    {
      key: 'cipher',
      label: '加密方式',
      kind: 'select',
      required: true,
      options: SSR_CIPHERS,
      hint: '加密方法'
    },
    {
      key: 'obfs',
      label: '混淆',
      kind: 'select',
      required: true,
      options: SSR_OBFS,
      hint: '混淆方法'
    },
    { key: 'obfs-param', label: '混淆参数', kind: 'text' },
    {
      key: 'protocol',
      label: '协议',
      kind: 'select',
      required: true,
      options: SSR_PROTOCOLS,
      hint: '认证协议'
    },
    { key: 'protocol-param', label: '协议参数', kind: 'text' },
    { key: 'udp', label: 'UDP', kind: 'bool' }
  ]
}
