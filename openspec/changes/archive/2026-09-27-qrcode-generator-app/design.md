# Design

## Context

The repository currently holds a stock Vite + React 19 + TypeScript starter (`proto-qrcode/proto-qrcode`) with no application logic, no tests, and the default Vite `.gitignore`/README. There is no backend; the app must be fully client-side. See proposal.md for motivation. Requirements are defined in the four delta specs: `qrcode-generation`, `qrcode-payloads`, `saved-qrcodes`, `app-layout`.

## Goals / Non-Goals

**Goals:**
- Deliver a client-only React SPA with a reliable, testable QR generation pipeline: payload builder → QR render → PNG download.
- Make saved-configuration CRUD deterministic and fully covered by integration/UI tests.
- Verify with real-browser tests that the rendered QR actually decodes to the configured payload.
- Ship MIT license and a correct `.gitignore` for an open-source release.

**Non-Goals:**
- No backend, accounts, or cloud sync — persistence is browser-local only.
- No multi-color/logo-color customization (logo is black and white only, per spec).
- No generation of other QR modes (URL shortening, analytics, batch generation).

## Decisions

### 1. QR rendering: `qrcode.react` (canvas)
Use the `QRCodeCanvas` component with dynamic `bgColor` and `imageSettings`.
- Transparent default: `bgColor="rgba(0,0,0,0)"`; white background: `bgColor="#ffffff"`.
- Logo embedding is built in via `imageSettings.src`/`x`/`y` (centered).
- Download uses a ref to the canvas and `canvas.toDataURL('image/png')`; because `bgColor` is part of the canvas, the downloaded PNG already honors the with/without-background option without extra compositing.
- Alternatives considered: `qrcode` (node-qrcode) — fine but requires manual canvas drawing/logo compositing in React; `react-qr-code` (SVG) — no canvas download path. `qrcode.react` minimizes custom drawing code.

### 2. Black-and-white logo preprocessing
Uploaded logo is read via `FileReader` into an image, drawn onto an offscreen canvas with `ctx.filter = 'grayscale(100%) contrast(120%)'`, and exported as a PNG data URL. That data URL is passed to `imageSettings.src`, so the centered logo is always black and white regardless of the source image. The same data URL is persisted so saved records round-trip exactly.

### 3. Payload builders: pure functions with per-type validation
`src/lib/payloads/` exposes `buildPayload(type, fields)` and per-type validators.
- `text`: trimmed literal string.
- `instagram` / `facebook`: normalized profile → URL.
- `wifi`: `WIFI:T:<type>;S:<ssid>;P:<password>;H:<0|1>;;`.
- `pix`: EMV BR Code "copia e cola" (payload format indicator `000201` → merchant info `26`/`00` Pix key, merchant account info, transaction amount, country, name, city, CRC16-CCITT). Pure string assembly plus CRC16 implementation — unit-testable against known-good Pix payload strings.
- Validation is field-level and returns a list of missing/invalid fields, which the UI renders as messages (matches spec scenarios).

### 4. Persistence: localStorage behind a CRUD module
`src/storage/savedQrcodes.ts` owns a single namespaced key (`proto-qrcode:saved:v1`) holding a JSON array. It exposes `list()`, `create()`, `update()`, `remove()`, `get(id)` and returns records sorted newest-first. Record shape:

```ts
interface SavedQrCode {
  id: string
  type: 'text' | 'pix' | 'instagram' | 'wifi' | 'facebook'
  fields: Record<string, string | boolean>
  background: 'none' | 'white'
  logoDataUrl: string | null
  createdAt: string   // ISO
  updatedAt: string
}
```

A `useSavedQrcodes` hook wraps the module with React state, and pagination (50/page) is computed from the sorted list. Persistence is explicit: "Gerar" only renders the QR in memory, while a green "Salvar" button (opposite it in the same row) is the single action that creates or updates a record. "Salvar while editing" identifies the record by id and updates it instead of inserting a duplicate, then shows a confirmation dialog warning that clearing the browser cache loses everything.

