import { ArrowRight } from 'lucide-react'

import type { PathBDataset } from '../../domain'
import { BaselinePlan } from './BaselinePlan'
import { DisruptionOptions } from './DisruptionOptions'
import { StudentFacts } from './StudentFacts'

type CrashTestSetupProps = {
  dataset: PathBDataset
  onRun: () => void
}

export function CrashTestSetup({ dataset, onRun }: CrashTestSetupProps) {
  return (
    <main id="main" className="setup-view">
      <section className="setup-panel" aria-labelledby="setup-title">
        <div className="setup-panel__intro">
          <h1 id="setup-title">Real life changed. Will Maya's plan hold?</h1>
          <p>Stress-test one real disruption and see how it impacts her plan.</p>
        </div>

        <StudentFacts dataset={dataset} />
        <DisruptionOptions />

        <button className="primary-button" type="button" onClick={onRun}>
          Run the crash test
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </section>

      <BaselinePlan dataset={dataset} />

      <footer className="fixture-footer">
        <span>Source: synthetic 2025–2027 catalog</span>
        <span aria-hidden="true" className="fixture-footer__divider" />
        <span>{dataset.institutionLabel} fixture</span>
      </footer>
    </main>
  )
}
