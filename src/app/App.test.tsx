import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => undefined)),
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  it('introduces the crash-test story', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Real life changed. Will Maya\'s plan hold?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('A crash test for your college plan')).toBeVisible()
    expect(
      screen.getByRole('radio', { name: /I did not pass CS 201/ }),
    ).toBeChecked()
    expect(screen.getByText('More scenarios in a full version')).toBeVisible()
    expect(
      screen.queryByRole('radio', { name: /I lost summer availability/ }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Synthetic Great Lakes University fixture/)).toBeVisible()
  })

  it('runs the crash test and focuses the deterministic result', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Run the crash test' }))

    expect(
      screen.getByRole('heading', { name: 'Tracing the dependency chain…' }),
    ).toBeVisible()

    const resultHeading = await screen.findByRole(
      'heading',
      { name: "Maya's plan hit a fault line." },
      { timeout: 1500 },
    )

    await waitFor(() => expect(resultHeading).toHaveFocus())
    expect(
      screen.getByRole('table', {
        name: 'Faster finish course movement by term',
      }),
    ).toBeVisible()
    expect(screen.getByText('Recommended for this priority')).toBeVisible()
    expect(
      screen.getByRole('heading', { name: 'One question to ask your advisor' }),
    ).toBeVisible()
    expect(screen.getByText('Before the meeting')).toBeVisible()
    expect(
      screen.getByText('Personalizing the wording without changing plan facts.'),
    ).toBeVisible()
  })

  it('changes the recommendation when Maya protects her work schedule', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Run the crash test' }))
    await screen.findByRole(
      'heading',
      { name: "Maya's plan hit a fault line." },
      { timeout: 1500 },
    )

    await user.click(
      screen.getByRole('radio', { name: /Keep my work schedule/ }),
    )

    expect(
      screen.getByRole('radio', { name: /Steadier load/ }),
    ).toBeChecked()
    expect(
      screen.getByRole('table', {
        name: 'Steadier load course movement by term',
      }),
    ).toBeVisible()
    expect(screen.getByText('comfortable — 10-credit maximum')).toBeVisible()
    expect(
      screen.getByText(/keeps every term at 10 credits or fewer/),
    ).toHaveTextContent('December 2027 graduation')
  })

  it('lets the student inspect the other viable path without changing facts', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Run the crash test' }))
    await screen.findByRole(
      'heading',
      { name: "Maya's plan hit a fault line." },
      { timeout: 1500 },
    )

    await user.click(screen.getByRole('radio', { name: /Steadier load/ }))

    expect(
      screen.getByRole('table', {
        name: 'Steadier load course movement by term',
      }),
    ).toBeVisible()
    expect(
      screen.getByText(/Spring 2026 alongside CS 302 and CS 340/),
    ).toHaveTextContent('December 2027 graduation')
    expect(
      screen.getByText(/Viewing Steadier load as an alternative/),
    ).toHaveTextContent('Faster finish is recommended')
    expect(screen.getByText(/2 courses are blocked directly/)).toBeVisible()
  })

  it('returns to the unchanged starting plan', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Run the crash test' }))
    await screen.findByRole(
      'heading',
      { name: "Maya's plan hit a fault line." },
      { timeout: 1500 },
    )
    await user.click(screen.getByRole('button', { name: 'Start over' }))

    expect(
      screen.getByRole('heading', {
        name: 'Real life changed. Will Maya\'s plan hold?',
      }),
    ).toBeVisible()
    expect(screen.queryByText("Maya's plan hit a fault line.")).not.toBeInTheDocument()
  })
})
