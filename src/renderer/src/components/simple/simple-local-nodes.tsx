import { Card, CardBody } from '@heroui/react'
import { toast } from '@renderer/components/base/toast'
import { getSimpleConfig, removeSimpleNode } from '@renderer/utils/ipc'
import { useMemo, useState } from 'react'
import { MdAdd } from 'react-icons/md'
import { parse } from 'yaml'
import useSWR from 'swr'
import type { SimpleObject } from '../../../../shared/simple-config'
import SimpleNodeCard from './simple-node-card'
import SimpleNodeModal from './simple-node-modal'

const SimpleLocalNodes: React.FC = () => {
  const { data, mutate } = useSWR('getSimpleConfig', getSimpleConfig)
  const [editing, setEditing] = useState<string>()
  const [creating, setCreating] = useState(false)
  const nodes = useMemo<SimpleObject[]>(() => {
    if (!data) return []
    try {
      const parsed: unknown = parse(data.draft.modules.proxies)
      return Array.isArray(parsed)
        ? parsed.filter((item): item is SimpleObject => !!item && typeof item === 'object')
        : []
    } catch {
      return []
    }
  }, [data])
  return (
    <div>
      {nodes.length === 0 && (
        <div className="px-2 pb-2 text-sm text-foreground-500">
          还没有本地节点，可以粘贴分享链接、Clash 节点或手动填写。
        </div>
      )}
      <div>
        {nodes.map((node) => (
          <div key={String(node.name)} className="px-2 pt-2">
            <SimpleNodeCard
              node={node}
              onEdit={() => setEditing(String(node.name))}
              onDelete={async () => {
                await removeSimpleNode(String(node.name), node)
                await mutate()
              }}
            />
          </div>
        ))}
        <div className="px-2 pb-2 pt-2">
          <Card isPressable fullWidth onPress={() => setCreating(true)}>
            <CardBody className="flex h-14 flex-row items-center justify-center gap-2 text-foreground-500">
              <MdAdd className="text-xl" />
              <span className="text-sm">添加节点</span>
            </CardBody>
          </Card>
        </div>
      </div>
      {(creating || editing !== undefined) && (
        <SimpleNodeModal
          key={creating ? 'new-node' : `edit:${editing}`}
          name={creating ? undefined : editing}
          onClose={() => {
            setCreating(false)
            setEditing(undefined)
          }}
          onSaved={() => {
            mutate().catch((error) => toast.error(String(error)))
          }}
        />
      )}
    </div>
  )
}

export default SimpleLocalNodes
