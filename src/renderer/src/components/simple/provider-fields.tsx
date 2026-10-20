import { Button, Input, Select, SelectItem, Textarea } from '@heroui/react'
import { MdAdd, MdClose } from 'react-icons/md'
import type { SimpleObject } from '../../../../shared/simple-config'
import type { SimpleNodeField } from '../../../../shared/simple-node'
import { listSimpleNodeOptions } from '../../../../shared/simple-node'
import NodeFieldEditor from './node-field-editor'
/* eslint-disable react/prop-types */

const ProviderTypeSelect: React.FC<{
  field: SimpleNodeField
  value: unknown
  disabled?: boolean
  onChange: (value: string | undefined) => void
}> = ({ field, value, disabled, onChange }) => {
  const selected = typeof value === 'string' ? [...new Set(value.split('|').filter(Boolean))] : []
  const options = listSimpleNodeOptions(field)
  const items = [
    ...options,
    ...selected
      .filter((value) => !options.some((option) => option.value === value))
      .map((value) => ({ value, label: value }))
  ]
  return (
    <Select
      size="sm"
      aria-label={field.label}
      placeholder="不排除"
      selectionMode="multiple"
      selectedKeys={selected}
      isDisabled={disabled}
      onSelectionChange={(keys) =>
        onChange(
          (keys === 'all' ? items.map((item) => item.value) : Array.from(keys)).join('|') ||
            undefined
        )
      }
    >
      {items.map((item) => (
        <SelectItem key={item.value}>{item.label}</SelectItem>
      ))}
    </Select>
  )
}

export const ProviderFields: React.FC<{
  fields: readonly SimpleNodeField[]
  values: SimpleObject
  disabled?: boolean
  onChange: (key: string, value: unknown) => void
}> = ({ fields, values, disabled, onChange }) => (
  <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
    {fields.map((field) => (
      <div
        key={field.key}
        className={field.kind === 'list' || field.key === 'url' ? 'sm:col-span-2' : ''}
      >
        <div className="mb-1.5 flex h-5 items-center justify-between gap-1">
          <span className="text-sm text-foreground-600" title={field.label}>
            {field.label}
          </span>
          {field.kind !== 'bool' && values[field.key] !== undefined && (
            <Button
              size="sm"
              variant="light"
              isIconOnly
              className="h-5 min-h-0 w-5 min-w-0 text-foreground-400"
              aria-label={`清除${field.label}`}
              isDisabled={disabled}
              onPress={() => onChange(field.key, undefined)}
            >
              <MdClose />
            </Button>
          )}
        </div>
        <div className="min-w-0">
          {field.kind === 'list' ? (
            <Textarea
              size="sm"
              aria-label={field.label}
              minRows={2}
              className="font-mono"
              isDisabled={disabled}
              value={
                Array.isArray(values[field.key]) ? (values[field.key] as unknown[]).join('\n') : ''
              }
              onValueChange={(value) =>
                onChange(
                  field.key,
                  value ? value.split('\n').filter((line) => line.trim()) : undefined
                )
              }
            />
          ) : field.key === 'exclude-type' ? (
            <ProviderTypeSelect
              field={field}
              value={values[field.key]}
              disabled={disabled}
              onChange={(value) => onChange(field.key, value)}
            />
          ) : field.kind === 'bool' ? (
            <Select
              size="sm"
              className="w-full"
              aria-label={field.label}
              isDisabled={disabled}
              selectedKeys={[values[field.key] === undefined ? 'unset' : String(values[field.key])]}
              disallowEmptySelection
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0]
                if (value) onChange(field.key, value === 'unset' ? undefined : value === 'true')
              }}
            >
              <SelectItem key="unset">未设置</SelectItem>
              <SelectItem key="true">启用</SelectItem>
              <SelectItem key="false">禁用</SelectItem>
            </Select>
          ) : (
            <div className="[&>*]:!w-full">
              <NodeFieldEditor
                field={field}
                value={values[field.key]}
                disabled={disabled}
                onChange={(value) => onChange(field.key, value === '' ? undefined : value)}
              />
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
)

export interface HeaderRow {
  name: string
  values: string
}

export const ProviderHeaders: React.FC<{
  rows: HeaderRow[]
  disabled?: boolean
  onChange: (rows: HeaderRow[]) => void
}> = ({ rows, disabled, onChange }) => (
  <div className="flex flex-col gap-3">
    {rows.map((row, index) => (
      <div key={index} className="flex items-start gap-3 rounded-xl bg-content2/50 p-3">
        <Input
          size="sm"
          label="名称"
          labelPlacement="outside"
          placeholder="X-Custom-Header"
          className="min-w-0 flex-1"
          value={row.name}
          isDisabled={disabled}
          onValueChange={(name) =>
            onChange(rows.map((row, i) => (i === index ? { ...row, name } : row)))
          }
        />
        <Textarea
          size="sm"
          label="值"
          labelPlacement="outside"
          placeholder="多个值每行一个"
          minRows={1}
          className="min-w-0 flex-[2]"
          value={row.values}
          isDisabled={disabled}
          onValueChange={(values) =>
            onChange(rows.map((row, i) => (i === index ? { ...row, values } : row)))
          }
        />
        <Button
          size="sm"
          variant="light"
          isIconOnly
          className="mt-6 shrink-0 text-foreground-400"
          aria-label={`删除请求头 ${index + 1}`}
          isDisabled={disabled}
          onPress={() => onChange(rows.filter((_, i) => i !== index))}
        >
          <MdClose />
        </Button>
      </div>
    ))}
    <Button
      size="sm"
      variant="flat"
      className="self-start"
      startContent={<MdAdd />}
      isDisabled={disabled}
      onPress={() => onChange([...rows, { name: '', values: '' }])}
    >
      添加请求头
    </Button>
  </div>
)
