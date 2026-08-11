import { useEffect, useRef, useState } from 'react'

import {
  analyzeCourseFailure,
  mayaCourseFailure,
  mayaDataset,
  type AlternativePath,
  type Priority,
  type ScenarioResult,
} from '../domain'
import { AppHeader } from './components/AppHeader'
import { CrashTestSetup } from './components/CrashTestSetup'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { ResultsView } from './components/ResultsView'

type AppPhase = 'setup' | 'loading' | 'results' | 'error'

const initialPriority: Priority = 'graduate-on-time'

export function App() {
  const [phase, setPhase] = useState<AppPhase>('setup')
  const [priority, setPriority] = useState<Priority>(initialPriority)
  const [scenario, setScenario] = useState<ScenarioResult | null>(null)
  const [selectedPathId, setSelectedPathId] = useState<
    AlternativePath['id']
  >('faster-finish')
  const timerRef = useRef<number | undefined>(undefined)
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    },
    [],
  )

  useEffect(() => {
    if (phase === 'results') resultsHeadingRef.current?.focus()
  }, [phase])

  function calculateScenario(nextPriority: Priority) {
    const nextScenario = analyzeCourseFailure(
      mayaDataset,
      mayaCourseFailure,
      nextPriority,
    )
    setScenario(nextScenario)
    setSelectedPathId(nextScenario.recommendedPathId)
    setPhase('results')
  }

  function runCrashTest() {
    setPhase('loading')
    timerRef.current = window.setTimeout(() => {
      try {
        calculateScenario(priority)
      } catch {
        setPhase('error')
      }
    }, 550)
  }

  function changePriority(nextPriority: Priority) {
    setPriority(nextPriority)
    try {
      calculateScenario(nextPriority)
    } catch {
      setPhase('error')
    }
  }

  function reset() {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current)
    timerRef.current = undefined
    setPriority(initialPriority)
    setScenario(null)
    setSelectedPathId('faster-finish')
    setPhase('setup')
  }

  return (
    <div className="app-shell">
      <AppHeader canReset={phase !== 'setup'} onReset={reset} />
      {phase === 'setup' ? (
        <CrashTestSetup dataset={mayaDataset} onRun={runCrashTest} />
      ) : null}
      {phase === 'loading' ? <LoadingState /> : null}
      {phase === 'results' && scenario ? (
        <ResultsView
          dataset={mayaDataset}
          onPathSelect={setSelectedPathId}
          onPriorityChange={changePriority}
          priority={priority}
          ref={resultsHeadingRef}
          scenario={scenario}
          selectedPathId={selectedPathId}
        />
      ) : null}
      {phase === 'error' ? <ErrorState onRetry={runCrashTest} /> : null}
    </div>
  )
}
