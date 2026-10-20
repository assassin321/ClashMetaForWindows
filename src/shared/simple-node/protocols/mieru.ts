import type { SimpleNodeType } from '../types'
import { MIERU_HANDSHAKE_MODES, MIERU_MULTIPLEXING, MIERU_TRANSPORTS } from '../options'

export const mieru: SimpleNodeType = {
  type: 'mieru',
  label: 'Mieru',
  schemes: ['mieru'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number' },
    { key: 'port-range', label: '端口范围', kind: 'text' },
    {
      key: 'transport',
      label: '传输协议',
      kind: 'select',
      options: MIERU_TRANSPORTS,
      hint: '传输层协议'
    },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'username', label: '用户名', kind: 'text', required: true },
    { key: 'password', label: '密码', kind: 'password', required: true, secret: true },
    {
      key: 'multiplexing',
      label: '多路复用',
      kind: 'select',
      options: MIERU_MULTIPLEXING,
      default: 'MULTIPLEXING_LOW',
      hint: '多路复用级别'
    },
    {
      key: 'handshake-mode',
      label: '握手模式',
      kind: 'select',
      options: MIERU_HANDSHAKE_MODES,
      default: 'HANDSHAKE_STANDARD'
    },
    { key: 'traffic-pattern', label: '流量特征', kind: 'text' }
  ]
}
