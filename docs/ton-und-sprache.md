# Ton, Sprache und Tokens — schneller Index

> Gehört zu `design-guidelines.md` (dort steht die vollständige Designsprache).
> Wird in diesem Repo gepflegt; die Fassung in `ludwig/app/apps/web/DESIGN.md`
> ist die alte. Pfade im Text zeigen auf die App — siehe Übersetzung in
> `design-guidelines.md`.

**Source of truth**: `design/Ludwig Design System v2/` im Repo.
Alle Tokens, alle Components, alle Tonalitäts-Regeln stammen von dort.
Wenn unsicher, dort nachsehen — diese Datei ist der schnelle Index.

> *„Kompetenz in Ruhe."* — Conservative. Reliable. Structured. Precise.

---

## 1. Ton & Sprache

- **Immer „Sie"**, niemals „Du". Auch in Fehlermeldungen.
- **Keine Anrede mit Vornamen** im UI. „Guten Tag, Frau Berger" statt „Hallo Anna".
- **Subjekt = Ludwig oder die Kanzlei**. „Ludwig hat 47 Belege vorkontiert."
- **Buttons im Imperativ**: „Beleg prüfen", „Export starten", „Mandant anlegen".
- **Überschriften ohne Punkt**, Fließtext mit korrekter Interpunktion.
- **Keine Emojis. Keine Unicode-Symbole**. Funktionale Lucide-Icons.
- **Naming-Pflicht**: alle UI-Labels DE und identisch zu `GLOSSARY.md` (Tenant=Kanzlei, Client=Mandant, Creditor=Kreditor, …).

**Verboten**: „smart", „intelligent" (Buzzword), „revolutionär", „magisch", „Hey", „Cool", „Power-Feature", Anglizismen außer Fachsprache (DATEV, USt., BWA, SKR03/04).

---

## 2. Tokens (in `globals.css` als CSS-Variables, in Tailwind als Aliases)

### Farben
| Token | Hex | Verwendung |
|---|---|---|
| `--color-primary` | `#1A3A5C` | Headlines, primäre Buttons, App-Chrome |
| `--color-accent` | `#3B8FC4` | Links, Fokus, aktive Zustände |
| `--color-text` | `#2D2D2D` | Fließtext (nie reines Schwarz) |
| `--color-text-muted` | `#5C5C5C` | Sekundärtext |
| `--color-text-subtle` | `#8A8A8A` | Tertiärtext, Captions |
| `--color-bg` | `#FFFFFF` | Standard-Hintergrund |
| `--color-bg-soft` | `#F4F6F8` | Flächige Hintergründe, App-Main |
| `--color-bg-sunken` | `#ECEFF3` | Tabellen-Trenner, Skeleton |
| `--color-border` | `#DDE2E8` | 1 px Standard-Border |
| `--color-success` | `#3F7A5A` | bestätigend (`Buchung gespeichert`) |
| `--color-warning` | `#B07B2C` | sparsam (`Beleg unvollständig`) |
| `--color-danger` | `#A8403C` | Fehler, Destruktive Aktionen |

**Verboten**: Gold, Warmtöne, Lila, Pink, Neon, breite Farbverläufe, gefüllte Icons.

### Typografie
- **Sans (UI + Body)**: Inter — humanistische Grotesk, `tnum` für Zahlen.
- **Serif (Editorial)**: Source Serif 4 — Hero-Aussagen, Marken-Momente.
- **Mono**: JetBrains Mono — Kontonummern, DATEV-Codes, technische Listen.
- Skala: Display 56 / H1 40 / H2 30 / H3 22 / H4 18 / Body 16 / Small 14 / Caption 13 / Overline 12.
- Body line-height 1.55. Beträge **immer** mit `font-variant-numeric: tabular-nums lining-nums`.

### Spacing
4 px Grundraster, 8 px Rhythmus. Tokens: `--space-1` (4) … `--space-24` (96). Container: 720 / 1080 / 1280 px. Lesbarkeit: max 68ch.

### Radius
2 (sm: Inputs/kleine Tags) / 4 (md: Buttons, Cards) / 6 (lg: Modals) / 10 (xl: nur Hero) / 999 (pill: nur Status-Badges). Keine extremen Rundungen.

### Shadow
4 Stufen `--shadow-xs/sm/md/lg`, kühl getönt (rgba `#142438`). **Cards: entweder Border oder Schatten, niemals beides.**

