import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { type ReactNode } from 'react'

interface Props {
  name: string
  disabled: boolean
  children: ReactNode
}

const SortableGroup: React.FC<Props> = (props) => {
  const { name, disabled, children } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: name,
    disabled
  })
  const { onPointerDown, ...otherListeners } = listeners || {}
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...otherListeners}
      onPointerDownCapture={(event) => {
        if ((event.target as HTMLElement).closest('button, input, select, textarea, a')) return
        onPointerDown?.(event)
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 1 : undefined
      }}
      className={isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}
    >
      {children}
    </div>
  )
}

export default SortableGroup
