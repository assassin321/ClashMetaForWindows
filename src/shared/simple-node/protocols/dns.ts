import type { SimpleNodeType } from '../types'

export const dns: SimpleNodeType = {
  type: 'dns',
  label: 'DNS',
  schemes: [],
  fields: [{ key: 'name', label: '名称', kind: 'text', required: true }]
}
