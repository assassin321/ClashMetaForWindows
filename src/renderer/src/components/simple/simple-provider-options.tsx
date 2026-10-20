import { Button, Divider, Input, Tab, Tabs, Textarea } from '@heroui/react'
import { useState } from 'react'
import { MdAdd, MdClose } from 'react-icons/md'
import type { SimpleObject } from '../../../../shared/simple-config'
import {
  IP_VERSIONS,
  SIMPLE_NODE_PROTOCOLS,
  type SimpleNodeField
} from '../../../../shared/simple-node'
import SettingItem from '../base/base-setting-item'
import NodeFieldEditor from './node-field-editor'
import { ProviderFields, ProviderHeaders, type HeaderRow } from './provider-fields'
import SimpleNodeFieldPicker from './simple-node-field-picker'
/* eslint-disable react/prop-types */

const object = (value: unknown): SimpleObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as SimpleObject)
    : {}
const healthFields: readonly SimpleNodeField[] = [
  { key: 'enable', label: '启用健康检查', kind: 'bool' },
  { key: 'url', label: '检测地址', kind: 'text' },
  { key: 'interval', label: '检测间隔（秒）', kind: 'number' },
  { key: 'timeout', label: '检测超时（毫秒）', kind: 'number' },
  { key: 'lazy', label: '仅在使用时检测', kind: 'bool' },
  { key: 'expected-status', label: '预期 HTTP 状态码', kind: 'text' }
]
const overrideFields: readonly SimpleNodeField[] = [
  { key: 'additional-suffix', label: '名称后缀', kind: 'text' },
  { key: 'tfo', label: 'TCP Fast Open', kind: 'bool' },
  { key: 'mptcp', label: 'MPTCP', kind: 'bool' },
  { key: 'udp', label: 'UDP', kind: 'bool' },
  { key: 'udp-over-tcp', label: 'UDP over TCP', kind: 'bool' },
  { key: 'skip-cert-verify', label: '跳过证书验证', kind: 'bool' },
  { key: 'name-cert-verify', label: '证书验证名称', kind: 'text' },
  { key: 'interface-name', label: '出口网卡', kind: 'text' },
  { key: 'routing-mark', label: '路由标记', kind: 'number' },
  { key: 'ip-version', label: 'IP 版本', kind: 'select', options: IP_VERSIONS },
  { key: 'up', label: '上传带宽', kind: 'text' },
  { key: 'down', label: '下载带宽', kind: 'text' },
  { key: 'override-expr', label: '覆盖表达式（每行一条）', kind: 'list' }
]

interface Props {
  children: React.ReactNode
  group: boolean
  values: SimpleObject
  prefix: string
  onPrefixChange: (prefix: string) => void
  remote: boolean
  outbounds: string[]
  headers: HeaderRow[]
  disabled: boolean
  onChange: (value: SimpleObject) => void
  onHeadersChange: (rows: HeaderRow[]) => void
}

