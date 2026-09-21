import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOverrideConfig, updateOverrideConfig } from './override'
import {
  createProfile,
  getProfileConfig,
  getProfileItem,
  removeProfileItem,
  updateProfileConfig,
  updateProfileItem
} from './profile'
import { addProfileUpdater } from '../core/profileUpdater'

let testDir = ''

const mocks = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  checkProfileConfig: vi.fn(),
  // fires on every profile.yaml path resolution (i.e. at the start of each config read/write)
  onProfileConfigPath: vi.fn(),
  // awaited right after every fs/promises readFile completes (lets a test commit a write "during" a read)
  afterRead: vi.fn(),
  // awaited right before every atomicWriteFile (lets a test race something against a write in flight)
  beforeWrite: vi.fn(),
  generateProfile: vi.fn(),
  hotReload: vi.fn(),
  restartCore: vi.fn()
}))

vi.mock('electron', () => ({ app: { getVersion: () => '2.0.0' } }))
vi.mock('fs/promises', async (importOriginal) => {
  const orig = await importOriginal<typeof import('fs/promises')>()
  const readFile = orig.readFile as (p: string, o?: unknown) => Promise<unknown>
  return {
    ...orig,
    readFile: async (p: string, o?: unknown) => {
      const r = await readFile(p, o)
      await mocks.afterRead(p)
      return r
    }
  }
})
vi.mock('../utils/safeFile', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../utils/safeFile')>()
  return {
    ...orig,
    atomicWriteFile: async (...args: Parameters<typeof orig.atomicWriteFile>) => {
      await mocks.beforeWrite(String(args[0]))
      return orig.atomicWriteFile(...args)
    }
  }
})
// the real override module backs the global override set (override.yaml lives in the test dir)
vi.mock('../core/factory', async () => {
  const { getOverrideConfig } = await import('./override')
  return {
    generateProfile: mocks.generateProfile,
    globalOverrideIdsNow: async () =>
      (await getOverrideConfig()).items.filter((o) => o.global).map((o) => o.id)
  }
})
vi.mock('i18next', () => ({ default: { t: (key: string) => key } }))
vi.mock('axios', () => ({ default: { get: mocks.axiosGet } }))
vi.mock('../utils/age', () => ({
  decryptAgeContent: (content: string) => Promise.resolve(content)
}))
vi.mock('../utils/dirs', () => ({
  mihomoCorePath: () => join(testDir, 'mihomo'),
  mihomoProfileWorkDir: (id: string) => join(testDir, 'work', id),
  mihomoWorkDir: () => join(testDir, 'work'),
  profileConfigPath: () => {
    mocks.onProfileConfigPath()
    return join(testDir, 'profile.yaml')
  },
  profilePath: (id: string) => join(testDir, 'profiles', `${id}.yaml`),
  overrideConfigPath: () => join(testDir, 'override.yaml'),
  overridePath: (id: string, ext: string) => join(testDir, 'overrides', `${id}.${ext}`)
}))
vi.mock('../utils/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}))
vi.mock('../resolve/server', () => ({ subStorePort: 8299 }))
vi.mock('../core/mihomoApi', () => ({
  mihomoCloseAllConnections: vi.fn(),
  mihomoHotReloadConfig: mocks.hotReload
}))
vi.mock('../core/manager', () => ({
  checkProfileConfig: mocks.checkProfileConfig,
  restartCore: mocks.restartCore
}))
vi.mock('../core/profileUpdater', () => ({
  addProfileUpdater: vi.fn(),
  removeProfileUpdater: vi.fn()
}))
vi.mock('./app', () => ({
  getAppConfig: () =>
    Promise.resolve({
      core: 'mihomo',
      subscriptionTimeout: 30000,
      userAgent: 'mihomo.party/v2.0.0 (clash.meta)'
    })
}))
vi.mock('./controledMihomo', () => ({
  getControledMihomoConfig: () => Promise.resolve({ 'mixed-port': 7890 })
}))

const oldProfile = `proxies:
  - name: old
    type: http
    server: 127.0.0.1
    port: 8080
`

const newProfile = `proxies:
  - name: new
    type: http
    server: 127.0.0.1
    port: 8081
`

beforeEach(async () => {
  testDir = mkdtempSync(join(tmpdir(), 'mihomo-party-profile-test-'))
  mkdirSync(join(testDir, 'profiles'), { recursive: true })
  writeFileSync(
    join(testDir, 'profile.yaml'),
    'current: remote\nitems:\n  - id: remote\n    type: remote\n    name: Remote\n'
  )
  writeFileSync(join(testDir, 'profiles', 'remote.yaml'), oldProfile)
  writeFileSync(join(testDir, 'override.yaml'), 'items: []\n')

  vi.clearAllMocks()
  mocks.onProfileConfigPath.mockReset()
  mocks.afterRead.mockReset()
  mocks.beforeWrite.mockReset()
  mocks.axiosGet.mockResolvedValue({
    status: 200,
    data: newProfile,
    headers: { 'content-type': 'text/yaml' }
  })
  mocks.generateProfile.mockResolvedValue('remote')
  mocks.checkProfileConfig.mockResolvedValue(undefined)
  mocks.hotReload.mockResolvedValue(undefined)
  // the module caches must match the freshly written files (all real writes go through the queue and keep them in sync)
  await getProfileConfig(true)
  await getOverrideConfig(true)
})

const globalOverride = (id: string): IOverrideItem => ({
  id,
  type: 'local',
  ext: 'yaml',
  name: id,
  updated: 1,
  global: true
})

afterEach(() => {
  rmSync(testDir, { recursive: true, force: true })
})

describe('remote profile candidate validation', () => {
  it('keeps the last-known-good profile when semantic validation fails', async () => {
    mocks.checkProfileConfig.mockRejectedValueOnce(new Error("proxy 'missing-group' not found"))

    await expect(
      createProfile({ id: 'remote', type: 'remote', name: 'Remote', url: 'https://example.test' })
    ).rejects.toThrow("proxy 'missing-group' not found")

    expect(readFileSync(join(testDir, 'profiles', 'remote.yaml'), 'utf8')).toBe(oldProfile)
    expect(mocks.generateProfile).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ profileId: 'remote', updateRuntimeConfig: false })
    )
    expect(mocks.hotReload).not.toHaveBeenCalled()
  })

  it('replaces the profile only after semantic validation succeeds', async () => {
    await createProfile({
      id: 'remote',
      type: 'remote',
      name: 'Remote',
      url: 'https://example.test'
    })

    expect(mocks.checkProfileConfig).toHaveBeenCalledOnce()
    expect(readFileSync(join(testDir, 'profiles', 'remote.yaml'), 'utf8')).toBe(newProfile)
    expect(mocks.hotReload).toHaveBeenCalledOnce()
  })
})

