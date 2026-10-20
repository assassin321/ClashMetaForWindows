import type { SimpleNodeField } from '../types'
import { EARLY_DATA_HEADER_NAMES, HTTP_METHODS, MKCP_HEADERS, XHTTP_MODES } from '../options'

export const wsOpts: SimpleNodeField = {
  key: 'ws-opts',
  label: 'WebSocket 参数',
  kind: 'object',
  children: [
    { key: 'path', label: '路径', kind: 'text' },
    { key: 'headers', label: '请求头', kind: 'map' },
    { key: 'max-early-data', label: '最大早期数据', kind: 'number' },
    {
      key: 'early-data-header-name',
      label: '早期数据 Header',
      kind: 'select',
      options: EARLY_DATA_HEADER_NAMES
    },
    { key: 'v2ray-http-upgrade', label: 'HTTP Upgrade', kind: 'bool' },
    { key: 'v2ray-http-upgrade-fast-open', label: 'HTTP Upgrade Fast Open', kind: 'bool' }
  ]
}

export const grpcOpts: SimpleNodeField = {
  key: 'grpc-opts',
  label: 'gRPC 参数',
  kind: 'object',
  children: [
    { key: 'grpc-service-name', label: 'gRPC 服务名', kind: 'text' },
    { key: 'grpc-user-agent', label: 'gRPC User-Agent', kind: 'text' },
    { key: 'ping-interval', label: 'Ping 间隔', kind: 'number' },
    { key: 'max-connections', label: '最大连接数', kind: 'number' },
    { key: 'min-streams', label: '最小流数', kind: 'number' },
    { key: 'max-streams', label: '最大流数', kind: 'number' }
  ]
}

export const h2Opts: SimpleNodeField = {
  key: 'h2-opts',
  label: 'HTTP/2 参数',
  kind: 'object',
  children: [
    { key: 'host', label: '主机地址', kind: 'list' },
    { key: 'path', label: '路径', kind: 'text' }
  ]
}

export const httpOpts: SimpleNodeField = {
  key: 'http-opts',
  label: 'HTTP 参数',
  kind: 'object',
  children: [
    { key: 'method', label: '请求方式', kind: 'select', options: HTTP_METHODS },
    { key: 'path', label: '路径列表', kind: 'list' },
    { key: 'headers', label: '请求头', kind: 'map' }
  ]
}

