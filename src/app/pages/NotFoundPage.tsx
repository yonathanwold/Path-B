import { ArrowRight } from 'lucide-react'

import { RouteLink } from '../components/RouteLink.tsx'
import type { RoutePath } from '../routing.ts'

export function NotFoundPage({ navigate }: { navigate: (to: RoutePath) => void }) {
  return (
    <div className="page centered-state">
      <span className="eyebrow">404 · Path not modeled</span>
      <h1 data-route-heading tabIndex={-1}>This route is outside Maya&apos;s journey.</h1>
      <p>Return to the overview to follow the verified six-step stress-test flow.</p>
      <RouteLink className="primary-button" navigate={navigate} to="/">
        Return to Overview <ArrowRight aria-hidden="true" size={18} />
      </RouteLink>
    </div>
  )
}
