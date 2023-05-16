import url from 'node:url'
import path from 'node:path'
import cp from 'node:child_process'

import decamelize from 'decamelize'

import { download } from './install.js'
import { hasAccess } from './utils.js'
import { BINARY_FILE } from './constants.js'
import type { EdgedriverParameters } from 'types.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const EXCLUDED_PARAMS = ['version', 'help']

export async function start (params: EdgedriverParameters) {
  await download(params.edgeDriverVersion)
  const targetDir = path.resolve(__dirname, '..', '.bin')
  const binaryFilePath = path.resolve(targetDir, BINARY_FILE)

  if (!(await hasAccess(binaryFilePath))) {
    throw new Error('Failed to download Edgedriver')
  }

  const argv = Object.entries(params)
    .filter(([key,]) => !EXCLUDED_PARAMS.includes(key))
    .map(([key, val]) => {
      if (typeof val === 'boolean' && !val) {
        return ''
      }
      return `--${decamelize(key, { separator: '-' })}${typeof val === 'boolean' ? '' : `=${val}`}`
    })
    .filter(Boolean)
  return cp.spawn(binaryFilePath, argv)
}

export * from './types.js'
