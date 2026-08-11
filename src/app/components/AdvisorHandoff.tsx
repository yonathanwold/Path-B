import { Check, Clipboard, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'

import type {
  AlternativePath,
  PathBDataset,
  ScenarioResult,
} from '../../domain'
import { buildDeterministicExplanation } from '../../presentation/scenario'

type AdvisorHandoffProps = {
  dataset: PathBDataset
  scenario: ScenarioResult
  selectedPath: AlternativePath
}

export function AdvisorHandoff({
  dataset,
  scenario,
  selectedPath,
}: AdvisorHandoffProps) {
  const explanation = buildDeterministicExplanation(
    dataset,
    scenario,
    selectedPath,
  )
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  async function copyQuestion() {
    try {
      await navigator.clipboard.writeText(explanation.advisorQuestion)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <section className="advisor-handoff" aria-labelledby="advisor-title">
      <div className="advisor-handoff__explanation">
        <p className="explanation-source">Deterministic scenario explanation</p>
        <p>{explanation.summary}</p>
        <p>{explanation.tradeoff}</p>
      </div>

      <div className="advisor-question">
        <span className="advisor-question__icon">
          <MessageCircleQuestion aria-hidden="true" size={24} strokeWidth={1.7} />
        </span>
        <div>
          <h2 id="advisor-title">One question to ask your advisor</h2>
          <blockquote>{explanation.advisorQuestion}</blockquote>
        </div>
        <button className="copy-button" type="button" onClick={copyQuestion}>
          {copyState === 'copied' ? (
            <Check aria-hidden="true" size={16} />
          ) : (
            <Clipboard aria-hidden="true" size={16} />
          )}
          {copyState === 'copied' ? 'Copied' : 'Copy question'}
        </button>
      </div>

      <p className="copy-status" role="status" aria-live="polite">
        {copyState === 'failed'
          ? 'Clipboard access is unavailable. Select the question and copy it manually.'
          : copyState === 'copied'
            ? 'Advisor question copied.'
            : ''}
      </p>
    </section>
  )
}
