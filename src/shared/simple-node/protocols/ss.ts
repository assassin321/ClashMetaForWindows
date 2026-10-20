import type { SimpleNodeField, SimpleNodeType } from '../types'
import { FINGERPRINTS, KCPTUN_CRYPTS, PLUGIN_MODES, SS_CIPHERS, SS_PLUGINS } from '../options'

export const ssPluginOpts: SimpleNodeField = {
  key: 'plugin-opts',
  label: '插件参数',
  kind: 'map',
  variantKey: 'plugin',
  variants: {
    obfs: [
      { key: 'mode', label: '模式', kind: 'select', options: PLUGIN_MODES },
      { key: 'host', label: '主机', kind: 'text' }
    ],
    'v2ray-plugin': [
      { key: 'mode', label: '模式', kind: 'select', options: PLUGIN_MODES },
      { key: 'host', label: '主机', kind: 'text' },
      { key: 'path', label: '路径', kind: 'text' },
      { key: 'tls', label: 'TLS', kind: 'bool' },
      {
        key: 'ech-opts',
        label: 'ECH 参数',
        kind: 'object',
        children: [
          { key: 'enable', label: '启用', kind: 'bool' },
          { key: 'config', label: '配置', kind: 'text' },
          { key: 'query-server-name', label: '查询域名', kind: 'text' }
        ]
      },
      { key: 'fingerprint', label: '证书指纹', kind: 'text' },
      { key: 'certificate', label: '证书', kind: 'text' },
      { key: 'private-key', label: '私钥', kind: 'password', secret: true },
      { key: 'headers', label: '请求头', kind: 'map' },
      { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
      { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
      { key: 'mux', label: '多路复用', kind: 'bool' },
      { key: 'v2ray-http-upgrade', label: 'HTTP Upgrade', kind: 'bool' },
      { key: 'v2ray-http-upgrade-fast-open', label: 'HTTP Upgrade Fast Open', kind: 'bool' }
    ],
    'gost-plugin': [
      { key: 'mode', label: '模式', kind: 'select', options: PLUGIN_MODES },
      { key: 'host', label: '主机', kind: 'text' },
      { key: 'path', label: '路径', kind: 'text' },
      { key: 'tls', label: 'TLS', kind: 'bool' },
      {
        key: 'ech-opts',
        label: 'ECH 参数',
        kind: 'object',
        children: [
          { key: 'enable', label: '启用', kind: 'bool' },
          { key: 'config', label: '配置', kind: 'text' },
          { key: 'query-server-name', label: '查询域名', kind: 'text' }
        ]
      },
      { key: 'fingerprint', label: '证书指纹', kind: 'text' },
      { key: 'certificate', label: '证书', kind: 'text' },
      { key: 'private-key', label: '私钥', kind: 'password', secret: true },
      { key: 'headers', label: '请求头', kind: 'map' },
      { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
      { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
      { key: 'mux', label: '多路复用', kind: 'bool' }
    ],
    'shadow-tls': [
      { key: 'password', label: '密码', kind: 'password', secret: true },
      { key: 'host', label: '主机', kind: 'text' },
      { key: 'fingerprint', label: '证书指纹', kind: 'text' },
      { key: 'certificate', label: '证书', kind: 'text' },
      { key: 'private-key', label: '私钥', kind: 'password', secret: true },
      { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
      { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
      { key: 'version', label: '版本', kind: 'select', options: ['1', '2', '3'] },
      { key: 'alpn', label: 'ALPN', kind: 'list' }
    ],
    restls: [
      { key: 'password', label: '密码', kind: 'password', secret: true },
      { key: 'host', label: '主机', kind: 'text' },
      { key: 'version-hint', label: '版本提示', kind: 'text' },
      { key: 'restls-script', label: 'Restls 脚本', kind: 'text' },
      { key: 'fingerprint', label: '证书指纹', kind: 'text' },
      { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
      { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
      { key: 'force-tls12', label: '强制 TLS 1.2', kind: 'bool' }
    ],
    jls: [
      { key: 'host', label: '主机', kind: 'text' },
      { key: 'username', label: '用户名', kind: 'text' },
      { key: 'password', label: '密码', kind: 'password', secret: true },
      { key: 'alpn', label: 'ALPN', kind: 'list' }
    ],
    kcptun: [
      { key: 'key', label: '密钥', kind: 'password', secret: true },
      { key: 'crypt', label: '加密方式', kind: 'select', options: KCPTUN_CRYPTS },
      { key: 'mode', label: '模式', kind: 'select', options: PLUGIN_MODES },
      { key: 'conn', label: '连接数', kind: 'number' },
      { key: 'autoexpire', label: '自动过期', kind: 'number' },
      { key: 'scavengettl', label: '回收 TTL', kind: 'number' },
      { key: 'mtu', label: 'MTU', kind: 'number' },
      { key: 'ratelimit', label: '限速', kind: 'number' },
      { key: 'sndwnd', label: '发送窗口', kind: 'number' },
      { key: 'rcvwnd', label: '接收窗口', kind: 'number' },
      { key: 'datashard', label: '数据分片', kind: 'number' },
      { key: 'parityshard', label: '校验分片', kind: 'number' },
      { key: 'dscp', label: 'DSCP', kind: 'number' },
      { key: 'nocomp', label: '禁用压缩', kind: 'bool' },
      { key: 'acknodelay', label: 'ACK 无延迟', kind: 'bool' },
      { key: 'nodelay', label: '无延迟', kind: 'number' },
      { key: 'interval', label: '间隔', kind: 'number' },
      { key: 'resend', label: '重传', kind: 'number' },
      { key: 'nc', label: '无压缩', kind: 'number' },
      { key: 'sockbuf', label: 'Socket 缓冲', kind: 'number' },
      { key: 'smuxver', label: 'SMUX 版本', kind: 'number' },
      { key: 'smuxbuf', label: 'SMUX 缓冲', kind: 'number' },
      { key: 'framesize', label: '帧大小', kind: 'number' },
      { key: 'streambuf', label: '流缓冲', kind: 'number' },
      { key: 'keepalive', label: '保活间隔', kind: 'number' }
    ]
  }
}

export const ss: SimpleNodeType = {
  type: 'ss',
  label: 'Shadowsocks',
  schemes: ['ss'],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'server', label: '服务器', kind: 'text', required: true },
    { key: 'port', label: '端口', kind: 'number', required: true },
    { key: 'password', label: '密码', kind: 'password', required: true, secret: true },
    {
      key: 'cipher',
      label: '加密方式',
      kind: 'select',
      required: true,
      options: SS_CIPHERS,
      hint: '加密方法'
    },
    { key: 'udp', label: 'UDP', kind: 'bool' },
    { key: 'plugin', label: '插件', kind: 'select', options: SS_PLUGINS },
    ssPluginOpts,
    { key: 'udp-over-tcp', label: 'UDP over TCP', kind: 'bool' },
    {
      key: 'udp-over-tcp-version',
      label: 'UDP over TCP 版本',
      kind: 'select',
      options: ['1', '2'],
      default: 1,
      hint: '应与服务端支持的版本一致'
    },
    { key: 'client-fingerprint', label: '客户端指纹', kind: 'select', options: FINGERPRINTS }
  ]
}
