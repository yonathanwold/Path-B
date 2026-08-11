import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  GitBranch,
  Scale,
  ShieldCheck,
} from 'lucide-react'

import type { PathBDataset, ScenarioResult } from '../../domain/index.ts'

export function StressTestPage({
  calculationError,
  dataset,
  onRun,
  scenario,
}: {
  calculationError: string | null
  dataset: PathBDataset
  onRun: () => void
  scenario: ScenarioResult
}) {
  const course = dataset.courses.find(
    (candidate) => candidate.id === scenario.failedCourseId,
  )
  const disruptionTerm = dataset.terms.find(
    (term) => term.id === scenario.disruption.termId,
  )

  return (
    <div className="page page--stress-test">
      <header className="page-header page-header--narrow">
        <span className="eyebrow">Stress Test</span>
        <h1 data-route-heading tabIndex={-1}>What changed?</h1>
        <p className="page-lede">
          Choose one real disruption. Path B keeps the academic rules fixed and
          recalculates what moves around them.
        </p>
      </header>

      <div className="stress-layout">
        <form
          className="disruption-form"
          onSubmit={(event) => {
            event.preventDefault()
            onRun()
          }}
        >
          <fieldset>
            <legend>Today&apos;s disruption</legend>
            <p>One focused demo scenario keeps the causal story easy to verify.</p>
            <label className="disruption-option disruption-option--selected">
              <input checked name="disruption" readOnly type="radio" />
              <span className="radio-visual" aria-hidden="true" />
              <span>
                <strong>I did not pass {course?.code}</strong>
                <small>
                  {course?.title} · {disruptionTerm?.label} · {course?.credits} credits
                </small>
              </span>
              <CheckCircle2 aria-hidden="true" size={20} />
            </label>
          </fieldset>

          {calculationError ? (
            <div className="inline-error" role="alert">
              <strong>The plan could not be recalculated.</strong>
              <span>{calculationError}</span>
            </div>
          ) : null}

          <button className="primary-button primary-button--wide" type="submit">
            Run the stress test <ArrowRight aria-hidden="true" size={18} />
          </button>
          <p className="form-trust-note">
            <ShieldCheck aria-hidden="true" size={16} />
            Results are computed locally from the fixture before any optional AI wording.
          </p>
        </form>

        <aside className="engine-checks" aria-labelledby="engine-checks-title">
          <span className="eyebrow">What Path B checks</span>
          <h2 id="engine-checks-title">The constraints that make the answer trustworthy</h2>
          <ol>
            <li>
              <CalendarClock aria-hidden="true" size={21} />
              <span><strong>Next offering</strong> When {course?.code} can actually be repeated.</span>
            </li>
            <li>
              <GitBranch aria-hidden="true" size={21} />
              <span><strong>Prerequisite cascade</strong> Every course blocked directly or downstream.</span>
            </li>
            <li>
              <ShieldCheck aria-hidden="true" size={21} />
              <span><strong>Student constraints</strong> Half-time status and Maya&apos;s work-compatible load.</span>
            </li>
            <li>
              <Scale aria-hidden="true" size={21} />
              <span><strong>Tradeoffs</strong> Graduation timing, workload, and illustrative added cost.</span>
            </li>
          </ol>
        </aside>
      </div>
    </div>
  )
}
