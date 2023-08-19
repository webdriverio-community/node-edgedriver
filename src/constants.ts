import os from 'node:os'
import logger from '@wdio/logger'

export const TAGGED_VERSIONS = ['stable', 'beta', 'dev', 'canary']
export const DOWNLOAD_URL = 'https://msedgewebdriverstorage.blob.core.windows.net/edgewebdriver/%s/%s.zip'
export const TAGGED_VERSION_URL = 'https://msedgedriver.azureedge.net/LATEST_%s'
export const LATEST_RELEASE_URL = 'https://msedgedriver.azureedge.net/LATEST_RELEASE_%s_%s'
export const BINARY_FILE = 'msedgedriver' + (os.platform() === 'win32' ? '.exe' : '')
export const DEFAULT_ALLOWED_ORIGINS = ['*']
export const DEFAULT_ALLOWED_IPS = ['']
export const log = logger('edgedriver')
