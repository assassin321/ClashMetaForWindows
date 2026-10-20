import { BrowserWindow } from 'electron'
import type { OperationMode } from '../../shared/simple-config'
import { getAppConfig, patchAppConfig } from '../config/app'
import { getProfileConfig, getProfileItem } from '../config/profile'
import { hasCoreProcess, restartCore } from '../core/manager'
import { mihomoHotReloadConfig, patchMihomoConfig } from '../core/mihomoApi'
import { getRuntimeConfig } from '../core/factory'
import { WriteQueue } from '../utils/safeFile'
import { createLogger } from '../utils/logger'
import { inheritStandardGeneralSettings, inheritStandardSubscriptions } from './service'
import { getSimpleState, saveSimpleState } from './store'

const queue = new WriteQueue()
const logger = createLogger('OperationMode')

export async function setOperationMode(mode: OperationMode): Promise<void> {
  if (!['standard', 'simple'].includes(mode)) throw new Error('未知配置模式')
  await queue.run(async () => {
    const started = performance.now()
    const previous = await getAppConfig()
    if (previous.operationMode === mode && previous.modeSelected) return
    const snapshot = mode === 'simple' ? await getSimpleState() : undefined
    // A process keeps its -d directory and decryption environment across hot reloads.
    let hotReload = hasCoreProcess() && !previous.diffWorkDir
    if (hotReload) {
      const { current } = await getProfileConfig()
      if ((await getProfileItem(current))?.ageSecretKey) hotReload = false
    }
    let modeChanged = false
    const apply = async (): Promise<void> => {
      if (hotReload) {
        await mihomoHotReloadConfig()
        const runtime = await getRuntimeConfig()
        await patchMihomoConfig({ 'log-level': runtime['log-level'] || 'info' })
      } else await restartCore()
    }
    try {
      if (mode === 'simple') {
        if (snapshot?.revision === 0) await inheritStandardGeneralSettings()
        await inheritStandardSubscriptions()
      }
      await patchAppConfig({ operationMode: mode, modeSelected: true })
      modeChanged = true
      await apply()
      for (const window of BrowserWindow.getAllWindows()) {
        for (const event of [
          'groupsUpdated',
          'rulesUpdated',
          'controledMihomoConfigUpdated',
          'simpleConfigUpdated'
        ])
          window.webContents.send(event)
      }
      logger.info(
        `Switched to ${mode} via ${hotReload ? 'hot reload' : 'restart'} in ${Math.round(performance.now() - started)}ms`
      )
    } catch (error) {
      try {
        if (snapshot) await saveSimpleState(snapshot)
        if (modeChanged) {
          await patchAppConfig({
            operationMode: previous.operationMode || 'standard',
            modeSelected: previous.modeSelected ?? true
          })
          if (previous.modeSelected) {
            try {
              await apply()
            } catch {
              await restartCore()
            }
          }
        }
      } catch (rollbackError) {
        logger.error('Failed to roll back operation mode switch', rollbackError)
      }
      throw error
    } finally {
      // Publish the settled mode, including rollback, to every renderer.
      for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('appConfigUpdated')
      }
    }
  })
}
