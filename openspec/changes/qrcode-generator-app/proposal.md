# Proposal

## Why

The `proto-qrcode` project is a fresh Vite + React + TypeScript template with no application yet. This change turns it into a complete, open-source (MIT) QR code generator web app for the Proto Gestão ecosystem: a single-page tool that builds QR codes for common use cases (Pix, Instagram, WiFi, Facebook, plain text), lets users embed a black-and-white logo, and persists every generated configuration locally so it can be reused, edited, or deleted without regenerating.

## What Changes

- Replace the starter template UI with a full QR code generator application.
- Main screen opens directly on the QR generator (default tab: **text**).
- Tabs for **Pix**, **Instagram**, **WiFi**, **Facebook**, and **text** (default); each tab exposes the fields needed to build the correct payload.
- App bar at the top with the app logo and name; below it a two-panel layout: form + tabs on the left, QR code preview on the right.
- Preview area offers download options: **with background** and **without background** (default), plus a "Generate" button.
- Logo upload: user can select an image to be placed in the center of the QR code; it is rendered in black and white.
- QR codes render without a background by default (transparent background).
- Local cache of generated configurations: every generated QR configuration is saved to local preferences (localStorage), listed below the form, sorted newest-first, paginated 50 items per page, with **edit** and **delete** actions.
- Footer with copyright notice and the line "Essa aplicação é mais uma solução do Proto Gestão." plus a link to https://protogestao.com.
- Add MIT license (`LICENSE`) and configure `.gitignore` for this project.
- Testing gate: implementation is only complete once integration tests and UI tests pass, covering the full app — complete local CRUD of saved QR codes and verification that the generated QR code matches the user's configuration.

## Capabilities

### New Capabilities
- `qrcode-generation`: Generate a QR code from a text payload; render transparent (no-background) by default with optional white/normal background; support download with/without background; support embedding a black-and-white logo at the center of the QR code.
- `qrcode-payloads`: Build the QR payload for each supported tab type — pix, instagram, wifi, facebook, and text (default) — from the fields the user fills in.
- `saved-qrcodes`: Persist generated QR configurations to local storage; list them below the generator sorted by date/time (newest first) with pagination of 50 items per page; support create, read, update, and delete of saved items.
- `app-layout`: Render the application shell — top app bar with logo and app name, main two-panel generator area, saved-items list, and the footer with copyright and Proto Gestão attribution plus link.

### Modified Capabilities
- None.

## Impact

- **Code**: Rewrites `src/` from the Vite starter template into the application (`App.tsx`, new components, hooks, payload builders, storage layer, tests).
- **Dependencies**: Adds a QR code library (e.g. `qrcode.react`), `localStorage` persistence (no backend), and test tooling (Vitest + Testing Library + Playwright for UI/integration tests).
- **Repository files**: Adds `LICENSE` (MIT), updates `.gitignore`, updates `README.md`, updates `package.json` (name, scripts, deps).
- **Runtime**: Client-side only, no server/backend involved.