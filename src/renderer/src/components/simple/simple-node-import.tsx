import { Button, Chip, Textarea } from '@heroui/react'
import { toast } from '@renderer/components/base/toast'
import { createSimpleNodes } from '@renderer/utils/ipc'
import { useState } from 'react'
import { MdContentPaste } from 'react-icons/md'
import type { SimpleObject } from '../../../../shared/simple-config'
import { parseSimpleNodeInput } from '../../../../shared/simple-node/parse'
/* eslint-disable react/prop-types */

interface Props {
  mode: 'import-link' | 'import-yaml'
  onParsed: (node: SimpleObject) => void
  onImported: () => void
}

const SimpleNodeImport: React.FC<Props> = ({ mode, onParsed, onImported }) => {
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [batch, setBatch] = useState<SimpleObject[]>([])
  const [saving, setSaving] = useState(false)

  const parseInput = (): void => {
    const result = parseSimpleNodeInput(text)
    setErrors(result.errors)
    if (!result.nodes.length) return
    if (result.nodes.length === 1) {
      onParsed(result.nodes[0])
      return
    }
    setBatch(result.nodes)
  }
  const importBatch = async (): Promise<void> => {
    setSaving(true)
    try {
      await createSimpleNodes(batch)
      toast.success(`已导入 ${batch.length} 个节点`)
      onImported()
    } catch (error) {
      setErrors([String(error)])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        size="sm"
        minRows={8}
        autoFocus
        className="font-mono"
        label={mode === 'import-link' ? '分享链接' : 'Clash 节点配置'}
        placeholder={
          mode === 'import-link'
            ? 'ss://... 每行一个，支持一次粘贴多个'
            : 'proxies:\n  - name: 节点\n    type: ss\n    server: example.com\n    port: 443'
        }
        value={text}
        onValueChange={(next) => {
          setText(next)
          setBatch([])
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          color="primary"
          startContent={<MdContentPaste className="text-lg" />}
          isDisabled={!text.trim()}
          onPress={parseInput}
        >
          解析
        </Button>
        {batch.length > 0 && (
          <>
            <span className="text-sm">解析到 {batch.length} 个节点</span>
            {batch.map((node) => (
              <Chip key={String(node.name)} size="sm" variant="flat">
                {String(node.name)}
              </Chip>
            ))}
            <Button size="sm" color="primary" isLoading={saving} onPress={importBatch}>
              全部导入
            </Button>
          </>
        )}
      </div>
      {errors.map((message) => (
        <span key={message} className="text-[10px] text-danger">
          {message}
        </span>
      ))}
    </div>
  )
}

export default SimpleNodeImport
