import { Button, Card, CardBody, Chip, Textarea } from '@heroui/react'
import BasePage from '@renderer/components/base/base-page'
import { getSimpleConfig, publishSimpleConfig, saveSimpleDraft } from '@renderer/utils/ipc'
import { useEffect, useState } from 'react'
import type { SimpleModule, SimpleState } from '../../../../shared/simple-config'
import { SIMPLE_MODULES } from '../../../../shared/simple-config'
/* eslint-disable react/prop-types */

export const SimpleModuleEditor: React.FC<{ module: SimpleModule; title?: string }> = ({
  module,
  title
}) => {
  const [state, setState] = useState<SimpleState>()
  const [value, setValue] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    getSimpleConfig().then((next) => {
      setState(next)
      setValue(next.draft.modules[module] || '')
    })
  }, [module])
  const save = async (publish: boolean): Promise<void> => {
    if (!state) return
    setSaving(true)
    try {
      const draft = { ...state.draft, modules: { ...state.draft.modules, [module]: value } }
      const result = publish ? await publishSimpleConfig(draft) : await saveSimpleDraft(draft)
      setErrors(result.errors)
      if (!publish || !result.errors.length) {
        const saved = await getSimpleConfig()
        setState(saved)
        setValue(saved.draft.modules[module] || '')
      }
    } finally {
      setSaving(false)
    }
  }
  return (
    <BasePage
      title={title || SIMPLE_MODULES[module]}
      header={
        <>
          <Chip size="sm" variant="flat">
            简易模式
          </Chip>
          <Button size="sm" variant="light" className="app-nodrag" onPress={() => save(false)}>
            保存草稿
          </Button>
          <Button
            size="sm"
            color="primary"
            className="app-nodrag"
            isLoading={saving}
            onPress={() => save(true)}
          >
            发布
          </Button>
        </>
      }
    >
      <div className="p-2">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-small text-default-500">
                此模块由简易模式独立生成，可引用其他模块名称
              </span>
              <span className="ml-auto text-small text-default-500">
                {value.split('\n').length} 行
              </span>
            </div>
            <Textarea value={value} onValueChange={setValue} minRows={22} className="font-mono" />
            {errors.map((error) => (
              <div key={error} className="text-danger text-small mt-1">
                {error}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </BasePage>
  )
}
