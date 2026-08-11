import { useEffect, useMemo, useState } from 'react'

import {
  ExplanationApiResponseSchema,
  ExplanationContentSchema,
  type ExplanationApiResponse,
  type ExplanationContent,
} from './contracts'
import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../domain'
import { buildDeterministicExplanation } from '../presentation/scenario'

export type ExplanationViewState = {
  status: 'loading' | 'claude' | 'deterministic' | 'unavailable'
  reason: ExplanationApiResponse['reason'] | 'request-failed'
  explanation: ExplanationContent
}

type UseExplanationInput = {
  dataset: PathBDataset
  scenario: ScenarioResult
  priority: Priority
  selectedPath: AlternativePath
}

export function useExplanation({
  dataset,
  scenario,
  priority,
  selectedPath,
}: UseExplanationInput): ExplanationViewState {
  const requestKey = `${priority}:${selectedPath.id}`
  const fallback = useMemo(
    () =>
      ExplanationContentSchema.parse(
        buildDeterministicExplanation(dataset, scenario, selectedPath),
      ),
    [dataset, scenario, selectedPath],
  )
  const [state, setState] = useState<
    ExplanationViewState & { requestKey: string }
  >({
    requestKey,
    status: 'loading',
    reason: 'request-failed',
    explanation: fallback,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timeoutId = window.setTimeout(() => controller.abort(), 6_000)

    void (async () => {
      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version: 1,
            scenarioId: 'maya-cs201-failure',
            priority,
            selectedPathId: selectedPath.id,
          }),
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Explanation request failed.')

        const parsed = ExplanationApiResponseSchema.safeParse(
          await response.json(),
        )
        if (!parsed.success) throw new Error('Explanation response was invalid.')
        if (!active) return

        setState({
          requestKey,
          status: parsed.data.mode,
          reason: parsed.data.reason,
          explanation: parsed.data.explanation,
        })
      } catch {
        if (!active) return
        setState({
          requestKey,
          status: 'unavailable',
          reason: 'request-failed',
          explanation: fallback,
        })
      } finally {
        window.clearTimeout(timeoutId)
      }
    })()

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [fallback, priority, requestKey, selectedPath.id])

  if (state.requestKey !== requestKey) {
    return {
      status: 'loading',
      reason: 'request-failed',
      explanation: fallback,
    }
  }

  return state
}
