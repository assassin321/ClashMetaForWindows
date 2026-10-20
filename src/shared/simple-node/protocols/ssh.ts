import type { SimpleNodeType } from '../types'
import { SSH_HOST_KEY_ALGORITHMS } from '../options'

export const ssh: SimpleNodeType = {
  type: 'ssh',
  label: 'SSH',
  schemes: ['ssh'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'username', label: '用户名', kind: 'text', required: true },
    { key: 'password', label: '密码', kind: 'password', secret: true },
    { key: 'private-key', label: '私钥', kind: 'password', secret: true },
    { key: 'private-key-passphrase', label: '私钥口令', kind: 'password', secret: true },
    { key: 'host-key', label: '主机密钥', kind: 'list' },
    {
      key: 'host-key-algorithms',
      label: '主机密钥算法',
      kind: 'list',
      options: SSH_HOST_KEY_ALGORITHMS
    }
  ]
}
