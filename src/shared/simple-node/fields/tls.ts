import type { SimpleNodeField } from '../types'
import { RESTLS_VERSION_HINTS, SHADOW_TLS_VERSIONS } from '../options'

export const echOpts: SimpleNodeField = {
  key: 'ech-opts',
  label: 'ECH 参数',
  kind: 'object',
  children: [
    { key: 'enable', label: '启用 ECH', kind: 'bool' },
    { key: 'config', label: 'ECH 配置', kind: 'text' },
    { key: 'query-server-name', label: '查询域名', kind: 'text' }
  ]
}

export const realityOpts: SimpleNodeField = {
  key: 'reality-opts',
  label: 'Reality 参数',
  kind: 'object',
  children: [
    { key: 'public-key', label: '公钥', kind: 'text' },
    { key: 'short-id', label: 'Short ID', kind: 'text' },
    { key: 'support-x25519mlkem768', label: '支持 X25519MLKEM768', kind: 'bool' }
  ]
}

export const shadowTlsOpts: SimpleNodeField = {
  key: 'shadow-tls-opts',
  label: 'ShadowTLS 参数',
  kind: 'object',
  children: [
    { key: 'password', label: '密码', kind: 'password', secret: true },
    {
      key: 'version',
      label: '版本',
      kind: 'select',
      options: SHADOW_TLS_VERSIONS,
      default: 2,
      hint: '应与服务端保持一致'
    }
  ]
}

export const restlsOpts: SimpleNodeField = {
  key: 'restls-opts',
  label: 'Restls 参数',
  kind: 'object',
  children: [
    { key: 'password', label: '密码', kind: 'password', secret: true },
    {
      key: 'version-hint',
      label: '版本提示',
      kind: 'select',
      options: RESTLS_VERSION_HINTS,
      hint: 'Restls握手使用的TLS版本，应与伪装目标服务器一致'
    },
    { key: 'restls-script', label: 'Restls 脚本', kind: 'text' }
  ]
}

export const jlsOpts: SimpleNodeField = {
  key: 'jls-opts',
  label: 'JLS 参数',
  kind: 'object',
  children: [
    { key: 'username', label: '用户名', kind: 'text', hint: 'JLS认证用户名' },
    { key: 'password', label: '密码', kind: 'password', secret: true, hint: 'JLS认证密码' }
  ]
}

export const tlsMirrorOpts: SimpleNodeField = {
  key: 'tlsmirror-opts',
  label: 'TLSMirror 参数',
  kind: 'object',
  children: [
    { key: 'primary-key', label: '主密钥', kind: 'text' },
    {
      key: 'explicit-nonce-ciphersuites',
      label: '显式 Nonce 密码套件',
      kind: 'list',
      hint: 'TLS 1.2载体使用显式nonce的加密套件'
    },
    {
      key: 'defer-instance-derived-write-time',
      label: '延迟写入时间',
      kind: 'object',
      children: [
        { key: 'base-nanoseconds', label: '基准纳秒', kind: 'number' },
        { key: 'uniform-random-multiplier-nanoseconds', label: '随机乘数纳秒', kind: 'number' }
      ]
    },
    {
      key: 'transport-layer-padding',
      label: '传输层填充',
      kind: 'object',
      children: [{ key: 'enabled', label: '启用', kind: 'select', options: ['true', 'false'] }]
    },
    {
      key: 'connection-enrolment',
      label: '连接注册',
      kind: 'object',
      children: [
        { key: 'primary-ingress-outbound', label: '主入口出站', kind: 'text' },
        { key: 'primary-egress-outbound', label: '主出口出站', kind: 'text' }
      ]
    },
    {
      key: 'embedded-traffic-generator',
      label: '内嵌流量生成器',
      kind: 'object',
      children: [
        {
          key: 'steps',
          label: '步骤',
          kind: 'list',
          hint: 'HTTP载体流量步骤列表',
          children: [
            { key: 'name', label: '名称', kind: 'text' },
            { key: 'host', label: '主机', kind: 'text' },
            { key: 'path', label: '路径', kind: 'text' },
            { key: 'method', label: '请求方式', kind: 'text' },
            {
              key: 'headers',
              label: '请求头',
              kind: 'list',
              children: [
                { key: 'name', label: '名称', kind: 'text' },
                { key: 'value', label: '值', kind: 'text' },
                { key: 'values', label: '值列表', kind: 'list' }
              ]
            },
            {
              key: 'next-step',
              label: '下一步',
              kind: 'list',
              children: [
                { key: 'weight', label: '权重', kind: 'number' },
                { key: 'goto-location', label: '跳转位置', kind: 'number' }
              ]
            },
            { key: 'connection-ready', label: '连接就绪', kind: 'bool' },
            { key: 'connection-recall-exit', label: '连接回收退出', kind: 'bool' },
            {
              key: 'wait-time',
              label: '等待时间',
              kind: 'object',
              children: [
                { key: 'base-nanoseconds', label: '基准纳秒', kind: 'number' },
                {
                  key: 'uniform-random-multiplier-nanoseconds',
                  label: '随机乘数纳秒',
                  kind: 'number'
                }
              ]
            },
            { key: 'h2-do-not-wait-for-download-finish', label: 'H2 不等待下载完成', kind: 'bool' }
          ]
        }
      ]
    },
    { key: 'sequence-watermarking-enabled', label: '序列水印', kind: 'bool' }
  ]
}
