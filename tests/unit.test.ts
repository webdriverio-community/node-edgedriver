import os from 'node:os'
import { vi, test, expect } from 'vitest'
import fetch from 'node-fetch'

import * as pkgExports from '../src/index.js'
import { fetchVersion } from '../src/install.js'
import { getNameByArchitecture, parseParams } from '../src/utils.js'
import { EDGE_PRODUCTS_API } from '../src/constants.js'

vi.mock('node:os', () => ({
    default: {
        arch: vi.fn(),
        platform: vi.fn()
    }
}))

vi.mock('node-fetch', async (orig) => {
    const origFetch: any = await orig()
    const apiResponse = await import('./__fixtures__/api.json', { assert: { type: 'json' } })
    return {
        default: vi.fn(async (url) => {
            if (url === EDGE_PRODUCTS_API) {
                return {
                    json: vi.fn().mockResolvedValue(apiResponse.default)
                }
            } else if (!url.includes('LATEST_RELEASE')) {
                return {
                    text: vi.fn().mockResolvedValue('��123.456.789.0')
                }
            }

            return origFetch.default(url)
        })
    }
})

test('fetchVersion', async () => {
    expect(await fetchVersion('123.456.789.0')).toBe('123.456.789.0')
    expect(await fetchVersion('beta')).toBe('122.0.2365.30')
    expect(await fetchVersion('some114version')).toBe('114.0.1823.82')
    await expect(fetchVersion('latest-win')).rejects.toThrow()
    vi.mocked(os.arch).mockReturnValue('arm')
    vi.mocked(os.platform).mockReturnValue('linux')
    expect(await fetchVersion('stable')).toBe('121.0.2277.113')
    vi.mocked(os.arch).mockReturnValue('arm64')
    vi.mocked(os.platform).mockReturnValue('linux')
    expect(await fetchVersion('stable')).toBe('121.0.2277.113')
    vi.mocked(os.arch).mockReturnValue('arm')
    vi.mocked(os.platform).mockReturnValue('win32')
    expect(await fetchVersion('stable')).toBe('123.456.789.0')
    vi.mocked(os.arch).mockReturnValue('arm64')
    vi.mocked(os.platform).mockReturnValue('win32')
    expect(await fetchVersion('stable')).toBe('121.0.2277.112')
    vi.mocked(os.arch).mockReturnValue('x64')
    vi.mocked(os.platform).mockReturnValue('darwin')
    expect(await fetchVersion('stable')).toBe('121.0.2277.112')
    vi.mocked(os.arch).mockReturnValue('arm64')
    vi.mocked(os.platform).mockReturnValue('darwin')
    expect(await fetchVersion('stable')).toBe('121.0.2277.112')
})

test('fetchVersion with proxy support', async () => {
    vi.resetModules()
    process.env.HTTPS_PROXY = 'https://proxy.com'
    const { fetchVersion } = await import('../src/install.js')
    expect(await fetchVersion('stable')).toBe('121.0.2277.112')
    expect(fetch).toBeCalledWith(
        expect.any(String),
        expect.objectContaining({
            agent: expect.any(Object)
        })
    )
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
