import type { SimpleNodeField } from '../types'
import { IP_STACK_MODES } from '../options'

export const ipStackField: SimpleNodeField = {
  key: 'ip-stack',
  label: 'IP 栈',
  kind: 'object',
  children: [
    { key: 'mode', label: '模式', kind: 'select', options: IP_STACK_MODES },
    { key: 'congestion-controller', label: '拥塞控制', kind: 'text' }
  ]
}

export const amneziaWgOption: SimpleNodeField = {
  key: 'amnezia-wg-option',
  label: 'AmneziaWG 参数',
  kind: 'object',
  children: [
    { key: 'version', label: '版本', kind: 'number' },
    { key: 'jc', label: '垃圾包数量', kind: 'number' },
    { key: 'jmin', label: '垃圾包最小长度', kind: 'number' },
    { key: 'jmax', label: '垃圾包最大长度', kind: 'number' },
    { key: 's1', label: '握手初始化填充', kind: 'number' },
    { key: 's2', label: '握手响应填充', kind: 'number' },
    { key: 's3', label: 'Cookie 填充', kind: 'number' },
    { key: 's4', label: '数据包填充', kind: 'number' },
    { key: 'h1', label: '握手包 Magic Header', kind: 'text' },
    { key: 'h2', label: '响应包 Magic Header', kind: 'text' },
    { key: 'h3', label: 'Underload 包 Magic Header', kind: 'text' },
    { key: 'h4', label: '数据包 Magic Header', kind: 'text' },
    { key: 'i1', label: 'I1 填充', kind: 'text' },
    { key: 'i2', label: 'I2 填充', kind: 'text' },
    { key: 'i3', label: 'I3 填充', kind: 'text' },
    { key: 'i4', label: 'I4 填充', kind: 'text' },
    { key: 'i5', label: 'I5 填充', kind: 'text' },
    { key: 'j1', label: 'J1 受控填充', kind: 'text' },
    { key: 'j2', label: 'J2 受控填充', kind: 'text' },
    { key: 'j3', label: 'J3 受控填充', kind: 'text' },
    { key: 'itime', label: 'Itime 间隔', kind: 'number' },
    { key: 'header-protection-key', label: '头保护密钥', kind: 'text' },
    { key: 'content-padding-addition', label: '内容填充增量', kind: 'text' },
    { key: 'rekey-after-time', label: '重密钥周期', kind: 'text' },
    { key: 'rekey-timeout', label: '重密钥超时', kind: 'text' },
    { key: 'reject-after-time', label: '拒绝周期', kind: 'text' },
    { key: 'keepalive-timeout', label: '保活超时', kind: 'text' },
    { key: 'max-handshake-attempts', label: '最大握手次数', kind: 'text' },
    { key: 'random-trailers', label: '随机尾部填充', kind: 'bool' },
    { key: 'disable-cookies', label: '禁用 Cookie', kind: 'bool' }
  ]
}
