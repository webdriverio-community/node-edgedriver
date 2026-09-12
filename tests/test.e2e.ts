import waitPort from 'wait-port'
import { execSync } from 'node:child_process'
import { remote } from 'webdriverio'

import findEdgePath from '../dist/finder.js'
import { start, download } from '../dist/index.js'
import { beforeEach, describe, it } from 'node:test'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

describe('Edgedriver E2E Tests', () => {
    const port = 4444

    beforeEach(async () => {
        const tempDir = process.env.EDGEDRIVER_CACHE_DIR || os.tmpdir()
        const edgedriverCachePath = tempDir ? path.resolve(tempDir, 'msedgedriver') : ''
        if (edgedriverCachePath && await fs.lstat(edgedriverCachePath).catch(() => false)) {
            console.log(`Removing existing Edge binary at ${edgedriverCachePath}`)
            await fs.unlink(edgedriverCachePath)
        }

        const edgedriverPath = process.env.EDGE_BINARY_PATH ? path.resolve(process.env.EDGE_BINARY_PATH, 'msedgedriver') : ''
        if (edgedriverPath && await fs.lstat(edgedriverPath).catch(() => false)) {
            console.log(`Removing existing Edge binary at ${edgedriverPath}`)
            await fs.unlink(edgedriverPath)
        }

        try {
            // Kill pending processes
            execSync(`kill -9 $(lsof -t -i :${port})`)
            console.log(`Successfully killed process on port ${port}`)
        } catch  {
            console.log(`No process found running on port ${port}, or insufficient permissions.`)
        }
    })

    it('start edgedriver manually', async () => {
        const port = 4444
        const cp = await start({ port })

        try {
            await waitPort({ port: 4444 })
            const browser = await remote({
                port,
                capabilities: {
                    browserName: 'MicrosoftEdge',
                    'ms:edgeOptions': {
                        binary: findEdgePath(),
                        args: [
                            'no-sandbox',
                            'headless'
                        ]
                    }
                }
            })
            await browser.url('https://guinea-pig.webdriver.io/')
            await browser.deleteSession()
        } catch (err) {
            console.error(err)
            process.exit(1)
        } finally {
            cp.kill()
        }
    })

    it('start specific edgedriver', async () => {
        const binary = await download()

        try {
            const browser = await remote({
                automationProtocol: 'webdriver',
                capabilities: {
                    browserName: 'edge',
                    'ms:edgeOptions': {
                        args: ['no-sandbox', 'headless']
                    },
                    'wdio:edgedriverOptions': {
                        binary
                    }
                }
            })
            await browser.url('https://guinea-pig.webdriver.io/')
            await browser.deleteSession()
        } catch (err) {
            console.error(err)
            process.exit(1)
        }
    })
})
