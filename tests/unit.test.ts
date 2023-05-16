import os from 'node:os'
import { vi, test, expect } from 'vitest'

import { findByArchitecture, parseParams } from '../src/utils.js'

vi.mock('node:os', () => ({
  default: {
    arch: vi.fn(),
    platform: vi.fn()
  }
}))

test('findByArchitecture', () => {
  vi.mocked(os.arch).mockReturnValue('arm')
  vi.mocked(os.platform).mockReturnValue('linux')
  expect(findByArchitecture('edgedriver_linux32.zip')).toBe(true)
  vi.mocked(os.arch).mockReturnValue('arm64')
  vi.mocked(os.platform).mockReturnValue('linux')
  expect(findByArchitecture('edgedriver_linux64.zip')).toBe(true)
  vi.mocked(os.arch).mockReturnValue('arm')
  vi.mocked(os.platform).mockReturnValue('win32')
  expect(findByArchitecture('edgedriver_win32.zip')).toBe(true)
  vi.mocked(os.arch).mockReturnValue('arm64')
  vi.mocked(os.platform).mockReturnValue('win32')
  expect(findByArchitecture('edgedriver_win64.zip')).toBe(true)
  vi.mocked(os.arch).mockReturnValue('x64')
  vi.mocked(os.platform).mockReturnValue('darwin')
  expect(findByArchitecture('edgedriver_mac64.zip')).toBe(true)
  vi.mocked(os.arch).mockReturnValue('arm64')
  vi.mocked(os.platform).mockReturnValue('darwin')
  expect(findByArchitecture('edgedriver_mac64_m1.zip')).toBe(true)
})

test('parseParams', () => {
  expect(parseParams({ baseUrl: 'foobar', silent: true, verbose: false, allowedIps: ['123', '321'] }))
    .toMatchSnapshot()
})