### 5. Payload preview and confirmation dialogs
- On every tab except text, a read-only box below the fields shows the live plain-text payload (`buildPayload` output) so the user validates exactly what the QR will encode before generating/saving.
- The save action is the only path that writes to storage; generating does not persist.
- A single reusable `ConfirmDialog` widget backs every confirmation in the app. It is fully configurable: `variant` (`success` green / `danger` red) changes the icon badge and confirm-button color, and `icon`, `title`, `description`, `confirmLabel`, `cancelLabel`, and `showCancel` are props. It is a controlled modal (overlay + `role="dialog"`, Escape/overlay dismiss, optional cancel + confirm buttons), so it is dismissible and testable.
  - **Save**: success variant, check icon, title "QR code salvo", a single "Entendi" action, message warning that clearing the browser cache loses everything.
  - **Delete**: danger variant, trash icon, title "Excluir QR code?", cancel + confirm, destructive description. This replaces the previous native `window.confirm`.

### 5. State management
No external state library. The app shell holds the active tab/form state; the saved-list state lives in a context (`SavedQrcodesProvider`) so the form, list, edit/delete actions, and pagination stay in sync. Plain CSS in the existing `index.css`/`App.css` — no UI framework, keeping the dependency surface small.

### 6. Testing strategy (the acceptance gate)
Three layers, all required before the change is considered done:
- **Unit (Vitest):** payload builders (including a known-correct Pix payload fixture and CRC16 vectors), validators, the B&W logo conversion, and the storage module CRUD against a localStorage mock.
- **Integration (Vitest + React Testing Library + jsdom):** component flows — generate → saved record created; edit → record updated not duplicated; delete → confirm → removed; pagination page boundaries at 50; round-trip integrity (save → reload → load into form → identical fields). Enforce coverage thresholds so the whole app is covered (storage and payload libs at 100%, overall app above a configured threshold).
- **UI/E2E (Playwright, real Chromium):** end-to-end user flows per tab, download button produces a PNG, and — the QR-correctness proof — decode the rendered canvas in the page with `jsqr` (injected into the test) and assert the decoded text equals the configured payload for each tab type (text, wifi, pix, instagram, facebook). Coverage is combined and reported; CI-style `npm run test` runs all three layers.

### 7. Open-source packaging
- `LICENSE` = MIT text, copyright "Proto Gestão", year 2026; `"license": "MIT"` in `package.json`.
- `.gitignore` extends the Vite default with `coverage/`, `playwright-report/`, `test-results/`, `.env*`, and `.eslintcache`.

## Risks / Trade-offs

- **Canvas in jsdom is not a real renderer** → qrcode.react's output and `jsqr` decode are validated only in Playwright's real browser; jsdom tests assert behavior through props/state, not pixels.
- **`bgColor` transparency + `toDataURL` behavior of qrcode.react** → verified with a Playwright assertion on the downloaded PNG; if transparency is lost, fall back to compositing onto a white canvas only for the "with background" download.
- **localStorage quota (≈5MB) with logo data URLs** → logos are downscaled (e.g. max ~128px) before storing; large collections remain usable because only the current 50-item page is rendered. Worst case, saving fails loudly with a quota error shown to the user.
- **Logo at QR center lowers decode reliability** → logo is sized conservatively (~15% of QR width) and decode tests use a small logo; scan-failure edge cases are accepted as a QR-standard trade-off.
- **Pix EMV payload is fiddly (CRC16, field layout)** → golden fixtures of real Pix "copia e cola" strings pin the builder in unit tests.

## Migration Plan

Greenfield: no data to migrate and nothing to deploy. The storage key is versioned (`:v1`), so future schema changes can migrate or bump the key. Rollback is reverting the change set; no persistence migrates backward.

## Open Questions

- Exact app name/logo shown in the app bar was not specified — assume **"Proto QR Code"** with the Proto Gestão logo; trivial to rename later without touching specs.
- Logo file format/size limits not specified — assume PNG/JPG/SVG-free (raster only), downscaled to ~128px. Not spec-affecting.
- Download filename not specified — assume `qrcode-<timestamp>.png`. Not spec-affecting.