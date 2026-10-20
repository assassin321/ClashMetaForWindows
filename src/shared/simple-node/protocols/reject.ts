import type { SimpleNodeType } from '../types'

export const reject: SimpleNodeType = {
  type: 'reject',
  label: 'Reject',
  schemes: [],
  fields: [{ key: 'name', label: '名称', kind: 'text', required: true }]
}
