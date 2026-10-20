import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem
} from '@heroui/react'
import { toast } from '@renderer/components/base/toast'
import { getProfileConfig, getSimpleConfig, importSimpleSubscription } from '@renderer/utils/ipc'
import { useEffect, useState } from 'react'
import type { SimplePreview, SimpleState } from '../../../../shared/simple-config'

/* eslint-disable react/prop-types */

interface Props {
  onClose: () => void
  onImported: (state: SimpleState, preview: SimplePreview) => void
}

const SimpleSubscriptionModal: React.FC<Props> = ({ onClose, onImported }) => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [profileId, setProfileId] = useState('')
  const [profiles, setProfiles] = useState<IProfileItem[]>([])
  const [mode, setMode] = useState<'extract' | 'inline' | 'http'>('http')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    getProfileConfig()
      .then((config) => setProfiles(config.items.filter((item) => item.type === 'remote')))
      .catch((error) => toast.error(String(error)))
  }, [])
  const save = async (): Promise<void> => {
    if (!url.trim() && !profileId) {
      toast.error('订阅 URL 不能为空')
      return
    }
    setSaving(true)
    try {
      const result = await importSimpleSubscription({
        name: name || profiles.find((item) => item.id === profileId)?.name || '',
        url: url || undefined,
        profileId: profileId || undefined,
        mode
      })
      onImported(await getSimpleConfig(), result.preview)
      onClose()
    } catch (error) {
      toast.error(String(error))
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal isOpen hideCloseButton size="2xl" backdrop="blur" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="app-drag">添加订阅</ModalHeader>
        <ModalBody>
          <Input label="名称" value={name} onValueChange={setName} />
          <Select
            label="已有订阅（可选）"
            selectedKeys={profileId ? [profileId] : []}
            onChange={(e) => {
              const id = e.target.value
              setProfileId(id)
              const profile = profiles.find((item) => item.id === id)
              if (profile) {
                setName((current) => current || profile.name)
                setUrl(profile.url || '')
              }
            }}
          >
            {profiles.map((profile) => (
              <SelectItem key={profile.id}>{profile.name}</SelectItem>
            ))}
          </Select>
          <Input label="订阅 URL" value={url} onValueChange={setUrl} />
          <Select
            label="导入方式"
            selectedKeys={[mode]}
            onChange={(e) => setMode(e.target.value as typeof mode)}
          >
            <SelectItem key="http">HTTP Provider</SelectItem>
            <SelectItem key="inline">Inline Provider</SelectItem>
            <SelectItem key="extract">提取节点</SelectItem>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" isLoading={saving} onPress={save}>
            添加
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default SimpleSubscriptionModal
