import type { SimpleNodeType } from '../types'

export const tailscale: SimpleNodeType = {
  type: 'tailscale',
  label: 'Tailscale',
  schemes: ['tailscale'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'hostname', label: '主机名', kind: 'text' },
    { key: 'auth-key', label: 'Auth Key', kind: 'password', secret: true },
    { key: 'control-url', label: '控制服务器', kind: 'text' },
    { key: 'state-dir', label: '状态目录', kind: 'text' },
    {
      key: 'ephemeral',
      label: '临时节点',
      kind: 'bool',
      default: false,
      hint: '启用后以 ephemeral node 身份登录，节点下线后自动从 Tailnet 中移除，适用于临时访问场景'
    },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'accept-routes', label: '接受路由', kind: 'bool' },
    { key: 'exit-node', label: '出口节点', kind: 'text' },
    { key: 'exit-node-allow-lan-access', label: '出口节点允许局域网', kind: 'bool' }
  ]
}