export const xhttpOpts: SimpleNodeField = {
  key: 'xhttp-opts',
  label: 'XHTTP 参数',
  kind: 'object',
  children: [
    { key: 'path', label: '路径', kind: 'text' },
    { key: 'host', label: '主机', kind: 'text' },
    { key: 'mode', label: '模式', kind: 'select', options: XHTTP_MODES, default: 'auto' },
    { key: 'headers', label: '请求头', kind: 'map' },
    { key: 'no-grpc-header', label: '禁用 gRPC Header', kind: 'bool' },
    { key: 'x-padding-bytes', label: '填充字节', kind: 'text' },
    { key: 'x-padding-obfs-mode', label: '填充混淆模式', kind: 'bool' },
    { key: 'x-padding-key', label: '填充密钥', kind: 'text' },
    { key: 'x-padding-header', label: '填充 Header', kind: 'text' },
    {
      key: 'x-padding-placement',
      label: '填充位置',
      kind: 'select',
      options: ['queryInHeader', 'cookie', 'header', 'query']
    },
    {
      key: 'x-padding-method',
      label: '填充方式',
      kind: 'select',
      options: ['repeat-x', 'tokenish'],
      hint: '填充方法'
    },
    {
      key: 'uplink-http-method',
      label: '上行 HTTP 方法',
      kind: 'select',
      options: HTTP_METHODS,
      default: 'POST',
      hint: '上行HTTP方法'
    },
    {
      key: 'session-placement',
      label: '会话位置',
      kind: 'select',
      options: ['path', 'query', 'cookie', 'header'],
      default: 'path',
      hint: '会话信息承载位置'
    },
    { key: 'session-key', label: '会话密钥', kind: 'text' },
    { key: 'session-table', label: '会话表', kind: 'text' },
    { key: 'session-length', label: '会话长度', kind: 'text' },
    {
      key: 'seq-placement',
      label: '序列位置',
      kind: 'select',
      options: ['path', 'query', 'cookie', 'header'],
      default: 'path',
      hint: '序列号承载位置'
    },
    { key: 'seq-key', label: '序列密钥', kind: 'text' },
    {
      key: 'uplink-data-placement',
      label: '上行数据位置',
      kind: 'select',
      options: ['body', 'cookie', 'header', 'auto'],
      default: 'body',
      hint: '上行数据承载位置'
    },
    { key: 'uplink-data-key', label: '上行数据密钥', kind: 'text' },
    { key: 'uplink-chunk-size', label: '上行分块大小', kind: 'text' },
    { key: 'sc-max-each-post-bytes', label: '单次 POST 上限', kind: 'text' },
    { key: 'sc-min-posts-interval-ms', label: 'POST 最小间隔', kind: 'text' },
    {
      key: 'reuse-settings',
      label: '复用配置',
      kind: 'object',
      children: [
        { key: 'max-concurrency', label: '最大并发', kind: 'text' },
        { key: 'max-connections', label: '最大连接数', kind: 'text' },
        { key: 'c-max-reuse-times', label: '连接最大复用次数', kind: 'text' },
        { key: 'h-max-request-times', label: 'HTTP 最大请求次数', kind: 'text' },
        { key: 'h-max-reusable-secs', label: 'HTTP 最大复用秒数', kind: 'text' },
        { key: 'h-keep-alive-period', label: 'HTTP 保活周期', kind: 'number' }
      ]
    },
    {
      key: 'download-settings',
      label: '下载设置',
      kind: 'object',
      children: [
        { key: 'path', label: '路径', kind: 'text' },
        { key: 'host', label: '主机', kind: 'text' },
        { key: 'headers', label: '请求头', kind: 'text' },
        {
          key: 'reuse-settings',
          label: '复用配置',
          kind: 'object',
          children: [
            { key: 'max-concurrency', label: '最大并发', kind: 'text' },
            { key: 'max-connections', label: '最大连接数', kind: 'text' },
            { key: 'c-max-reuse-times', label: '连接最大复用次数', kind: 'text' },
            { key: 'h-max-request-times', label: 'HTTP 最大请求次数', kind: 'text' },
            { key: 'h-max-reusable-secs', label: 'HTTP 最大复用秒数', kind: 'text' },
            { key: 'h-keep-alive-period', label: 'HTTP 保活周期', kind: 'number' }
          ]
        },
        { key: 'server', label: '服务器', kind: 'text' },
        { key: 'port', label: '端口', kind: 'number' },
        { key: 'tls', label: 'TLS', kind: 'bool' },
        { key: 'alpn', label: 'ALPN', kind: 'text' },
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
        {
          key: 'shadow-tls-opts',
          label: 'ShadowTLS 参数',
          kind: 'object',
          children: [
            { key: 'password', label: '密码', kind: 'password', secret: true },
            {
              key: 'version',
              label: '版本',
              kind: 'select',
              options: ['1', '2', '3'],
              default: 2,
              hint: '应与服务端保持一致'
            }
          ]
        },
        {
          key: 'restls-opts',
          label: 'Restls 参数',
          kind: 'object',
          children: [
            { key: 'password', label: '密码', kind: 'password', secret: true },
            {
              key: 'version-hint',
              label: '版本提示',
              kind: 'select',
              options: ['tls12', 'tls13'],
              hint: 'Restls握手使用的TLS版本，应与伪装目标服务器一致'
            },
            { key: 'restls-script', label: 'Restls 脚本', kind: 'text' }
          ]
        },
        {
          key: 'jls-opts',
          label: 'JLS 参数',
          kind: 'object',
          children: [
            { key: 'username', label: '用户名', kind: 'text', hint: 'JLS认证用户名' },
            { key: 'password', label: '密码', kind: 'password', secret: true, hint: 'JLS认证密码' }
          ]
        },
        {
          key: 'reality-opts',
          label: 'Reality 参数',
          kind: 'object',
          children: [
            { key: 'public-key', label: '公钥', kind: 'text' },
            { key: 'short-id', label: 'Short ID', kind: 'text' },
            { key: 'support-x25519mlkem768', label: '支持 X25519MLKEM768', kind: 'bool' }
          ]
        },
        { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
        { key: 'name-cert-verify', label: '证书校验名称', kind: 'text' },
        { key: 'fingerprint', label: '证书指纹', kind: 'text' },
        { key: 'certificate', label: '证书', kind: 'text' },
        { key: 'private-key', label: '私钥', kind: 'password', secret: true },
        { key: 'servername', label: 'SNI', kind: 'text' },
        {
          key: 'client-fingerprint',
          label: '客户端指纹',
          kind: 'select',
          options: [
            'none',
            'chrome',
            'firefox',
            'safari',
            'ios',
            'android',
            'edge',
            '360',
            'qq',
            'random',
            'chrome120',
            'firefox120',
            'safari16',
            'chrome_psk',
            'chrome_psk_shuffle',
            'chrome_padding_psk_shuffle',
            'chrome_pq',
            'chrome_pq_psk',
            'randomized'
          ]
        }
      ]
    }
  ]
}

export const mkcpOpts: SimpleNodeField = {
  key: 'mkcp-opts',
  label: 'mKCP 参数',
  kind: 'object',
  children: [
    { key: 'mtu', label: 'MTU', kind: 'number' },
    { key: 'tti', label: 'TTI', kind: 'number' },
    { key: 'uplink-capacity', label: '上行容量', kind: 'number' },
    { key: 'downlink-capacity', label: '下行容量', kind: 'number' },
    { key: 'congestion', label: '拥塞控制', kind: 'bool' },
    { key: 'write-buffer', label: '写缓冲', kind: 'number' },
    { key: 'read-buffer', label: '读缓冲', kind: 'number' },
    { key: 'seed', label: '种子', kind: 'text' },
    {
      key: 'header',
      label: '伪装头',
      kind: 'select',
      options: MKCP_HEADERS,
      hint: '未配置时不添加伪装包头'
    }
  ]
}

export const mekyaOpts: SimpleNodeField = {
  key: 'mekya-opts',
  label: 'Mekya 参数',
  kind: 'object',
  children: [
    { key: 'url', label: 'URL', kind: 'text' },
    { key: 'h2-pool-size', label: 'HTTP/2 连接池', kind: 'number' },
    { key: 'max-write-delay', label: '最大写延迟', kind: 'number' },
    { key: 'max-request-size', label: '最大请求大小', kind: 'number' },
    { key: 'polling-interval-initial', label: '初始轮询间隔', kind: 'number' },
    { key: 'max-write-size', label: '最大写大小', kind: 'number' },
    { key: 'max-write-duration-ms', label: '最大写耗时', kind: 'number' },
    { key: 'max-simultaneous-write-connection', label: '最大并发写连接', kind: 'number' },
    { key: 'packet-writing-buffer', label: '写包缓冲区', kind: 'number' },
    {
      key: 'kcp',
      label: 'mKCP 参数',
      kind: 'object',
      children: [
        { key: 'mtu', label: 'MTU', kind: 'number' },
        { key: 'tti', label: 'TTI', kind: 'number' },
        { key: 'uplink-capacity', label: '上行容量', kind: 'number' },
        { key: 'downlink-capacity', label: '下行容量', kind: 'number' },
        { key: 'congestion', label: '拥塞控制', kind: 'bool' },
        { key: 'write-buffer', label: '写缓冲', kind: 'number' },
        { key: 'read-buffer', label: '读缓冲', kind: 'number' },
        { key: 'seed', label: '种子', kind: 'text' },
        {
          key: 'header',
          label: '伪装头',
          kind: 'select',
          options: ['none', 'noop', 'srtp', 'utp', 'wechat-video', 'wechat', 'dtls', 'wireguard'],
          hint: '未配置时不添加伪装包头'
        }
      ]
    }
  ]
}
