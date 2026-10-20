import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Radio,
  RadioGroup,
  Textarea
} from '@heroui/react'
import React, { useState } from 'react'
import { saveSimpleRules } from '@renderer/utils/ipc'
import { parseSimpleRule, SIMPLE_RULE_TYPES } from '../../../../shared/simple-rules'
import type { SimpleRuleEditor } from '../../../../shared/simple-config'

interface Props {
  index: number | null
  insertAt?: number
  initialValue?: string
  data: SimpleRuleEditor
  onClose: () => void
  onSaved: () => void
}

const RuleEditorModal: React.FC<Props> = (props) => {
  const { index, data, onClose, onSaved } = props
  const original = index === null ? undefined : data.rules[index]
  const initialValue = original ?? props.initialValue
  const initial = initialValue
    ? parseSimpleRule(initialValue)
    : {
        type: 'DOMAIN-SUFFIX',
        payload: '',
        target: data.outbounds.includes('PROXY') ? 'PROXY' : 'DIRECT',
        options: []
      }
  const [form, setForm] = useState(initial)
  const insertAt = props.insertAt ?? data.rules.length
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const types = [...new Set([...SIMPLE_RULE_TYPES, form.type])]
  const targets = form.type === 'SUB-RULE' ? data.subRules : data.outbounds
  const supportsResolve = [
    'GEOIP',
    'IP-ASN',
    'IP-CIDR',
    'IP-CIDR6',
    'IP-SUFFIX',
    'RULE-SET'
  ].includes(form.type)
  const supportsSource = ['GEOIP', 'IP-ASN', 'IP-CIDR', 'IP-CIDR6', 'IP-SUFFIX'].includes(form.type)
  const save = async (): Promise<void> => {
    setSaving(true)
    setError('')
    try {
      if (!form.target || !targets.includes(form.target)) throw new Error('请选择有效的目标')
      if (form.type !== 'MATCH' && !form.payload.trim()) throw new Error('规则内容不能为空')
      const value =
        original && form.options.length <= 1 && JSON.stringify(form) === JSON.stringify(initial)
          ? original
          : [
              form.type,
              ...(form.type === 'MATCH' ? [] : [form.payload.trim()]),
              form.target,
              ...form.options.slice(0, 1)
            ].join(',')
      if (
        index === null &&
        (!Number.isInteger(insertAt) || insertAt < 0 || insertAt > data.rules.length)
      )
        throw new Error('插入位置无效')
      await saveSimpleRules(
        { action: index === null ? 'add' : 'edit', index: index ?? insertAt, value },
        data.rules
      )
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
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      isDismissable={!saving}
      isKeyboardDismissDisabled={saving}
      onClose={onClose}
      classNames={{ backdrop: 'top-[48px]', base: 'max-h-[calc(100dvh-80px)]' }}
    >
      <ModalContent>
        <ModalHeader className="app-drag">{index === null ? '添加规则' : '编辑规则'}</ModalHeader>
        <ModalBody>
          <fieldset disabled={saving} className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              size="sm"
              label="类型"
              disallowEmptySelection
              selectedKeys={[form.type]}
              onSelectionChange={(keys) => {
                const type = String(Array.from(keys)[0] || form.type)
                if (type === form.type) return
                setForm((current) => ({
                  ...current,
                  type,
                  options: [],
                  payload: '',
                  target:
                    type === 'SUB-RULE'
                      ? ''
                      : data.outbounds.includes(current.target)
                        ? current.target
                        : 'DIRECT'
                }))
              }}
            >
              {types.map((type) => (
                <SelectItem key={type}>{type}</SelectItem>
              ))}
            </Select>
            <Select
              size="sm"
              label={form.type === 'SUB-RULE' ? '子规则' : '目标代理'}
              selectedKeys={form.target ? [form.target] : []}
              onSelectionChange={(keys) =>
                setForm({ ...form, target: String(Array.from(keys)[0] || '') })
              }
            >
              {[...new Set([...targets, ...(form.target ? [form.target] : [])])].map((name) => (
                <SelectItem key={name}>{name}</SelectItem>
              ))}
            </Select>
            {form.type === 'RULE-SET' ? (
              <Select
                size="sm"
                className="sm:col-span-2"
                label="规则集"
                selectedKeys={form.payload ? [form.payload] : []}
                onSelectionChange={(keys) =>
                  setForm({ ...form, payload: String(Array.from(keys)[0] || '') })
                }
              >
                {[
                  ...new Set([
                    ...Object.keys(data.ruleProviders),
                    ...(form.payload ? [form.payload] : [])
                  ])
                ].map((name) => (
                  <SelectItem key={name}>{name}</SelectItem>
                ))}
              </Select>
            ) : (
              form.type !== 'MATCH' && (
                <Textarea
                  size="sm"
                  className="sm:col-span-2 font-mono"
                  label={
                    ['AND', 'OR', 'NOT', 'SUB-RULE'].includes(form.type) ? '匹配表达式' : '规则内容'
                  }
                  minRows={2}
                  value={form.payload}
                  onValueChange={(payload) => setForm({ ...form, payload })}
                />
              )
            )}
            {(supportsResolve || supportsSource) && (
              <RadioGroup
                className="sm:col-span-2"
                label="匹配方式"
                size="sm"
                orientation="horizontal"
                classNames={{ wrapper: 'gap-x-6 gap-y-3' }}
                value={form.options[0] || 'default'}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    options: value === 'default' ? [] : [value]
                  }))
                }
              >
                <Radio value="default">默认</Radio>
                {supportsResolve && <Radio value="no-resolve">不解析</Radio>}
                {supportsSource && <Radio value="src">匹配来源</Radio>}
              </RadioGroup>
            )}
          </fieldset>
          {error && (
            <div role="alert" className="text-sm text-danger break-words">
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
            isDisabled={saving}
            onPress={() => save()}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
export default RuleEditorModal
