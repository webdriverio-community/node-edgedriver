import waitPort from 'wait-port'
import { remote } from 'webdriverio'

import findEdgePath from '../dist/finder.js'
import { start } from '../dist/index.js'

const port = 4444
const cp = await start({ port })

try {
  await waitPort({ port: 4444 })
  const browser = await remote({
    port,
    capabilities: {
      browserName: 'MicrosoftEdge',
      'ms:edgeOptions': {
        binary: findEdgePath()
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
