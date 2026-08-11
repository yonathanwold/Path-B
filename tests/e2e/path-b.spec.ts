import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function expectActivePlan(page: Page, name: string) {
  if ((page.viewportSize()?.width ?? 0) < 700) {
    await expect(
      page.getByRole('list', { name: `${name} course movement by term, mobile view` }),
    ).toBeVisible()
    return
  }

  await expect(
    page.getByRole('table', { name: `${name} course movement by term` }),
  ).toBeVisible()
}

test('Maya can compare resilient paths and leave with a specific question', async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(String(error)))

  await page.goto('/')

  await expect(page).toHaveTitle(/Path B/)
  await expect(
    page.getByRole('heading', {
      name: "Real life changed. Will Maya's plan hold?",
    }),
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: /I did not pass CS 201/ })).toBeChecked()
  await expect(page.getByRole('radio', { name: /I lost summer availability/ })).toBeDisabled()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true)

  await page.getByRole('button', { name: 'Run the crash test' }).click()

  const resultHeading = page.getByRole('heading', {
    name: "Maya's plan hit a fault line.",
  })
  await expect(resultHeading).toBeFocused()
  await expectActivePlan(page, 'Faster finish')

  await page.getByRole('radio', { name: /Keep my work schedule/ }).check()

  await expect(page.getByRole('radio', { name: /Steadier load/ })).toBeChecked()
  await expectActivePlan(page, 'Steadier load')
  await expect(page.locator('.advisor-question blockquote')).toContainText(
    'keeps every term at 10 credits or fewer',
  )
  await expect(page.locator('.advisor-question blockquote')).toContainText(
    'December 2027 graduation',
  )

  await page.getByRole('radio', { name: /Faster finish/ }).check()

  await expect(page.locator('.advisor-question blockquote')).toContainText(
    'still graduate in May 2027',
  )
  await expectActivePlan(page, 'Faster finish')

  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(accessibility.violations).toEqual([])
  expect(browserErrors).toEqual([])
})
