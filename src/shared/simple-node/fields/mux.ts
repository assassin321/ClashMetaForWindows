import type { SimpleNodeField } from '../types'
import { SMUX_PROTOCOLS } from '../options'

export const smuxField: SimpleNodeField = {
  key: 'smux',
  label: '多路复用',
  kind: 'object',
  hint: 'sing-mux多路复用配置',
  children: [
    { key: 'enabled', label: '启用多路复用', kind: 'bool' },
    {
      key: 'protocol',
      label: '多路复用协议',
      kind: 'select',
      options: SMUX_PROTOCOLS,
      default: 'h2mux'
    },
    { key: 'max-connections', label: '最大连接数', kind: 'number' },
    { key: 'min-streams', label: '最小流数', kind: 'number' },
    { key: 'max-streams', label: '最大流数', kind: 'number' },
    { key: 'padding', label: '启用填充', kind: 'bool' },
    { key: 'statistic', label: '统计信息', kind: 'bool' },
    { key: 'only-tcp', label: '仅 TCP 生效', kind: 'bool' },
    {
      key: 'brutal-opts',
      label: 'Brutal 参数',
      kind: 'object',
      hint: 'Brutal拥塞控制',
      children: [
        { key: 'enabled', label: '启用', kind: 'bool' },
        { key: 'up', label: '上行', kind: 'text' },
        { key: 'down', label: '下行', kind: 'text' }
      ]
    }
  ]
}
