import { Button } from '@heroui/react'
import { useState } from 'react'
import { MdDeleteOutline } from 'react-icons/md'
import BaseConfirmModal from '../base/base-confirm-modal'
import { toast } from '../base/toast'
/* eslint-disable react/prop-types */

interface Props {
  label: string
  disabled?: boolean
  onDelete: () => Promise<void>
}

const DeleteResourceButton: React.FC<Props> = (props) => {
  const { label, disabled, onDelete } = props
  const [pending, setPending] = useState<() => Promise<void>>()
  const [saving, setSaving] = useState(false)
  return (
    <div
      className="shrink-0"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Button
        size="sm"
        isIconOnly
        variant="light"
        color="danger"
        title={`删除${label}`}
        aria-label={`删除${label}`}
        isDisabled={disabled || saving}
        onPress={() => setPending(() => onDelete)}
      >
        <MdDeleteOutline className="text-lg" />
      </Button>
      {pending && (
        <BaseConfirmModal
          isOpen
          title={`删除${label}`}
          content="删除后会自动清理关联引用。"
          confirmText="删除"
          isLoading={saving}
          onCancel={() => setPending(undefined)}
          onConfirm={async () => {
            if (saving) return
            setSaving(true)
            try {
              await pending()
              setPending(undefined)
            } catch (error) {
              toast.error(String(error))
            } finally {
              setSaving(false)
            }
          }}
        />
      )}
    </div>
  )
}

export default DeleteResourceButton
