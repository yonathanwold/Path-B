import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleDollarSign,
  GraduationCap,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'

import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../../domain/index.ts'
import {
  presentPath,
  priorityOptions,
  termLabel,
} from '../../presentation/scenario.ts'

function sacrificeLabel(path: AlternativePath, dataset: PathBDataset) {
  const presented = presentPath(dataset, path)
  return path.id === 'faster-finish'
    ? `Workload comfort in ${presented.busiestTerm}.`
    : `One semester of time and ${presented.additionalCost} in modeled added cost.`
}

export function PathDecision({
  dataset,
  onPathChange,
  onPriorityChange,
  priority,
  scenario,
  selectedPathId,
}: {
  dataset: PathBDataset
  onPathChange: (pathId: AlternativePath['id']) => void
  onPriorityChange: (priority: Priority) => void
  priority: Priority
  scenario: ScenarioResult
  selectedPathId: AlternativePath['id']
}) {
  const selectedPath =
    scenario.alternatives.find((path) => path.id === selectedPathId) ??
    scenario.alternatives[0]!
  const recommendedPath =
    scenario.alternatives.find((path) => path.id === scenario.recommendedPathId) ??
    scenario.alternatives[0]!
  const recommendedPresentation = presentPath(dataset, recommendedPath)
  const selectedPresentation = presentPath(dataset, selectedPath)
  const courseById = new Map(dataset.courses.map((course) => [course.id, course]))

  return (
    <>
      <fieldset className="priority-control">
        <legend className="sr-only">Choose Maya's highest priority</legend>
        {priorityOptions.map((option) => (
          <label
            className={priority === option.id ? 'priority-segment priority-segment--selected' : 'priority-segment'}
            key={option.id}
          >
            <input
              checked={priority === option.id}
              name="priority"
              onChange={() => onPriorityChange(option.id)}
              type="radio"
              value={option.id}
            />
            <span>{option.label}</span>
            <small>{option.shortDescription}</small>
          </label>
        ))}
      </fieldset>

      <div className="recommendation-strip">
        <span>
          <ShieldCheck aria-hidden="true" size={19} />
          <strong>Recommended: {recommendedPath.title}</strong>
        </span>
        <span>
          <GraduationCap aria-hidden="true" size={19} />
          Protects {recommendedPresentation.protects[0]}
        </span>
        <span>
          <BriefcaseBusiness aria-hidden="true" size={19} />
          {recommendedPath.id === 'faster-finish'
            ? `Requires a ${recommendedPath.maximumCredits}-credit ${recommendedPresentation.busiestTerm}`
            : `Caps terms at ${recommendedPath.maximumCredits} credits`}
        </span>
      </div>

      <p aria-live="polite" className="sr-only" role="status">
        {selectedPath.title} selected. Projected graduation{' '}
        {selectedPresentation.graduation}; {selectedPath.maximumCredits}-credit
        maximum; {selectedPath.workFit} work fit.
      </p>

      <section className="path-decision" aria-labelledby="path-decision-title">
        <div className="section-heading section-heading--compact">
          <div>
            <span className="eyebrow">Same facts, different priorities</span>
            <h2 id="path-decision-title">Compare two ways forward</h2>
          </div>
          <span>Both modeled paths pass deterministic schedule validation.</span>
        </div>

        <fieldset className="path-options">
          <legend className="sr-only">Choose a recovery path</legend>
          {scenario.alternatives.map((path) => {
            const presented = presentPath(dataset, path)
            const selected = path.id === selectedPathId
            const recommended = path.id === scenario.recommendedPathId
            return (
              <label
                className={selected ? 'path-choice path-choice--selected' : 'path-choice'}
                key={path.id}
              >
                <span className="path-choice__heading">
                  <input
                    checked={selected}
                    name="recovery-path"
                    onChange={() => onPathChange(path.id)}
                    type="radio"
                    value={path.id}
                  />
                  <strong>{path.title}</strong>
                  {recommended ? <em>Recommended for this priority</em> : null}
                  {selected ? (
                    <span className="selected-indicator">
                      <Check aria-hidden="true" size={14} /> Selected
                    </span>
                  ) : null}
                </span>

                <dl className="decision-metrics">
                  <div>
                    <dt><GraduationCap aria-hidden="true" size={18} /> Graduation</dt>
                    <dd>{presented.graduation}</dd>
                  </div>
                  <div>
                    <dt><BriefcaseBusiness aria-hidden="true" size={18} /> Workload fit</dt>
                    <dd>{path.workFit === 'tight' ? `Tight · ${path.maximumCredits}-credit peak` : `Comfortable · ${path.maximumCredits}-credit maximum`}</dd>
                  </div>
                  <div>
                    <dt><CircleDollarSign aria-hidden="true" size={18} /> Illustrative added cost</dt>
                    <dd>{presented.additionalCost}</dd>
                  </div>
                </dl>

                <div className="path-choice__outcomes">
                  <p className="protects-line">
                    <ShieldCheck aria-hidden="true" size={18} />
                    <span><strong>Protects:</strong> {presented.protects.join(' and ')}.</span>
                  </p>
                  <p className="sacrifice-line">
                    <TriangleAlert aria-hidden="true" size={18} />
                    <span><strong>You give up:</strong> {sacrificeLabel(path, dataset)}</span>
                  </p>
                </div>
              </label>
            )
          })}
        </fieldset>

        <div className="selected-schedule">
          <div>
            <span className="selected-schedule__icon">
              <CalendarDays aria-hidden="true" size={20} />
            </span>
            <div>
              <span className="eyebrow">Selected path schedule</span>
              <h3>{selectedPath.title}</h3>
            </div>
          </div>
          <ol>
            {selectedPath.schedule.map((scheduledTerm) => (
              <li key={scheduledTerm.termId}>
                <strong>{termLabel(dataset, scheduledTerm.termId)}</strong>
                <span>{scheduledTerm.credits} credits</span>
                <small>
                  {scheduledTerm.courseIds
                    .map((courseId) => courseById.get(courseId)?.code ?? courseId)
                    .join(', ')}
                </small>
              </li>
            ))}
          </ol>
        </div>

        <div className="decision-summary">
          <span>
            <Check aria-hidden="true" size={20} />
            <span>
              <strong>Maya selected {selectedPath.title}.</strong>
              Calculated from offerings, prerequisites, credits, and her constraints.
            </span>
          </span>
          <span className="decision-summary__tradeoff">
            {selectedPresentation.protects[0]}
            <ArrowRight aria-hidden="true" size={16} />
            {sacrificeLabel(selectedPath, dataset)}
          </span>
        </div>
      </section>
    </>
  )
}
