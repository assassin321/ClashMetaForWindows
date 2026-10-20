import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs
} from '@heroui/react'
import SettingItem from '@renderer/components/base/base-setting-item'
import { createSimpleNodes, getSimpleNode, saveSimpleNode } from '@renderer/utils/ipc'
import React, { useEffect, useMemo, useState } from 'react'
import { MdAdd } from 'react-icons/md'
import type { SimpleObject } from '../../../../shared/simple-config'
import {
  SIMPLE_NODE_PROTOCOLS,
  isSimpleNodeValueEmpty,
  listOptionalSimpleNodeFields,
  listSimpleNodeFields,
  listVisibleSimpleNodeFields,
  readSimpleNodeValue,
  removeSimpleNodeValue,
  writeSimpleNodeValue
} from '../../../../shared/simple-node'
import SimpleNodeFields from './simple-node-fields'
import SimpleNodeImport from './simple-node-import'
import SimpleNodeFieldPicker from './simple-node-field-picker'

type Mode = 'form' | 'import-link' | 'import-yaml'

interface Props {
  name?: string
  onClose: () => void
  onSaved: () => void
}

const nodeType = (node: SimpleObject): string =>
  typeof node.type === 'string' && node.type ? node.type : 'ss'

const filledPaths = (node: SimpleObject, type: string): string[] => {
  const entries = listOptionalSimpleNodeFields(type)
  const filled = entries.filter(
    (entry) => !isSimpleNodeValueEmpty(readSimpleNodeValue(node, entry.path))
  )
  return filled
    .filter((entry) => !filled.some((other) => other.path.startsWith(`${entry.path}.`)))
    .map((entry) => entry.path)
}

const SimpleNodeModal: React.FC<Props> = ({ name, onClose, onSaved }) => {
  const [data, setData] = useState<SimpleObject>()
  const [mode, setMode] = useState<Mode>('form')
  const [values, setValues] = useState<SimpleObject>({})
  const [added, setAdded] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getSimpleNode(name)
      .then((next) => {
        if (!active) return
        setData(next)
        setValues(structuredClone(next))
        setAdded(filledPaths(next, nodeType(next)))
      })
      .catch((reason) => {
        if (active) setError(String(reason))
      })
    return () => {
      active = false
    }
  }, [name])

  const type = nodeType(values)
  const typeOptions = Object.values(SIMPLE_NODE_PROTOCOLS)
  const visible = useMemo(() => listVisibleSimpleNodeFields(type, added), [type, added])

  const setValue = (path: string, value: unknown): void => {
    setValues((current) =>
      value === undefined
        ? removeSimpleNodeValue(current, path)
        : writeSimpleNodeValue(current, path, value)
    )
  }
  const addField = (path: string): void => {
    setAdded((current) => (current.includes(path) ? current : [...current, path]))
    setPickerOpen(false)
  }
  const removeField = (path: string): void => {
    setAdded((current) => current.filter((item) => item !== path && !item.startsWith(`${path}.`)))
    setValue(path, undefined)
  }
  const changeType = (next: string): void => {
    let updated: SimpleObject = { type: next }
    for (const key of ['name', 'server', 'port']) {
      const current = values[key]
      if (current !== undefined && current !== '') updated[key] = current
    }
    for (const entry of listSimpleNodeFields(next)) {
      if (entry.field.hidden) continue
      const current = readSimpleNodeValue(values, entry.path)
      if (!isSimpleNodeValueEmpty(current))
        updated = writeSimpleNodeValue(updated, entry.path, current)
    }
    setValues(updated)
    setAdded(filledPaths(updated, next))
  }

  const applyParsed = (node: SimpleObject): void => {
    setValues((current) => ({
      ...node,
      name: typeof current.name === 'string' && current.name.trim() ? current.name : node.name
    }))
    setAdded(filledPaths(node, nodeType(node)))
    setMode('form')
  }
  const save = async (): Promise<void> => {
    if (!data) return
    setSaving(true)
    setError('')
    try {
      const node: SimpleObject = { ...values, name: String(values.name ?? '').trim(), type }
      if (name === undefined) await createSimpleNodes([node])
      else await saveSimpleNode(name, node, data)
      onSaved()
      onClose()
    } catch (reason) {
      setError(String(reason))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Modal
        isOpen
        hideCloseButton
        size="3xl"
        backdrop="blur"
        scrollBehavior="inside"
        isDismissable={!saving}
        isKeyboardDismissDisabled={saving}
        classNames={{
          backdrop: 'top-[48px]',
          wrapper: 'top-[48px] h-[calc(100dvh-48px)]',
          base: 'max-h-[calc(100dvh-112px)]'
        }}
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader className="app-drag min-w-0">
            <span className="truncate">
              {name === undefined ? '添加节点' : `编辑节点 · ${name}`}
            </span>
          </ModalHeader>
          <ModalBody>
            {!data && !error && (
              <div className="flex justify-center py-8">
                <Spinner aria-label="加载节点" />
              </div>
            )}
            {data && name === undefined && (
              <Tabs
                size="sm"
                color="primary"
                className="mb-3"
                selectedKey={mode}
                onSelectionChange={(key) => {
                  setMode(key as Mode)
                }}
              >
                <Tab key="form" title="手动填写" />
                <Tab key="import-link" title="分享链接" />
                <Tab key="import-yaml" title="Clash 节点" />
              </Tabs>
            )}
            {data && (mode === 'import-link' || mode === 'import-yaml') && (
              <SimpleNodeImport
                key={mode}
                mode={mode}
                onParsed={applyParsed}
                onImported={() => {
                  onSaved()
                  onClose()
                }}
              />
            )}
            {data && mode === 'form' && (
              <fieldset disabled={saving} className="min-w-0">
                <SettingItem title="类型" divider>
                  <Select
                    size="sm"
                    className="w-48"
                    disallowEmptySelection
                    selectedKeys={[type]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0]
                      if (selected !== undefined) changeType(String(selected))
                    }}
                  >
                    {typeOptions.map((item) => (
                      <SelectItem key={item.type}>{item.label}</SelectItem>
                    ))}
                  </Select>
                </SettingItem>
                <SimpleNodeFields
                  type={type}
                  values={values}
                  added={added}
                  disabled={saving}
                  onChange={setValue}
                  onRemove={removeField}
                />
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
              </fieldset>
            )}
            {error && (
              <div
                role="alert"
                className="mt-2 text-sm break-words whitespace-pre-wrap text-danger"
              >
                {error}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="light" isDisabled={saving} onPress={onClose}>
              取消
            </Button>
            {mode === 'form' && (
              <Button
                size="sm"
                color="primary"
                isLoading={saving}
                isDisabled={!data || saving}
                onPress={save}
              >
                保存
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      {pickerOpen && (
        <SimpleNodeFieldPicker
          type={type}
          hidden={visible}
          onPick={addField}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  )
}

export default SimpleNodeModal
