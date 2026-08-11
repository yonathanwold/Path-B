import {
  FlaskConical,
  GitBranch,
  GraduationCap,
  House,
  Map,
  Menu,
  MessageCircleQuestion,
  RotateCcw,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import type { ActiveRoute, RoutePath } from '../routing.ts'
import { PathBMark } from './PathBMark.tsx'
import { RouteLink } from './RouteLink.tsx'

const navItems = [
  { path: '/' as const, label: 'Overview', icon: House },
  { path: '/plan' as const, label: 'My Plan', icon: Map },
  { path: '/stress-test' as const, label: 'Stress Test', icon: FlaskConical },
  { path: '/impact' as const, label: 'Impact', icon: GitBranch },
  { path: '/paths' as const, label: 'Paths', icon: GraduationCap },
  { path: '/advisor' as const, label: 'Advisor', icon: MessageCircleQuestion },
]

type Navigate = (to: RoutePath) => void

function ProductNavigation({
  navigate,
  onNavigate,
  route,
}: {
  navigate: Navigate
  onNavigate?: () => void
  route: ActiveRoute
}) {
  return (
    <nav aria-label="Path B journey" className="product-nav">
      <ol>
        {navItems.map(({ icon: Icon, label, path }) => (
          <li key={path}>
            <RouteLink
              aria-current={route === path ? 'page' : undefined}
              className="product-nav__link"
              navigate={navigate}
              onClick={onNavigate}
              to={path}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </RouteLink>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function ScenarioContext({ active }: { active: boolean }) {
  return (
    <aside className="scenario-context" aria-label="Demo scenario">
      <span className="scenario-context__label">Demo scenario</span>
      <p>
        <UserRound aria-hidden="true" size={18} />
        Maya <span aria-hidden="true">•</span> CS major
      </p>
      <p>
        <GitBranch aria-hidden="true" size={18} />
        {active ? 'CS 201 failure active' : 'No stress test yet'}
      </p>
      <p>
        <FlaskConical aria-hidden="true" size={18} />
        Synthetic fixture
      </p>
    </aside>
  )
}

export function AppShell({
  children,
  hasScenario,
  navigate,
  onReset,
  route,
}: {
  children: ReactNode
  hasScenario: boolean
  navigate: Navigate
  onReset: () => void
  route: ActiveRoute
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuDialogRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const currentIndex = navItems.findIndex((item) => item.path === route)
  const current = currentIndex >= 0 ? navItems[currentIndex] : null
  const previous = currentIndex > 0 ? navItems[currentIndex - 1] : null

  useEffect(() => {
    const dialog = menuDialogRef.current
    if (!dialog) return

    if (menuOpen && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    }

    if (!menuOpen && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="product-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="desktop-sidebar">
        <RouteLink className="brand" navigate={navigate} to="/">
          <PathBMark />
          <span>
            <strong>Path B</strong>
            <small>Degree-plan resilience</small>
          </span>
        </RouteLink>
        <ProductNavigation navigate={navigate} route={route} />
        <ScenarioContext active={hasScenario} />
      </aside>

      <header className="mobile-header">
        <RouteLink className="mobile-brand" navigate={navigate} to="/">
          <PathBMark />
          <strong>Path B</strong>
        </RouteLink>
        <span className="mobile-header__route">{current?.label ?? 'Path B'}</span>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="dialog"
          aria-label="Open navigation"
          className="icon-button"
          onClick={() => setMenuOpen(true)}
          ref={menuButtonRef}
          type="button"
        >
          <Menu aria-hidden="true" size={24} />
        </button>
      </header>

      <dialog
        aria-labelledby="mobile-menu-title"
        className="mobile-menu"
        onCancel={closeMenu}
        onClose={() => setMenuOpen(false)}
        ref={menuDialogRef}
      >
        <div className="mobile-menu__header">
          <span id="mobile-menu-title">Path B journey</span>
          <button
            aria-label="Close navigation"
            className="icon-button"
            onClick={closeMenu}
            type="button"
          >
            <X aria-hidden="true" size={24} />
          </button>
        </div>
        <ProductNavigation
          navigate={navigate}
          onNavigate={closeMenu}
          route={route}
        />
        <ScenarioContext active={hasScenario} />
      </dialog>

      <div className="workspace">
        <header className="workspace-bar">
          <div className="breadcrumb" aria-label="Breadcrumb">
            {previous ? <span>{previous.label}</span> : <span>Path B</span>}
            <span aria-hidden="true">/</span>
            <strong>{current?.label ?? 'Page not found'}</strong>
          </div>
          <div className="workspace-bar__actions">
            {current ? (
              <span className="step-count">
                {currentIndex + 1} of {navItems.length}
              </span>
            ) : null}
            {hasScenario ? (
              <button className="reset-button" onClick={onReset} type="button">
                <RotateCcw aria-hidden="true" size={16} />
                Reset scenario
              </button>
            ) : null}
          </div>
        </header>

        {current ? (
          <div className="mobile-progress" aria-hidden="true">
            <span>
              {currentIndex + 1} of {navItems.length} <b>•</b> {current.label}
            </span>
            <i className={`mobile-progress__fill mobile-progress__fill--${currentIndex + 1}`} />
          </div>
        ) : null}

        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}
