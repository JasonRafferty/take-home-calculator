# Tax bands as fetched JSON, not hardcoded JS

## Problem

`public/js/config.js` hardcodes UK income tax bands, National Insurance
bands, and student loan plan thresholds directly in a JS object
(`window.TaxConfig`). These figures change every UK tax year (6 April),
but updating them currently means editing JS source and shipping a full
rebuild. The values in the repo are frozen at 2023/24 and are now stale.
Separately, `data/tax-config.json` exists at the repo root but is empty,
unused, and not served by Vite (it lives outside `public/`) — dead weight
left over from an earlier, unfinished attempt at this.

## Goals

- Move the yearly-changing figures (income tax bands, NI bands, student
  loan Plan 1/2 thresholds) out of JS and into a data file, fetched at
  runtime, so future updates are a data-only change.
- Refresh those figures to the current 2026/27 tax year while doing so.
- Remove the dead `data/tax-config.json` file.
- Keep UI-only config (`periods`, `chart` labels/colors) in `config.js` —
  it isn't tax data and doesn't need to be externalized.

## Non-goals

- No live/external API call. There is no public HMRC/gov.uk API that
  serves these figures as structured data for this purpose; the
  "external source" is a JSON file we maintain ourselves.
- No new student loan plans (Plan 4, Plan 5, Postgraduate) — the UI only
  exposes Plan 1/2 today, so only those two get refreshed. Adding more
  plans is a separate UI feature.
- No historical/multi-year support — only the current year's figures are
  stored.

## Design

**New file: `public/data/tax-bands.json`**

Lives under `public/` (not repo-root `data/`) so Vite copies it verbatim
and it's fetchable at `/data/tax-bands.json` in both dev and the
production build, same as `js/` and `vendor/`.

```json
{
  "taxYear": "2026/27",
  "lastVerified": "2026-06-30",
  "incomeTaxBands": [
    { "upTo": 12570, "rate": 0 },
    { "upTo": 50270, "rate": 0.2 },
    { "upTo": 125140, "rate": 0.4 },
    { "upTo": null, "rate": 0.45 }
  ],
  "nationalInsuranceBands": [
    { "upTo": 12570, "rate": 0 },
    { "upTo": 50270, "rate": 0.08 },
    { "upTo": null, "rate": 0.02 }
  ],
  "studentLoanPlans": {
    "plan1": { "threshold": 26900, "rate": 0.09 },
    "plan2": { "threshold": 29385, "rate": 0.09 }
  }
}
```

JSON has no `Infinity` literal, so the top band's `upTo` is `null` and is
converted to `Infinity` on load (the calculator's banded-deduction logic
already relies on `Infinity` as the top bound).

Sourced from gov.uk on 2026-06-30:
[Income Tax rates and Personal Allowances](https://www.gov.uk/income-tax-rates),
[Rates and thresholds for employers 2026 to 2027](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027).
Student loan thresholds confirmed via web search of 2026/27 repayment
threshold reporting.

The repo-root `data/tax-config.json` (empty, unused) is deleted.

**`public/js/config.js`**

Keeps `window.TaxConfig.periods` and `window.TaxConfig.chart` as
hardcoded UI config (unchanged — not tax data, doesn't need externalizing).
Gains a `loadBands()` function: fetches `data/tax-bands.json`, parses it,
converts `upTo: null` → `Infinity` in both band arrays, and assigns
`incomeTaxBands` / `nationalInsuranceBands` / `studentLoanPlans` /
`taxYear` / `lastVerified` onto `window.TaxConfig`. Returns the promise
chain so callers can await it.

**`public/js/app.js`**

Init becomes async: before `bindEvents()` / `clearCalculator()` run, the
app awaits `window.TaxConfig.loadBands()`.

- While loading: calculate button is disabled, shows "Loading…".
- On success: button re-enabled, normal init proceeds, footer text is set
  from `window.TaxConfig.taxYear`.
- On failure (network error, bad JSON): button stays disabled, footer
  shows an error message. The app does not fall back to silently
  calculating with missing/undefined band data.

**`public/js/ui.js` / `index.html`**

The footer `<p class="accurate">Accurate to Nov 2023</p>` text becomes
dynamic: `index.html` keeps the element (empty or with a neutral
placeholder), and `CalculatorUI` gains a small setter the app calls once
bands are loaded (or failed) to fill in "Accurate to tax year 2026/27" or
the error text.

**README**

Remove the two now-resolved "Known issues" bullets (stale hardcoded
data, dead unused JSON file) and update the architecture section's
description of `config.js` / load order to mention the new fetch step.

## Testing

No test runner exists in this repo (per README). Manual verification via
`npm run dev`:

- Confirm bands load and a calculation at a boundary salary (e.g.
  £50,270) matches expected output under the new NI rate/threshold.
- Confirm the calculate button is disabled until load completes.
- Simulate a fetch failure (e.g. temporarily rename the JSON file) and
  confirm the error state shows instead of silently miscalculating.
- Confirm `npm run build && npm run preview` serves `/data/tax-bands.json`
  correctly under the production base path.
