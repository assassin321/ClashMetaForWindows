import { Cron } from 'croner'
import { addProfileItem, getCurrentProfileItem, getProfileConfig, getProfileItem } from '../config'
import { logger } from '../utils/logger'

const intervalPool: Record<string, Cron | NodeJS.Timeout> = {}
const delayedUpdatePool: Record<string, NodeJS.Timeout> = {}
const updatingProfileIds = new Set<string>()

// 定时触发的订阅刷新至少间隔1分钟
const MIN_INTERVAL_MS = 60 * 1000
const MAX_TIMER_DELAY_MS = 2_147_483_647

function safeIntervalMs(minutes: unknown): number {
  const requestedMs = Number(minutes) * 60 * 1000
  if (!Number.isFinite(requestedMs) || requestedMs <= 0) return MIN_INTERVAL_MS
  return Math.min(Math.max(requestedMs, MIN_INTERVAL_MS), MAX_TIMER_DELAY_MS)
}

function intervalDelayMs(interval: unknown): number | undefined {
  const minutes = Number(interval)
  if (!Number.isFinite(minutes) || minutes <= 0) return undefined
  return safeIntervalMs(minutes)
}

async function updateProfile(id: string): Promise<void> {
  if (updatingProfileIds.has(id)) return
  updatingProfileIds.add(id)
  try {
    const item = await getProfileItem(id)
    if (item && item.type === 'remote') {
      await addProfileItem(item)
    }
  } finally {
    updatingProfileIds.delete(id)
  }
}

function updateTask(itemId: string, logLabel: string): () => Promise<void> {
  return async () => {
    try {
      await updateProfile(itemId)
    } catch (e) {
      await logger.warn(`[ProfileUpdater] Failed to update ${logLabel}:`, e)
    }
  }
}

function scheduleProfileUpdate(item: IProfileItem): void {
  if (item.type !== 'remote' || !item.autoUpdate || !item.interval) return

  const itemId = item.id
  const logLabel = `profile ${itemId}`
  const delayMs = intervalDelayMs(item.interval)
  if (delayMs) {
    intervalPool[itemId] = setInterval(updateTask(itemId, logLabel), delayMs)
    return
  }

  if (typeof item.interval !== 'string') return

  const cronExpression = item.interval.trim()
  // 只接受 5 段 cron；6 段 cron 带秒，会绕过 UI 造成秒级刷新。
  if (cronExpression.split(/\s+/).length !== 5) return

  try {
    intervalPool[itemId] = new Cron(cronExpression, updateTask(itemId, logLabel))
  } catch {
    // ignore invalid cron
  }
}

function scheduleDelayedCurrentUpdate(item: IProfileItem): void {
  const delayMs = intervalDelayMs(item.interval)
  if (!delayMs) return

  const itemId = item.id
  delayedUpdatePool[itemId] = setTimeout(
    async () => {
      delete delayedUpdatePool[itemId]
      try {
        await updateProfile(itemId)
      } catch (e) {
        await logger.warn(`[ProfileUpdater] Failed to update current profile:`, e)
      }
    },
    Math.min(delayMs + 10000, MAX_TIMER_DELAY_MS)
  )
}

export async function initProfileUpdater(): Promise<void> {
  const { items = [], current } = await getProfileConfig()
  const currentItem = await getCurrentProfileItem()

  for (const item of items.filter((i) => i.id !== current)) {
    if (item.type === 'remote' && item.autoUpdate && item.interval) {
      await addProfileUpdater(item)

      try {
        await addProfileItem(item)
      } catch (e) {
        await logger.warn(`[ProfileUpdater] Failed to init profile ${item.name}:`, e)
      }
    }
  }

  if (currentItem?.type === 'remote' && currentItem.autoUpdate && currentItem.interval) {
    const currentId = currentItem.id
    await addProfileUpdater(currentItem)

    try {
      await addProfileItem(currentItem)
    } catch (e) {
      await logger.warn(`[ProfileUpdater] Failed to init current profile:`, e)
    }

    const latestCurrentItem = (await getProfileItem(currentId)) ?? currentItem
    scheduleDelayedCurrentUpdate(latestCurrentItem)
  }
}

export async function addProfileUpdater(item: IProfileItem): Promise<void> {
  await removeProfileUpdater(item.id)
  scheduleProfileUpdate(item)
}

export async function removeProfileUpdater(id: string): Promise<void> {
  if (intervalPool[id]) {
    if (intervalPool[id] instanceof Cron) {
      ;(intervalPool[id] as Cron).stop()
    } else {
      clearInterval(intervalPool[id] as NodeJS.Timeout)
    }
    delete intervalPool[id]
  }
  if (delayedUpdatePool[id]) {
    clearTimeout(delayedUpdatePool[id])
    delete delayedUpdatePool[id]
  }
}
