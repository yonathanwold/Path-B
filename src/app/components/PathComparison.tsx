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

      <fieldset>
        <legend className="sr-only">Choose a recovery path to inspect</legend>
        <div className="path-grid">
          {scenario.alternatives.map((path, index) => {
            const presented = presentPath(dataset, path)
            const selected = path.id === selectedPathId
            const recommended = path.id === scenario.recommendedPathId
            const metrics = [
              {
                icon: GraduationCap,
                label: 'Projected graduation',
                value: presented.graduation,
              },
              {
                icon: Gauge,
                label: 'Busiest term',
                value: `${presented.busiestTerm} · ${path.maximumCredits} credits`,
              },
              {
                icon: BriefcaseBusiness,
                label: `Work fit (${dataset.student.workHoursPerWeek} hrs/wk)`,
                value: presented.workFit,
              },
              {
                icon: ShieldCheck,
                label: 'Half-time assumption',
                value: presented.halfTime,
              },
              {
                icon: CircleDollarSign,
                label: 'Illustrative added cost',
                value: presented.additionalCost,
              },
              {
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
                  {metrics.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
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
