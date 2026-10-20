import type { SimpleNodeType } from '../types'

export const easytier: SimpleNodeType = {
  type: 'easytier',
  label: 'EasyTier',
  schemes: ['easytier'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'network-name', label: '网络名称', kind: 'text', required: true },
    { key: 'network-secret', label: '网络密钥', kind: 'password', secret: true },
    { key: 'hostname', label: '主机名', kind: 'text' },
    { key: 'ipv4', label: 'IPv4', kind: 'text' },
    { key: 'dhcp', label: 'DHCP', kind: 'bool' },
    { key: 'peers', label: '对端', kind: 'list' },
    { key: 'listeners', label: '监听地址', kind: 'list' },
    { key: 'no-listener', label: '禁用监听', kind: 'bool' },
    { key: 'mapped-listeners', label: '映射监听', kind: 'list' },
    { key: 'exit-nodes', label: '出口节点', kind: 'list' },
    { key: 'proxy-networks', label: '代理网段', kind: 'list' },
    { key: 'instance-name', label: '实例名称', kind: 'text' },
    { key: 'state-dir', label: '状态目录', kind: 'text' },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'accept-dns', label: '接受 DNS', kind: 'bool' },
    { key: 'enable-exit-node', label: '启用出口节点', kind: 'bool' },
    { key: 'enable-encryption', label: '启用加密', kind: 'bool' },
    {
      key: 'encryption-algorithm',
      label: '加密算法',
      kind: 'select',
      options: ['aes-gcm', 'chacha20', 'aes-gcm-256']
    },
    { key: 'private-mode', label: '私有模式', kind: 'bool' },
    { key: 'latency-first', label: '延迟优先', kind: 'bool' },
    { key: 'disable-p2p', label: '禁用 P2P', kind: 'bool' },
    { key: 'enable-kcp-proxy', label: '启用 KCP 代理', kind: 'bool' },
    { key: 'disable-kcp-input', label: '禁用 KCP 入站', kind: 'bool' },
    { key: 'enable-quic-proxy', label: '启用 QUIC 代理', kind: 'bool' },
    { key: 'disable-quic-input', label: '禁用 QUIC 入站', kind: 'bool' },
    { key: 'mtu', label: 'MTU', kind: 'number' },
    { key: 'tld-dns-zone', label: 'TLD DNS 区域', kind: 'text' },
    { key: 'secure-mode', label: '安全模式', kind: 'bool' },
    { key: 'local-private-key', label: '本地私钥', kind: 'password', secret: true },
    { key: 'local-public-key', label: '本地公钥', kind: 'text' }
  ]
}
