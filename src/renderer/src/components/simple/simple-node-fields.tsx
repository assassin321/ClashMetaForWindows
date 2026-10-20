import { Button, Divider, Select, SelectItem } from '@heroui/react'
import SettingItem from '@renderer/components/base/base-setting-item'
import React, { useMemo, useState } from 'react'
import { MdClose } from 'react-icons/md'
import type { SimpleObject } from '../../../../shared/simple-config'
import type { SimpleNodeField } from '../../../../shared/simple-node'
import {
  SIMPLE_NODE_COMMON_FIELDS,
  getSimpleNodeFields,
  listVisibleSimpleNodeFields,
  readSimpleNodeValue
} from '../../../../shared/simple-node'
import NodeFieldEditor, { KeyValueEditor, ListYamlEditor } from './node-field-editor'

interface Props {
  type: string
  values: SimpleObject
  added: readonly string[]
  disabled?: boolean
  onChange: (path: string, value: unknown) => void
  onRemove: (path: string) => void
}

const isGroupField = (field: SimpleNodeField): boolean =>
  !!field.variants || (field.kind === 'object' && (field.children?.length ?? 0) > 0)

const isExpandableField = (field: SimpleNodeField): boolean =>
  field.kind === 'map' || (field.kind === 'list' && (field.children?.length ?? 0) > 0)

const SimpleNodeFields: React.FC<Props> = ({
  type,
  values,
  added,
  disabled,
  onChange,
  onRemove
}) => {
  const [expanded, setExpanded] = useState<string[]>([])
  const visible = useMemo(() => listVisibleSimpleNodeFields(type, added), [type, added])
  const fields = useMemo(() => [...getSimpleNodeFields(type), ...SIMPLE_NODE_COMMON_FIELDS], [type])

  const removeButton = (path: string, label: string): React.ReactNode => (
    <Button
      size="sm"
      isIconOnly
      variant="light"
      title="移除字段"
      aria-label={`移除 ${label}`}
      onPress={() => onRemove(path)}
    >
      <MdClose className="text-lg text-foreground-500" />
    </Button>
  )

  const actions = (field: SimpleNodeField, path: string): React.ReactNode => (
    <>
      {field.hint && field.hint.length > 8 ? (
        <span className="ml-2 hidden text-[10px] text-foreground-500 sm:inline">{field.hint}</span>
      ) : null}
      {field.required ? null : removeButton(path, field.label)}
    </>
  )

  const title = (field: SimpleNodeField): React.ReactNode => (
    <span title={field.hint}>{field.label}</span>
  )

  const renderRow = (field: SimpleNodeField, prefix: string): React.ReactNode => {
    const path = prefix ? `${prefix}.${field.key}` : field.key
    const current = readSimpleNodeValue(values, path)
    if (isExpandableField(field)) {
      const open = expanded.includes(path)
      const count =
        field.kind === 'map'
          ? Object.keys((current as SimpleObject) ?? {}).length
          : Array.isArray(current)
            ? current.length
            : 0
      const entries =
        field.kind === 'map' && current && typeof current === 'object' && !Array.isArray(current)
          ? Object.fromEntries(
              Object.entries(current as Record<string, unknown>).map(([key, entry]) => [
                key,
                String(entry ?? '')
              ])
            )
          : {}
      return (
        <React.Fragment key={path}>
          <SettingItem title={title(field)} divider={!open} actions={actions(field, path)}>
            <Button
              size="sm"
              variant="flat"
              onPress={() =>
                setExpanded((items) =>
                  items.includes(path) ? items.filter((item) => item !== path) : [...items, path]
                )
              }
            >
              {open ? '收起' : count > 0 ? `编辑 (${count})` : '编辑'}
            </Button>
          </SettingItem>
          {open && (
            <>
              <div className="pb-2">
                {field.kind === 'map' ? (
                  <KeyValueEditor
                    value={entries}
                    disabled={disabled}
                    onChange={(value) => onChange(path, value)}
                  />
                ) : (
                  <ListYamlEditor
                    value={current ?? []}
                    disabled={disabled}
                    onChange={(value) => onChange(path, value)}
                  />
                )}
              </div>
              <Divider className="my-2" />
            </>
          )}
        </React.Fragment>
      )
    }
    return (
      <SettingItem key={path} title={title(field)} divider actions={actions(field, path)}>
        <NodeFieldEditor
          field={field}
          value={current}
          disabled={disabled}
          onChange={(value) => onChange(path, value)}
        />
      </SettingItem>
    )
  }

  const renderFields = (
    list: readonly SimpleNodeField[],
    prefix: string,
    force = false
  ): React.ReactNode[] =>
    list.flatMap((field) => {
      const path = prefix ? `${prefix}.${field.key}` : field.key
      if (field.hidden || (!force && !visible.has(path))) return []
      return [renderRow(field, prefix)]
    })

  const renderGroups = (
    list: readonly SimpleNodeField[],
    prefix: string,
    force = false
  ): React.ReactNode[] =>
    list.flatMap((field) => {
      if (field.hidden || !isGroupField(field)) return []
      const path = prefix ? `${prefix}.${field.key}` : field.key
      if (!force && !visible.has(path)) return []
      const variants = field.variants
      const nested = variants
        ? (variants[
            String(field.variantKey ? readSimpleNodeValue(values, field.variantKey) : '') ||
              Object.keys(variants)[0]
          ] ?? [])
        : (field.children ?? [])
      return [
        <React.Fragment key={path}>
          <SettingItem title={title(field)} divider={false} actions={actions(field, path)} />
          <div className="border-l-2 border-divider pl-3">
            {variants ? (
              <SettingItem title="模式" divider>
                <Select
                  size="sm"
                  className="w-48"
                  disallowEmptySelection
                  selectedKeys={[
                    String(field.variantKey ? readSimpleNodeValue(values, field.variantKey) : '') ||
                      Object.keys(variants)[0]
                  ]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0]
                    if (selected !== undefined && field.variantKey) {
                      onChange(field.variantKey, String(selected))
                    }
                  }}
                >
                  {Object.keys(variants).map((option) => (
                    <SelectItem key={option}>{option}</SelectItem>
                  ))}
                </Select>
              </SettingItem>
            ) : null}
            {renderFields(nested, path, !!variants)}
            {renderGroups(nested, path, !!variants)}
          </div>
          <Divider className="my-2" />
        </React.Fragment>
      ]
    })

  return (
    <>
      {renderFields(
        fields.filter((field) => !isGroupField(field)),
        ''
      )}
      {renderGroups(fields, '')}
    </>
  )
}

export default SimpleNodeFields
