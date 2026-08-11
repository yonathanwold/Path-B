import { RotateCcw } from 'lucide-react'

type AppHeaderProps = {
  canReset: boolean
  onReset: () => void
}

export function AppHeader({ canReset, onReset }: AppHeaderProps) {
  return (
    <header className="site-header">
      <a className="wordmark" href="#main" aria-label="Path B home">
        Path B
      </a>
      <p>A crash test for your college plan</p>
      {canReset ? (
        <button className="reset-button" type="button" onClick={onReset}>
          <RotateCcw aria-hidden="true" size={17} strokeWidth={1.8} />
          Start over
        </button>
      ) : null}
    </header>
  )
}
