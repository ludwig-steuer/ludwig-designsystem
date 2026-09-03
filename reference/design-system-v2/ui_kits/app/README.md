# Ludwig App — UI Kit

The Ludwig product UI for tax-advisor offices (Steuerkanzleien).

## Layout
- **Sidebar** (240 px, `#F4F6F8`): Logo, mandant switcher, primary nav (Posteingang, Belege, Mandanten, Export, Berichte).
- **Top bar** (56 px): Active mandant + global search + user menu.
- **Content** (max 1280 px, 32 px padding).

## Core screens
1. **Posteingang** — Inbox of new documents Ludwig has processed; user reviews/approves.
2. **Beleg-Detail** — A single document with Ludwig's proposed booking (account, USt, narrative).
3. **Mandanten** — Client list with status.
4. **DATEV-Export** — Bundle and export prepared bookings.

## Components
`Sidebar.jsx` · `TopBar.jsx` · `BelegList.jsx` · `BelegDetail.jsx` · `MandantList.jsx` · `ExportPanel.jsx` · `Button.jsx` · `Badge.jsx` · primitives.
