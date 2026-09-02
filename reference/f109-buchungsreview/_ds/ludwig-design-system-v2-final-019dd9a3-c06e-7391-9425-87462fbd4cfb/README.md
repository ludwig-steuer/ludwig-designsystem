# Ludwig Design System

> „Mehr Zeit für Mandanten. Ludwig bucht den Rest."

Ludwig ist ein KI-Buchhaltungsassistent für kleine deutsche Steuerkanzleien (1–10 Mitarbeiter). Ludwig verarbeitet Belege automatisch, erstellt Umsatzsteuer-Vorkontierungen, wählt Konten aus und bereitet alles für den DATEV-Export vor. Der Steuerberater prüft und berät — Ludwig erledigt die Buchung.

**Ludwig ist kein Tool. Ludwig ist ein digitaler Mitarbeiter.**

---

## Brand fundamentals

**Charakter.** Ruhig. Zuverlässig. Strukturiert. Präzise. Freundlich, aber niemals locker. „Kompetenz in Ruhe" — kein Startup-Feeling, kein Blendwerk. Die Marke fühlt sich an wie ein erfahrener, verlässlicher Kollege, nicht wie ein Tech-Produkt.

**Zielgruppe.** Konservative, detailorientierte Fachleute. Sie schätzen Verlässlichkeit über alles. Skeptisch gegenüber Hype, aber offen für Lösungen, die wirklich funktionieren.

**Sprache.** Alle UI- und Marketingtexte auf Deutsch. Ansprache immer mit „Sie".

---

## Sources & inputs

This system was built **from a written brief only** — no codebase, no Figma, no slide deck, and no existing UI was provided. All visual decisions are inferred from the brand character (calm, conservative, German tax profession) and the supplied palette.

When you provide existing materials (codebase, Figma file, screenshots of the live product, brand book), this system should be revisited to align with the source of truth.

**Provided directly:**
- Brand brief (mission, character, audience, tagline)
- Color palette (Primär `#1A3A5C`, Akzent `#3B8FC4`, Text `#2D2D2D`, Hellgrau `#F4F6F8`, Weiß)
- Tone & language guidelines

---

## Content fundamentals

### Stimme

Die Stimme ist **fachlich, ruhig, präzise**. Sie klingt wie ein erfahrener Kollege, der seine Arbeit kennt und nichts beweisen muss. Keine Superlative. Keine Versprechen. Keine Aufregung.

### Ansprache

- **Immer „Sie"** — niemals „Du". Auch in Fehlermeldungen, Tooltips, Onboarding.
- **Keine Anrede mit Vornamen.** „Guten Tag, Frau Berger" statt „Hallo Anna".
- **Subjekt = Ludwig oder die Kanzlei.** Ludwig spricht in der dritten Person über sich selbst, wenn nötig: „Ludwig hat 47 Belege vorkontiert."

### Casing

- **Deutsche Rechtschreibung in voller Kapitalisierung** — Substantive groß, keine Title-Case-Anglizismen.
  - ✅ „Belege hochladen", „Konten auswählen"
  - ❌ „Belege Hochladen", „Konten Auswählen"
- **Buttons im Imperativ.** „Beleg prüfen", „Export starten", „Mandant anlegen".
- **Überschriften ohne Punkt.** Sätze in Fließtext mit korrekter Interpunktion.

### Wortwahl

**Verwenden:**
„prüfen", „freigeben", „vorkontieren", „erfassen", „zuordnen", „buchen", „exportieren", „Beleg", „Mandant", „Kanzlei", „Vorgang", „Zeitraum"

**Vermeiden:**
„AI", „smart", „intelligent" (Buzzword), „revolutionär", „magisch", „einfach mal", „Hey", „Cool", „Power-Feature", „Game-Changer", Anglizismen außer wo Fachsprache (DATEV, USt., BWA).

### Beispiele

