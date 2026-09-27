# Tasks

## 1. Project setup & open-source packaging

- [ ] 1.1 Add runtime dependency `qrcode.react` and dev dependencies `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@playwright/test`, and `jsqr` to `package.json` and verify `npm install` succeeds
- [ ] 1.2 Add `LICENSE` with the full MIT license text (copyright Proto Gestão, year 2026), set `"license": "MIT"` in `package.json`, and verify the file and field are present
- [ ] 1.3 Extend `.gitignore` to also cover `coverage/`, `playwright-report/`, `test-results/`, `.env*`, and `.eslintcache` and verify `git check-ignore` reports them
- [ ] 1.4 Add npm scripts `test` (Vitest), `test:coverage`, `test:e2e` (Playwright), and `test:all` and verify each script runs its command
- [ ] 1.5 Configure Vitest (jsdom environment, setup file with jest-dom, coverage thresholds for storage and payload libs) and Playwright (Chromium project, webServer for Vite) and verify `npm run test` and a dry-run of `npm run test:e2e` execute without config errors

## 2. Payload builders and validation

- [ ] 2.1 Implement `src/lib/payloads/text.ts` (trimmed literal payload, empty check) and verify unit tests cover non-empty, trimmed, and empty-invalid cases
- [ ] 2.2 Implement `src/lib/payloads/instagram.ts` and `facebook.ts` (profile → URL normalization, required-field validation) and verify unit tests assert the produced URLs and the invalid/empty error paths
- [ ] 2.3 Implement `src/lib/payloads/wifi.ts` producing `WIFI:T:<type>;S:<ssid>;P:<password>;H:<0|1>;;` including the hidden-network flag, and verify unit tests assert exact strings for WPA2, open, and hidden cases
- [ ] 2.4 Implement `src/lib/payloads/pix.ts` building the EMV BR Code "copia e cola" payload (payload format indicator, merchant account information with Pix key, amount, country, name, city, CRC16-CCITT) and verify it passes unit tests against known-good Pix fixture strings and CRC16 vectors
- [ ] 2.5 Implement `src/lib/payloads/index.ts` dispatching by type with a default `text` payload, and verify unit tests cover all five types plus an unknown-type fallback
- [ ] 2.6 Implement field-level validation returning the list of missing/invalid fields per type, and verify unit tests assert each validation error message for empty/invalid inputs

## 3. Local persistence (CRUD)

- [ ] 3.1 Implement `src/storage/savedQrcodes.ts` (namespaced key `proto-qrcode:saved:v1`, list/get/create/update/remove, newest-first ordering) and verify unit tests against a localStorage mock cover all CRUD operations and ordering
- [ ] 3.2 Implement `src/storage/savedQrcodes.ts` round-trip integrity (save → read → identical fields, no mutation) and verify unit tests assert exact equality of stored records
- [ ] 3.3 Implement `useSavedQrcodes` hook with React state synced to storage plus 50-items-per-page pagination state, and verify integration tests cover create, update-in-place (no duplicates), delete, and page-boundary behavior at 50 items
- [ ] 3.4 Handle the localStorage quota-exceeded error path with a user-facing message, and verify a unit test simulates quota overflow and asserts the error is surfaced

## 4. QR generation core

- [ ] 4.1 Implement `src/lib/qr/logoBlackAndWhite.ts` (offscreen canvas grayscale + contrast conversion to a PNG data URL, downscaled) and verify unit tests confirm the output is a valid data URL and the source is no longer colored
- [ ] 4.2 Implement a QR render wrapper using `qrcode.react` `QRCodeCanvas` with `bgColor` transparent by default and white when background is enabled, and verify integration tests assert the component receives the expected background props for both options
- [ ] 4.3 Wire the centered logo via `imageSettings` (src from the B&W-converted data URL), and verify tests assert `imageSettings` is absent without a logo and present with the converted logo
- [ ] 4.4 Implement PNG download from the rendered canvas via `toDataURL('image/png')` honoring the background option, and verify an integration test asserts the download function is called with the current canvas state and produces a `qrcode-<timestamp>.png` filename
- [ ] 4.5 Mark a rendered QR as stale when payload/background/logo changes after generation, and verify an integration test asserts the stale flag appears and clears on regenerate

## 5. Application shell (layout)

- [ ] 5.1 Replace the Vite starter with the app layout: top app bar with logo and app name "Proto QR Code", and verify the rendered shell shows the logo and name
- [ ] 5.2 Implement the tabs (text default, pix, instagram, wifi, facebook) with per-type form fields on the left panel, and verify integration tests assert the default active tab is text and each tab shows its own fields
- [ ] 5.3 Implement the QR preview panel on the right with background toggle (without background default), logo upload, Generate button, and download buttons, and verify integration tests assert the default state and each control's behavior
- [ ] 5.4 Implement the saved list below the form with edit/delete actions and pagination controls, and verify integration tests assert ordering, empty state, and page navigation
- [ ] 5.5 Implement the footer with copyright, "Essa aplicação é mais uma solução do Proto Gestão.", and a link to https://protogestao.com, and verify an integration test asserts the attribution text and the link href

## 6. Integration tests covering the full app (CRUD + generation)

- [ ] 6.1 Cover the full generate flow: fill fields → generate → QR renders → record saved with exact config, and verify integration tests assert the saved record equals the form state
- [ ] 6.2 Cover the edit flow: load a saved record → change a field → generate → same record updated (no duplicate), and verify integration tests assert one record with the new values
- [ ] 6.3 Cover delete with confirmation, and verify integration tests assert the record is removed from storage and list
- [ ] 6.4 Cover reload persistence and round-trip integrity (reload → click saved item → form repopulated with identical payload, background, and logo), and verify integration tests assert exact equality after the round trip
- [ ] 6.5 Run `npm run test:coverage` and verify coverage thresholds pass with tests covering all storage CRUD, payload builders, and the app's main flows

## 7. UI / E2E tests (Playwright)

- [ ] 7.1 Add Playwright E2E covering each tab end-to-end (fill → generate → QR canvas appears), and verify the tests pass in Chromium
- [ ] 7.2 Add E2E decode verification: decode the rendered QR canvas in the page with `jsqr` and assert the decoded text equals the configured payload for text, wifi, pix, instagram, and facebook, and verify each assertion passes
- [ ] 7.3 Add E2E for download with and without background, and verify the tests assert a PNG file downloads and the with-background variant is not transparent
- [ ] 7.4 Add E2E for the full saved-list lifecycle (generate → appears newest-first → edit → delete), and verify the tests pass
- [ ] 7.5 Verify `npm run test:e2e` passes completely in a clean run

## 8. Acceptance gate

- [ ] 8.1 Run `npm run lint` and `npm run build` and verify both pass with no errors
- [ ] 8.2 Run `npm run test:all` and verify unit, integration, and E2E suites all pass together
- [ ] 8.3 Verify the app in a real browser: default text tab, transparent-background QR, logo in black and white, saved list below the form, and the footer link to https://protogestao.com all behave per spec
- [ ] 8.4 Verify `openspec validate` passes for this change