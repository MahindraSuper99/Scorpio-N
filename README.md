# Scorpio-N Rhino Edition — Dealer Survey

A short, mobile-first, multi-step survey for dealers, built to be reached via
QR code and completed in a couple of minutes on a phone. Plain HTML/CSS/JS —
no build step, no framework, deploy anywhere that serves static files.

Screen flow: **Welcome → Step 1 (Survey Questions) → Step 2 (Accessories &
Feedback) → Thank you**, with a progress stepper shown on steps 1–2.

## Files

- `index.html` — the survey markup (all screens)
- `styles.css` — styling, following the Mahindra Survey CI spec supplied for
  this project (colors, Manrope typeface, stepper/button/card/table
  treatments)
- `script.js` — step navigation, province→dealership cascading, the
  accessory list and live price totals, validation, submit
- `dealers.json` — dealership options, grouped by province

## Before going live

1. **Dealer list — done.** `dealers.json` holds the full 104-dealer list from
   the supplied store-locator spreadsheet, grouped by its own "Province"
   column (9 SA provinces plus Botswana, Namibia, Swaziland, Zimbabwe, and a
   "SADC" group for a couple of entries filed that way in the source data).
   The province dropdown is generated from this file's keys, so re-run the
   same grouping if the source list is updated.
2. **Accessory prices** — the 12 accessories and their ex-VAT prices are
   defined in the `ACCESSORIES` array at the top of `script.js`. Update
   prices there if they change; the per-item table, the "full set" reference
   total, and the live selection subtotal all derive from that one array.
3. **Logo asset — done.** `mahindra-icon.png` is the real "twin-wing" mark,
   cropped from the supplied `mahindra-logo-source.jpg` (wordmark cropped
   out, white background made transparent so it sits cleanly on both the red
   header and white cards). Referenced via `<img class="brand-icon">` in
   `index.html`. If a cleaner source file (vector/higher-res, or an
   official light/dark variant) becomes available, drop it in and update the
   `src` — no other changes needed.
4. **Response collection** — by default, submitted answers are only saved to
   the visitor's own browser (`localStorage`, for testing). To actually
   collect responses, set `SUBMIT_ENDPOINT` at the top of `script.js` to a
   webhook that accepts a JSON POST (a Google Apps Script Web App URL tied to
   a Google Sheet is the simplest option). Each submission POSTs:
   ```json
   {
     "fullName": "...",
     "designation": "...",
     "otherDesignation": "...",
     "province": "...",
     "dealership": "...",
     "selectedAccessories": ["Heavy-Duty Roof Rack", "..."],
     "accessorySubtotalExclVat": 36900,
     "accessoryTotalInclVat": 42435,
     "stockConsideration": "8",
     "comments": "...",
     "submittedAt": "ISO timestamp"
   }
   ```
5. **Deploy** as a static site (e.g. GitHub Pages, Netlify, Vercel, or any
   web server) and generate a QR code pointing at the deployed URL with any
   QR generator.

## Pricing note

The source accessory price sheet lists 12 items excluding VAT, summing to
R147,900, alongside a "Total" of R170,085 — that's the same figure at 15%
VAT (147,900 × 1.15 = 170,085 exactly), not a separate/incorrect number. The
table's footer row is labelled "Total (full set, incl. 15% VAT)" to make
that explicit, and it's computed from the item prices rather than
hardcoded, so it stays correct if prices change. The live "Your selection"
box below the table applies the same excl./incl. VAT split to whatever the
dealer actually checks.

## CI notes

Styling and screen structure follow real screenshots of an existing Mahindra
South Africa survey (a Festival of Motoring test-drive feedback form) that
were supplied as the ground-truth reference, superseding an earlier written
spec on a couple of points — notably, field labels are **not** red for
required fields (that was wrong in the earlier spec); red is reserved for
actual validation errors.

Matched from the reference: brand red `#e31837`, `#1a1a1a` ink text,
`gray-100` page background, white cards, Manrope typeface, rounded-2xl
cards, rounded-xl buttons, ring+scale on selected toggle buttons, black top
strip, `color-scheme: light` forced to prevent Android auto-dark-mode
inversion, a richer welcome screen (org sub-line, live date/time pill, a
Duration/Questions/Valid-for stat row, a POPIA privacy notice panel), a
subtitle line under each step heading, and a small "link valid / POPIA"
note under the card on step screens. The 1–10 stock-consideration question
reuses the toggle-button treatment as a 5-column, 2-row grid.

**The POPIA privacy notice wording is placeholder copy** written to match
the reference's tone and structure (what's collected / how it's used) for
this survey's actual content — it is not legally reviewed. Have your
compliance/legal team check it before this goes live.

## Survey flow (per scope)

1. First Name and Surname (free text, required)
2. Designation (dropdown, required): Franchise Director, Owner, Dealer
   Principal, Marketing Manager, Sales Manager, Sales Executive, Fleet Sales
   Executive, Other (free-text follow-up, required when "Other" is chosen)
3. Which dealership are you from? — Province (dropdown, required), then
   Dealership (dropdown, required, filtered to that province)
4. Accessory list — 12 items with ex-VAT prices, dealer selects any number
   via checkboxes; live subtotal (excl. VAT) and total (incl. 15% VAT)
   update as they select
5. On a scale of 1–10, how strongly would you consider adding the Scorpio-N
   Rhino to your dealership stock? (required)
6. Open additional comments (optional)
7. Submit → validation → thank-you screen: "Thank you for your feedback.
   Your input will help us shape the Scorpio-N Rhino Edition."

Note: this replaces the earlier version of the scope, which showed a
Standard/Rhino Edition price comparison and two Yes/No "will you purchase
with/without the roof rack" questions — the new accessory checklist and
1–10 scale supersede that (a fixed roof-rack bundle doesn't fit an a-la-carte
accessory list). If that comparison should still appear somewhere in the
flow, let me know and I'll add it back as a read-only step.
<!-- main branch tracking for Vercel production deploys -->
