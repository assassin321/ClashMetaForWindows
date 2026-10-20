import type { SimpleNodeType } from '../types'
import {
  OPENVPN_AUTHS,
  OPENVPN_COMP_LZO,
  OPENVPN_KEY_DIRECTIONS,
  OPENVPN_PROTOS,
  SS_CIPHERS
} from '../options'
import { ipStackField } from '../fields/tunnel'

export const openvpn: SimpleNodeType = {
  type: 'openvpn',
  label: 'OpenVPN',
  schemes: ['openvpn'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    {
      key: 'proto',
      label: '协议',
      kind: 'select',
      options: OPENVPN_PROTOS,
      default: 'udp',
      hint: '传输协议'
    },
    {
      key: 'dev',
      label: '设备',
      kind: 'select',
      options: ['tun'],
      default: 'tun',
      hint: '设备类型'
    },
    { key: 'cipher', label: '加密方式', kind: 'select', options: SS_CIPHERS },
    {
      key: 'data-ciphers',
      label: '数据加密算法',
      kind: 'list',
      hint: '向服务端通告的数据通道加密方式列表，按服务端列表顺序选择首个双方支持的值'
    },
    { key: 'data-ciphers-fallback', label: '回退加密算法', kind: 'text' },
    {
      key: 'auth',
      label: '认证',
      kind: 'select',
      options: OPENVPN_AUTHS,
      default: 'SHA256',
      hint: 'AEAD cipher 会忽略 auth'
    },
    {
      key: 'comp-lzo',
      label: 'LZO 压缩',
      kind: 'select',
      options: OPENVPN_COMP_LZO,
      default: 'no',
      hint: 'Lempel-Ziv-Oberhumer 压缩策略'
    },
    { key: 'ca', label: 'CA 证书', kind: 'text' },
    { key: 'cert', label: '客户端证书', kind: 'text' },
    { key: 'key', label: '密钥', kind: 'password', secret: true },
    { key: 'tls-auth', label: 'TLS Auth', kind: 'text' },
    {
      key: 'key-direction',
      label: '密钥方向',
      kind: 'select',
      options: OPENVPN_KEY_DIRECTIONS,
      hint: '仅用于 tls-auth；未配置时出站入站均使用第一组密钥（双向模式）；配置方向时应与服务端相反'
    },
    { key: 'tls-crypt', label: 'TLS Crypt', kind: 'text' },
    { key: 'tls-crypt-v2', label: 'TLS Crypt V2', kind: 'text' },
    { key: 'username', label: '用户名', kind: 'text' },
    { key: 'password', label: '密码', kind: 'password', secret: true },
    {
      key: 'peer-info',
      label: '对端信息',
      kind: 'map',
      hint: '透传给服务端的 peer-info 键值对，追加在内置 peer-info 之后'
    },
    { key: 'ping', label: 'Ping 间隔', kind: 'number' },
    { key: 'ping-restart', label: 'Ping 重启', kind: 'number' },
    { key: 'tran-window', label: '传输窗口', kind: 'number' },
    { key: 'handshake-timeout', label: '握手超时', kind: 'number' },
    { key: 'mtu', label: 'MTU', kind: 'number' },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    ipStackField,
    { key: 'remote-dns-resolve', label: '远程 DNS 解析', kind: 'bool' },
    { key: 'dns', label: 'DNS', kind: 'list' }
  ]
}
