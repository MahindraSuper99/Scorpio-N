# Scorpio-N Rhino Edition — Dealer Survey

A short, mobile-first survey for dealers, built to be reached via QR code and
completed in under a minute on a phone. Plain HTML/CSS/JS — no build step,
no framework, deploy anywhere that serves static files.

## Files

- `index.html` — the survey markup
- `styles.css` — mobile-first styling
- `script.js` — dealer list loading, validation, submit handling
- `dealers.json` — the dealership dropdown options

## Before going live

1. **Dealer list** — replace the placeholder entries in `dealers.json` with
   the current full dealer list, one name per array entry:
   ```json
   ["Dealer One", "Dealer Two", "Dealer Three"]
   ```
2. **Vehicle photos** — the Background section currently uses simple line-art
   placeholders for the Standard and Rhino Edition vehicles (no stock photos
   are bundled). Swap in the approved product photography by replacing the
   `<svg>` placeholder in each `.vehicle-photo` block in `index.html` with an
   `<img>` tag pointing at the real image assets.
5. **Brand identity** — the header uses Mahindra's public red/black identity
   (`#e31837` red, black header bar, "Rise." tagline). This session's sandbox
   blocks outbound requests to `mahindra.co.za` and other general sites, so
   these values come from published brand-color references rather than the
   live site's CSS or logo files. Before this goes out under the Mahindra
   name, swap in the official logo SVG/PNG (replace the `.brand-mark` /
   `.brand-tagline` text in `index.html`) and confirm the exact hex codes
   against the dealership's brand kit.
3. **Response collection** — by default, submitted answers are only saved to
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
4. **Deploy** as a static site (e.g. GitHub Pages, Netlify, Vercel, or any
   web server) and generate a QR code pointing at the deployed URL with any
   QR generator.

## Survey flow (per scope)

1. First Name (free text, required)
2. Designation (dropdown, required): Franchise Director, Owner, Dealer
   Principal, Marketing Manager, Sales Manager, Sales Executive, Fleet Sales
   Executive, Other (free-text follow-up)
3. Dealership (dropdown, required, sourced from `dealers.json`)
4. Background: RRP for the Standard Scorpio-N Z8L 2.2D 6AT 4x4
   (R629,899.00) and the Rhino Edition (R699,899.00, excl. labour/fitment),
   with its accessory list (roof rack, black "Rhino" nudge, red brake
   callipers, black alloys & all-terrain tyres, tow bar)
5. Two required Yes/No questions on purchase intent, with and without the
   roof rack
6. Submit → validation → thank-you message: "Thank you for your feedback.
   Your input will help us shape the Scorpio-N Rhino Edition."
