// Browser-only fixture data. All service requests are intercepted; no real accounts are used.
// See frontend/DESIGN.md for setup. Screenshots go into ignored node_modules/.cache.
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('../node_modules/.cache/careerly-browser/node_modules/playwright')
const {
  default: AxeBuilder,
} = require('../node_modules/.cache/careerly-browser/node_modules/@axe-core/playwright')
const baseURL = process.env.CAREERLY_UI_URL || 'http://127.0.0.1:5174'
const reviewWidths = process.argv.includes('--interactions-only') ? [] : [1440, 1280, 1024, 768, 430, 390]
const authOnly = process.argv.includes('--auth-only')
const output = resolve('node_modules/.cache/careerly-browser/screenshots')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  args: ['--disable-gpu'],
  executablePath:
    process.env.CAREERLY_BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
})
const errors = []
const accessibilityIssues = []
const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'alex@example.test',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2026-09-01T09:00:00Z',
  email_confirmed_at: '2026-09-01T09:00:00Z',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Alex Morgan' },
}
const today = new Date()
const localDate = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-')
const token = [
  'eyJhbGciOiJIUzI1NiJ9',
  Buffer.from(
    JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 86400 }),
  ).toString('base64url'),
  'fixture',
].join('.')
const session = {
  access_token: token,
  refresh_token: 'fixture-refresh',
  token_type: 'bearer',
  expires_in: 86400,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  user,
}
const fixtureApplications = [
  {
    id: 'a1',
    title: 'Product designer',
    company: 'Example Studio',
    location: 'Remote',
    status: 'interviewing',
    applied_date: localDate,
    follow_up_date: localDate,
    notes: 'Discuss the product team and prepare a few questions.',
  },
  {
    id: 'a2',
    title: 'Frontend engineer',
    company: 'Sample Labs',
    location: 'Riyadh, Saudi Arabia',
    status: 'applied',
    applied_date: localDate,
    follow_up_date: null,
    notes: null,
  },
  {
    id: 'a3',
    title: 'Design engineer',
    company: 'Demo Works',
    location: 'Hybrid',
    status: 'offer',
    applied_date: null,
    follow_up_date: localDate,
    notes: null,
  },
  {
    id: 'a4',
    title: 'A very long job title to verify wrapping on compact mobile screens',
    company: 'An unusually long company name for layout verification',
    location: 'Karachi, Pakistan',
    status: 'rejected',
    applied_date: localDate,
    follow_up_date: null,
    notes: 'LongWord'.repeat(40),
  },
].map((item) => ({
  ...item,
  user_id: user.id,
  job_url: 'https://example.test/job',
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
}))
let applications = structuredClone(fixtureApplications)
let jobs = [
  {
    id: 'j1',
    user_id: user.id,
    title: 'Senior frontend engineer',
    company: 'Example Studio',
    location: 'Remote',
    description: 'An opportunity to build thoughtful software.',
    job_url: 'https://example.test/job',
    created_at: '2026-10-01T10:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
]
let profile = {
  id: user.id,
  full_name: 'Alex Morgan',
  headline: 'Building thoughtful digital products',
  location: 'Karachi, Pakistan',
  bio: 'Curious about meaningful work and good teams.',
  created_at: user.created_at,
  updated_at: user.created_at,
}
let failRead = false
let failWrite = false
let loginError = false
let observedWrites = 0

async function setup(authenticated) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  })
  if (authenticated)
    await context.addInitScript(
      (value) => localStorage.setItem('sb-careerly-ui-test-auth-token', JSON.stringify(value)),
      session,
    )
  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin === baseURL) return route.continue()
    const json = (body, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.hostname === 'careerly-ui-test.supabase.co') {
      if (url.pathname.endsWith('/token'))
        return loginError ? json({ msg: 'Invalid login credentials' }, 400) : json(session)
      if (url.pathname.endsWith('/signup')) return json({ user, session: null })
      if (url.pathname.endsWith('/logout')) return json({})
      if (url.pathname.endsWith('/user')) return json(user)
      return json({})
    }
    if (url.hostname !== '127.0.0.1' || url.port !== '8001')
      throw new Error('Unexpected external request: ' + url.origin)
    if (url.pathname === '/health') return json({ status: 'ok' })
    if (request.method() === 'GET' && failRead)
      return json({ detail: 'Temporary test failure' }, 503)
    if (request.method() !== 'GET' && failWrite)
      return json({ detail: 'Temporary test failure' }, 503)
    if (url.pathname.endsWith('/dashboard/summary')) {
      const counts = { applied: 0, interviewing: 0, offer: 0, rejected: 0, withdrawn: 0 }
      applications.forEach((item) => counts[item.status]++)
      return json({
        as_of_date: localDate,
        saved_jobs_count: jobs.length,
        total_applications: applications.length,
        active_applications: counts.applied + counts.interviewing + counts.offer,
        applications_by_status: counts,
        recent_applications: applications.slice(0, 5),
        upcoming_follow_ups: applications
          .filter(
            (item) =>
              item.follow_up_date &&
              item.follow_up_date >= localDate &&
              ['applied', 'interviewing', 'offer'].includes(item.status),
          )
          .slice(0, 5),
      })
    }
    if (url.pathname.endsWith('/profile')) {
      if (request.method() === 'PATCH') {
        observedWrites++
        profile = { ...profile, ...request.postDataJSON() }
      }
      return json(profile)
    }
    const isApplication = url.pathname.includes('/applications')
    const records = isApplication ? applications : jobs
    if (request.method() === 'GET') {
      const filtered = url.searchParams.has('status')
        ? records.filter((item) => item.status === url.searchParams.get('status'))
        : records
      const offset = Number(url.searchParams.get('offset') || 0)
      return json(filtered.slice(offset, offset + Number(url.searchParams.get('limit') || 100)))
    }
    observedWrites++
    if (request.method() === 'POST') {
      const item = {
        ...request.postDataJSON(),
        id: String(Date.now()),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      records.unshift(item)
      return json(item, 201)
    }
    const index = records.findIndex((item) => item.id === url.pathname.split('/').at(-1))
    if (request.method() === 'PATCH') {
      records[index] = { ...records[index], ...request.postDataJSON() }
      return json(records[index])
    }
    if (request.method() === 'DELETE') {
      records.splice(index, 1)
      return route.fulfill({ status: 204 })
    }
    return json({ detail: 'Unmatched test request' }, 404)
  })
  const page = await context.newPage()
  page.setDefaultTimeout(60000)
  page.on('pageerror', (error) => errors.push(error.message))
  return { context, page }
}

