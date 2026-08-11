import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearScenarioSession,
  readScenarioSession,
  scenarioSessionKey,
  writeScenarioSession,
} from './session.ts'

describe('scenario session storage', () => {
  beforeEach(() => window.sessionStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('round-trips only the versioned scenario intent', () => {
    writeScenarioSession({
      version: 1,
      scenarioId: 'maya-cs201-failure',
      priority: 'protect-work-schedule',
      selectedPathId: 'steadier-load',
    })

    expect(readScenarioSession()).toEqual({
      version: 1,
      scenarioId: 'maya-cs201-failure',
      priority: 'protect-work-schedule',
      selectedPathId: 'steadier-load',
    })
    expect(Object.keys(JSON.parse(window.sessionStorage.getItem(scenarioSessionKey)!))).toEqual([
      'version',
      'scenarioId',
      'priority',
      'selectedPathId',
    ])
  })

  it('discards malformed or stale state', () => {
    window.sessionStorage.setItem(
      scenarioSessionKey,
      JSON.stringify({
        version: 2,
        scenarioId: 'invented-scenario',
        priority: 'anything',
        selectedPathId: 'impossible',
      }),
    )

    expect(readScenarioSession()).toBeNull()
    expect(window.sessionStorage.getItem(scenarioSessionKey)).toBeNull()
  })

  it('clears the stored intent', () => {
    window.sessionStorage.setItem(scenarioSessionKey, '{}')
    clearScenarioSession()
    expect(window.sessionStorage.getItem(scenarioSessionKey)).toBeNull()
  })

  it('fails soft when individual storage methods are blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(readScenarioSession()).toBeNull()

    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(() =>
      writeScenarioSession({
        version: 1,
        scenarioId: 'maya-cs201-failure',
        priority: 'graduate-on-time',
        selectedPathId: 'faster-finish',
      }),
    ).not.toThrow()

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(() => clearScenarioSession()).not.toThrow()
  })
})
