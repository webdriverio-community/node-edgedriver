import { test, expect } from 'vitest'

// eslint-disable-next-line import/extensions
const { start } = require('../..')

test('should work in CJS context', () => {
  expect(typeof start).toBe('function')
})