async function ready(page, route) {
  if (!page.url().startsWith(baseURL)) await page.goto(baseURL + route)
  else
    await page.evaluate((path) => {
      history.pushState({}, '', path)
      dispatchEvent(new PopStateEvent('popstate'))
    }, route)
  const headings = {
    '/app': 'Welcome back',
    '/app/jobs': 'Your saved opportunities',
    '/app/applications': 'Your applications',
    '/app/profile': 'Your profile',
    '/app/resume': 'Resume workspace',
    '/app/interview': 'Interview preparation',
    '/': 'Your next',
    '/login': 'Good to have you back.',
    '/signup': 'Make your next move.',
    '/auth/confirmed': 'Continue to your workspace.',
    '/page-does-not-exist': "Let's find your way back.",
  }
  await page.locator('h1').filter({ hasText: headings[route] }).waitFor()
  await page.locator('.skeleton').first().waitFor({ state: 'hidden' })
  await page.evaluate(() => document.fonts.ready)
}

async function checkAccessibility(page, label) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  for (const violation of result.violations) {
    const issue = {
      page: label,
      id: violation.id,
      nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }
    accessibilityIssues.push(issue)
    console.log('Accessibility issue: ' + JSON.stringify(issue))
  }
}

async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  assert.ok(
    sizes.scroll <= sizes.width + 1,
    label + ' has horizontal overflow: ' + JSON.stringify(sizes),
  )
}

