# Tasks

## 1. Foundation and Dependencies

- [x] 1.1 Add `react-router-dom` and `xlsx` to `package.json` and verify `npm install` completes and `npm run build` still succeeds
- [x] 1.2 Create the budget domain types (`budget`, `parameter`, `calculations`) under `src/lib/budget/` and verify `tsc -b` passes
- [x] 1.3 Implement `src/lib/budget/calculations.ts` with area, material, machine, additional costs, total, unit cost, and margin/price conversion functions; verify unit tests cover the formulas and edge cases (`quantity = 0`, `margin >= 100`, `salePrice <= 0`)
- [x] 1.4 Implement reusable-parameter defaults (verniz, produto de limpeza, custo de energia, consumo da máquina a 0.005 kWh/h, depreciação, margem padrão) and verify unit tests assert the default set is produced once
- [x] 1.5 Implement `src/storage/budgets.ts` and `src/storage/reusableParameters.ts` with keys `lasergest:budgets:v1` and `lasergest:parameters:v1`; verify round-trip, ordering by `createdAt` desc, and corrupted-data recovery tests pass

## 2. Shell, Routing, and Branding

- [x] 2.1 Extract the current generator into `src/pages/QrCodePage.tsx` without behavior changes; verify existing `App.test.tsx` QR scenarios still pass after updating the render location
- [x] 2.2 Add `HashRouter` with routes `/` (QR Code) and `/orcamentos` (Orçamentos) and make `/` the default; verify navigating to each route renders the corresponding page in tests
- [x] 2.3 Update `AppBar` to show the "LaserGest" name and navigation links to "QR Code" and "Orçamentos"; verify `AppBar.test.tsx` and an e2e navigation test pass
- [x] 2.4 Update document title/branding references from "Proto QR Code" to "LaserGest" (keeping Proto Gestão attribution in the footer) and verify no user-facing reference to the old product name remains
- [x] 2.5 Wrap the app with the existing saved-QR provider plus new budget/parameter providers so QR state survives navigation; verify switching sections does not reset a generated QR code

## 3. Reusable Parameters

- [x] 3.1 Implement `useReusableParameters` and its provider with localStorage persistence and the existing storage-error behavior; verify provider tests cover load, create, update, delete, reload, and storage failure
- [x] 3.2 Build the reusable-parameters panel inside the Orçamentos page with name, unit, and value fields and validation for non-numeric/negative values; verify integration tests cover create/edit/delete and validation messages
- [x] 3.3 Seed defaults only when the parameters key is absent and do not reseed after the user deletes all parameters; verify a test removes all parameters, reloads, and still sees an empty list

## 4. Budget Form and Calculations

- [x] 4.1 Build the budget form with material type, material cost per m², width/height in mm, quantity, engraving time per piece, energy cost, machine consumption, depreciation, margin, sale price, and material-type validation; verify integration tests render every field and block save when required inputs are missing/invalid
- [x] 4.2 Wire live calculation display (piece area, unit/total material cost, machine cost per hour/total cost, additional costs total, total cost, cost per unit) using the pure calculation module; verify integration tests assert the breakdown for a known budget
- [x] 4.3 Implement the editable additional-costs list (description + value) with add/remove and include its total in the breakdown; verify tests add two costs and assert the summed total
- [x] 4.4 Implement application of reusable parameters to the budget (select parameter + quantity) and include `unitValue × quantity` in the additional total; verify tests apply verniz and limpeza and assert the line values and total
- [x] 4.5 Implement bidirectional margin/sale price with `priceSource` tracking and validation for `margin >= 100` and `salePrice <= 0`; verify tests edit margin → price, edit price → margin, and change cost while keeping the last edited field fixed
- [x] 4.6 Prefill energy cost, machine consumption, depreciation, and default margin from reusable parameters for a new budget; verify a test asserts the prefilled values match the parameter set

## 5. Budget Cache and Lifecycle

- [x] 5.1 Implement `useBudgets` and its provider with save, load, update-in-place, delete, and newest-first list ordering; verify provider tests cover each operation and persistence across remounts
- [x] 5.2 Build the saved-budgets list with empty state, load-to-form, edit indicator, and delete confirmation dialog mirroring the saved-QR list UX; verify integration tests cover load, edit, and confirmed/cancelled deletion
- [x] 5.3 Ensure saving an edited budget updates the same record and stores applied parameter values as a snapshot; verify a test edits a reusable parameter after saving and confirms the saved budget totals do not change

## 6. XLSX Export

- [x] 6.1 Implement `src/lib/budget/exportXlsx.ts` to build an .xlsx workbook with identification, inputs, applied parameters, additional costs, calculation breakdown, totals, margin, and sale price; verify unit tests inspect the generated sheet rows
- [x] 6.2 Add an export action per saved budget that downloads `orcamento-<material-slug>-<timestamp>.xlsx` and lazy-loads the xlsx module; verify an e2e test captures the download and asserts the PK/zip signature and filename pattern

## 7. Verification and Regression

- [x] 7.1 Add an e2e test that opens Orçamentos, creates and saves a budget, reloads the page, and confirms the saved budget is still listed with its totals
- [x] 7.2 Add an e2e test that navigates from Orçamentos back to QR Code and confirms the existing generator, Pix tab, and PNG download still work
- [x] 7.3 Run `npm run lint`, `npm run build`, `npm test`, and `npx playwright test`; verify all suites pass and no existing QR, Pix, saved-list, border, radius, or 1000×1000 export behavior regressed
