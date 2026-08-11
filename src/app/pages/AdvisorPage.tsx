import { ArrowLeft, CheckCircle2 } from 'lucide-react'

import { useExplanation } from '../../ai/useExplanation.ts'
import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioId,
  ScenarioResult,
} from '../../domain/index.ts'
import { AdvisorBrief } from '../components/AdvisorBrief.tsx'
import { RouteLink } from '../components/RouteLink.tsx'
import type { RoutePath } from '../routing.ts'

export function AdvisorPage({
  dataset,
  navigate,
  priority,
  scenario,
  scenarioId,
  selectedPath,
}: {
  dataset: PathBDataset
  navigate: (to: RoutePath) => void
  priority: Priority
  scenario: ScenarioResult
  scenarioId: ScenarioId
  selectedPath: AlternativePath
}) {
  const explanationState = useExplanation({
    dataset,
    priority,
    scenario,
    scenarioId,
    selectedPath,
  })

  return (
    <div className="page page--advisor">
      <header className="page-header page-header--advisor">
        <div>
          <span className="eyebrow">Advisor</span>
          <h1 data-route-heading tabIndex={-1}>Leave with one useful question.</h1>
          <p className="page-lede">
            Path B turns the selected recovery path into a concise meeting brief,
            with the assumptions a human still needs to verify.
          </p>
        </div>
        <span className="status-pill status-pill--complete">
          <CheckCircle2 aria-hidden="true" size={18} /> Analysis complete
        </span>
      </header>

      <AdvisorBrief
        dataset={dataset}
        explanationState={explanationState}
        scenario={scenario}
        selectedPath={selectedPath}
      />

      <footer className="advisor-footer">
        <RouteLink className="text-link" navigate={navigate} to="/paths">
          <ArrowLeft aria-hidden="true" size={17} /> Review path choice
        </RouteLink>
        <p>Synthetic Great Lakes University is a fixture, not a real institution.</p>
      </footer>
    </div>
  )
}
