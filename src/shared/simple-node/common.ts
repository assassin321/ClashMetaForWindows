import type { SimpleNodeField } from './types'
import { IP_VERSIONS } from './options'
import { smuxField } from './fields/mux'

export const SIMPLE_NODE_COMMON_FIELDS: readonly SimpleNodeField[] = [
  { key: 'tfo', label: 'TCP Fast Open', kind: 'bool' },
  { key: 'mptcp', label: 'MPTCP', kind: 'bool' },
  { key: 'interface-name', label: '出口网卡', kind: 'text' },
  { key: 'routing-mark', label: '路由标记', kind: 'number' },
  { key: 'ip-version', label: 'IP 版本', kind: 'select', options: IP_VERSIONS, default: 'dual' },
  { key: 'dialer-proxy', label: '前置代理', kind: 'text' },
  smuxField
]
