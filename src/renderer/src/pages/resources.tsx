import BasePage from '@renderer/components/base/base-page'
import GeoData from '@renderer/components/resources/geo-data'
import RuleProvider from '@renderer/components/resources/rule-provider'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import EditModeMenu from '@renderer/components/simple/edit-mode-menu'
import MihomoIcon from '../components/base/mihomo-icon'

const Resources: React.FC = () => {
  const { t } = useTranslation()
  const { appConfig } = useAppConfig()
  const { core = 'mihomo' } = appConfig || {}
  const simple = appConfig?.operationMode === 'simple'
  const [editing, setEditing] = useState(false)
  useEffect(() => {
    if (!simple) setEditing(false)
  }, [simple])

  return (
    <BasePage
      title={t('sider.cards.resources')}
      header={simple ? <EditModeMenu enabled={editing} onChange={setEditing} /> : undefined}
    >
      <div className="flex justify-center items-center py-3">
      <MihomoIcon className="h-10 w-10 mr-2" />
      <h3 className="text-2xl font-bold">Clash Meta For Windows</h3>
      </div>
      <GeoData />
      <RuleProvider editing={simple && editing} />
    </BasePage>
  )
}

export default Resources
