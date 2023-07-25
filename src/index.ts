import cp from 'node:child_process'

import { download as downloadDriver } from './install.js'
import { hasAccess, parseParams } from './utils.js'
import { DEFAULT_ALLOWED_ORIGINS, DEFAULT_ALLOWED_IPS } from './constants.js'
import type { EdgedriverParameters } from './types.js'

export async function start (params: EdgedriverParameters) {
  let binaryFilePath = params.customEdgeDriverPath
  if (!binaryFilePath) {
    binaryFilePath = await downloadDriver(params.edgeDriverVersion)
  }

  if (!(await hasAccess(binaryFilePath))) {
    throw new Error('Failed to access EdgeDriver, was it installed successfully?')
  }

  params.allowedOrigins = params.allowedOrigins || DEFAULT_ALLOWED_ORIGINS
  params.allowedIps = params.allowedIps || DEFAULT_ALLOWED_IPS

  const args = parseParams(params)
  console.log(`Starting EdgeDriver with params: ${args.join(' ')}`)
  return cp.spawn(binaryFilePath, args)
}

export const download = downloadDriver
export * from './types.js'
