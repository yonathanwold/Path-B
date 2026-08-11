import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function expectNoPageOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)
}

async function expectRouteAtTop(page: Page) {
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
}

async function expectImpactVisualization(page: Page) {
  if ((page.viewportSize()?.width ?? 0) <= 760) {
    await expect(
      page.getByRole('list', { name: 'Course movement in chronological order' }),
    ).toBeVisible()
    return
  }

  await expect(
    page.getByRole('table', { name: 'Earliest viable course movement by term' }),
  ).toBeVisible()
}

async function expectActiveRoute(page: Page, name: string) {
  if ((page.viewportSize()?.width ?? 0) <= 1020) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('dialog', { name: 'Path B journey' })).toBeVisible()
    await expect(page.getByRole('link', { name })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Path B journey' })).toBeHidden()
    return
  }

  await expect(page.getByRole('link', { name })).toHaveAttribute(
    'aria-current',
    'page',
  )
}

test('Maya can follow the routed resilience story and keep her decision', async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(String(error)))

  await page.goto('/')

  await expect(page).toHaveTitle('Overview — Path B')
  await expect(
    page.getByRole('heading', {
      name: "Real life changed. Will Maya's plan hold?",
    }),
  ).toBeVisible()
  await expectActiveRoute(page, 'Overview')
  await expectNoPageOverflow(page)

  await page.getByRole('link', { name: "Review Maya's plan" }).click()
  await expect(page).toHaveURL(/\/plan$/)
  await expect(
    page.getByRole('heading', {
      name: 'Maya is on track—if one spring-only course holds.',
    }),
  ).toBeFocused()
  await expect(page.getByText('Viable as planned')).toBeVisible()
  await expect(page.getByText('Vulnerable hinge').first()).toBeVisible()

  await page.getByRole('link', { name: 'Stress-test this plan' }).click()
  await expect(page).toHaveURL(/\/stress-test$/)
  await expectRouteAtTop(page)
  await expect(
    page.getByRole('radio', { name: /I did not pass CS 201/ }),
  ).toBeChecked()

  await page.getByRole('button', { name: 'Run the stress test' }).click()
  await expect(page).toHaveURL(/\/impact$/)
  await expectRouteAtTop(page)
  const impactHeading = page.getByRole('heading', {
    name: "CS 201 wasn't passed. 5 planned courses must move.",
  })
  await expect(impactHeading).toBeFocused()
  await expectImpactVisualization(page)
  await expect(page.getByText('2 courses', { exact: true })).toBeVisible()
  await expect(page.getByText('May 2027', { exact: true })).toBeVisible()
  await expectNoPageOverflow(page)

  await page.reload()
  await expect(impactHeading).toBeVisible()
  await expectImpactVisualization(page)

  await page.getByRole('link', { name: 'Compare recovery paths' }).click()
  await expect(page).toHaveURL(/\/paths$/)
  await page
    .getByRole('radio', { name: /Keep my 20-hour work schedule/ })
    .check()
  await expect(page.getByText('Recommended: Steadier load')).toBeVisible()
  await expect(page.getByRole('radio', { name: /Steadier load/ })).toBeChecked()
  await expect(page.getByText('December 2027', { exact: true })).toBeVisible()

  await page.getByRole('radio', { name: /Faster finish/ }).check()
  await expect(page.getByText('Maya selected Faster finish.')).toBeVisible()

  await page.getByRole('link', { name: 'Prepare advisor brief' }).click()
  await expect(page).toHaveURL(/\/advisor$/)
  await expect(
    page.getByRole('heading', { name: 'Leave with one useful question.' }),
  ).toBeFocused()
  await expect(page.locator('blockquote')).toContainText('still graduate in May 2027')
  await expect(page.getByText(/Plan facts and recommendations are deterministic/)).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/paths$/)
  await expect(page.getByRole('radio', { name: /Faster finish/ })).toBeChecked()
  await expect(
    page.getByRole('radio', { name: /Keep my 20-hour work schedule/ }),
  ).toBeChecked()

  if ((page.viewportSize()?.width ?? 0) <= 1020) {
    await page.getByRole('button', { name: 'Open navigation' }).click()
    await expect(page.getByRole('dialog', { name: 'Path B journey' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Path B journey' })).toBeHidden()
  }

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])
  expect(browserErrors).toEqual([])
})

test('a protected deep link without scenario state fails honestly', async ({ page }) => {
  await page.goto('/impact')

  await expect(
    page.getByRole('heading', {
      name: 'Run the scenario before opening its results.',
    }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to Stress Test' })).toHaveAttribute(
    'href',
    '/stress-test',
  )
  await expectNoPageOverflow(page)
})
