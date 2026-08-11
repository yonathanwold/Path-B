import {
  BriefcaseBusiness,
  CalendarRange,
  Check,
  CircleDollarSign,
  Gauge,
  GraduationCap,
  Scale,
  ShieldCheck,
} from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  ScenarioResult,
} from '../../domain'
import { presentPath } from '../../presentation/scenario'

type PathComparisonProps = {
  dataset: PathBDataset
  scenario: ScenarioResult
  selectedPathId: AlternativePath['id']
  onSelect: (pathId: AlternativePath['id']) => void
}

export function PathComparison({
  dataset,
  scenario,
  selectedPathId,
  onSelect,
}: PathComparisonProps) {
  const recommendedPath =
    scenario.alternatives.find(
      (path) => path.id === scenario.recommendedPathId,
    ) ?? scenario.alternatives[0]!
  const selectedPath =
    scenario.alternatives.find((path) => path.id === selectedPathId) ??
    scenario.alternatives[0]!
  const viewingAlternative = selectedPath.id !== recommendedPath.id

  return (
    <section className="path-comparison" aria-labelledby="comparison-title">
      <div className="comparison-heading">
        <div>
          <h2 id="comparison-title">Compare two ways forward</h2>
          <p>Same course facts. Different priorities and tradeoffs.</p>
        </div>
        <p className="comparison-heading__hint">
          Select a path to update the term rail and advisor question.
        </p>
      </div>

      <p className="comparison-evidence">
        Both modeled paths keep Maya at or above {dataset.student.minimumCreditsPerTerm}{' '}
        credits. Synthetic demo data; verify course availability, aid, and cost
        with advising. <a href="#evidence-details">Review assumptions</a>.
      </p>

      {viewingAlternative ? (
        <p className="alternative-notice" role="status">
          Viewing {selectedPath.title} as an alternative. {recommendedPath.title}{' '}
          is recommended for your selected priority.
        </p>
      ) : null}

      <fieldset>
        <legend className="sr-only">Choose a recovery path to inspect</legend>
        <div className="path-grid">
          {scenario.alternatives.map((path, index) => {
            const presented = presentPath(dataset, path)
            const selected = path.id === selectedPathId
            const recommended = path.id === scenario.recommendedPathId
            const metrics = [
              {
                id: 'graduation',
                icon: GraduationCap,
                label: 'Projected graduation',
                value: presented.graduation,
              },
              {
                id: 'busiest-term',
                icon: Gauge,
                label: 'Busiest term',
                value: `${presented.busiestTerm} · ${path.maximumCredits} credits`,
              },
              {
                id: 'work-fit',
                icon: BriefcaseBusiness,
                label: `Work fit (${dataset.student.workHoursPerWeek} hrs/wk)`,
                value: presented.workFit,
              },
              {
                id: 'half-time',
                icon: ShieldCheck,
                label: 'Half-time assumption',
                value: presented.halfTime,
              },
              {
                id: 'cost',
                icon: CircleDollarSign,
                label: 'Illustrative added cost',
                value: presented.additionalCost,
              },
              {
                id: 'sacrifice',
                icon: Scale,
                label: 'One sacrifice',
                value: presented.sacrifice,
              },
            ]

            return (
              <label
                className={`path-option${selected ? ' path-option--selected' : ''}`}
                key={path.id}
              >
                {recommended ? (
                  <span className="recommendation-label">Recommended for this priority</span>
                ) : null}
                <input
                  checked={selected}
                  name="recovery-path"
                  onChange={() => onSelect(path.id)}
                  type="radio"
                  value={path.id}
                />
                <span className="path-option__number">{index + 1}</span>
                <span className="path-option__heading">
                  <strong>{path.title}</strong>
                  <span>{path.description}</span>
                </span>
                {selected ? (
                  <span className="path-option__selected">
                    <Check aria-hidden="true" size={14} />
                    Inspecting
                  </span>
                ) : null}

                <dl>
                  {metrics.map(({ id, icon: Icon, label, value }) => (
                    <div className={`path-metric path-metric--${id}`} key={id}>
                      <dt>
                        <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                        {label}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="path-protects">
                  <CalendarRange aria-hidden="true" size={16} />
                  <span>
                    Protects <strong>{presented.protects.join(' + ')}</strong>
                  </span>
                </div>
              </label>
            )
          })}
        </div>
      </fieldset>
    </section>
  )
}
