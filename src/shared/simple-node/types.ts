export type SimpleNodeFieldKind =
  'text' | 'password' | 'number' | 'bool' | 'select' | 'list' | 'map' | 'object'

export interface SimpleNodeOption {
  value: string
  label?: string
}

export interface SimpleNodeField {
  key: string
  label: string
  kind: SimpleNodeFieldKind
  required?: boolean
  hidden?: boolean
  secret?: boolean
  options?: readonly (string | SimpleNodeOption)[]
  default?: string | number | boolean
  placeholder?: string
  hint?: string
  unit?: string
  variantKey?: string
  variants?: Readonly<Record<string, readonly SimpleNodeField[]>>
  children?: readonly SimpleNodeField[]
}

export interface SimpleNodeType {
  type: string
  label: string
  schemes: readonly string[]
  fields: readonly SimpleNodeField[]
}
