import {
  ScenarioSessionSchema,
  type ScenarioSession,
} from '../domain/index.ts'

export const scenarioSessionKey = 'path-b:scenario-session'

function browserSessionStorage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function readScenarioSession(): ScenarioSession | null {
  const storage = browserSessionStorage()
  if (!storage) return null

  try {
    const value = storage.getItem(scenarioSessionKey)
    if (!value) return null

    const parsed = ScenarioSessionSchema.safeParse(JSON.parse(value))
    if (parsed.success) return parsed.data

    storage.removeItem(scenarioSessionKey)
  } catch {
    // Storage restrictions and malformed browser state both fail soft.
  }

  return null
}

export function writeScenarioSession(session: ScenarioSession) {
  const storage = browserSessionStorage()
  if (!storage) return

  try {
    storage.setItem(scenarioSessionKey, JSON.stringify(session))
  } catch {
    // The current in-memory session remains usable when persistence is blocked.
  }
}

export function clearScenarioSession() {
  try {
    browserSessionStorage()?.removeItem(scenarioSessionKey)
  } catch {
    // Clearing an unavailable storage area is already the desired outcome.
  }
}
