import os from 'node:os'
import fs from 'node:fs/promises'

export function skipDownload () {
  return (
    process.env.npm_config_edgedriver_skip_download ||
    process.env.EDGEDRIVER_SKIP_DOWNLOAD
  )
}

export async function hasAccess (filePath: string) {
  return fs.access(filePath).then(() => true, () => false)
}

export function findByArchitecture (name: string) {
  const arch = ['arm64', 'ppc64', 'x64', 's390x'].includes(os.arch())
    ? '64' + (os.platform() === 'darwin' ? '_m1' : '')
    : '32'
  const platformIdentifier = os.platform() === 'win32'
    ? 'win'
    : os.platform() === 'darwin'
      ? 'mac'
      : 'arm' // linux
  return name.split('.')[0].toLocaleLowerCase().endsWith(`_${platformIdentifier}${arch}`)
}