| ✅ Ludwig                                                  | ❌ Nicht Ludwig                                  |
|------------------------------------------------------------|--------------------------------------------------|
| Ludwig hat 47 Belege vorkontiert. Bitte prüfen.            | 🎉 Ludwig hat 47 Belege gerockt!                  |
| Export für DATEV bereit.                                   | Bereit zum Abfeuern: DATEV-Export!               |
| Beleg konnte nicht eindeutig zugeordnet werden.            | Hoppla, das hat nicht geklappt.                  |
| Guten Morgen, Frau Berger.                                 | Hi Anna 👋                                        |
| Mehr Zeit für Mandanten. Ludwig bucht den Rest.            | Buchhaltung auf Autopilot mit KI-Power!          |
| Mandant hinzufügen                                         | + Neuen Mandanten erstellen jetzt!               |

### Tonalität bei Fehlern

Sachlich, lösungsorientiert. Ludwig schlägt einen nächsten Schritt vor, niemals Entschuldigungen oder Emojis.

> **Beleg unvollständig.** Es fehlt das Rechnungsdatum. Bitte ergänzen Sie das Datum oder laden Sie den Beleg erneut hoch.

### Emoji & Icons

- **Keine Emoji.** Nicht in UI, nicht in Marketing, nicht in E-Mails.
- **Symbole nur funktional.** Icons stützen, sie schmücken nicht. Siehe Iconography unten.

---

## Visual foundations

### Farbe

**Primärpalette** (5 Farben — bewusst eng):

| Token        | Hex       | Verwendung                                                     |
|--------------|-----------|----------------------------------------------------------------|
| Primär       | `#1A3A5C` | Logo, Headlines, primäre Buttons, App-Chrome                   |
| Akzent       | `#3B8FC4` | Links, Fokus, aktive Zustände, dezente Highlights              |
| Text         | `#2D2D2D` | Fließtext (nie reines Schwarz)                                 |
| Hellgrau     | `#F4F6F8` | Flächige Hintergründe, Karten-Sunken-Zonen                     |
| Weiß         | `#FFFFFF` | Standard-Hintergrund, Karten-Oberflächen                       |

**Semantische Farben** sind bewusst entsättigt: success `#3F7A5A`, warning `#B07B2C` (sparsam!), danger `#A8403C`. Niemals grell. Niemals neon.

**Verboten:** Gold, Warmtöne, Lila, Pink, Neon, Verläufe quer durchs Spektrum.

### Typografie

- **Sans (UI + Body):** Inter — humanistische Grotesk, ausgezeichnete Tabellen-Ziffern (`tnum`), für Beträge essentiell.
- **Serif (Editorial):** Source Serif 4 — für Hero-Aussagen, Zitate, Markenmomente. Vermittelt Solidität und Tradition.
- **Mono:** JetBrains Mono — für Kontonummern, DATEV-Codes, technische Listen.

> **Substitution Flag** — Inter und Source Serif 4 wurden als Erstwahl gesetzt, da kein Brand Book vorlag. Wenn Ludwig eine andere Hausschrift hat (z.B. lizensierte Schrift), bitte Files in `fonts/` ablegen und in `colors_and_type.css` ersetzen.

**Skala:** Konservativ. Display 56 / H1 40 / H2 30 / H3 22 / H4 18 / Body 16 / Small 14 / Caption 13 / Overline 12. Großzügige Zeilenhöhe (1.55 für Body). Tabular-Numerals immer für Beträge.

### Layout & Raum

- **4 px Grundraster, 8 px Rhythmus.** Spacing-Scale `--space-1` (4 px) bis `--space-24` (96 px).
- **Container:** 720 / 1080 / 1280 px. Lesbarkeit: max. 68ch.
- **Großzügige Weißräume** — Ludwig wirkt nie gedrängt. Luft ist Teil des „ruhigen" Charakters.
- **Inhalt links-bündig, niemals zentriert** für Listen, Tabellen, Formulare.
- **Tabellen sind ein Herz-Element.** Sie sollen ruhig wirken: schmale Zeilenpaddings (12 px vertikal), klare horizontale Linien (`#ECEFF3`), keine Zebra-Streifen.

### Hintergründe

- **Flächig.** Weiß oder `#F4F6F8`. Keine Bilder als Hintergrund. Keine Verläufe.
- **Marketing/Hero:** dunkler Primär-Block (`#1A3A5C`) mit Serif-Display, fertig. Kein Foto darunter. Wenn Foto, dann ruhig, sachlich, in kühlem Tone-of-Voice (siehe Bildwelt).
- **Keine repeating patterns, keine Texturen, keine Hand-Illustrationen.**

