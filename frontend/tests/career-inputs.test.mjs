import assert from 'node:assert/strict'
import test from 'node:test'

import { safeJobUrl } from '../src/utils/job-url.ts'
import { isApplicationStatus } from '../src/types/application.ts'

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
