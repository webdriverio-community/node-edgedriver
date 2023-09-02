import os from 'node:os'
import { vi, test, expect } from 'vitest'

import * as pkgExports from '../src/index.js'
import { fetchVersion } from '../src/install.js'
import { getNameByArchitecture, parseParams } from '../src/utils.js'

vi.mock('node:os', () => ({
  default: {
    arch: vi.fn(),
    platform: vi.fn()
  }
}))

test('fetchVersion', async () => {
  expect(await fetchVersion('123.456.789.0')).toBe('123.456.789.0')
  expect(await fetchVersion('beta')).toEqual(expect.any(String))
  expect(await fetchVersion('some114version')).toBe('114.0.1823.82')
  await expect(fetchVersion('latest-win')).rejects.toThrow()
})

test('getNameByArchitecture', () => {
  vi.mocked(os.arch).mockReturnValue('arm')
  vi.mocked(os.platform).mockReturnValue('linux')
  expect(getNameByArchitecture()).toBe('edgedriver_linux32')
  vi.mocked(os.arch).mockReturnValue('arm64')
  vi.mocked(os.platform).mockReturnValue('linux')
  expect(getNameByArchitecture()).toBe('edgedriver_linux64')
  vi.mocked(os.arch).mockReturnValue('arm')
  vi.mocked(os.platform).mockReturnValue('win32')
  expect(getNameByArchitecture()).toBe('edgedriver_win32')
  vi.mocked(os.arch).mockReturnValue('arm64')
  vi.mocked(os.platform).mockReturnValue('win32')
  expect(getNameByArchitecture()).toBe('edgedriver_win64')
  vi.mocked(os.arch).mockReturnValue('x64')
  vi.mocked(os.platform).mockReturnValue('darwin')
  expect(getNameByArchitecture()).toBe('edgedriver_mac64')
  vi.mocked(os.arch).mockReturnValue('arm64')
  vi.mocked(os.platform).mockReturnValue('darwin')
  expect(getNameByArchitecture()).toBe('edgedriver_mac64_m1')
})

test('parseParams', () => {
  expect(parseParams({ baseUrl: 'foobar', silent: true, verbose: false, allowedIps: ['123', '321'] }))
    .toMatchSnapshot()
})

test('exports', () => {
  expect(typeof pkgExports.download).toBe('function')
  expect(typeof pkgExports.findEdgePath).toBe('function')
  expect(typeof pkgExports.start).toBe('function')
})
