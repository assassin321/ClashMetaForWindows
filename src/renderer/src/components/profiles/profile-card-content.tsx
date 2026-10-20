import { Button, CardBody, CardFooter, Chip, Progress } from '@heroui/react'
import { calcPercent, calcTraffic } from '@renderer/utils/calc'
import dayjs from '@renderer/utils/dayjs'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

/* eslint-disable react/prop-types */

interface Props {
  info: Pick<IProfileItem, 'name' | 'type' | 'updated' | 'extra'>
  isCurrent?: boolean
  actions: ReactNode
}

const ProfileCardContent: React.FC<Props> = (props) => {
  const { info, isCurrent = false, actions } = props
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()
  const { profileDisplayDate = 'expire' } = appConfig || {}
  const extra = info.extra
  const usage = (extra?.upload ?? 0) + (extra?.download ?? 0)
  const total = extra?.total ?? 0
  return (
    <>
      <CardBody className="pb-1">
        <div className="flex justify-between h-8">
          <h3
            title={info?.name}
            className={`text-ellipsis whitespace-nowrap overflow-hidden text-md font-bold leading-8 ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            {info?.name}
          </h3>
          {actions}
        </div>
        {info.type === 'remote' && extra && (
          <div
            className={`mt-2 flex justify-between ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            <small>{`${calcTraffic(usage)}/${calcTraffic(total)}`}</small>
            {profileDisplayDate === 'expire' ? (
              <Button
                size="sm"
                variant="light"
                className={`h-5 p-1 m-0 ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
                onPress={async () => {
                  await patchAppConfig({ profileDisplayDate: 'update' })
                }}
              >
                {extra.expire
                  ? dayjs.unix(extra.expire).format('YYYY-MM-DD')
                  : t('profiles.neverExpire')}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="light"
                className={`h-5 p-1 m-0 ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
                onPress={async () => {
                  await patchAppConfig({ profileDisplayDate: 'expire' })
                }}
              >
                {dayjs(info.updated).fromNow()}
              </Button>
            )}
          </div>
        )}
      </CardBody>
      <CardFooter className="pt-0">
        {info.type === 'remote' && !extra && (
          <div
            className={`w-full mt-2 flex justify-between ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            <Chip
              size="sm"
              variant="bordered"
              className={`${isCurrent ? 'text-primary-foreground border-primary-foreground' : 'border-primary text-primary'}`}
            >
              {t('profiles.remote')}
            </Chip>
            <small>{dayjs(info.updated).fromNow()}</small>
          </div>
        )}
        {info.type === 'local' && (
          <div
            className={`mt-2 flex justify-between ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
          >
            <Chip
              size="sm"
              variant="bordered"
              className={`${isCurrent ? 'text-primary-foreground border-primary-foreground' : 'border-primary text-primary'}`}
            >
              {t('profiles.local')}
            </Chip>
          </div>
        )}
        {extra && (
          <Progress
            className="w-full"
            aria-label={t('profiles.trafficUsage')}
            classNames={{
              indicator: isCurrent ? 'bg-primary-foreground' : 'bg-foreground'
            }}
            value={calcPercent(extra?.upload, extra?.download, extra?.total)}
          />
        )}
      </CardFooter>
    </>
  )
}
export default ProfileCardContent
