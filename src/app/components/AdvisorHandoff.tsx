import { Check, Clipboard, MessageCircleQuestion } from 'lucide-react'
import { useState } from 'react'

import type { ExplanationViewState } from '../../ai/useExplanation'

type AdvisorHandoffProps = {
  explanationState: ExplanationViewState
}

export function AdvisorHandoff({ explanationState }: AdvisorHandoffProps) {
  const { explanation, status } = explanationState
  const [copyResult, setCopyResult] = useState<{
    question: string
    status: 'copied' | 'failed'
  } | null>(null)
  const copyState =
    copyResult?.question === explanation.advisorQuestion
      ? copyResult.status
      : 'idle'

  const sourceLabel =
    status === 'claude'
      ? 'Claude-personalized explanation'
      : status === 'deterministic'
        ? 'Deterministic demo explanation'
        : status === 'unavailable'
          ? 'Verified fallback explanation'
          : 'Verified plan explanation'
  const explanationStatus =
    status === 'claude'
      ? 'Claude selected the focus and next steps from verified plan facts.'
      : status === 'deterministic'
        ? 'Claude is optional; this verified fallback uses the same plan facts.'
        : status === 'unavailable'
          ? 'Personalized wording is unavailable; showing the verified fallback.'
          : 'Personalizing the wording without changing plan facts.'

  async function copyQuestion() {
    try {
      await navigator.clipboard.writeText(explanation.advisorQuestion)
      setCopyResult({
        question: explanation.advisorQuestion,
        status: 'copied',
      })
    } catch {
      setCopyResult({
        question: explanation.advisorQuestion,
        status: 'failed',
      })
    }
  }

  return (
    <section className="advisor-handoff" aria-labelledby="advisor-title">
      <div className="advisor-handoff__explanation">
        <p className="explanation-source">{sourceLabel}</p>
        <p>{explanation.summary}</p>
        <p>{explanation.tradeoff}</p>
        <p className="explanation-status" role="status" aria-live="polite">
          {explanationStatus}
        </p>
      </div>

      <div className="handoff-actions">
        <h3>Before the meeting</h3>
        <ol>
          {explanation.nextSteps.map((nextStep) => (
            <li key={nextStep}>{nextStep}</li>
          ))}
        </ol>
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
