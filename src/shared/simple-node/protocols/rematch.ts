import type { SimpleNodeType } from '../types'

export const rematch: SimpleNodeType = {
  type: 'rematch',
  label: 'Rematch',
  schemes: [],
  fields: [
    { key: 'name', label: '名称', kind: 'text', required: true },
    { key: 'target-rematch-name', label: '目标重匹配名称', kind: 'text' },
    { key: 'target-sub-rule', label: '目标子规则', kind: 'text' }
  ]
}
