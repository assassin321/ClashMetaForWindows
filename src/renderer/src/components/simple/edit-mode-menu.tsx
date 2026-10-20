import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Switch
} from '@heroui/react'
import React from 'react'
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import { MdEdit } from 'react-icons/md'

interface Props {
  enabled: boolean
  disabled?: boolean
  onChange: (enabled: boolean) => void
}

const EditModeMenu: React.FC<Props> = (props) => {
  const { enabled, disabled, onChange } = props
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          size="sm"
          isIconOnly
          variant="light"
          className="app-nodrag"
          title="设置"
          aria-label="设置"
        >
          <HiOutlineAdjustmentsHorizontal className="text-lg" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="设置" onAction={() => onChange(!enabled)}>
        <DropdownItem
          key="edit"
          isDisabled={disabled}
          startContent={<MdEdit className="text-lg" />}
          endContent={
            <Switch
              size="sm"
              aria-label="编辑模式"
              isSelected={enabled}
              isReadOnly
              tabIndex={-1}
              className="pointer-events-none"
            />
          }
        >
          编辑模式
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default EditModeMenu
