import type { SimpleNodeType } from '../types'

export const direct: SimpleNodeType = {
  type: 'direct',
  label: 'Direct',
  schemes: [],
  fields: [{ key: 'name', label: '名称', kind: 'text', required: true }]
}
