import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Tab,
  Tabs
} from '@heroui/react'
import React, { useEffect, useState } from 'react'
import {
  createSimpleProxyGroup,
  getSimpleProxyGroup,
  saveSimpleProxyGroup
} from '@renderer/utils/ipc'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import {
  SIMPLE_BUILTIN_OUTBOUNDS,
  type SimpleObject,
  type SimpleProxyGroupEditor
} from '../../../../shared/simple-config'
import GroupMembersEditor from './group-members-editor'

interface Props {
  name?: string
  onClose: () => void
  onSaved: () => void
}

const groupTypes = [
  { key: 'select', label: '手动选择' },
  { key: 'url-test', label: '自动测速' },
  { key: 'fallback', label: '故障转移' },
  { key: 'load-balance', label: '负载均衡' }
]
const excludedTypes = [
  'Direct',
  'Reject',
  'RejectDrop',
  'Compatible',
  'Pass',
  'PassRule',
  'Rematch',
  'Dns',
  'Relay',
  'Selector',
  'Fallback',
  'URLTest',
  'LoadBalance',
  'Shadowsocks',
  'ShadowsocksR',
  'Snell',
  'Socks5',
  'Http',
  'Vmess',
  'Vless',
  'Trojan',
  'Hysteria',
  'Hysteria2',
  'WireGuard',
  'Tuic',
  'Ssh',
  'Mieru',
  'AnyTLS',
  'Sudoku',
  'Masque',
  'TrustTunnel',
  'ShadowQuic',
  'OpenVPN',
  'Tailscale',
  'GostRelay'
]
const numberFields = [
  ['interval', '检测间隔（秒）'],
  ['timeout', '检测超时（毫秒）'],
  ['max-failed-times', '最大失败次数'],
  ['tolerance', '切换容差（毫秒）']
] as const
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

