import {
  Check,
  Clipboard,
  FileCheck2,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'

import type { ExplanationViewState } from '../../ai/useExplanation.ts'
import type {
  AlternativePath,
  PathBDataset,
  ScenarioResult,
} from '../../domain/index.ts'
import { presentPath } from '../../presentation/scenario.ts'

export function AdvisorBrief({
  dataset,
  explanationState,
  scenario,
  selectedPath,
}: {
  dataset: PathBDataset
  explanationState: ExplanationViewState
  scenario: ScenarioResult
  selectedPath: AlternativePath
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const presented = presentPath(dataset, selectedPath)
  const assumptions = dataset.assumptions.filter((assumption) =>
    scenario.assumptionIds.includes(assumption.id),
  )
  const sourceLabel =
    explanationState.status === 'claude'
      ? 'Claude-personalized wording'
      : explanationState.status === 'loading'
        ? 'Verified facts ready · optional wording loading'
        : explanationState.status === 'unavailable'
          ? 'Verified deterministic fallback'
          : 'Deterministic meeting brief'

  async function copyQuestion() {
    try {
      await navigator.clipboard.writeText(
        explanationState.explanation.advisorQuestion,
      )
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="advisor-layout">
      <section className="meeting-brief" aria-labelledby="meeting-brief-title">
        <div className="brief-source">
          {explanationState.status === 'claude' ? (
            <Sparkles aria-hidden="true" size={17} />
          ) : (
            <FileCheck2 aria-hidden="true" size={17} />
          )}
          {sourceLabel}
        </div>
        <h2 id="meeting-brief-title">Your meeting brief</h2>
        <p>{explanationState.explanation.summary}</p>
        <p>{explanationState.explanation.tradeoff}</p>

        <dl className="brief-facts">
          <div>
            <dt>Selected path</dt>
            <dd>{selectedPath.title}</dd>
          </div>
          <div>
            <dt>Projected graduation</dt>
            <dd>{presented.graduation}</dd>
          </div>
          <div>
            <dt>Modeled peak</dt>
            <dd>{selectedPath.maximumCredits} credits</dd>
          </div>
        </dl>

        <div className="meeting-checklist">
          <h3>Before the meeting</h3>
          <ol>
            {explanationState.explanation.nextSteps.map((step) => (
              <li key={step}>
                <span><Check aria-hidden="true" size={15} /></span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <aside className="verification-panel" aria-labelledby="verification-title">
        <span className="eyebrow">Human verification</span>
        <h2 id="verification-title">Confirm these assumptions</h2>
        <ul>
          {assumptions.slice(0, 3).map((assumption) => (
            <li key={assumption.id}>
              <TriangleAlert aria-hidden="true" size={17} />
              <span>
                <strong>{assumption.label}</strong>
                {assumption.verificationNote}
              </span>
            </li>
          ))}
        </ul>
        <details id="evidence-details">
          <summary>Fixture data, sources, and cost limits</summary>
          <p>{dataset.fixtureDisclosure}</p>
          {dataset.sources.map((source) => (
            <p key={source.id}>
              <strong>{source.label}:</strong> {source.detail}
            </p>
          ))}
        </details>
      </aside>

      <section className="advisor-question" aria-labelledby="advisor-question-title">
        <span className="advisor-question__icon">
          <MessageCircleQuestion aria-hidden="true" size={28} />
        </span>
        <div>
          <span className="eyebrow">One useful next step</span>
          <h2 id="advisor-question-title">Ask your advisor</h2>
          <blockquote>{explanationState.explanation.advisorQuestion}</blockquote>
        </div>
        <button className="secondary-button" onClick={copyQuestion} type="button">
          {copyState === 'copied' ? (
            <Check aria-hidden="true" size={17} />
          ) : (
            <Clipboard aria-hidden="true" size={17} />
          )}
          {copyState === 'copied' ? 'Copied' : 'Copy question'}
        </button>
      </section>

      <p className="copy-status" role="status" aria-live="polite">
        {copyState === 'copied'
          ? 'Advisor question copied.'
          : copyState === 'failed'
            ? 'Clipboard access is unavailable. Select the question and copy it manually.'
            : ''}
      </p>

      <p className="trust-boundary">
        <ShieldCheck aria-hidden="true" size={17} />
        Plan facts and recommendations are deterministic. Claude may improve emphasis and wording only; it cannot change course requirements.
      </p>
    </div>
  )
}
