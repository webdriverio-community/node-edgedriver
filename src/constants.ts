import os from 'node:os'

export const DOWNLOAD_DIRECTORY = 'https://msedgedriver.azureedge.net/'
export const XML_TEMPLATE = ['EnumerationResults/Blobs/Blob', {
  name: 'title-case(Name)',
  url: './Url',
  lastModified: '//Last-Modified'
}]

export const BINARY_FILE = 'msedgedriver' + (os.platform() === 'win32' ? '.exe' : '')
export const DEFAULT_ALLOWED_ORIGINS = ['*']
export const DEFAULT_ALLOWED_IPS = ['']