### Motion
`cubic-bezier(0.2, 0, 0, 1)`. 120/180/280 ms. Erlaubt: Fade, kurzes Translate-Y, Disclosure-Höhe. Verboten: Bounce, Rotate, Parallax, Glanz-Sweeps.

---

## 3. Layout-Regeln

- **App-Sidebar links, 240 px breit, fixiert**. Logo oben, Mandanten-Switcher (oder im TopBar), Hauptnavigation. Hintergrund: dunkler Verlauf `#1F4670 → #14304B → #0F2438`.
- **TopBar 56 px hoch**, weiß, Border-Bottom 1 px.
- **Content-Bereich**: Padding `--space-8` (32 px), max-width `--container-wide` (1280 px), Hintergrund `#FAFBFC`.
- **Inhalt links-bündig** für Listen/Tabellen/Forms. Niemals zentriert.
- **Großzügige Weißräume**.
- **Tabellen ruhig**: 12 px vertikales Padding, klare horizontale Linien (`#ECEFF3`), keine Zebra-Streifen.

---

## 4. Components-Inventar

Quelle: `design/Ludwig Design System v2/ui_kits/app/`. Spiegel im Repo unter `apps/web/src/ui/components/`.

### Primitives
- `Button` — kinds `primary | secondary | tertiary | danger`, sizes `default | sm | icon`. Class: `btn btn-primary` etc.
- `Badge` — kinds `info | success | warning | danger | neutral`, optional Dot. Class: `bdg bdg-info` etc.
- `Input` / `Label` / `Select` / `Checkbox` — Standard-Form-Primitives.
- `Card` — `border` ODER `shadow`, niemals beides. Padding ≥ 20 px.
- `PageHeader` — `title`, optional `sub`, optional `actions` rechts.
- `Stat` — Kennzahl-Tile mit Label, Zahl, optional Delta.

### Layout
- `AppShell` — Grid `240px 1fr / 56px 1fr`, kollabierbare Sidebar (240/64 px).
- `Sidebar` — dunkel, mit Logo, Nav-Items mit Icon+Label+Count, User-Block unten. Items haben aktiven Indikator (2 px linker Strich, hellblau).
- `TopBar` — `TenantSwitcher` links, `Crumb` mitte, `Search`, `RoleBadge`, Help-/Bell-Buttons rechts.
- `RoleBadge` — Pill, farbcodiert: Stb=primary navy `#E3EAF1/#1A3A5C`, Mandant=accent blue `#E3F0F8/#2E78A8`, Admin=warning amber `#F5EEE0/#B07B2C`.
- `TenantSwitcher` / `ClientSwitcher` — Dropdown mit Avatar (farbig), Mandantennummer mono, Name, Suchfeld, Liste mit „X offen"-Pill.

### Feedback / Status
- `Banner` — kinds `info | success | warning | danger`. Innerhalb von Sektionen.
- `Toast` — kinds `success | danger`, oben rechts (Stack, max-width 420 px).
- `StatusBadge` — `draft | ready_to_book | booked | archived`, plus Pipeline `processing | succeeded | failed`.
- `ConfidenceIndicator` — Balken/Score 0-100, farbkodiert.
- `EmptyState` — Icon-Kreis, Titel, Sub, Aktionen. Erklärt **wie** etwas reinkommt (Upload / Mail-Inbox / Drag-Drop), nicht nur „leer".

### Daten
- `DataTable` — sortier-/filterbar, Pagination, Row-Actions, Empty-State, Loading-Skeleton. Hauptelement für Belege, Buchungen, Kreditoren.
- `Pagination` — `start–end von total · ‹ 1 2 3 … N ›`. Aktive Seite = weißer Hintergrund + Border, sonst transparent.
- `Skeleton` — Shimmer-Block mit `linear-gradient` Animation.

