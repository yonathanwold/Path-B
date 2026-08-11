import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('App', () => {
  it('introduces the crash-test story', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Real life changed. Will Maya\'s plan hold?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('A crash test for your college plan')).toBeVisible()
  })
})
