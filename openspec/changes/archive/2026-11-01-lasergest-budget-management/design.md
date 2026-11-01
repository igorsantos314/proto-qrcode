# Design

## Context

See `proposal.md` for motivation. The current app is a single-screen React 19 + Vite + TypeScript SPA. `App.tsx` renders the QR generator directly, with reusable providers for saved QR codes (`SavedQrcodesProvider` + `useSavedQrcodes`), CSS Modules for styling, and a localStorage adapter per feature. There is no router today, and `qrcode.react` handles QR rendering. Tests are Vitest + Testing Library for units/integration and Playwright for e2e.

Constraints:
- Existing QR functionality and its localStorage key (`proto-qrcode:saved:v1`) must keep working.
- The product is client-only: no backend is introduced by this change.
- Currency is BRL and the UI is in Portuguese.
- Dimensions are entered in millimeters and material cost in R$/m², per the accepted clarification.

## Goals / Non-Goals

**Goals:**
- Add a budgets domain (form, calculations, cache, list, export) without disrupting QR generation.
- Add reusable parameters that prefill budgets and can be applied as cost lines.
- Introduce a shell with distinct sections/routes for QR Code and Orçamentos, branded LaserGest.
- Keep calculation logic pure and unit-testable, independent of React.

**Non-Goals:**
- Server-side persistence, authentication, multi-user sync, or database storage.
- PDF export, print layout, tax invoicing, or integration with fiscal systems.
- Inventory control, customer CRM, or machine scheduling.
- Changing the existing QR payload behavior or its saved-record schema beyond optional presentation fields already present.

## Decisions

### Routing: HashRouter with two top-level routes

Use `react-router-dom` with `HashRouter`, routes `/` (QR Code) and `/orcamentos` (Orçamentos), wrapped by the existing app shell.

- **Why hash routing:** the app is deployed as static files; hash routes avoid requiring a server rewrite/SPA fallback that would 404 on direct navigation to `/orcamentos`. They still provide distinct, shareable URLs.
- **Alternatives considered:** `BrowserRouter` (cleaner URLs but requires hosting rewrites); local state-only sections (no deep linking, does not satisfy "endpoints diferentes" as well).

### Page split

Extract the current generator into a `QrCodePage` and add a `BudgetsPage`. `App.tsx` becomes the shell: `AppBar` (logo, "LaserGest", nav), route outlet, `Footer`. Existing QR providers remain mounted in the shell so QR state is preserved while navigating.

### Reusable parameters as a sub-section of Orçamentos

The top-level navigation stays limited to "QR Code" and "Orçamentos" (as specified). Reusable parameters live inside `BudgetsPage` as a collapsible panel/tab, so they are discoverable next to where they are used without adding a third top-level route.

### Budget data model with snapshots

Persist budget inputs plus a snapshot of parameter values used at save time:

```ts
type ReusableParameter = {
  id: string
  name: string
  unit: string
  value: number
  description?: string
  createdAt: string
  updatedAt: string
}

type AdditionalCost = { id: string; description: string; value: number }

type AppliedParameter = {
  parameterId: string
  name: string
  unit: string
  unitValue: number
  quantity: number
}

type BudgetRecord = {
  id: string
  materialType: string
  materialCostPerM2: number
  widthMm: number
  heightMm: number
  quantity: number
  engravingTimeHours: number
  energyCostPerKwh: number
  machineConsumptionKwhPerHour: number
  depreciationPerHour: number
  marginPercent: number
  salePrice: number
  additionalCosts: AdditionalCost[]
  appliedParameters: AppliedParameter[]
  createdAt: string
  updatedAt: string
}
```

Derived values are not persisted; a pure `calculateBudget(record)` recomputes them on read and after edits. Snapshotted parameter values ensure old budgets do not change when a reusable parameter is edited.

### Calculation module

Create `src/lib/budget/calculations.ts` with pure functions:

- `pieceAreaM2(widthMm, heightMm)`
- `unitMaterialCost`, `totalMaterialCost`
- `machineCostPerHour = consumption × energyCost + depreciation`
- `totalMachineCost`
- `additionalCostsTotal`
- `totalCost`, `costPerUnit`
- `salePriceFromMargin(costPerUnit, marginPercent)`
- `marginFromSalePrice(costPerUnit, salePrice)`

