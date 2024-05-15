import path from 'node:path'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import cp from 'node:child_process'
import { format } from 'node:util'
import { Readable } from 'node:stream'

import fetch from 'node-fetch'
import unzipper, { type Entry } from 'unzipper'

import findEdgePath from './finder.js'
import { TAGGED_VERSIONS, EDGE_PRODUCTS_API, TAGGED_VERSION_URL, LATEST_RELEASE_URL, DOWNLOAD_URL, BINARY_FILE, log } from './constants.js'
import { hasAccess, getNameByArchitecture, sleep } from './utils.js'

interface ProductAPIResponse {
  Product: string
  Releases: {
    Platform: string
    Architecture: string
    ProductVersion: string
  }[]
}

export async function download (
  edgeVersion: string = process.env.EDGEDRIVER_VERSION,
  cacheDir: string = process.env.EDGEDRIVER_CACHE_DIR || os.tmpdir()
) {
  const binaryFilePath = path.resolve(cacheDir, BINARY_FILE)
  if (await hasAccess(binaryFilePath)) {
    return binaryFilePath
  }

  if (!edgeVersion) {
    const edgePath = findEdgePath()
    if (!edgePath) {
      throw new Error('Could not find Microsoft Edge binary, please make sure the browser is installed on your system.')
    }

    log.info(`Trying to detect Microsoft Edge version from binary found at ${edgePath}`)
    edgeVersion = os.platform() === 'win32' ? await getEdgeVersionWin(edgePath) : await getEdgeVersionUnix(edgePath)
    log.info(`Detected Microsoft Edge v${edgeVersion}`)
  }

  const version = await fetchVersion(edgeVersion)
  const downloadUrl = format(DOWNLOAD_URL, version, getNameByArchitecture())
  log.info(`Downloading Edgedriver from ${downloadUrl}`)
  const res = await fetch(downloadUrl)

  if (!res.body) {
    throw new Error(`Failed to download binary (statusCode ${res.status})`)
  }

  await fsp.mkdir(cacheDir, { recursive: true })
  await downloadZip(res.body, cacheDir)
  await fsp.chmod(binaryFilePath, '755')
  log.info('Finished downloading Edgedriver')
  await sleep() // wait for file to be accessible, avoid ETXTBSY errors
  return binaryFilePath
}

async function getEdgeVersionWin (edgePath: string) {
  const versionPath = path.dirname(edgePath)
  const contents = await fsp.readdir(versionPath)
  const versions = contents.filter((p) => /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/g.test(p))

  // returning oldest in case there is an updated version and Edge still hasn't relaunched
  const oldest = versions.sort((a, b) => a > b ? 1 : -1)[0]
  return oldest
}

async function getEdgeVersionUnix (edgePath: string) {
  log.info(`Trying to detect Microsoft Edge version from binary found at ${edgePath}`)
  const versionOutput = await new Promise<string>((resolve, reject) => cp.exec(`"${edgePath}" --version`, (err, stdout, stderr) => {
    console.log(111, err, stdout, stderr)

    if (err) {
      return reject(err)
    }
    if (stderr) {
      return reject(new Error(stderr))
    }
    console.log('RESOVE', stdout)
    return resolve(stdout)
  }))
  console.log('RETURN', versionOutput.trim().split(' ').pop())
  return versionOutput.trim().split(' ').pop()
}

export async function fetchVersion (edgeVersion: string) {
  const p = os.platform()
  const platform = p === 'win32' ? 'win' : p === 'darwin' ? 'mac' : 'linux'

  /**
   * if version has 4 digits it is a valid version, e.g. 109.0.1467.0
   */
  if (edgeVersion.split('.').length === 4) {
    return edgeVersion
  }

  /**
   * if browser version is a tagged version, e.g. stable, beta, dev, canary
   */
  if (TAGGED_VERSIONS.includes(edgeVersion.toLowerCase())) {
    const apiResponse = await fetch(EDGE_PRODUCTS_API).catch((err) => {
      log.error(`Couldn't fetch version from ${EDGE_PRODUCTS_API}: ${err.stack}`)
      return { json: async () => [] as ProductAPIResponse[] }
    })
    const products = await apiResponse.json() as ProductAPIResponse[]
    const product = products.find((p) => p.Product.toLowerCase() === edgeVersion.toLowerCase())
    const productVersion = product?.Releases.find((r) => (
      /**
       * On Mac we all product versions are universal to its architecture
       */
      (platform === 'mac' && r.Platform === 'MacOS') ||
      /**
       * On Windows we need to check for the architecture
       */
      (platform === 'win' && r.Platform === 'Windows' && os.arch() === r.Architecture) ||
      /**
       * On Linux we only have one architecture
       */
      (platform === 'linux' && r.Platform === 'Linux')
    ))?.ProductVersion

    if (productVersion) {
      return productVersion
    }

    const res = await fetch(format(TAGGED_VERSION_URL, edgeVersion.toUpperCase()))
    return (await res.text()).replace(/\0/g, '').slice(2).trim()
  }

  /**
   * check for a number in the version and check for that
   */
  const MATCH_VERSION = /\d+/g
  if (edgeVersion.match(MATCH_VERSION)) {
    const [major] = edgeVersion.match(MATCH_VERSION)
    const url = format(LATEST_RELEASE_URL, major.toString().toUpperCase(), platform.toUpperCase())
    const res = await fetch(url)
    return (await res.text()).replace(/\0/g, '').slice(2).trim()
  }

  throw new Error(`Couldn't detect version for ${edgeVersion}`)
}

function downloadZip(body: NodeJS.ReadableStream, cacheDir: string) {
  const stream = Readable.from(body).pipe(unzipper.Parse())
  const promiseChain: Promise<string | void>[] = [
    new Promise((resolve, reject) => {
      stream.on('close', () => resolve())
      stream.on('error', () => reject())
    })
  ]

  stream.on('entry', async (entry: Entry) => {
    const unzippedFilePath = path.join(cacheDir, entry.path)
    if (entry.type === 'Directory') {
      return
    }

    if (!await hasAccess(path.dirname(unzippedFilePath))) {
      await fsp.mkdir(path.dirname(unzippedFilePath), { recursive: true })
    }

    const execStream = entry.pipe(fs.createWriteStream(unzippedFilePath))
    promiseChain.push(new Promise((resolve, reject) => {
      execStream.on('close', () => resolve(unzippedFilePath))
      execStream.on('error', reject)
    }))
  })

  return Promise.all(promiseChain)
}

/**
 * download on install
 */
if (process.argv[1] && process.argv[1].endsWith('/dist/install.js') && Boolean(process.env.EDGEDRIVER_AUTO_INSTALL)) {
  await download().then(
    () => log.info('Success!'),
    (err) => log.error(`Failed to install Edgedriver: ${err.stack}`)
  )
}
