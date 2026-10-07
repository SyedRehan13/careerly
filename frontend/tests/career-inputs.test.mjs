import assert from 'node:assert/strict'
import test from 'node:test'

import { safeJobUrl } from '../src/utils/job-url.ts'
import { isApplicationStatus } from '../src/types/application.ts'
import { formatCalendarDate, getLocalDate } from '../src/utils/calendar-date.ts'

test('calendar dates retain their day on both sides of UTC', () => {
  const previousTimezone = process.env.TZ
  try {
    for (const timezone of ['America/Los_Angeles', 'Asia/Karachi']) {
      process.env.TZ = timezone
      assert.equal(formatCalendarDate('2026-10-07', 'en-US'), 'Oct 7, 2026')
      assert.equal(getLocalDate(new Date(2026, 0, 2, 0, 15)), '2026-01-02')
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ
    else process.env.TZ = previousTimezone
  }
})

test('job links allow HTTP/HTTPS and reject executable or local URLs', () => {
  assert.equal(safeJobUrl('https://example.com/jobs/1'), 'https://example.com/jobs/1')
  assert.equal(safeJobUrl('http://example.com/job'), 'http://example.com/job')
  for (const value of [null, '', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>', 'file:///C:/private', '//example.com', 'not a URL']) {
    assert.equal(safeJobUrl(value), null)
  }
})

test('application status inputs match supported backend statuses', () => {
  for (const status of ['applied', 'interviewing', 'offer', 'rejected', 'withdrawn']) {
    assert.equal(isApplicationStatus(status), true)
  }
  for (const status of ['', 'all', 'accepted', 'APPLIED']) {
    assert.equal(isApplicationStatus(status), false)
  }
})