Monetary values keep full precision internally and are rounded only for display/export (2 decimals). Currency formatting uses `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

### Bidirectional margin/sale price

Track which field the user edited last (`priceSource: 'margin' | 'price'`). Editing margin recalculates sale price; editing sale price recalculates margin. When cost changes, keep the last edited field fixed and derive the other. Guard against `margin >= 100` (invalid) and `salePrice <= 0`.

- **Why:** avoids update loops and respects the user's last intent when costs change.
- **Alternative considered:** always treat margin as primary and overwrite price on cost changes (simpler, but surprises users who fixed a price).

### Reusable parameters defaults

Seed defaults on first load if the parameters key is absent: verniz (R$/L), produto de limpeza (R$/L), custo de energia (R$/kWh), consumo da máquina (kWh/h, default 0.005 for a 5 W diode), depreciação (R$/h), margem padrão (%). Seed once and persist; deleting all is allowed and must not reseed on every load.

### Storage adapters and state

Follow the existing `storage/*` + `hooks/*` + `state/*Provider` pattern:

- `lasergest:budgets:v1` for budgets.
- `lasergest:parameters:v1` for reusable parameters.
- `useBudgets`/`BudgetsProvider` and `useReusableParameters`/`ReusableParametersProvider` with the same error-handling behavior as `useSavedQrcodes` (localStorage unavailable → user-facing error, keep in-memory state).
- Existing QR key untouched; no migration needed.

### XLSX export

Use SheetJS (`xlsx`) client-side. `exportBudgetXlsx(record, calculations)` builds one worksheet with sections: identification (material, date), inputs, applied parameters, additional costs, calculation breakdown, totals, margin, and sale price. File name `orcamento-<material-slug>-<timestamp>.xlsx`.

- **Why SheetJS:** small API surface, direct `utils.aoa_to_sheet` + `writeFile` in the browser, no server dependency.
- **Alternatives considered:** CSV renamed to `.xlsx` (invalid format); ExcelJS (heavier, more than needed).

### Validation rules

Validate numeric fields as finite and non-negative; `quantity > 0`; dimensions `> 0` for meaningful area; `margin < 100`; `salePrice > 0`; material type required. Validation messages mirror the existing Portuguese validation style.

### Testing strategy

- Unit: pure calculation functions, margin/price conversion, xlsx row building, storage round-trips.
- Integration: budget form updates breakdown; bidirectional margin/price; save/edit/delete; parameter apply and snapshot behavior.
- E2E: navigation between sections, generate a QR code after navigation, create/save a budget, download `.xlsx` and assert the zip signature (`PK`), and reload persistence.

## Risks / Trade-offs

- **Floating-point rounding in currency** → keep full precision internally, round only on display/export; add unit tests with known values.
- **Invalid margin (>= 100%) or zero quantity** → guard in calculation and form validation; never render `Infinity`/`NaN`.
- **localStorage quota/unavailability** → mirror existing `STORAGE_ERROR_MESSAGE` handling; keep working in memory and surface an error.
- **Deep links on static hosting** → HashRouter avoids server rewrite requirements; URLs include `#/`.
- **SheetJS bundle size** → the export module can be lazily imported on demand to keep the initial bundle small.
- **Snapshot vs live parameters** → old budgets intentionally keep saved values; users must re-apply parameters to reflect new prices (documented in UI copy).
- **Existing QR tests/e2e rely on a single canvas and text labels** → keep QR UI component structure and labels stable while moving it into a page component.

## Migration Plan

1. Add router and shell; move the existing generator into `QrCodePage` without changing its behavior.
2. Add budgets + parameters providers and storage keys.
3. Add budget pages/components and calculation/export modules.
4. Update branding to LaserGest and navigation; keep the QR saved-records key and data intact.
5. Run existing unit/e2e suites plus new budget and navigation tests.
6. Rollback: revert the router/shell and remove the new keys/modules; QR functionality and its storage remain untouched.

## Open Questions

None blocking; the accepted clarifications cover units (mm / R$/m²), margin over sale price, depreciation as R$/h, and the LaserGest name.