describe('profile deletion (R2-ISS-034 / R2-ISS-067)', () => {
  it('a failed core restart deletes nothing: the record stays for a retry, and the retry completes the deletion', async () => {
    const workDir = join(testDir, 'work', 'remote')
    mkdirSync(workDir, { recursive: true })
    writeFileSync(join(workDir, 'config.yaml'), 'proxies: []\n')
    mocks.restartCore.mockRejectedValueOnce(new Error('restart failed'))

    await expect(removeProfileItem('remote')).rejects.toThrow('restart failed')
    expect(existsSync(workDir)).toBe(true)
    expect(existsSync(join(testDir, 'profiles', 'remote.yaml'))).toBe(true)
    expect(readFileSync(join(testDir, 'profile.yaml'), 'utf8')).toContain('id: remote')
    expect(vi.mocked(addProfileUpdater)).toHaveBeenCalledOnce() // timer re-armed

    await removeProfileItem('remote') // current already moved away → no restart needed
    expect(existsSync(workDir)).toBe(false)
    expect(existsSync(join(testDir, 'profiles', 'remote.yaml'))).toBe(false)
    expect(readFileSync(join(testDir, 'profile.yaml'), 'utf8')).not.toContain('id: remote')
  })

  it('R2-ISS-071: concurrent deletions never leave current pointing at a deleted profile', async () => {
    writeFileSync(
      join(testDir, 'profile.yaml'),
      'current: A\nitems:\n  - id: A\n    type: remote\n    name: A\n  - id: B\n    type: remote\n    name: B\n'
    )
    await getProfileConfig(true)
    const results = await Promise.allSettled([removeProfileItem('A'), removeProfileItem('B')])
    expect(results.map((r) => r.status)).toEqual(['fulfilled', 'fulfilled'])
    expect(await getProfileConfig()).toEqual({ current: undefined, items: [] })
  })

  it.each([1, 2])(
    'R2-ISS-072 (V2): a failed profile.yaml write (#%s) during deletion keeps the record and re-arms its updater',
    async (failing) => {
      let writes = 0
      mocks.beforeWrite.mockImplementation(async (p: string) => {
        if (!p.endsWith('profile.yaml')) return
        writes++
        if (writes === failing) throw new Error('disk full')
      })
      await expect(removeProfileItem('remote')).rejects.toThrow('disk full')
      expect(readFileSync(join(testDir, 'profile.yaml'), 'utf8')).toContain('id: remote')
      expect(vi.mocked(addProfileUpdater)).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'remote' })
      )
    }
  )

  it('R2-ISS-067: a failed subscription-file removal keeps the record (and the work dir) so the user can retry', async () => {
    const workDir = join(testDir, 'work', 'remote')
    mkdirSync(workDir, { recursive: true })
    writeFileSync(join(workDir, 'config.yaml'), 'proxies: []\n')
    // a directory where the file should be: rm() without recursive fails (EISDIR / EPERM-like)
    rmSync(join(testDir, 'profiles', 'remote.yaml'))
    mkdirSync(join(testDir, 'profiles', 'remote.yaml'))

    await expect(removeProfileItem('remote')).rejects.toThrow()
    expect(readFileSync(join(testDir, 'profile.yaml'), 'utf8')).toContain('id: remote')
    expect(existsSync(workDir)).toBe(true)
    // the record stays → its updater is re-armed (R2-ISS-072)
    expect(vi.mocked(addProfileUpdater)).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'remote' })
    )

    rmSync(join(testDir, 'profiles', 'remote.yaml'), { recursive: true })
    await removeProfileItem('remote')
    expect(existsSync(workDir)).toBe(false)
    expect(readFileSync(join(testDir, 'profile.yaml'), 'utf8')).not.toContain('id: remote')
  })
})
