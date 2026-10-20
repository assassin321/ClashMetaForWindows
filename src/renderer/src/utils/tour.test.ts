import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInstance } from 'i18next'
import type { Config } from 'driver.js'
import enUS from '../locales/en-US.json'
import zhCN from '../locales/zh-CN.json'

const mocks = vi.hoisted(() => ({
  driver: vi.fn(),
  setConfig: vi.fn(),
  isActive: vi.fn(),
  getActiveIndex: vi.fn(),
  drive: vi.fn()
}))

vi.mock('driver.js', () => ({ driver: mocks.driver }))

describe('tour language synchronization', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.resetAllMocks()
    mocks.driver.mockReturnValue({
      setConfig: mocks.setConfig,
      isActive: mocks.isActive,
      getActiveIndex: mocks.getActiveIndex,
      drive: mocks.drive
    })
  })

  it.each([false, true])('updates translated text with an active tour: %s', async (active) => {
    const { createTourDriver, getDriver } = await import('./tour')
    const i18n = createInstance()
    await i18n.init({
      lng: 'en-US',
      resources: {
        'en-US': { translation: enUS },
        'zh-CN': { translation: zhCN }
      }
    })
    const navigate = vi.fn()
    createTourDriver(i18n.t, navigate)
    const initialDriver = getDriver()
    const initialConfig = mocks.driver.mock.calls[0][0] as Config
    expect(initialConfig.steps?.[0].popover?.title).toBe(enUS['guide.welcome.title'])

    mocks.isActive.mockReturnValue(active)
    mocks.getActiveIndex.mockReturnValue(3)
    await i18n.changeLanguage('zh-CN')
    createTourDriver(i18n.t, navigate)

    expect(mocks.driver).toHaveBeenCalledOnce()
    expect(getDriver()).toBe(initialDriver)
    const updatedConfig = mocks.setConfig.mock.calls[0][0] as Config
    expect(updatedConfig.steps?.[0].popover?.title).toBe(zhCN['guide.welcome.title'])
    expect(updatedConfig.steps?.[0].popover?.description).toBe(zhCN['guide.welcome.description'])
    expect(updatedConfig.nextBtnText).toBe(zhCN['common.next'])
    expect(updatedConfig.prevBtnText).toBe(zhCN['common.prev'])
    expect(updatedConfig.doneBtnText).toBe(zhCN['common.done'])
    if (active) expect(mocks.drive).toHaveBeenCalledWith(3)
    else expect(mocks.drive).not.toHaveBeenCalled()
  })
})
