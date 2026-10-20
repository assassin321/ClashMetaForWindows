import { Navigate } from 'react-router-dom'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { getSiderCardRoute } from '@renderer/utils/sider'
import {
  Connections,
  DNS,
  Logs,
  Mihomo,
  NetworkPageComponent,
  Override,
  Profiles,
  Proxies,
  Resources,
  Rules,
  Settings,
  Sniffer,
  SubStore,
  Sysproxy,
  Simple,
  SimpleModule,
  Traffic,
  Tun
} from './route-pages'

export { useDeferredRoutePreload } from './route-pages'

const HomeRedirect: React.FC = () => {
  const { appConfig } = useAppConfig()

  if (!appConfig) return null
  const dest =
    appConfig.operationMode === 'simple'
      ? 'simple'
      : appConfig.rememberSelectedSiderCard
        ? appConfig.lastSelectedSiderCard
        : 'proxy'
  if (dest === 'simple') return <Navigate to="/simple" replace />
  return <Navigate to={getSiderCardRoute(dest)} replace />
}

const ProfilesRoute: React.FC = () => {
  const { appConfig } = useAppConfig()
  if (!appConfig) return null
  return appConfig.operationMode === 'simple' ? <Navigate to="/simple" replace /> : <Profiles />
}

const routes = [
  {
    path: '/network',
    element: <NetworkPageComponent />
  },
  {
    path: '/mihomo',
    element: <Mihomo />
  },
  {
    path: '/sysproxy',
    element: <Sysproxy />
  },
  {
    path: '/tun',
    element: <Tun />
  },
  {
    path: '/proxies',
    element: <Proxies />
  },
  {
    path: '/rules',
    element: <Rules />
  },
  {
    path: '/resources',
    element: <Resources />
  },
  {
    path: '/dns',
    element: <DNS />
  },
  {
    path: '/sniffer',
    element: <Sniffer />
  },
  {
    path: '/logs',
    element: <Logs />
  },
  {
    path: '/connections',
    element: <Connections />
  },
  {
    path: '/override',
    element: <Override />
  },
  {
    path: '/profiles',
    element: <ProfilesRoute />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/substore',
    element: <SubStore />
  },
  {
    path: '/traffic',
    element: <Traffic />
  },
  {
    path: '/simple',
    element: <Simple />
  },
  {
    path: '/simple/:module',
    element: <SimpleModule />
  },
  {
    path: '/',
    element: <HomeRedirect />
  }
]

export default routes