### Bildwelt (image vibe)

- **Wenn Fotos:** kühl, dezent, dokumentarisch. Schreibtische, Aktenordner, Hände am Stift, Bildschirme — ruhige, professionelle Szenen. Keine Lifestyle-Stocks. Kein „happy team high-five".
- **Farbgebung:** entsättigt, leicht kühl, niemals warmgelb gefiltert.
- **Niemals KI-Renderings, Roboter, Gehirne, neuronale Netze, abstrakte Tech-Grafiken.**
- Standard ist: **kein Bild**. Typografie und Whitespace tragen.

### Animation

Bewegung ist **funktional, niemals dekorativ**. 

- **Eases:** `cubic-bezier(0.2, 0, 0.0, 1)` (standard). Keine Bounces, keine Springs.
- **Dauern:** 120 ms (micro), 180 ms (base), 280 ms (slow).
- **Erlaubt:** Fade in (Opacity), kurze Translate-Y (4–8 px), Höhenänderungen bei Disclosure.
- **Verboten:** Scale-Bounces, Rotate-Animationen, Parallax, „Magic"-Übergänge, Shimmer-Effekte als Selbstzweck (Skeleton ja, Glanz-Sweep nein).

### Hover & Press

- **Hover:** Hintergrund schiebt sich um eine Tonstufe (z.B. Button Primär → `--color-primary-600`). Niemals Skalierung, niemals Schatten-Wachstum.
- **Press / Active:** Hintergrund eine weitere Stufe dunkler. Inhalt verschiebt sich nicht.
- **Disabled:** Opacity 0.5, kein Cursor-Pointer.

### Borders

- **1 px**, niemals dicker, außer für aktiven Tab-Indicator (2 px).
- Standard `--color-border` (`#DDE2E8`). Strong Variant `#C4CCD5` für Eingabefelder im Fokus oder Tabellen-Trennung.
- Cards verwenden **entweder** 1 px Border **oder** Schatten, niemals beides gleichzeitig.

### Schatten

Subtil, kühl getönt (rgba mit `#142438` Basis). Vier Stufen: `--shadow-xs/sm/md/lg`. Werden sehr sparsam eingesetzt — Cards bevorzugen Border über Schatten. Schatten kommen bei Menüs, Popovers, Modals.

### Corner radius

- **2 px** (sm) — Inputs, kleine Tags
- **4 px** (md) — Standard für Buttons, Cards
- **6 px** (lg) — größere Cards, Modals
- **10 px** (xl) — sparsam, nur Hero-Karten
- **999 px** (pill) — nur für Status-Badges

Keine extremen Rundungen. Ludwig ist nicht „cuddly".

### Cards

- Hintergrund Weiß
- 1 px Border `#DDE2E8` **oder** `--shadow-sm` — nicht beides
- Radius `--radius-md` (4 px) standard, `--radius-lg` (6 px) für hervorgehobene Cards
- Padding mindestens `--space-5` (20 px), bei Inhaltskarten `--space-6` (24 px)
- Header in Card: kleine Caps + Border-Bottom als Trenner

### Transparenz & Blur

- Sehr sparsam. Backdrop-Blur nur in Modals-Overlay (50 % Opacity, 8 px blur) und allenfalls Sticky-Header bei Scroll.
- **Keine Glassmorphism-Effekte** im Produkt-UI.

### Fokus-Ring

`outline: 2px solid #3B8FC4` mit 2 px offset. Immer sichtbar (`:focus-visible`).

### Layout-Regeln (fest)

- **App-Sidebar links, 240 px breit, fixiert.** Logo oben, Mandanten-Switcher, Hauptnavigation. Hintergrund `#F4F6F8`.
- **Top-Bar 56 px Höhe**, Border-Bottom, Mandant + Suchfeld + User-Menu.
- **Content-Bereich:** Padding `--space-8` (32 px), max-width `--container-wide` (1280 px).
- **Marketing-Header 72 px Höhe**, weiß, Border-Bottom 1 px.

---

## Iconography

**Approach:** Funktional, monochrom, dünner Strich. Icons sind **Unterstützung** — sie ersetzen niemals Beschriftung. In dieser konservativen Zielgruppe gilt: **Beschriftung > Icon**.

