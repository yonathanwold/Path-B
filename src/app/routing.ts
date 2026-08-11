import { useCallback, useEffect, useState } from 'react'

export const routePaths = [
  '/',
  '/plan',
  '/stress-test',
  '/impact',
  '/paths',
  '/advisor',
] as const

export type RoutePath = (typeof routePaths)[number]
export type ActiveRoute = RoutePath | 'not-found'

const routeSet = new Set<string>(routePaths)

export function routeFromPathname(pathname: string): ActiveRoute {
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return routeSet.has(normalized) ? (normalized as RoutePath) : 'not-found'
}

export function useAppRouter() {
  const [route, setRoute] = useState<ActiveRoute>(() =>
    routeFromPathname(window.location.pathname),
  )

  useEffect(() => {
    const handlePopState = () => setRoute(routeFromPathname(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((to: RoutePath, options?: { replace?: boolean }) => {
    if (window.location.pathname !== to) {
      const method = options?.replace ? 'replaceState' : 'pushState'
      window.history[method]({}, '', to)
    }
    setRoute(to)
  }, [])

  return { navigate, route }
}
