import os from 'node:os'
import logger, { type Logger } from '@wdio/logger'

export const TAGGED_VERSIONS = ['stable', 'beta', 'dev', 'canary']
export const BASE_CDN_URL = (
  process.env.EDGEDRIVER_CDNURL ||
  process.env.npm_config_edgedriver_cdnurl ||
  'https://msedgedriver.azureedge.net'
)
export const DOWNLOAD_URL = `${BASE_CDN_URL}/%s/%s.zip`
export const TAGGED_VERSION_URL = `${BASE_CDN_URL}/LATEST_%s`
export const LATEST_RELEASE_URL = `${BASE_CDN_URL}/LATEST_RELEASE_%s_%s`
export const BINARY_FILE = 'msedgedriver' + (os.platform() === 'win32' ? '.exe' : '')
export const DEFAULT_ALLOWED_ORIGINS = ['*']
export const DEFAULT_ALLOWED_IPS = ['']
export const log: Logger = logger('edgedriver')
