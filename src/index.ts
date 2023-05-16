import url from 'node:url'
import path from 'node:path'
import cp from 'node:child_process'

import { download } from './install.js'
import { hasAccess, parseParams } from './utils.js'
import { BINARY_FILE } from './constants.js'
import type { EdgedriverParameters } from 'types.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export async function start (params: EdgedriverParameters) {
  await download(params.edgeDriverVersion)
  const targetDir = path.resolve(__dirname, '..', '.bin')
  const binaryFilePath = path.resolve(targetDir, BINARY_FILE)

  if (!(await hasAccess(binaryFilePath))) {
    throw new Error('Failed to download Edgedriver')
  }

  return cp.spawn(binaryFilePath, parseParams(params))
}

export * from './types.js'
