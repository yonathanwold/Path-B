import { forwardRef } from 'react'

import type {
  AlternativePath,
  PathBDataset,
  Priority,
  ScenarioResult,
} from '../../domain'
import { useExplanation } from '../../ai/useExplanation'
import { buildImpactSummary } from '../../presentation/scenario'
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
    const explanationState = useExplanation({
      dataset,
      priority,
      scenario,
      selectedPath,
    })
    const impactSummary = buildImpactSummary(dataset, scenario)

    return (
      <main id="main" className="results-view">
        <section className="results-intro" aria-labelledby="results-title">
          <h1 id="results-title" ref={headingRef} tabIndex={-1}>
            {impactSummary.title}
          </h1>
          <p>{impactSummary.summary}</p>
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
          <AdvisorHandoff explanationState={explanationState} />
          <EvidenceDisclosure dataset={dataset} />
        </div>
      </main>
    )
  },
)
