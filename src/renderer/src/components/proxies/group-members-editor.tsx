import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, Card, CardBody, Input, Tab, Tabs } from '@heroui/react'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { MdAdd, MdCheck, MdChevronRight, MdClose, MdDragIndicator, MdSearch } from 'react-icons/md'
import {
  SIMPLE_BUILTIN_OUTBOUNDS,
  type SimpleProxyGroupEditor
} from '../../../../shared/simple-config'

type MemberField = 'proxies' | 'use'
interface Member {
  name: string
  field: MemberField
}
interface Props {
  proxies: string[]
  providers: string[]
  outbounds: string[]
  providerOptions: string[]
  groupNames: string[]
  outboundDetails: SimpleProxyGroupEditor['outboundDetails']
  providerTypes: SimpleProxyGroupEditor['providerTypes']
  includeAllProxies: boolean
  includeAllProviders: boolean
  disabled: boolean
  onChange: (field: MemberField, names: string[]) => void
  children: React.ReactNode
}

const memberId = (member: Member): string => JSON.stringify([member.field, member.name])
const collisionDetection: CollisionDetection = (args) => {
  const containers = args.droppableContainers.filter(
    (container) => container.data.current?.field === args.active.data.current?.field
  )
  const options = { ...args, droppableContainers: containers }
  if (!args.pointerCoordinates) return closestCenter(options)
  const hits = pointerWithin(options)
  const rows = hits.filter(
    (hit) => containers.find((item) => item.id === hit.id)?.data.current?.name
  )
  return rows.length ? rows : hits
}

const SelectedMember: React.FC<{
  member: Member
  disabled: boolean
  onRemove: () => void
}> = (props) => {
  const { member, disabled, onRemove } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: memberId(member), data: member, disabled })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex h-11 items-center gap-1 rounded-md pr-1 transition-colors ${isDragging ? 'opacity-40' : ''} ${isOver ? 'bg-primary/10' : 'bg-default-100 hover:bg-default-200/70'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        title="拖动排序"
        aria-label={`排序 ${member.name}`}
        className="shrink-0 touch-none cursor-grab p-2 text-foreground-400"
      >
        <MdDragIndicator />
      </button>
      <span className="min-w-0 flex-1 truncate text-sm" title={member.name}>
        {member.name}
      </span>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        title="移除"
        aria-label={`移除 ${member.name}`}
        isDisabled={disabled}
        onPress={onRemove}
      >
        <MdClose />
      </Button>
    </div>
  )
}

const MemberList: React.FC<{
  field: MemberField
  names: string[]
  disabled: boolean
  onChange: Props['onChange']
}> = (props) => {
  const { field, names, disabled, onChange } = props
  const { setNodeRef, isOver } = useDroppable({
    id: `members-${field}`,
    data: { field },
    disabled
  })
  return (
    <section className="min-w-0">
      <div className="mb-2 flex items-center gap-2 text-sm">
        <span className="font-medium">{field === 'proxies' ? '节点与代理组' : '整份订阅'}</span>
        <span className="text-foreground-400 tabular-nums">{names.length}</span>
      </div>
      <div
        ref={setNodeRef}
        aria-label={field === 'proxies' ? '已选节点与代理组' : '已选整份订阅'}
        className={`min-h-11 space-y-1.5 rounded-md transition-colors ${isOver ? 'bg-primary/5 ring-1 ring-inset ring-primary/40' : ''}`}
      >
        <SortableContext
          items={names.map((name) => memberId({ field, name }))}
          strategy={verticalListSortingStrategy}
        >
          {names.map((name, index) => (
            <SelectedMember
              key={name}
              member={{ field, name }}
              disabled={disabled}
              onRemove={() =>
                onChange(
                  field,
                  names.filter((_, i) => i !== index)
                )
              }
            />
          ))}
        </SortableContext>
        {!names.length && (
          <div className="flex h-11 items-center rounded-md bg-default-50 px-3 text-sm text-foreground-400">
            未添加
          </div>
        )}
      </div>
    </section>
  )
}

const AvailableMember: React.FC<{
  member: Member
  kind: string
  type: string
  selected: boolean
  disabled: boolean
  onAdd: () => void
}> = (props) => {
  const { member, kind, type, selected, disabled, onAdd } = props
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `available-${memberId(member)}`,
    data: member,
    disabled: disabled || selected
  })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`${kind} ${member.name}`}
      className={`flex h-12 shrink-0 items-center gap-2 border-b border-divider px-1 touch-none ${selected ? 'text-foreground-400' : 'cursor-grab'} ${isDragging ? 'opacity-40' : ''}`}
    >
      <MdDragIndicator className="shrink-0 text-foreground-400" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm" title={member.name}>
          {member.name}
        </div>
        <div className="truncate text-xs text-foreground-400" title={type}>
          {type}
        </div>
      </div>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        title={selected ? '已添加' : '添加'}
        aria-label={`${selected ? '已添加' : '添加'} ${member.name}`}
        isDisabled={disabled || selected}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        onPress={onAdd}
      >
        {selected ? <MdCheck /> : <MdAdd />}
      </Button>
    </div>
  )
}