const SimpleProviderOptions: React.FC<Props> = ({
  children,
  group,
  values,
  prefix,
  onPrefixChange,
  remote,
  outbounds,
  headers,
  disabled: saving,
  onChange,
  onHeadersChange: setHeaders
}) => {
  const [addedOverride, setAddedOverride] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const override = {
    ...object(values.override),
    ...(prefix ? { 'additional-prefix': prefix } : {})
  }
  const renames = Array.isArray(override['proxy-name']) ? override['proxy-name'].map(object) : []
  const fields: readonly SimpleNodeField[] = [
    { key: 'additional-prefix', label: '节点前缀', kind: 'text' },
    ...(group
      ? ([
          ...overrideFields,
          { key: 'dialer-proxy', label: '前置代理', kind: 'select', options: outbounds },
          { key: 'proxy-name', label: '节点名称替换', kind: 'list' }
        ] as SimpleNodeField[])
      : [])
  ]
  const visible = new Set([...Object.keys(override), ...addedOverride])
  const set = (key: string, value: unknown): void => {
    const next = { ...values }
    if (value === '' || value === undefined) delete next[key]
    else next[key] = value
    onChange(next)
  }
  const setNested = (parent: string, key: string, value: unknown): void => {
    const next = { ...object(values[parent]) }
    if (value === '' || value === undefined) delete next[key]
    else next[key] = value
    set(parent, Object.keys(next).length ? next : undefined)
  }
  const setOverride = (key: string, value: unknown): void => {
    setAddedOverride((current) => (current.includes(key) ? current : [...current, key]))
    if (key === 'additional-prefix') onPrefixChange(String(value ?? ''))
    else setNested('override', key, value)
  }
  return (
    <fieldset disabled={saving} className="min-w-0">
      <Tabs
        aria-label="订阅设置"
        size="sm"
        variant="underlined"
        color="primary"
        classNames={{
          base: 'sticky top-0 z-20 w-full shrink-0 bg-content1',
          tabList: 'w-full gap-5 border-b border-divider p-0',
          tab: 'h-10 w-auto px-0',
          panel: 'px-0 pt-3 pb-1'
        }}
      >
        <Tab key="info" title="订阅信息">
          <div className="flex flex-col gap-3">{children}</div>
        </Tab>
        {group && (
          <Tab key="filter" title="节点过滤">
            <ProviderFields
              fields={[
                { key: 'filter', label: '节点名称过滤（正则）', kind: 'text' },
                { key: 'exclude-filter', label: '排除节点名称（正则）', kind: 'text' },
                {
                  key: 'exclude-type',
                  label: '排除节点类型',
                  kind: 'select',
                  options: Object.values(SIMPLE_NODE_PROTOCOLS).map((protocol) => ({
                    value: protocol.type,
                    label: protocol.label
                  }))
                },
                ...(remote
                  ? [
                      {
                        key: 'proxy',
                        label: '集合更新代理',
                        kind: 'select' as const,
                        options: outbounds
                      },
                      { key: 'path', label: '缓存路径（可选）', kind: 'text' as const },
                      { key: 'size-limit', label: '大小上限（字节）', kind: 'number' as const }
                    ]
                  : [])
              ]}
              values={values}
              disabled={saving}
              onChange={set}
            />
          </Tab>
        )}
        {group && (
          <Tab key="health" title="健康检查">
            <ProviderFields
              fields={healthFields}
              values={object(values['health-check'])}
              disabled={saving}
              onChange={(key, value) => setNested('health-check', key, value)}
            />
          </Tab>
        )}
        <Tab key="override" title="覆盖参数">
          {fields
            .filter((field) => visible.has(field.key))
            .map((field) => (
              <div key={field.key}>
                <SettingItem
                  title={field.label}
                  divider={field.kind !== 'list'}
                  actions={
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      aria-label={`移除 ${field.label}`}
                      onPress={() => {
                        setAddedOverride((current) => current.filter((key) => key !== field.key))
                        if (field.key === 'additional-prefix') onPrefixChange('')
                        else setNested('override', field.key, undefined)
                      }}
                    >
                      <MdClose className="text-lg text-foreground-500" />
                    </Button>
                  }
                >
                  {field.key === 'proxy-name' ? (
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<MdAdd />}
                      onPress={() =>
                        setOverride('proxy-name', [...renames, { pattern: '', target: '' }])
                      }
                    >
                      添加替换
                    </Button>
                  ) : field.kind !== 'list' ? (
                    <NodeFieldEditor
                      field={field}
                      value={override[field.key]}
                      disabled={saving}
                      onChange={(value) => setOverride(field.key, value)}
                    />
                  ) : null}
                </SettingItem>
                {field.key === 'override-expr' && (
                  <>
                    <Textarea
                      size="sm"
                      aria-label={field.label}
                      minRows={2}
                      className="mt-2 font-mono"
                      isDisabled={saving}
                      value={
                        Array.isArray(override[field.key])
                          ? (override[field.key] as unknown[]).join('\n')
                          : ''
                      }
                      onValueChange={(text) =>
                        setOverride(
                          field.key,
                          text ? text.split('\n').filter((line) => line.trim()) : undefined
                        )
                      }
                    />
                    <Divider className="my-2" />
                  </>
                )}
                {field.key === 'proxy-name' && (
                  <>
                    <div className="mt-2 flex flex-col gap-2">
                      {renames.map((row, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            size="sm"
                            aria-label="匹配正则"
                            placeholder="匹配正则"
                            value={String(row.pattern ?? '')}
                            onValueChange={(pattern) =>
                              setOverride(
                                'proxy-name',
                                renames.map((row, i) => (i === index ? { ...row, pattern } : row))
                              )
                            }
                          />
                          <Input
                            size="sm"
                            aria-label="替换内容"
                            placeholder="替换内容"
                            value={String(row.target ?? '')}
                            onValueChange={(target) =>
                              setOverride(
                                'proxy-name',
                                renames.map((row, i) => (i === index ? { ...row, target } : row))
                              )
                            }
                          />
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            aria-label={`删除名称替换 ${index + 1}`}
                            onPress={() => {
                              const next = renames.filter((_, i) => i !== index)
                              setOverride('proxy-name', next.length ? next : undefined)
                            }}
                          >
                            <MdClose />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Divider className="my-2" />
                  </>
                )}
              </div>
            ))}
          <SettingItem
            title="添加字段"
            actions={
              <span className="ml-2 hidden text-[10px] text-foreground-500 sm:inline">
                未添加的字段不会写入配置
              </span>
            }
          >
            <Button
              size="sm"
              variant="flat"
              startContent={<MdAdd className="text-lg" />}
              onPress={() => setPickerOpen(true)}
            >
              添加
            </Button>
          </SettingItem>
        </Tab>
        {group && remote && (
          <Tab key="headers" title="请求头">
            <p className="mb-4 text-xs leading-relaxed text-foreground-500">
              User-Agent 和鉴权沿用订阅信息，其他请求头在这里添加。
            </p>
            <ProviderHeaders rows={headers} disabled={saving} onChange={setHeaders} />
          </Tab>
        )}
      </Tabs>
      {pickerOpen && (
        <SimpleNodeFieldPicker
          fields={fields.map((field) => ({
            field,
            path: field.key,
            labels: [field.label],
            required: false
          }))}
          hidden={visible}
          onPick={(key) => {
            setAddedOverride((current) => [...current, key])
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </fieldset>
  )
}
export default SimpleProviderOptions
