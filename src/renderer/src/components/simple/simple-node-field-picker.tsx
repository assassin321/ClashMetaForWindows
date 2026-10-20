import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react'
import { useMemo, useState } from 'react'
import { MdSearch } from 'react-icons/md'
import type { SimpleNodeFieldEntry } from '../../../../shared/simple-node'
import { listOptionalSimpleNodeFields } from '../../../../shared/simple-node'
/* eslint-disable react/prop-types */

interface Props {
  type?: string
  fields?: readonly SimpleNodeFieldEntry[]
  hidden: Set<string>
  onPick: (path: string) => void
  onClose: () => void
}

const SimpleNodeFieldPicker: React.FC<Props> = ({ type, fields, hidden, onPick, onClose }) => {
  const [search, setSearch] = useState('')
  const entries = useMemo<SimpleNodeFieldEntry[]>(() => {
    const keyword = search.trim().toLowerCase()
    return (fields ?? listOptionalSimpleNodeFields(type || '')).filter((entry) => {
      if (hidden.has(entry.path)) return false
      if (!keyword) return true
      return (
        entry.path.toLowerCase().includes(keyword) ||
        entry.labels.join(' ').toLowerCase().includes(keyword)
      )
    })
  }, [type, fields, hidden, search])
  return (
    <Modal
      isOpen
      hideCloseButton
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        backdrop: 'top-[48px]',
        wrapper: 'top-[48px] h-[calc(100dvh-48px)]',
        base: 'max-h-[calc(100dvh-112px)]'
      }}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="app-drag">添加字段</ModalHeader>
        <ModalBody>
          <Input
            size="sm"
            autoFocus
            placeholder="搜索字段"
            startContent={<MdSearch className="text-lg text-foreground-500" />}
            value={search}
            onValueChange={setSearch}
          />
          {entries.length === 0 ? (
            <div className="py-6 text-center text-sm text-foreground-500">没有可添加的字段</div>
          ) : (
            <div className="flex flex-col gap-1">
              {entries.map((entry) => (
                <Button
                  key={entry.path}
                  variant="light"
                  className="h-auto min-h-9 w-full justify-between gap-3 px-2 py-1"
                  onPress={() => onPick(entry.path)}
                >
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="truncate text-sm">{entry.labels.join(' › ')}</span>
                    <span className="truncate text-[10px] text-foreground-500">{entry.path}</span>
                  </span>
                  <Chip size="sm" variant="flat" className="shrink-0">
                    {entry.field.kind}
                  </Chip>
                </Button>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="light" onPress={onClose}>
            取消
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SimpleNodeFieldPicker
