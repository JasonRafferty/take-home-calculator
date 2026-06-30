# Take Home Calculator

A static, client-side UK salary/take-home-pay calculator. Enter a gross
salary and optional pension %/student loan plan, and it breaks down income
tax, National Insurance, pension contribution, and student loan repayment,
shown as text and a pie chart, for weekly/monthly/annual periods.

Built with [Vite](https://vitejs.dev). Run locally:

```sh
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the dist/ build locally
```

Deployment is automatic: pushing to `main` runs
`.github/workflows/deploy.yml`, which builds with Vite and publishes
`dist/` to GitHub Pages at
`https://jasonrafferty.github.io/take-home-calculator/`. One-time manual
step required: in the repo's Settings → Pages, set **Source** to
"GitHub Actions" (otherwise the `actions/deploy-pages` step fails).

## Architecture

Vanilla JS, no framework. Each `public/js/*.js` file is an IIFE that
attaches a namespace to `window`, loaded via plain (non-module) `<script>`
tags so existing global-namespace code didn't need to change when Vite was
introduced. `public/` is Vite's static-asset directory — files there are
copied into `dist/` unchanged and referenced by root-absolute path
(`/js/...`, `/vendor/...`); `vite.config.js` sets `base:
"/take-home-calculator/"` for production builds so those paths resolve
correctly once deployed under the GitHub Pages subpath. `css/` and
`assests/` (background image) stay outside `public/` and go through Vite's
normal asset pipeline (hashed, fingerprinted) since they're referenced via
`<link>`/`url()` rather than plain `<script src>`.

Load order (set in `index.html`) matters because later files depend on
globals set by earlier ones:

1. `public/vendor/chart.min.js` — vendored copy of Chart.js (not from
   npm/CDN).
2. `public/js/config.js` — `window.TaxConfig`: tax bands, NI bands, student
   loan plan thresholds, period divisors, chart colors. **This is the only
   source of tax data** — see "Known issues" below.
3. `public/js/formatters.js` — `window.Formatters`: parsing/formatting for
   currency and percentage inputs.
4. `public/js/calculator.js` — `window.TakeHomeCalculator`: pure
   calculation functions (`calculateTakeHomePay`, `getPeriodBreakdown`,
   `isBalanced`). This is the core business logic and has no DOM
   dependency.
5. `public/js/chart.js` — `window.ChartView`: wraps Chart.js pie chart
   creation and updates.
6. `public/js/ui.js` — `window.CalculatorUI`: DOM element lookup and
   rendering (`getElements`, `renderBreakdown`, button active-state
   toggling).
7. `public/js/app.js` — wires everything together: holds UI state
   (`activePeriod`, `activeStudentLoanPlan`, `lastCalculation`), binds
   event listeners, drives calculate/clear/period-switch flows.

Tax calculation logic (`calculateBandDeduction` in `js/calculator.js`) walks
banded rates (e.g. income tax bands) applying marginal rates up to each
band's `upTo` threshold — same approach for both income tax and NI.

## Known issues / tech debt

- **Tax data is stale.** The UI footer says "Accurate to Nov 2023" and the
  bands in `js/config.js` are 2023/24 figures. UK tax bands, NI rates, and
  student loan thresholds change roughly every tax year (e.g. NI employee
  rate, Plan 2 threshold, and a Plan 5 loan type have all changed since).
  Anyone asked to "fix the calculation" should check current HMRC/SLC
  figures and update `js/config.js` (and the footer text) rather than
  assume the existing bands are still correct.
- **`data/tax-config.json` is empty and unused.** Nothing reads it; the
  real config lives in `js/config.js` as a JS object. Either wire it up as
  the actual source of truth (fetch it at load time) or delete it —
  currently it's dead weight that could mislead someone into editing the
  wrong file.
- **`vendor/chart.min.js` is hand-vendored**, not installed via a package
  manager, so there's no recorded version or way to update it except
  manually replacing the file.
- No automated tests exist, despite `js/calculator.js` being pure logic
  that's easy to unit test (no DOM, no globals mutation beyond reading
  `window.TaxConfig`).

## Tools this project would benefit from

Done:

- ~~`package.json` + npm~~ — done, see above.
- ~~Vite~~ — done, see above.
- ~~GitHub Actions deploy to GitHub Pages~~ — done (`.github/workflows/deploy.yml`).

Still worth adding, in priority order:

1. **A test runner (Vitest)** — `calculateTakeHomePay`,
   `calculateBandDeduction`, and `calculateStudentLoan` are pure functions
   doing tax-band math that's easy to get subtly wrong (boundary values,
   rounding) and easy to regression-test. Highest value, lowest effort, and
   now that `package.json` exists it's a one-line `npm install -D vitest`
   away.
2. **ESLint + Prettier** — enforce consistent style and catch bugs (the
   codebase is already consistent by hand, but this prevents drift as
   more changes land).
3. **A lint/test CI job alongside the deploy workflow** — currently
   `deploy.yml` only builds and ships; once a test runner/linter exist,
   gate the deploy (or add a separate PR-triggered workflow) on them
   passing.
4. **Replace vendored Chart.js with an npm dependency** — makes the
   Chart.js version explicit and updatable instead of a silently-aging
   committed file in `public/vendor/`.
5. **A scheduled reminder/process to refresh tax bands annually** — UK tax
   year changes every April; consider a yearly checklist or even fetching
   bands from a config file with a "last verified" date.

Things that are likely *not* worth it for a project this size: a
frontend framework (React/Vue) or TypeScript — the codebase is small and
dependency-free, and converting it would cost more than it returns unless
the feature set grows substantially.

## For future Claude sessions

- There's no test suite to run — if you change `public/js/calculator.js`,
  verify manually (`npm run dev`, try boundary salaries like £12,570,
  £50,270, £125,140) until tests exist.
- No linter to run before committing.
- `js/` and `vendor/` live under `public/` specifically so Vite copies them
  verbatim — don't move them back out to the repo root or plain
  `<script src="js/...">` tags will silently 404 in the production build
  (Vite only bundles `type="module"` scripts or processes `public/`
  contents; see "Architecture" above).
- Tax band figures in `public/js/config.js` are very likely outdated by the
  time you're reading this (frozen at 2023/24) — don't treat them as
  correct without checking, and don't be surprised if "Accurate to Nov
  2023" is inaccurate.
- `data/tax-config.json` is dead/empty — don't assume it's where tax data
  lives.
- GitHub Pages deploy requires the repo's Pages source be set to "GitHub
  Actions" in Settings (one-time manual step, not doable from a workflow
  file) — if pushes to `main` aren't showing up live, check that first.
