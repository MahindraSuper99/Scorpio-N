# Scorpio-N Rhino Edition — Dealer Survey

A short, mobile-first, multi-step survey for dealers, built to be reached via
QR code and completed in under a minute on a phone. Plain HTML/CSS/JS — no
build step, no framework, deploy anywhere that serves static files.

Screen flow: **Welcome → Step 1 (About You) → Step 2 (Background) → Step 3
(Purchase Intent) → Thank you**, with a progress stepper shown on steps 1–3.

## Files

- `index.html` — the survey markup (all screens)
- `styles.css` — styling, following the Mahindra Survey CI spec supplied for
  this project (colors, Manrope typeface, stepper/button/card treatments)
- `script.js` — step navigation, dealer list loading, validation, submit
- `dealers.json` — the dealership dropdown options

## Before going live

1. **Dealer list** — replace the placeholder entries in `dealers.json` with
   the current full dealer list, one name per array entry:
   ```json
   ["Dealer One", "Dealer Two", "Dealer Three"]
   ```
2. **Vehicle photos** — the Background step currently uses simple line-art
   placeholders for the Standard and Rhino Edition vehicles (no stock photos
   are bundled). Swap in the approved product photography by replacing the
   `<svg>` placeholder in each `.vehicle-photo` block in `index.html` with an
   `<img>` tag pointing at the real image assets.
3. **Logo asset** — the header/hero currently use a hand-drawn approximation
   of the "twin-wing" mark (inline SVG in `index.html`, `.brand-icon`/
   `.brand-word`) since no logo file was supplied. Swap it for the real
   Mahindra PNG/SVG mark when available.
4. **Response collection** — by default, submitted answers are only saved to
   the visitor's own browser (`localStorage`, for testing). To actually
   collect responses, set `SUBMIT_ENDPOINT` at the top of `script.js` to a
   webhook that accepts a JSON POST (a Google Apps Script Web App URL tied to
   a Google Sheet is the simplest option). Each submission POSTs:
   ```json
   {
     "firstName": "...",
     "designation": "...",
     "otherDesignation": "...",
     "dealership": "...",
     "purchaseWithRoofRack": "Yes|No",
     "purchaseWithoutRoofRack": "Yes|No",
     "submittedAt": "ISO timestamp"
   }
   ```
5. **Deploy** as a static site (e.g. GitHub Pages, Netlify, Vercel, or any
   web server) and generate a QR code pointing at the deployed URL with any
   QR generator.

## CI notes

Styling follows the "Mahindra Survey CI" spec supplied for this project:
brand red `#e31837` (buttons, header, stepper, mandatory-field labels),
`#1a1a1a` ink text, `gray-100` page background, white cards, Manrope
typeface, and the documented component patterns (rounded-2xl cards,
rounded-xl buttons, ring+scale on selected toggle buttons, black top strip,
`color-scheme: light` forced to prevent Android auto-dark-mode inversion).
The two purchase-intent questions use a plain Yes/No toggle rather than the
spec's 5-point Excellent→Unacceptable rating scale, since they're binary
questions, not satisfaction ratings — the same selected/unselected button
treatment applies either way.

## Survey flow (per scope)

1. First Name (free text, required)
2. Designation (dropdown, required): Franchise Director, Owner, Dealer
   Principal, Marketing Manager, Sales Manager, Sales Executive, Fleet Sales
   Executive, Other (free-text follow-up, required when "Other" is chosen)
3. Dealership (dropdown, required, sourced from `dealers.json`)
4. Background: RRP for the Standard Scorpio-N Z8L 2.2D 6AT 4x4
   (R629,899.00) and the Rhino Edition (R699,899.00, excl. labour/fitment),
   with its accessory list (roof rack, black "Rhino" nudge, red brake
   callipers, black alloys & all-terrain tyres, tow bar)
5. Two required Yes/No questions on purchase intent, with and without the
   roof rack
6. Submit → validation → thank-you screen: "Thank you for your feedback.
   Your input will help us shape the Scorpio-N Rhino Edition."
