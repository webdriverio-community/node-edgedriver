import waitPort from 'wait-port'
import { remote } from 'webdriverio'

import findEdgePath from '../dist/finder.js'
import { start, download } from '../dist/index.js'

const port = 4444
const cp = await start({ port })

// start edgedriver manually
console.log('= start edgedriver manually')

try {
    await waitPort({ port: 4444 })
    const browser = await remote({
        port,
        capabilities: {
            browserName: 'MicrosoftEdge',
            'ms:edgeOptions': {
                binary: findEdgePath(),
                args: ['no-sandbox', 'headless']
            }
        }
    })
    await browser.url('https://webdriver.io')
    await browser.deleteSession()
} catch (err) {
    console.error(err)
    process.exit(1)
} finally {
    cp.kill()
}

// start specific edgedriver
console.log('= start specific edgedriver =')
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
    await browser.url('https://webdriver.io')
    await browser.deleteSession()
} catch (err) {
    console.error(err)
    process.exit(1)
}