try {
  if (!authOnly) {
  const { context, page } = await setup(true)
  for (const width of reviewWidths) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of [
      '/app',
      '/app/jobs',
      '/app/applications',
      '/app/resume',
      '/app/interview',
      '/app/profile',
    ]) {
      await ready(page, route)
      await noOverflow(page, route + ' at ' + width)
      assert.equal(await page.locator('h1').count(), 1)
      if (width === 1440 || width === 390) await checkAccessibility(page, route + ' at ' + width)
      if ([1440, 390].includes(width))
        await page.screenshot({
          path: resolve(output, route.replaceAll('/', '_') + '-' + width + '.png'),
          fullPage: true,
        })
    }
    console.log('Protected layouts passed at ' + width + 'px')
  }
  await page.setViewportSize({ width: 1280, height: 650 })
  await ready(page, '/app')
  assert.ok(
    await page.locator('.desktop-sidebar').evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    'Desktop sidebar should fit at 1280x650',
  )
  await page.setViewportSize({ width: 390, height: 700 })
  await ready(page, '/app')
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  assert.ok(
    await page.locator('dialog.mobile-drawer .sidebar').evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
    'Mobile sidebar should fit at 390x700',
  )
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 390, height: 1000 })
  await ready(page, '/app/profile')
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  assert.equal(await page.locator('dialog.mobile-drawer').evaluate((el) => el.open), true)
  await page.keyboard.press('Escape')
  assert.equal(
    await page
      .getByRole('button', { name: 'Open navigation', exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  )
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await page.locator('dialog').getByRole('link', { name: 'Saved jobs', exact: true }).click()
  await page.locator('h1').filter({ hasText: 'Your saved opportunities' }).waitFor()
  assert.equal(await page.locator('dialog.mobile-drawer').evaluate((el) => el.open), false)
  // Dashboard shortcuts must open useful destinations without an extra click.
  await ready(page, '/app')
  await page.getByRole('link', { name: 'Track application', exact: true }).click()
  await page.locator('dialog.modal').waitFor({ state: 'visible' })
  assert.equal(new URL(page.url()).searchParams.get('action'), 'new')
  await page.keyboard.press('Escape')
  await page.locator('dialog.modal').waitFor({ state: 'hidden' })
  assert.equal(new URL(page.url()).searchParams.has('action'), false)
  await page.reload()
  await page.getByRole('heading', { name: 'Your applications', exact: true }).waitFor()
  assert.equal(await page.locator('dialog.modal').count(), 0)
  await ready(page, '/app')
  await page.locator('.stat-card').filter({ hasText: 'Interviewing' }).click()
  await page.getByRole('button', { name: 'Interviewing', exact: true, pressed: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Interviewing', exact: true }).getAttribute('aria-pressed'), 'true')
  await page.locator('.skeleton').first().waitFor({ state: 'hidden' })
  assert.equal(await page.locator('.job-card').count(), 1)
  await page.reload()
  await page.getByRole('button', { name: 'Interviewing', exact: true, pressed: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Interviewing', exact: true }).getAttribute('aria-pressed'), 'true')
  await ready(page, '/app')
  await page.getByRole('link', { name: 'Save a job', exact: true }).click()
  await page.locator('dialog.modal').waitFor({ state: 'visible' })
  await page.keyboard.press('Escape')
  await page.locator('dialog.modal').waitFor({ state: 'hidden' })
  assert.equal(new URL(page.url()).searchParams.has('action'), false)
  await page.getByRole('searchbox').fill('does not exist')
  await page.getByRole('heading', { name: 'Nothing matched this time' }).waitFor()
  await page.getByRole('button', { name: 'Clear search' }).click()
  await page.getByRole('button', { name: 'Save a job', exact: true }).click()
  const modal = page.locator('dialog.modal')
  await modal.waitFor({ state: 'visible' })
  assert.equal(await page.locator('#job-title').evaluate((element) => element === document.activeElement), true, 'New job dialog focuses the title field')
  await checkAccessibility(page, 'Save opportunity dialog')
  await page.keyboard.press('Shift+Tab')
  assert.equal(await modal.evaluate((element) => element.contains(document.activeElement)), true)
  await page.screenshot({ path: resolve(output, 'save-dialog-mobile.png'), fullPage: true })
  await noOverflow(page, 'Mobile save dialog')
  await page.getByLabel('Job title', { exact: false }).fill('UI review role')
  await page.getByLabel('Company', { exact: false }).fill('Fixture Company')
  failWrite = true
  await modal.getByRole('button', { name: 'Save job', exact: true }).click()
  await modal.getByRole('alert').waitFor()
  assert.equal(await page.getByLabel('Job title', { exact: false }).inputValue(), 'UI review role')
  failWrite = false
  await modal.getByRole('button', { name: 'Save job', exact: true }).click()
  await modal.waitFor({ state: 'hidden' })
  await page.getByRole('heading', { name: 'UI review role', exact: true }).waitFor()
  await page
    .getByRole('button', { name: 'Delete UI review role at Fixture Company', exact: true })
    .click()
  await page.getByRole('button', { name: 'Keep it', exact: true }).click()
  assert.ok(jobs.some((item) => item.title === 'UI review role'))
  await page
    .getByRole('button', { name: 'Delete UI review role at Fixture Company', exact: true })
    .click()
  await page.getByRole('button', { name: 'Confirm delete' }).click()
  await page
    .getByRole('heading', { name: 'UI review role', exact: true })
    .waitFor({ state: 'hidden' })
  await ready(page, '/app/applications')
  await page.getByRole('searchbox', { name: 'Search applications on this page' }).fill('Frontend')
  await page.getByRole('heading', { name: 'Product designer', exact: true }).waitFor({ state: 'hidden' })
  assert.equal(await page.locator('.job-card').count(), 1)
  await page.getByRole('searchbox').fill('no matching role')
  await page.getByRole('heading', { name: 'No matching applications' }).waitFor()
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await page.getByRole('heading', { name: 'Product designer', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Interviewing', exact: true }).click()
  await page
    .getByRole('heading', { name: 'Frontend engineer', exact: true })
    .waitFor({ state: 'hidden' })
  await page
    .getByRole('button', {
      name: 'Edit application for Product designer at Example Studio',
      exact: true,
    })
    .click()
  await page.getByRole('combobox', { name: /Status/ }).selectOption('offer')
  await page.getByLabel('Follow-up date').fill('')
  await modal.getByRole('button', { name: 'Save changes', exact: true }).click()
  await modal.waitFor({ state: 'hidden' })
  await page.waitForURL(baseURL + '/app/applications?status=offer')
  // URL updates can precede React's rendered navigation state.
  await page.getByRole('button', { name: 'Offer', exact: true, pressed: true }).waitFor()
  assert.equal(
    await page.getByRole('button', { name: 'Offer', exact: true }).getAttribute('aria-pressed'),
    'true',
  )
  assert.equal(applications.find((item) => item.id === 'a1').follow_up_date, null)
  await ready(page, '/app/profile')
  await page.getByLabel('Headline', { exact: true }).fill('A revised headline')
  await page.locator('.profile-identity').getByText('A revised headline', { exact: true }).waitFor()
  await page.getByText('You have unsaved changes', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.getByText('Your profile is up to date.').waitFor()
  assert.equal(profile.headline, 'A revised headline')
  applications = []
  jobs = []
  for (const route of ['/app', '/app/jobs', '/app/applications']) {
    await ready(page, route)
    await page.screenshot({
      path: resolve(output, route.replaceAll('/', '_') + '-empty.png'),
      fullPage: true,
    })
    await noOverflow(page, route + ' empty')
  }
  failRead = true
  await ready(page, '/app/jobs')
  await page.getByRole('alert').waitFor()
  await page.screenshot({ path: resolve(output, 'error-mobile.png'), fullPage: true })
  failRead = false
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await page.getByRole('heading', { name: 'Good things are worth saving' }).waitFor()
  await context.close()
  console.log('Mobile navigation, dialogs, CRUD, filters, empty states, error recovery passed')
  }

  const guest = await setup(false)
  for (const width of reviewWidths) {
    const height = authOnly ? (width <= 430 ? 844 : width === 1280 ? 720 : 768) : 1000
    await guest.page.setViewportSize({ width, height })
    for (const route of (authOnly ? ['/login', '/signup'] : ['/', '/login', '/signup', '/auth/confirmed', '/page-does-not-exist'])) {
      await ready(guest.page, route)
      await noOverflow(guest.page, route + ' at ' + width)
      if (authOnly) {
        const fits = await guest.page.evaluate(() =>
          document.documentElement.scrollHeight <= window.innerHeight + 1,
        )
        assert.ok(fits, `${route} should fit without vertical scrolling at ${width}x${height}`)
      }
      if (width === 1440 || width === 390)
        await checkAccessibility(guest.page, route + ' at ' + width)
      if ([1440, 390].includes(width))
        await guest.page.screenshot({
          path: resolve(
            output,
            (route === '/' ? 'landing' : route.replaceAll('/', '_')) + '-' + width + '.png',
          ),
          fullPage: true,
        })
    }
    console.log('Public layouts passed at ' + width + 'px')
  }
  await guest.page.setViewportSize({ width: 390, height: 1000 })
  await ready(guest.page, '/signup')
  await guest.page.getByLabel('Full name', { exact: true }).fill('New Person')
  await guest.page.getByLabel('Email address', { exact: true }).fill('new@example.test')
  await guest.page.getByLabel('Password', { exact: true }).fill('example-password')
  await guest.page.getByLabel('Confirm password', { exact: true }).fill('different-password')
  await guest.page.getByRole('button', { name: 'Create your account', exact: true }).click()
  await guest.page.getByRole('alert').waitFor()
  await guest.page.getByRole('button', { name: 'Show password', exact: true }).click()
  assert.equal(
    await guest.page.getByLabel('Password', { exact: true }).getAttribute('type'),
    'text',
  )
  await guest.page.getByRole('button', { name: 'Hide password', exact: true }).click()
  await guest.page.getByLabel('Confirm password', { exact: true }).fill('example-password')
  await guest.page.getByRole('button', { name: 'Create your account', exact: true }).click()
  await guest.page
    .getByText('Check your email to confirm your account.', { exact: false })
    .waitFor()
  await ready(guest.page, '/login')
  loginError = true
  await guest.page.getByLabel('Email address', { exact: true }).fill(user.email)
  await guest.page.getByLabel('Password', { exact: true }).fill('example-password')
  await guest.page.getByRole('button', { name: 'Log in to your workspace' }).click()
  await guest.page.getByRole('alert').waitFor()
  loginError = false
  await guest.page.getByRole('button', { name: 'Log in to your workspace' }).click()
  await guest.page.waitForURL(baseURL + '/app')
  await guest.page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await guest.page.locator('dialog').getByRole('button', { name: 'Log out', exact: true }).click()
  await guest.page.waitForURL(baseURL + '/login')
  await guest.context.close()
  if (!authOnly) assert.ok(observedWrites >= 4)
  assert.deepEqual(errors, [], 'Browser runtime errors')
  assert.deepEqual(accessibilityIssues, [], 'Automated accessibility findings')
  console.log(
    `PASS: ${authOnly ? 'auth' : 'all'} layouts at ${reviewWidths.length} widths; ${authOnly ? 'auth' : 'CRUD and auth'} flows; no horizontal overflow, accessibility findings, or runtime errors.`,
  )
  console.log('Screenshots: ' + output)
} finally {
  await browser.close()
}