### Beleg / Bookkeeping
- `InvoicePreview` — zwei Spalten: PDF-Renderer links, strukturierte Daten (Header/Positionen/Summen) rechts.
- `InterpretationPanel` — Konfidenz, Klärungsfragen, Review-Items, Buchungsvorschlag. Ambiguität sichtbar, nicht versteckt.
- `ReviewItemCard` — „Prüfpunkt" mit Akzeptieren/Ablehnen/Nachfragen, optional Compare-Spalten (Original ↔ Ludwig-Vorschlag).
- `ClarificationDialog` — freie Rückfrage an Mandanten, asynchrone Antwort.
- `UploadZone` — Drag-&-Drop für PDF, gestrichelte Border, Icon-Tile, beim Drag-Active solid border + glow. Datei-Liste mit Pipeline-Steps (`uploading → dedup → ocr → extraction → interpretation → done | error`).
- `Wizard` — n-Step-Form für Mandanten-Onboarding. Numerische Step-Indikator-Pille, aktiv = primary mit Glow.
- `AuditTrail` — Timeline mit Punkten (Ludwig-blue, User-navy, System-grey).
- `Drawer` — Slide-over rechts, 460 px. Backdrop `rgba(20,36,56,0.30)` + `blur(2px)`.

### Iconography
- **Library**: [lucide-react](https://lucide.dev). Stroke-Weight **1.5** (lucide default ist 2 — überschreiben).
- Sizes: 16 (inline), 20 (Buttons/List), 24 (Header/Empty-State).
- Farbe: `currentColor`, default `--color-text-muted`. Keine farbigen, keine gefüllten (außer Status), keine animierten Icons.
- **Beschriftung schlägt Icon**: Icons unterstützen, ersetzen nie ein Label.

---

## 5. Hard Rules

1. **Ton: Sie, kein Du, keine Vornamen, kein Marketing-Sprech**, keine Emojis, keine Unicode-Glyphen.
2. **Naming aus `GLOSSARY.md`** im UI. Englische Spaltennamen aus dem DB-Schema bleiben in Code, **DE-Labels** im UI.
3. **Beträge mit Currency, immer tabular-nums**, DE-Format `1.234,56 €`. Datum DE `dd.MM.yyyy`.
4. **Keine Tailwind-Default-Farben** im UI-Code. Nur Tokens (`bg-primary`, `text-accent-700`, etc.).
5. **Card: Border ODER Shadow** — nicht beides.
6. **Tabellen: keine Zebra-Streifen, keine vertikalen Linien**, klare horizontale Trenner.
7. **Mobile**: Stb arbeitet desktop-first, Mandant darf mobil (Foto-Upload), Admin reines Desktop.
8. **Kein Dark-Mode initial.**
9. **Empty-States ausgearbeitet** — erklären wie der erste Eintrag entsteht.
10. **Ambiguität first-class**: Konfidenzwerte und Klärungsfragen sind UI-Elemente, nicht Tooltips.

---

## 6. Verzeichnisstruktur

```
apps/web/
  src/
    app/
      globals.css          # Tokens + Component-CSS aus Designer
      (auth)/login/        # zentrierte Login-Karte (Brief Abschnitt 2)
      (app)/
        layout.tsx         # AppShell (Sidebar + TopBar)
        dashboard/
        clients/
        admin/
    ui/
      components/
        primitives/        # Button, Badge, Card, Input, Label, Select, Checkbox
        layout/            # Sidebar, TopBar, AppShell, RoleBadge, TenantSwitcher
        feedback/          # Banner, Toast, EmptyState
        data/              # DataTable, Pagination, Skeleton
        invoice/           # InvoicePreview, InterpretationPanel, ReviewItem, ClarificationDialog
        upload/            # UploadZone
        wizard/            # Wizard, AuditTrail, Drawer
      icons/
        index.ts           # re-exports lucide-react Icons mit strokeWidth=1.5 default
  public/
    ludwig-logo.svg
    ludwig-logo-light.svg
    ludwig-mark.svg
```

---

## 7. Wo nachsehen

- **Tokens & Stylesheets**: `design/Ludwig Design System v2/colors_and_type.css`, `ui_kits/app/app.css`, `ui_kits/app/components.css`, `beleg-detail.css`.
- **Component-Vorlagen**: `ui_kits/app/*.jsx` (zu beachten: das sind Browser-Babel-Demos mit `window.X = ...`, idiomatisch zu Server/Client Components umbauen).
- **HTML-Previews jeder Komponente**: `design/Ludwig Design System v2/preview/*.html` (gerendert ansehen mit `open <file>`).
- **Login-Spezifikation**: `design/brief.md` Abschnitt 2 + `ui_kits/auth/`.
- **Iconography-Regeln**: `design/Ludwig Design System v2/preview/iconography.html`.

Wenn der Designer ein neues Asset/Pattern liefert: hier ergänzen, dann in `apps/web/src/ui/` umsetzen. Niemals selbst „Designs" erfinden.
