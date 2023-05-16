import os from 'node:os'
import fs from 'node:fs/promises'

import which from 'which'
import decamelize from 'decamelize'

import type { EdgedriverParameters } from './types.js'

interface Priorities {
  regex: RegExp
  weight: number
}

export async function hasAccess(filePath: string) {
  return fs.access(filePath).then(() => true, () => false)
}

export function findByArchitecture(name: string) {
  const arch = ['arm64', 'ppc64', 'x64', 's390x'].includes(os.arch())
    ? '64' + (os.platform() === 'darwin' && os.arch() === 'arm64' ? '_m1' : '')
    : '32'
  const platformIdentifier = os.platform() === 'win32'
    ? 'win'
    : os.platform() === 'darwin'
      ? 'mac'
      : 'linux'
  return name.split('.')[0].toLocaleLowerCase().endsWith(`_${platformIdentifier}${arch}`)
}

const EXCLUDED_PARAMS = ['version', 'help']
export function parseParams (params: EdgedriverParameters) {
  return Object.entries(params)
    .filter(([key,]) => !EXCLUDED_PARAMS.includes(key))
    .map(([key, val]) => {
      if (typeof val === 'boolean' && !val) {
        return ''
      }
      const vals = Array.isArray(val) ? val : [val]
      return vals.map((v) => `--${decamelize(key, { separator: '-' })}${typeof v === 'boolean' ? '' : `=${v}`}`)
    })
    .flat()
    .filter(Boolean)
}

/**
 * helper utility to clone a list
 * @param  {Any[]} arr  list of things
 * @return {Any[]}      new list of same things
 */
export function uniq(arr: string[]) {
  return Array.from(new Set(arr))
}

export function sort(installations: string[], priorities: Priorities[]) {
  const defaultPriority = 10
  return installations
    // assign priorities
    .map((inst) => {
      for (const pair of priorities) {
        if (pair.regex.test(inst)) {
          return { path: inst, weight: pair.weight }
        }
      }

      return { path: inst, weight: defaultPriority }
    })
    // sort based on priorities
    .sort((a, b) => (b.weight - a.weight))
    // remove priority flag
    .map(pair => pair.path)
}

/**
 * Look for edge executables by using the which command
 */
export function findByWhich(executables: string[], priorities: Priorities[]) {
  const installations: string[] = []
  executables.forEach((executable) => {
    try {
      const browserPath = which.sync(executable)
      if (hasAccess(browserPath)) {
        installations.push(browserPath)
      }
    } catch (err: any) {
      // Not installed.
    }
  })

  return sort(uniq(installations.filter(Boolean)), priorities)
}
