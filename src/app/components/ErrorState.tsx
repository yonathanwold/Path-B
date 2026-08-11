import { RefreshCcw, TriangleAlert } from 'lucide-react'

type ErrorStateProps = {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <main id="main" className="error-state" aria-labelledby="error-title">
      <TriangleAlert aria-hidden="true" size={28} />
      <p>We could not build this scenario.</p>
      <h1 id="error-title">Maya's plan is still intact.</h1>
      <p>
        No changes were saved. Retry the deterministic crash test or return to
        the starting plan.
      </p>
      <button className="primary-button" type="button" onClick={onRetry}>
        <RefreshCcw aria-hidden="true" size={17} />
        Retry crash test
      </button>
    </main>
  )
}
