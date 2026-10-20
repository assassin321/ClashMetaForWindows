import type { SimpleNodeType } from '../types'
import { FINGERPRINTS, SNEL_VERSIONS } from '../options'

export const snell: SimpleNodeType = {
  type: 'snell',
  label: 'Snell',
  schemes: ['snell'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'psk', label: 'PSK', kind: 'password', required: true, secret: true },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'version', label: '版本', kind: 'select', options: SNEL_VERSIONS, default: 1 },
    { key: 'reuse', label: '复用连接', kind: 'bool' },
    { key: 'obfs-opts', label: '混淆参数', kind: 'map', hint: 'Snell混淆配置' },
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS }
  ]
}
