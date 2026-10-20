import { Button, Input, Select, SelectItem, Switch, Textarea } from '@heroui/react'
import { useState } from 'react'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { MdAdd, MdClose } from 'react-icons/md'
import { parse, stringify } from 'yaml'
import type { SimpleNodeField } from '../../../../shared/simple-node'
import { listSimpleNodeOptions } from '../../../../shared/simple-node'
/* eslint-disable react/prop-types */

interface Props {
  field: SimpleNodeField
  value: unknown
  disabled?: boolean
  onChange: (value: unknown) => void
}

export const KeyValueEditor: React.FC<{
  value: Record<string, string>
  disabled?: boolean
  onChange: (value: Record<string, string>) => void
}> = ({ value, disabled, onChange }) => {
  const entries = Object.entries(value)
  const update = (index: number, key: string, entry: string): void => {
    const next = entries.map(([currentKey, currentValue], i) =>
      i === index ? [key, entry] : [currentKey, currentValue]
    )
    onChange(
      Object.fromEntries(next.filter(([itemKey, itemValue]) => itemKey !== '' && itemValue !== ''))
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, entry], index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            size="sm"
            className="flex-1"
            value={key}
            isDisabled={disabled}
            onValueChange={(next) => update(index, next, entry)}
          />
          <Input
            size="sm"
            className="flex-1"
            value={entry}
            isDisabled={disabled}
            onValueChange={(next) => update(index, key, next)}
          />
          <Button
            size="sm"
            isIconOnly
            variant="light"
            aria-label="删除条目"
            isDisabled={disabled}
            onPress={() => onChange(Object.fromEntries(entries.filter((_, i) => i !== index)))}
          >
            <MdClose className="text-lg text-foreground-500" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="flat"
        className="self-start"
        startContent={<MdAdd className="text-lg" />}
        isDisabled={disabled}
        onPress={() => onChange({ ...value, [`key${entries.length + 1}`]: '' })}
      >
        添加条目
      </Button>
    </div>
  )
}

export const ListYamlEditor: React.FC<{
  value: unknown
  disabled?: boolean
  onChange: (value: unknown) => void
}> = ({ value, disabled, onChange }) => {
  const [text, setText] = useState(() => stringify(value ?? []))
  return (
    <Textarea
      size="sm"
      minRows={4}
      className="font-mono"
      value={text}
      isDisabled={disabled}
      onValueChange={(next) => {
        setText(next)
        try {
          onChange(parse(next))
        } catch {
          // 保留未完成输入，等用户补全
        }
      }}
    />
  )
}

const NodeFieldEditor: React.FC<Props> = ({ field, value, disabled, onChange }) => {
  const [revealed, setRevealed] = useState(false)
  if (field.kind === 'bool') {
    return (
      <Switch
        size="sm"
        aria-label={field.label}
        isSelected={value === true}
        isDisabled={disabled}
        onValueChange={onChange}
      />
    )
  }
  if (field.kind === 'select') {
    const options = listSimpleNodeOptions(field)
    const current = typeof value === 'string' ? value : ''
    const items = options.some((item) => item.value === current)
      ? options
      : [...options, { value: current, label: current || '未设置' }]
    return (
      <Select
        size="sm"
        aria-label={field.label}
        className="w-48"
        disallowEmptySelection
        selectedKeys={[current]}
        isDisabled={disabled}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0]
          if (selected !== undefined) onChange(String(selected))
        }}
      >
        {items.map((item) => (
          <SelectItem key={item.value}>{item.label}</SelectItem>
        ))}
      </Select>
    )
  }
  if (field.kind === 'list') {
    const items = Array.isArray(value) ? value.map((item) => String(item)) : []
    return (
      <Input
        size="sm"
        aria-label={field.label}
        className="w-72"
        placeholder="逗号分隔"
        value={items.join(', ')}
        isDisabled={disabled}
        onValueChange={(next) =>
          onChange(
            next
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />
    )
  }
  if (field.kind === 'number') {
    return (
      <Input
        size="sm"
        aria-label={field.label}
        type="number"
        className="w-32"
        placeholder={field.default === undefined ? undefined : String(field.default)}
        value={value === undefined || value === null ? '' : String(value)}
        isDisabled={disabled}
        onValueChange={(next) => onChange(next === '' ? undefined : Number(next))}
      />
    )
  }
  const secret = field.kind === 'password'
  return (
    <Input
      size="sm"
      aria-label={field.label}
      className="w-72"
      type={secret && !revealed ? 'password' : 'text'}
      placeholder={field.default === undefined ? undefined : String(field.default)}
      value={value === undefined || value === null ? '' : String(value)}
      isDisabled={disabled}
      startContent={
        secret ? (
          <button
            type="button"
            tabIndex={-1}
            className="text-foreground-500"
            title={revealed ? '隐藏' : '显示'}
            aria-label={revealed ? '隐藏' : '显示'}
            onClick={() => setRevealed((current) => !current)}
          >
            {revealed ? <IoMdEyeOff className="h-4 w-4" /> : <IoMdEye className="h-4 w-4" />}
          </button>
        ) : null
      }
      onValueChange={(next) => onChange(next === '' ? undefined : next)}
    />
  )
}

export default NodeFieldEditor
