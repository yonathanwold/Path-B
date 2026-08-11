import { forwardRef } from 'react'

import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../../domain'
import { StudentFacts } from './StudentFacts'
import { PrioritySelector } from './PrioritySelector'
import { PlanCascade } from './PlanCascade'
import { ImpactStory } from './ImpactStory'
import { PathComparison } from './PathComparison'
import { AdvisorHandoff } from './AdvisorHandoff'
import { EvidenceDisclosure } from './EvidenceDisclosure'

type ResultsViewProps = {
  dataset: PathBDataset
  scenario: ScenarioResult
  priority: Priority
  selectedPathId: AlternativePath['id']
  onPriorityChange: (priority: Priority) => void
  onPathSelect: (pathId: AlternativePath['id']) => void
}

export const ResultsView = forwardRef<HTMLHeadingElement, ResultsViewProps>(
  function ResultsView(
    {
      dataset,
      scenario,
      priority,
      selectedPathId,
      onPriorityChange,
      onPathSelect,
    },
    headingRef,
  ) {
    const selectedPath =
      scenario.alternatives.find((path) => path.id === selectedPathId) ??
      scenario.alternatives[0]!
    const recommendedPath =
      scenario.alternatives.find(
        (path) => path.id === scenario.recommendedPathId,
      ) ?? scenario.alternatives[0]!

    return (
      <main id="main" className="results-view">
        <section className="results-intro" aria-labelledby="results-title">
          <h1 id="results-title" ref={headingRef} tabIndex={-1}>
            Maya's plan hit a fault line.
          </h1>
          <p>
            CS 201 is offered once a year. Two courses are blocked directly and
            five planned courses shift downstream.
          </p>
          <StudentFacts compact dataset={dataset} />
        </section>

        <div className="results-overview">
          <PlanCascade
            activePath={selectedPath}
            dataset={dataset}
            recommendedPathId={scenario.recommendedPathId}
            scenario={scenario}
          />
          <ImpactStory
            dataset={dataset}
            priority={priority}
            recommendedPath={recommendedPath}
            scenario={scenario}
          />
          <PrioritySelector
            dataset={dataset}
            onChange={onPriorityChange}
            priority={priority}
            recommendedPath={recommendedPath}
          />
        </div>

        <PathComparison
          dataset={dataset}
          onSelect={onPathSelect}
          scenario={scenario}
          selectedPathId={selectedPathId}
        />
        <div className="handoff-grid">
          <AdvisorHandoff
            dataset={dataset}
            scenario={scenario}
            selectedPath={selectedPath}
          />
          <EvidenceDisclosure dataset={dataset} />
        </div>
      </main>
    )
  },
)
