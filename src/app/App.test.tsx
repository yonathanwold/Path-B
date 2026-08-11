import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from './App.tsx'
import { scenarioSessionKey } from './session.ts'

async function runScenario(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('link', { name: 'Start the two-minute demo' }))
  expect(window.location.pathname).toBe('/stress-test')
  expect(
    screen.getByRole('radio', { name: /I did not pass CS 201/ }),
  ).toBeChecked()

  await user.click(screen.getByRole('button', { name: 'Run the stress test' }))
  expect(window.location.pathname).toBe('/impact')
  return screen.getByRole('heading', {
    name: "CS 201 wasn't passed. 5 planned courses must move.",
  })
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    window.sessionStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => undefined)),
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  it('introduces the routed resilience story', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: "Real life changed. Will Maya's plan hold?",
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('Degree-plan resilience')).toBeVisible()
    expect(screen.getAllByText('Synthetic fixture').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: "Review Maya's plan" })).toHaveAttribute(
      'href',
      '/plan',
    )
  })

  it('lets Maya inspect a course and its direct dependencies', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: "Review Maya's plan" }))
    await user.click(screen.getByRole('button', { name: 'CS 301' }))

    expect(
      screen.getByRole('heading', { name: 'CS 301 Algorithms' }),
    ).toBeVisible()
    expect(screen.getByText('CS 201', { selector: 'dd' })).toBeVisible()
    expect(screen.getByText('CS 450, CS 495', { selector: 'dd' })).toBeVisible()
  })

  it('runs the stress test, persists intent, and focuses the impact', async () => {
    const user = userEvent.setup()
    render(<App />)

    const heading = await runScenario(user)

    await waitFor(() => expect(heading).toHaveFocus())
    expect(
      screen.getByRole('table', {
        name: 'Earliest viable course movement by term',
      }),
    ).toBeVisible()
    expect(screen.getByText('2 courses', { selector: 'dd' })).toBeVisible()
    expect(JSON.parse(window.sessionStorage.getItem(scenarioSessionKey) ?? '{}')).toMatchObject({
      version: 1,
      scenarioId: 'maya-cs201-failure',
      priority: 'graduate-on-time',
      selectedPathId: 'faster-finish',
    })
  })

  it('changes the recommendation when Maya protects work', async () => {
    const user = userEvent.setup()
    render(<App />)
    await runScenario(user)

    await user.click(screen.getByRole('link', { name: 'Compare recovery paths' }))
    await user.click(
      screen.getByRole('radio', { name: /Keep my 20-hour work schedule/ }),
    )

    expect(screen.getByText('Recommended: Steadier load')).toBeVisible()
    expect(screen.getByRole('radio', { name: /Steadier load/ })).toBeChecked()
    expect(screen.getByText('December 2027')).toBeVisible()
    expect(screen.getByText(/Comfortable · 10-credit maximum/)).toBeVisible()
  })

  it('persists an explicit alternative through the advisor route and remount', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)
    await runScenario(user)

    await user.click(screen.getByRole('link', { name: 'Compare recovery paths' }))
    await user.click(
      screen.getByRole('radio', { name: /Keep my 20-hour work schedule/ }),
    )
    await user.click(screen.getByRole('radio', { name: /Faster finish/ }))
    await user.click(screen.getByRole('link', { name: 'Prepare advisor brief' }))

    expect(window.location.pathname).toBe('/advisor')
    expect(screen.getByText('Faster finish', { selector: 'dd' })).toBeVisible()
    expect(
      screen.getByText(/still graduate in May 2027/),
    ).toBeVisible()

    firstRender.unmount()
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Leave with one useful question.' }),
    ).toBeVisible()
    expect(screen.getByText('Faster finish', { selector: 'dd' })).toBeVisible()
    expect(screen.getByText('Verified facts ready · optional wording loading')).toBeVisible()
  })

  it('shows an honest empty state for a protected deep link without a session', () => {
    window.history.replaceState({}, '', '/impact')
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Run the scenario before opening its results.',
      }),
    ).toBeVisible()
    expect(screen.getByRole('link', { name: 'Go to Stress Test' })).toHaveAttribute(
      'href',
      '/stress-test',
    )
  })

  it('clears the scenario and returns to the stress test', async () => {
    const user = userEvent.setup()
    render(<App />)
    await runScenario(user)

    await user.click(screen.getByRole('button', { name: 'Reset scenario' }))

    expect(window.location.pathname).toBe('/stress-test')
    expect(window.sessionStorage.getItem(scenarioSessionKey)).toBeNull()
    expect(screen.getByRole('heading', { name: 'What changed?' })).toBeVisible()
  })
})
