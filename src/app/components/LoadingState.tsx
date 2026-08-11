export function LoadingState() {
  return (
    <main id="main" className="loading-state" aria-labelledby="loading-title">
      <div className="loading-state__fault" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="loading-state__label">Running Maya's crash test</p>
      <h1 id="loading-title">Tracing the dependency chain…</h1>
      <ol>
        <li>Checking CS 201's next offering</li>
        <li>Following prerequisite links</li>
        <li>Building two viable paths</li>
      </ol>
      <p className="sr-only" role="status" aria-live="polite">
        Path B is calculating Maya's scenario.
      </p>
    </main>
  )
}
