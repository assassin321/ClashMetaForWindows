import type { SimpleNodeType } from '../types'
import { SUDOKU_AEAD_METHODS, SUDOKU_MULTIPLEX, SUDOKU_TABLE_TYPES } from '../options'

export const sudoku: SimpleNodeType = {
  type: 'sudoku',
  label: 'Sudoku',
  schemes: ['sudoku'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'key', label: '密钥', kind: 'password', required: true, secret: true },
    {
      key: 'aead-method',
      label: 'AEAD 方式',
      kind: 'select',
      options: SUDOKU_AEAD_METHODS,
      default: 'chacha20-poly1305',
      hint: '加密算法'
    },
    { key: 'padding-min', label: '最小填充', kind: 'number' },
    { key: 'padding-max', label: '最大填充', kind: 'number' },
    {
      key: 'table-type',
      label: '码表类型',
      kind: 'select',
      options: SUDOKU_TABLE_TYPES,
      default: 'prefer_entropy',
      hint: '映射表类型'
    },
    { key: 'enable-pure-downlink', label: '纯下行', kind: 'bool' },
    { key: 'http-mask', label: 'HTTP 伪装', kind: 'bool', hidden: true },
    { key: 'http-mask-mode', label: '伪装模式', kind: 'text', hidden: true },
    { key: 'http-mask-tls', label: '伪装 TLS', kind: 'bool', hidden: true },
    { key: 'http-mask-host', label: '伪装 Host', kind: 'text', hidden: true },
    { key: 'path-root', label: '路径前缀', kind: 'text', hidden: true },
    {
      key: 'multiplex',
      label: '多路复用',
      kind: 'select',
      options: SUDOKU_MULTIPLEX,
      default: 'off',
      hint: '控制 Sudoku 会话多路复用模式'
    },
    { key: 'http-mask-multiplex', label: '伪装多路复用', kind: 'text', hidden: true },
    {
      key: 'httpmask',
      label: 'HTTP 伪装参数',
      kind: 'object',
      children: [
        { key: 'disable', label: '禁用伪装', kind: 'bool' },
        {
          key: 'mode',
          label: '伪装模式',
          kind: 'select',
          options: ['legacy', 'stream', 'poll', 'auto', 'ws'],
          default: 'legacy',
          hint: 'stream/poll/auto 支持走 CDN/反代'
        },
        { key: 'tls', label: '伪装 TLS', kind: 'bool' },
        { key: 'host', label: '伪装 Host', kind: 'text' },
        { key: 'path-root', label: '路径前缀', kind: 'text' },
        {
          key: 'multiplex',
          label: '多路复用',
          kind: 'select',
          options: ['off', 'auto', 'on'],
          default: 'off',
          hint: '复用单条隧道并在其内多路复用多个目标连接'
        }
      ]
    },
    { key: 'custom-table', label: '自定义码表', kind: 'text' },
    { key: 'custom-tables', label: '自定义码表组', kind: 'list' }
  ]
}
