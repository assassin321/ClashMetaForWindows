import { Tabs, Tab } from '@heroui/react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import { useGroups } from '@renderer/hooks/use-groups'
import { mihomoCloseAllConnections, patchMihomoConfig, updateTrayIcon } from '@renderer/utils/ipc'
import { Key } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  iconOnly?: boolean
  expanded?: boolean
}

const OutboundModeSwitcher: React.FC<Props> = ({ iconOnly, expanded = false }: Props) => {
  const { t } = useTranslation()
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const { mutate: mutateGroups } = useGroups()
  const { appConfig } = useAppConfig()
  const { autoCloseConnection = true, disableAnimations = false } = appConfig || {}
  const { mode } = controledMihomoConfig || {}

  const onChangeMode = async (mode: OutboundMode): Promise<void> => {
    await patchControledMihomoConfig({ mode })
    await patchMihomoConfig({ mode })
    if (autoCloseConnection) {
      await mihomoCloseAllConnections()
    }
    mutateGroups()
    window.electron.ipcRenderer.send('updateTrayMenu')
    await updateTrayIcon()
  }
  if (!mode) return null
  if (iconOnly) {
    return (
      <Tabs
        fullWidth
        isVertical
        aria-label={t('sider.cards.outbound.title')}
        disableAnimation={disableAnimations}
        color="primary"
        selectedKey={mode}
        classNames={{
          base: 'w-full',
          tabWrapper: 'w-full',
          tabList: 'bg-content1 shadow-medium outbound-mode-card w-full',
          tab: 'justify-start px-0',
          tabContent: 'w-full',
          // Follow the rail width directly; animate only movement between modes.
          cursor:
            'right-1 !w-auto data-[animated=true]:transition-[top,height] motion-reduce:transition-none'
        }}
        onSelectionChange={(key: Key) => onChangeMode(key as OutboundMode)}
      >
        {(['rule', 'global', 'direct'] as const).map((value) => (
          <Tab
            key={value}
            aria-label={t(`sider.cards.outbound.${value}`)}
            className={mode === value ? 'font-bold' : ''}
            title={
              <span className="flex items-center">
                <span className="sider-mode-icon">{value[0].toUpperCase()}</span>
                <span className="sider-item-label" aria-hidden={!expanded}>
                  {t(`sider.cards.outbound.${value}`)}
                </span>
              </span>
            }
          />
        ))}
      </Tabs>
    )
  }
  return (
    <Tabs
      fullWidth
      aria-label={t('sider.cards.outbound.title')}
      disableAnimation={disableAnimations}
      color="primary"
      selectedKey={mode}
      classNames={{
        tabList: 'bg-content1 shadow-medium outbound-mode-card'
      }}
      onSelectionChange={(key: Key) => onChangeMode(key as OutboundMode)}
    >
      <Tab
        className={`${mode === 'rule' ? 'font-bold' : ''}`}
        key="rule"
        title={t('sider.cards.outbound.rule')}
      />
      <Tab
        className={`${mode === 'global' ? 'font-bold' : ''}`}
        key="global"
        title={t('sider.cards.outbound.global')}
      />
      <Tab
        className={`${mode === 'direct' ? 'font-bold' : ''}`}
        key="direct"
        title={t('sider.cards.outbound.direct')}
      />
    </Tabs>
  )
}

export default OutboundModeSwitcher