const GroupEditorModal: React.FC<Props> = (props) => {
  const { name, onClose, onSaved } = props
  const { appConfig } = useAppConfig()
  const [data, setData] = useState<SimpleProxyGroupEditor>()
  const [values, setValues] = useState<SimpleObject>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getSimpleProxyGroup(name)
      .then((data) => {
        if (!active) return
        setData(data)
        setValues(structuredClone(data.group))
      })
      .catch((error) => {
        if (active) setError(String(error))
      })
    return () => {
      active = false
    }
  }, [name])

  const set = (key: string, value: unknown): void => {
    setValues((current) => {
      const next = { ...current }
      if (value === undefined || value === '') delete next[key]
      else next[key] = value
      if (key === 'proxies' && !strings(value).includes(String(next['empty-fallback']))) {
        delete next['empty-fallback']
      }
      return next
    })
  }
  const type = String(values.type || 'select')
  const types = [...groupTypes]
  if (!types.some((item) => item.key === type)) types.push({ key: type, label: type })
  const proxies = strings(values.proxies)
  const providers = strings(values.use)
  const groupName = String(values.name || '').trim()
  const nameError = !groupName
    ? '代理组名称不能为空'
    : SIMPLE_BUILTIN_OUTBOUNDS.includes(groupName) || groupName === 'GLOBAL'
      ? '不能使用内置出站或 GLOBAL 名称'
      : data?.outbounds.includes(groupName)
        ? data.groupNames.includes(groupName)
          ? '代理组名称已存在'
          : '代理组名称不能与节点名称相同'
        : ''
  const outboundOptions = [...new Set([...(data?.outbounds || []), ...proxies])]
  const providerOptions = [...new Set([...(data?.proxyProviders || []), ...providers])]
  const fallbackOptions = [...new Set(proxies)].filter(
    (name) => data?.outbounds.includes(name) && !data.groupNames.includes(name)
  )
  const selectedExcludedTypes =
    typeof values['exclude-type'] === 'string'
      ? values['exclude-type'].split('|').map((type) => type.trim().toLowerCase())
      : []
  const input = (key: string, label: string, placeholder?: string): React.ReactNode => (
    <Input
      size="sm"
      label={label}
      value={String(values[key] ?? '')}
      placeholder={placeholder}
      onValueChange={(value) => set(key, value)}
    />
  )
  const toggle = (key: string, label: string, fallback = false): React.ReactNode => (
    <Switch
      size="sm"
      classNames={{
        base: 'm-0 min-h-8 max-w-full gap-2 py-1',
        wrapper: 'mr-0 shrink-0',
        label: 'min-w-0 text-sm leading-5'
      }}
      isSelected={typeof values[key] === 'boolean' ? values[key] : fallback}
      onValueChange={(value) => set(key, value)}
    >
      {label}
    </Switch>
  )
  const save = async (): Promise<void> => {
    if (!data) return
    setSaving(true)
    setError('')
    try {
      const group: SimpleObject = { ...values, name: String(values.name || '').trim(), type }
      if (nameError) throw new Error(nameError)
      if (!fallbackOptions.includes(String(group['empty-fallback']))) delete group['empty-fallback']
      for (const [key, label] of numberFields) {
        if (group[key] === undefined) continue
        const number = Number(group[key])
        if (
          !Number.isSafeInteger(number) ||
          number < 0 ||
          (key === 'tolerance' && number > 65535)
        ) {
          throw new Error(`${label}必须是${key === 'tolerance' ? ' 0 到 65535 的' : '非负'}整数`)
        }
        group[key] = number
      }
      if (typeof group.url === 'string' && group.url.trim()) {
        const url = new URL(group.url)
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('检测地址必须使用 http(s)')
      }
      if (name === undefined) await createSimpleProxyGroup(group)
      else await saveSimpleProxyGroup(name, group, data.group)
      onSaved()
      onClose()
    } catch (error) {
      setError(String(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen
      hideCloseButton
      backdrop="blur"
      size="4xl"
      scrollBehavior="inside"
      isDismissable={!saving}
      isKeyboardDismissDisabled={saving}
      onClose={onClose}
      classNames={{ backdrop: 'top-[48px]', base: 'max-h-[calc(100dvh-80px)]' }}
    >
      <ModalContent>
        <ModalHeader className="app-drag min-w-0">
          <span className="truncate">
            {name === undefined ? '添加代理组' : `编辑代理组 · ${name}`}
          </span>
        </ModalHeader>
        <ModalBody>
          {!data && !error && (
            <div className="flex justify-center py-8">
              <Spinner aria-label="加载代理组" />
            </div>
          )}
          {data && (
            <fieldset disabled={saving} className="min-w-0">
              <Tabs aria-label="代理组参数" size="sm" classNames={{ panel: 'px-0 pt-4' }}>
                <Tab key="basic" title="基本">
                  <GroupMembersEditor
                    proxies={proxies}
                    providers={providers}
                    outbounds={outboundOptions}
                    providerOptions={providerOptions}
                    groupNames={data.groupNames}
                    outboundDetails={data.outboundDetails}
                    providerTypes={data.providerTypes}
                    includeAllProxies={values['include-all-proxies'] === true}
                    includeAllProviders={values['include-all-providers'] === true}
                    disabled={saving}
                    onChange={set}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        size="sm"
                        label="名称"
                        value={String(values.name ?? '')}
                        isInvalid={!!groupName && !!nameError}
                        errorMessage={nameError}
                        onValueChange={(value) => set('name', value)}
                      />
                      <Select
                        size="sm"
                        label="类型"
                        disallowEmptySelection
                        selectedKeys={[type]}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0]
                          if (selected) set('type', String(selected))
                        }}
                      >
                        {types.map((item) => (
                          <SelectItem key={item.key}>{item.label}</SelectItem>
                        ))}
                      </Select>
                      {input('icon', '图标')}
                      {type === 'select' && (
                        <Select
                          size="sm"
                          label="默认节点"
                          selectedKeys={
                            values['default-selected'] ? [String(values['default-selected'])] : []
                          }
                          onSelectionChange={(keys) => set('default-selected', Array.from(keys)[0])}
                        >
                          {[
                            ...new Set([
                              ...outboundOptions,
                              ...strings([values['default-selected']])
                            ])
                          ].map((name) => (
                            <SelectItem key={name}>{name}</SelectItem>
                          ))}
                        </Select>
                      )}
                      {type === 'load-balance' && (
                        <Select
                          size="sm"
                          label="均衡策略"
                          disallowEmptySelection
                          selectedKeys={[String(values.strategy || 'consistent-hashing')]}
                          onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0]
                            if (selected) set('strategy', String(selected))
                          }}
                        >
                          <SelectItem key="consistent-hashing">一致性哈希</SelectItem>
                          <SelectItem key="round-robin">轮询</SelectItem>
                          <SelectItem key="sticky-sessions">会话保持</SelectItem>
                        </Select>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                      {toggle('hidden', '隐藏代理组')}
                      {toggle('disable-udp', '禁用 UDP')}
                      {toggle('include-all-proxies', '包含全部节点')}
                      {toggle('include-all-providers', '包含全部订阅')}
                    </div>
                  </GroupMembersEditor>
                </Tab>
                <Tab key="advanced" title="高级">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">{input('url', '检测地址')}</div>
                    {numberFields
                      .filter(([key]) => key !== 'tolerance' || type === 'url-test')
                      .map(([key, label]) => (
                        <Input
                          key={key}
                          size="sm"
                          type="number"
                          min={0}
                          step={1}
                          max={key === 'tolerance' ? 65535 : undefined}
                          label={label}
                          value={String(values[key] ?? '')}
                          onValueChange={(value) => set(key, value)}
                        />
                      ))}
                    {input('expected-status', '预期 HTTP 状态码')}
                  </div>
                  <div className="mt-4">{toggle('lazy', '仅在使用时检测', true)}</div>
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-divider pt-4 sm:grid-cols-2">
                    {input('filter', '节点名称过滤')}
                    {input('exclude-filter', '排除节点名称')}
                    <Select
                      size="sm"
                      label="排除节点类型"
                      selectionMode="multiple"
                      selectedKeys={excludedTypes.filter((type) =>
                        selectedExcludedTypes.includes(type.toLowerCase())
                      )}
                      onSelectionChange={(keys) =>
                        set(
                          'exclude-type',
                          (keys === 'all' ? excludedTypes : Array.from(keys)).join('|')
                        )
                      }
                    >
                      {excludedTypes.map((type) => (
                        <SelectItem key={type}>{type}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      size="sm"
                      label="空组回退"
                      selectedKeys={
                        fallbackOptions.includes(String(values['empty-fallback']))
                          ? [String(values['empty-fallback'])]
                          : []
                      }
                      isDisabled={!fallbackOptions.length}
                      onSelectionChange={(keys) => set('empty-fallback', Array.from(keys)[0])}
                    >
                      {fallbackOptions.map((name) => (
                        <SelectItem key={name}>{name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </Tab>
              </Tabs>
            </fieldset>
          )}
          {error && (
            <div role="alert" className="text-danger text-sm whitespace-pre-wrap break-words">
              {error}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="light" isDisabled={saving} onPress={onClose}>
            取消
          </Button>
          <Button
            size="sm"
            color="primary"
            isLoading={saving}
            isDisabled={!data || saving || !!nameError}
            onPress={save}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GroupEditorModal
