import type { SimpleNodeType } from '../types'
import { ZEROTIER_TCP_FALLBACK_MODES } from '../options'
import { ipStackField } from '../fields/tunnel'

export const zerotier: SimpleNodeType = {
  type: 'zerotier',
  label: 'ZeroTier',
  schemes: ['zerotier'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    {
      key: 'network',
      label: '传输方式',
      kind: 'select',
      required: true,
      options: ['tcp', 'ws', 'http', 'h2', 'grpc', 'mkcp', 'kcp', 'mekya', 'xhttp']
    },
    { key: 'state-dir', label: '状态目录', kind: 'text' },
    { key: 'identity-secret', label: '身份密钥', kind: 'password', secret: true },
    { key: 'planet', label: 'Planet 文件', kind: 'text' },
    { key: 'mtu', label: 'MTU', kind: 'number' },
    ipStackField,
    { key: 'physical-mtu', label: '物理 MTU', kind: 'number' },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'remote-dns-resolve', label: '远程 DNS 解析', kind: 'bool' },
    { key: 'dns', label: 'DNS', kind: 'list' },
    { key: 'low-bandwidth', label: '低带宽模式', kind: 'bool' },
    { key: 'encrypted-hello', label: '加密握手', kind: 'bool' },
    { key: 'primary-port', label: '主端口', kind: 'number' },
    { key: 'secondary-port', label: '备用端口', kind: 'number' },
    {
      key: 'tcp-fallback-mode',
      label: 'TCP 回退模式',
      kind: 'select',
      options: ZEROTIER_TCP_FALLBACK_MODES
    },
    { key: 'tcp-fallback-relay', label: 'TCP 回退中继', kind: 'text' },
    {
      key: 'orbit',
      label: 'Orbit',
      kind: 'list',
      children: [
        { key: 'world', label: 'World ID', kind: 'text' },
        { key: 'seed', label: '种子', kind: 'text' }
      ]
    },
    { key: 'remote-trace-target', label: '远程追踪目标', kind: 'text' },
    { key: 'remote-trace-level', label: '远程追踪级别', kind: 'select', options: ['0', '1', '2'] }
  ]
}
