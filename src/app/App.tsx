import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  analyzeCourseFailure,
  resolveScenario,
  type AlternativePath,
  type Priority,
  type ScenarioSession,
} from '../domain/index.ts'
import { AppShell } from './components/AppShell.tsx'
import { AdvisorPage } from './pages/AdvisorPage.tsx'
import { ImpactPage } from './pages/ImpactPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { OverviewPage } from './pages/OverviewPage.tsx'
import { PathsPage } from './pages/PathsPage.tsx'
import { PlanPage } from './pages/PlanPage.tsx'
import { ScenarioRequiredPage } from './pages/ScenarioRequiredPage.tsx'
import { StressTestPage } from './pages/StressTestPage.tsx'
import { useAppRouter, type RoutePath } from './routing.ts'
import {
  clearScenarioSession,
  readScenarioSession,
  writeScenarioSession,
} from './session.ts'

const defaultPriority: Priority = 'graduate-on-time'
const defaultScenarioId = 'maya-cs201-failure' as const

const routeTitles: Record<RoutePath, string> = {
  '/': 'Overview',
  '/plan': 'My Plan',
  '/stress-test': 'Stress Test',
  '/impact': 'Impact',
  '/paths': 'Recovery Paths',
  '/advisor': 'Advisor Brief',
}

export function App() {
  const { navigate, route } = useAppRouter()
  const [session, setSession] = useState<ScenarioSession | null>(() =>
    readScenarioSession(),
  )
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const defaultScenario = resolveScenario(defaultScenarioId)
  const previewScenario = useMemo(
    () =>
      analyzeCourseFailure(
        defaultScenario.dataset,
        defaultScenario.disruption,
        defaultPriority,
      ),
    [defaultScenario.dataset, defaultScenario.disruption],
  )
  const active = useMemo(() => {
    if (!session) return { error: null, resolved: null, scenario: null }

    try {
      const resolved = resolveScenario(session.scenarioId)
      const scenario = analyzeCourseFailure(
        resolved.dataset,
        resolved.disruption,
        session.priority,
      )
      const selectedPath = scenario.alternatives.find(
        (path) => path.id === session.selectedPathId,
      )

      if (!selectedPath) {
        throw new Error('The saved recovery path is not available for this scenario.')
      }

      return { error: null, resolved, scenario }
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'The saved scenario could not be recalculated.',
        resolved: null,
        scenario: null,
      }
    }
  }, [session])

  useEffect(() => {
    document.title =
      route === 'not-found'
        ? 'Page not found — Path B'
        : `${routeTitles[route]} — Path B`
    window.scrollTo(0, 0)

    const focusHandle = window.setTimeout(() => {
      const heading = document.querySelector<HTMLElement>('[data-route-heading]')
      heading?.focus()
    }, 0)

    return () => window.clearTimeout(focusHandle)
  }, [route])

  function commitSession(nextSession: ScenarioSession) {
    writeScenarioSession(nextSession)
    setSession(nextSession)
  }

  function runScenario() {
    try {
      const scenario = analyzeCourseFailure(
        defaultScenario.dataset,
        defaultScenario.disruption,
        defaultPriority,
      )
      const nextSession: ScenarioSession = {
        version: 1,
        scenarioId: defaultScenarioId,
        priority: defaultPriority,
        selectedPathId: scenario.recommendedPathId,
      }
      commitSession(nextSession)
      setCalculationError(null)
      navigate('/impact')
    } catch (error) {
      setCalculationError(
        error instanceof Error
          ? error.message
          : 'The deterministic plan calculation failed.',
      )
    }
  }

  function changePriority(priority: Priority) {
    if (!session) return

    try {
      const resolved = resolveScenario(session.scenarioId)
      const scenario = analyzeCourseFailure(
        resolved.dataset,
        resolved.disruption,
        priority,
      )
      commitSession({
        ...session,
        priority,
        selectedPathId: scenario.recommendedPathId,
      })
      setCalculationError(null)
    } catch (error) {
      setCalculationError(
        error instanceof Error ? error.message : 'The priority could not be applied.',
      )
    }
  }

  function changePath(selectedPathId: AlternativePath['id']) {
    if (!session || !active.scenario) return
    if (!active.scenario.alternatives.some((path) => path.id === selectedPathId)) {
      setCalculationError('That recovery path is not available for this scenario.')
      return
    }

    commitSession({ ...session, selectedPathId })
    setCalculationError(null)
  }

  function resetScenario() {
    clearScenarioSession()
    setSession(null)
    setCalculationError(null)
    navigate('/stress-test')
  }

  const protectedRoute =
    route === '/impact' || route === '/paths' || route === '/advisor'

  let page

  if (route === 'not-found') {
    page = <NotFoundPage navigate={navigate} />
  } else if (protectedRoute && !session) {
    page = <ScenarioRequiredPage navigate={navigate} />
  } else if (protectedRoute && active.error) {
    page = (
      <div className="page centered-state centered-state--error">
        <span className="centered-state__icon">
          <AlertTriangle aria-hidden="true" size={30} />
        </span>
        <span className="eyebrow">Calculation unavailable</span>
        <h1 data-route-heading tabIndex={-1}>This saved scenario no longer validates.</h1>
        <p>{active.error}</p>
        <button className="primary-button" onClick={resetScenario} type="button">
          <RotateCcw aria-hidden="true" size={18} /> Reset and run again
        </button>
      </div>
    )
  } else if (route === '/') {
    page = (
      <OverviewPage
        dataset={defaultScenario.dataset}
        navigate={navigate}
        previewScenario={previewScenario}
      />
    )
  } else if (route === '/plan') {
    page = (
      <PlanPage
        dataset={defaultScenario.dataset}
        navigate={navigate}
        previewScenario={previewScenario}
      />
    )
  } else if (route === '/stress-test') {
    page = (
      <StressTestPage
        calculationError={calculationError}
        dataset={defaultScenario.dataset}
        onRun={runScenario}
        scenario={previewScenario}
      />
    )
  } else if (active.resolved && active.scenario && session) {
    const selectedPath =
      active.scenario.alternatives.find(
        (path) => path.id === session.selectedPathId,
      ) ?? active.scenario.alternatives[0]!
    const fasterPath =
      active.scenario.alternatives.find((path) => path.id === 'faster-finish') ??
      active.scenario.alternatives[0]!

    if (route === '/impact') {
      page = (
        <ImpactPage
          dataset={active.resolved.dataset}
          navigate={navigate}
          path={fasterPath}
          scenario={active.scenario}
        />
      )
    } else if (route === '/paths') {
      page = (
        <PathsPage
          dataset={active.resolved.dataset}
          navigate={navigate}
          onPathChange={changePath}
          onPriorityChange={changePriority}
          priority={session.priority}
          scenario={active.scenario}
          selectedPathId={session.selectedPathId}
        />
      )
    } else {
      page = (
        <AdvisorPage
          dataset={active.resolved.dataset}
          navigate={navigate}
          priority={session.priority}
          scenario={active.scenario}
          scenarioId={session.scenarioId}
          selectedPath={selectedPath}
        />
      )
    }
  }

  return (
    <AppShell
      hasScenario={Boolean(session)}
      navigate={navigate}
      onReset={resetScenario}
      route={route}
    >
      {page}
    </AppShell>
  )
}