const GroupMembersEditor: React.FC<Props> = (props) => {
  const {
    proxies,
    providers,
    outbounds,
    providerOptions,
    groupNames,
    outboundDetails,
    providerTypes,
    includeAllProxies,
    includeAllProviders,
    disabled,
    onChange,
    children
  } = props
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('nodes')
  const [activeMember, setActiveMember] = useState<Member>()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const field: MemberField = category === 'providers' ? 'use' : 'proxies'
  const names =
    category === 'providers'
      ? includeAllProviders
        ? []
        : providerOptions
      : outbounds.filter((name) => {
          if (category === 'groups') return groupNames.includes(name)
          return (
            !groupNames.includes(name) &&
            (!includeAllProxies || SIMPLE_BUILTIN_OUTBOUNDS.includes(name))
          )
        })
  const filtered = names.filter((name) =>
    name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  )
  const selected = field === 'use' ? providers : proxies
  const sections = new Map<string, { title: string; names: string[] }>()
  for (const name of filtered) {
    const source = outboundDetails[name]?.source
    const builtin = SIMPLE_BUILTIN_OUTBOUNDS.includes(name)
    const key = builtin ? 'builtin' : source ? `source:${source}` : 'local'
    const section = sections.get(key) || {
      title: builtin ? '内置' : source || '本地节点',
      names: []
    }
    section.names.push(name)
    sections.set(key, section)
  }
  const renderMember = (name: string): React.ReactNode => (
    <AvailableMember
      key={memberId({ field, name })}
      member={{ field, name }}
      kind={category === 'providers' ? '整份订阅' : category === 'groups' ? '代理组' : '节点'}
      type={(field === 'use' ? providerTypes[name] : outboundDetails[name]?.type) || 'unknown'}
      selected={selected.includes(name)}
      disabled={disabled}
      onAdd={() => {
        if (!selected.includes(name)) onChange(field, [...selected, name])
      }}
    />
  )
  const onDragEnd = ({ active, over }: DragEndEvent): void => {
    setActiveMember(undefined)
    const member = active.data.current as Member | undefined
    if (disabled || !member || !over || over.data.current?.field !== member.field) return
    const names = member.field === 'use' ? providers : proxies
    const from = names.indexOf(member.name)
    const target = names.indexOf(over.data.current?.name)
    const to = target < 0 ? names.length : target
    if (from >= 0) {
      if (String(active.id).startsWith('available-')) return
      onChange(member.field, arrayMove(names, from, Math.min(to, names.length - 1)))
    } else {
      const next = [...names]
      next.splice(to, 0, member.name)
      onChange(member.field, next)
    }
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => setActiveMember(active.data.current as Member)}
      onDragCancel={() => setActiveMember(undefined)}
      onDragEnd={onDragEnd}
    >
      <div className="grid min-w-0 grid-cols-1 gap-5 md:h-[min(55dvh,480px)] md:min-h-64 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4 md:overflow-y-auto md:pr-2">
          {children}
          <MemberList field="proxies" names={proxies} disabled={disabled} onChange={onChange} />
          <MemberList field="use" names={providers} disabled={disabled} onChange={onChange} />
        </div>
        <aside className="flex min-h-0 min-w-0 flex-col gap-3 border-t border-divider pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <Input
            size="sm"
            aria-label="搜索候选成员"
            placeholder="搜索"
            value={search}
            onValueChange={setSearch}
            startContent={<MdSearch className="shrink-0 text-foreground-400" />}
            isClearable
            onClear={() => setSearch('')}
            isDisabled={disabled}
          />
          <Tabs
            aria-label="候选成员分类"
            size="sm"
            fullWidth
            selectedKey={category}
            onSelectionChange={(key) => setCategory(String(key))}
          >
            <Tab key="nodes" title="节点" />
            <Tab key="groups" title="代理组" />
            <Tab key="providers" title="订阅" />
          </Tabs>
          <div
            aria-label="候选成员"
            className="-mx-2 max-h-64 min-h-32 overflow-y-auto px-2 pt-2 pb-3 md:max-h-none md:min-h-0 md:flex-1"
          >
            {category === 'nodes'
              ? [...sections].map(([key, section]) => {
                  const open = expanded.has(key) || !!search.trim()
                  return (
                    <section key={key} className="mb-2 min-w-0">
                      <Card
                        isPressable
                        fullWidth
                        radius="sm"
                        shadow="sm"
                        aria-label={`${open ? '收起' : '展开'} ${section.title}`}
                        aria-expanded={open}
                        onPress={() =>
                          setExpanded((current) => {
                            const next = new Set(current)
                            if (next.has(key)) next.delete(key)
                            else next.add(key)
                            return next
                          })
                        }
                      >
                        <CardBody className="flex h-12 flex-row items-center gap-2 px-3 py-2">
                          <span
                            className="min-w-0 flex-1 truncate text-sm font-medium"
                            title={section.title}
                          >
                            {section.title}
                          </span>
                          <span className="text-xs text-foreground-400 tabular-nums">
                            {section.names.length}
                          </span>
                          <MdChevronRight
                            className={`shrink-0 text-foreground-500 transition-transform ${open ? 'rotate-90' : ''}`}
                          />
                        </CardBody>
                      </Card>
                      {open && <div className="px-1">{section.names.map(renderMember)}</div>}
                    </section>
                  )
                })
              : filtered.map(renderMember)}
            {!filtered.length && (
              <div className="py-6 text-center text-sm text-foreground-400">
                {category === 'providers' && includeAllProviders
                  ? '已包含全部订阅'
                  : search
                    ? '无匹配结果'
                    : '暂无可用成员'}
              </div>
            )}
          </div>
        </aside>
      </div>
      {createPortal(
        <DragOverlay dropAnimation={null} style={{ zIndex: 100 }}>
          {activeMember && (
            <div className="flex h-10 items-center gap-2 rounded-lg border border-primary bg-content1 px-3 text-sm shadow-lg">
              <MdDragIndicator />
              <span className="truncate">{activeMember.name}</span>
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}

export default GroupMembersEditor