**System:** [Lucide Icons](https://lucide.dev) (CDN) — Stroke-Weight 1.5 px, 16/20/24 px Größen.

> **Substitution Flag** — Lucide ist gewählt, weil keine eigene Icon-Library im Briefing definiert war. Lucide ist klar, neutral, dünnstrichig — das passt zum Charakter. Wenn Ludwig eine eigene Icon-Library bekommt, ersetzen.

**Verwendung:**
- Stroke-Weight: **1.5 px** (Lucide default ist 2; bitte überschreiben).
- Farbe: erbt von `currentColor`, default `--color-text-muted` (`#5C5C5C`).
- Größen: **16 px** (inline mit Body-Text), **20 px** (Buttons, List-Icons), **24 px** (Section-Headers, leere Zustände).
- Keine farbigen Icons. Keine gefüllten Icons (außer Status-Badges: success/warning/danger).

**Verboten:**
- **Keine Emoji** — niemals als UI-Element.
- **Keine Unicode-Icons** (✓ ✗ ⚠) — stattdessen Lucide-Equivalent.
- **Keine selbstgezeichneten SVG-„Illustrationen"** ohne Briefing.
- **Keine 3D-Icons, keine Color-Icons, keine animierten Icons.**

**Branded mark:** `assets/ludwig-mark.svg` (Quadrat-Mark) und `assets/ludwig-logo.svg` (Wordmark). Light-Variante für dunkle Hintergründe: `assets/ludwig-logo-light.svg`.

---

## Index — what's in this folder

```
README.md                — this file
SKILL.md                 — agent skill manifest (use as Claude Code skill)
colors_and_type.css      — single-source-of-truth tokens + semantic styles

assets/
  ludwig-logo.svg        — primary wordmark (dark on light)
  ludwig-logo-light.svg  — wordmark for dark backgrounds
  ludwig-mark.svg        — square mark (for favicons, app icons)

fonts/
  README.md              — font sourcing notes (Google Fonts via CDN)

preview/                 — design-system preview cards (registered as assets)
  colors-primary.html, colors-neutrals.html, colors-semantic.html
  type-display.html, type-scale.html, type-numeric.html
  spacing-scale.html, radius-shadow.html
  buttons.html, inputs.html, badges.html, tables.html, cards.html
  logo.html, voice.html

ui_kits/
  app/                   — Ludwig product UI kit (web app for tax advisors)
  marketing/             — Marketing site UI kit
```

---

---

## Components

Exportierte React-Komponenten (über `window.LudwigDesignSystemV2Final_019dd9` bzw. per Import verfügbar), Quelle in `components/`:

- **Button** — Aktions-Button (`primary` · `secondary` · `tertiary`, `sm`/`md`), flach im Ruhezustand, dezenter Hover-Schatten bei Primary.
- **Badge** — Status-Pill aus der semantischen Palette (`info` · `success` · `warning` · `danger` · `neutral`).
- **ConfidenceDot** — Confidence-„Ampel" pro Element (`high` · `review` · `none`), das systemweite Prüf-Signal in Review-Oberflächen.

---

## How to use

1. Drop `colors_and_type.css` into your page `<head>` (or copy variables into your own stylesheet).
2. Reference assets from `assets/` (copy them into your project — do not hotlink).
3. For prototypes: pull the React components in `ui_kits/<product>/` and compose.
4. When in doubt about tone or visual: re-read **„Kompetenz in Ruhe."** Less is the answer.

## Manifest

- `README.md` — this file (brand context, content + visual foundations, iconography).
- `SKILL.md` — agent skill manifest, downloadable for Claude Code.
- `colors_and_type.css` — design tokens + semantic styles.
- `assets/ludwig-logo.svg`, `ludwig-logo-light.svg`, `ludwig-mark.svg` — brand marks.
- `fonts/README.md` — font sourcing & substitution notes.
- `preview/` — design-system preview cards (registered as assets in the Design System tab).
- `ui_kits/app/` — Ludwig product UI (sidebar, posteingang, beleg detail, mandanten, DATEV-export).
- `ui_kits/marketing/` — public site (hero, how-it-works, compare, trust, pricing, footer).
