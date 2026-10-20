import { Button, Card, CardBody } from '@heroui/react'
import { MdEdit } from 'react-icons/md'
import type { SimpleObject } from '../../../../shared/simple-config'
import { getSimpleNodeType } from '../../../../shared/simple-node'
import DeleteResourceButton from './delete-resource-button'
/* eslint-disable react/prop-types */

interface Props {
  node: SimpleObject
  onEdit: () => void
  onDelete: () => Promise<void>
}

const SimpleNodeCard: React.FC<Props> = ({ node, onEdit, onDelete }) => {
  const type = typeof node.type === 'string' ? node.type : ''
  const name = String(node.name ?? '')
  const server = typeof node.server === 'string' ? node.server : ''
  const port = node.port === undefined || node.port === null ? '' : String(node.port)
  const address = [server, port].filter(Boolean).join(':')
  return (
    <Card as="div" isPressable fullWidth onPress={onEdit}>
      <CardBody className="h-14 w-full">
        <div className="flex h-full justify-between gap-3">
          <div className="flex min-w-0 h-full flex-col">
            <div className="flex flex-5 items-center overflow-hidden text-ellipsis whitespace-nowrap leading-tight text-md">
              <span className="inline-block truncate" title={name}>
                {name}
              </span>
            </div>
            <div className="flex flex-3 items-center overflow-hidden text-ellipsis whitespace-nowrap text-[10px] leading-tight text-foreground-500">
              <span>{getSimpleNodeType(type)?.label ?? type}</span>
              {address ? <span className="ml-1 truncate">{address}</span> : null}
            </div>
          </div>
          <div
            className="flex items-center"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Button
              size="sm"
              isIconOnly
              variant="light"
              title={`编辑节点 ${name}`}
              aria-label={`编辑节点 ${name}`}
              onPress={onEdit}
            >
              <MdEdit className="text-lg text-foreground-500" />
            </Button>
            <DeleteResourceButton label={`节点 ${name}`} onDelete={onDelete} />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default SimpleNodeCard
