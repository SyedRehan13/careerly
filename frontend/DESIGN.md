# Careerly frontend

The visual system uses white surfaces, charcoal (#292929) actions and navigation, dark charcoal (#252525) feature panels, and light gray backgrounds. Brand elements, links, icons, focus rings, and illustrations use neutral grays. Small amber, violet, and red accents are reserved for application statuses and warning/error feedback. Tokens and reusable styles live in `src/index.css`. Lucide remains the only icon library. The Careerly mark is a small SVG, with a matching charcoal favicon.

## Route coverage

- Landing: explains the capabilities available today, with a clearly labeled sample workspace, three practical feature cards, and account creation links.
- Login/sign-up: framed charcoal editorial panel, illustrated workspace, white form card, working account-mode navigation, field icons, password visibility and signup requirements, validation and submission feedback. Login and signup have distinct welcome copy. At tablet and phone widths, the form takes priority. Height-aware spacing and reduced decoration keep the forms within typical laptop and phone screens; very short screens, validation messages, and zoom can still scroll to keep content accessible. Auth-specific styles live in `src/styles/auth.css`.
- Email confirmation: loading, error, signed-in and signed-out states. A direct visit without a session does not claim that verification succeeded.
- Overview: charcoal welcome banner, four clickable live summary cards, proportional status distribution, recent applications, upcoming follow-ups, and an actionable next step. Save-job and track-application shortcuts open their forms immediately.
- Saved jobs: bordered search toolbar, responsive cards, saved labels, expandable descriptions, page-scoped search, creation/editing dialogs, deletion confirmation, and a shortcut to track an application.
- Applications: searchable current-page results, the existing five backend statuses, grouped status filters, date panels, notes, creation/editing dialogs and deletion confirmation. Searches reset on status/page changes and after a save.
- Profile: live career profile preview, an optional-details progress indicator, explicit unsaved/save feedback, and clearly separated account details.
- Resume/interview preparation: charcoal feature panels with clearly marked planned capabilities, practical preparation guides, and working links to profile/interviewing applications.
- Account messages and missing pages: shared branded layout, responsive confirmation/error panels, and working navigation back to the website or workspace.

No discovery API, scheduled interviews, resume uploads, AI tools, company pages, or application history were added. Displayed account information still comes from the existing authenticated services. Searches on saved jobs and applications explicitly cover the currently loaded page; application status filters retain server-side filtering and pagination.

Application status filters are reflected in `?status=interviewing` (or another supported status), so dashboard cards and pipeline labels lead directly to the relevant list and survive refresh. `?action=new` opens a creation dialog on applications or saved jobs. The shared `useWorkspaceEditor` hook clears that action on save or dismissal so refresh does not reopen a finished form.

## Shared patterns

`WorkspaceUI.tsx` contains status badges, company initials, empty/loading/error states, save feedback and delete confirmation. `Modal.tsx` uses the browser's native dialog for focus containment and Escape handling, restores focus, locks background scrolling, and prevents dismissal while saving. The mobile sidebar uses the same native dialog behavior.

Button classes are `btn` plus `btn-primary`, `btn-secondary`, `btn-ghost`, or `btn-danger`. Inputs use `field` and `field-label`. Reuse the shared patterns when adding features. Motion respects reduced-motion preferences; keyboard focus remains visible.

Routes load on demand. Auth and React dependencies are grouped into separately cacheable build chunks. There are no added production dependencies, image downloads, or external font requests.

## Validation

From `frontend`:

```powershell
npm.cmd run lint
npm.cmd run build
node --experimental-strip-types --test tests/career-inputs.test.mjs
```

The optional browser review runs against fixtures with all service requests intercepted. It never needs real credentials or writes to the real backend.

Install its tools into an ignored directory:

```powershell
npm.cmd install --prefix node_modules/.cache/careerly-browser --no-save --package-lock=false playwright @axe-core/playwright
```

Start an isolated development server in a separate terminal using test-only environment overrides:

```powershell
$env:VITE_SUPABASE_URL='https://careerly-ui-test.supabase.co'
$env:VITE_SUPABASE_PUBLISHABLE_KEY='ui-test-public-key'
$env:VITE_API_BASE_URL='http://127.0.0.1:8001'
npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Then run `node tests/ui-review.mjs` from `frontend`. Chrome's standard Windows installation is used by default; set `CAREERLY_BROWSER_PATH` to another Chromium executable if necessary. Screenshots are written under ignored `node_modules/.cache/careerly-browser/screenshots`.

The browser review covers all pages at 1440, 1280, 1024, 768, 430 and 390 pixels, horizontal overflow, mobile navigation, dialogs, form feedback, mutations, status filters and authentication flows. Fixtures verify frontend behavior; the real Supabase/backend workflow should still receive a signed-in smoke test before release.

Close the isolated preview terminal when finished; its environment overrides are scoped to that process and do not edit `.env` files.
