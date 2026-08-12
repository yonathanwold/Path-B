import { ArrowRight, Info } from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../../domain/index.ts'
import { PathDecision } from '../components/PathDecision.tsx'
import { RouteLink } from '../components/RouteLink.tsx'
import type { RoutePath } from '../routing.ts'

export function PathsPage({
  dataset,
  navigate,
  onPathChange,
  onPriorityChange,
  priority,
  scenario,
  selectedPathId,
}: {
  dataset: PathBDataset
  navigate: (to: RoutePath) => void
  onPathChange: (pathId: AlternativePath['id']) => void
  onPriorityChange: (priority: Priority) => void
  priority: Priority
  scenario: ScenarioResult
  selectedPathId: AlternativePath['id']
}) {
  return (
    <div className="page page--paths">
      <header className="page-header page-header--paths">
        <span className="eyebrow">Paths</span>
        <h1 data-route-heading tabIndex={-1}>
          You can&apos;t protect everything. What matters most to Maya?
        </h1>
        <p className="page-lede">
          Both paths are academically viable. Her priority determines which
          tradeoff is worth making.
        </p>
      </header>

      <PathDecision
        dataset={dataset}
        onPathChange={onPathChange}
        onPriorityChange={onPriorityChange}
        priority={priority}
        scenario={scenario}
        selectedPathId={selectedPathId}
      />

      <footer className="route-footer">
        <p>
          <Info aria-hidden="true" size={18} />
          Costs are illustrative; aid and institutional pricing require human verification.
        </p>
        <div>
          <RouteLink className="primary-button" navigate={navigate} to="/advisor">
            Prepare advisor brief <ArrowRight aria-hidden="true" size={18} />
          </RouteLink>
        </div>
      </footer>
    </div>
  )
}
