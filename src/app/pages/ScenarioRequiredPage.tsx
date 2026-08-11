import { ArrowRight, FlaskConical } from 'lucide-react'

import { RouteLink } from '../components/RouteLink.tsx'
import type { RoutePath } from '../routing.ts'

export function ScenarioRequiredPage({
  navigate,
}: {
  navigate: (to: RoutePath) => void
}) {
  return (
    <div className="page centered-state">
      <span className="centered-state__icon"><FlaskConical aria-hidden="true" size={30} /></span>
      <span className="eyebrow">No active stress test</span>
      <h1 data-route-heading tabIndex={-1}>Run the scenario before opening its results.</h1>
      <p>
        Impact, recovery paths, and the advisor brief are generated from a verified
        scenario session. No result is guessed from the URL alone.
      </p>
      <RouteLink className="primary-button" navigate={navigate} to="/stress-test">
        Go to Stress Test <ArrowRight aria-hidden="true" size={18} />
      </RouteLink>
    </div>
  )
}
