# 0042 · Drawer — der Slide-over von rechts

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Gruppe Dialog |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, „etwas Bestehendes neben der Liste ansehen, ohne sie zu verlassen" ist fachfrei |
| Quelle | Anfrage Owner 2026-09-03 („dann brauchen wir vl. erstmal einen Drawer … im Ludwig-Projekt haben wir bereits einen, den könnten wir übernehmen") · `docs/v3-backlog.md` („Drawer/UrlDrawer-Familie, 29 Importstellen") · Vorlage: `app/apps/web/src/ui/components/primitives/Drawer.tsx` |
| Ersetzt | `Drawer` + `DrawerFooter` in `ui/components/primitives/Drawer.tsx` (29 Importstellen; Wächter-Test `ui/drawers/__tests__/drawer-catalog.test.ts`) |
| Blockiert | 0013 (das Kontenblatt-Icon braucht ein Ziel) · 0014 (OPOS-Browser im Drawer) · die Detail- und Drawer-Umzüge der Welle 1 |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-03 — `src/ui/v3/primitives/Drawer.tsx`, Stories daneben, `.v2drawer*` in `v3.css` |

## Ziel

Die Buchhalterin steht in einer Liste — Buchungssätze, Salden, Belege — und
will zu einer Zeile etwas Bestehendes nachschlagen: was sonst noch auf dem
Konto liegt, welche offenen Posten es zum Partner gibt. Sie will dafür die
Liste nicht verlassen; wenn sie zurückkommt, ist ihr Filter weg und ihre
Zeile auch.

Die App löst das seit F113 mit einem Slide-over von rechts, und zwar an 29
Stellen mit derselben Hülle. Das Set hat davon nichts: Es kennt `Dialog`
(zentriert, blockierend) und `MasterDetail` (die Seite ist so gebaut). Wer
im Set eine Ansicht baut, die ein Nachschlagen anbietet, hat kein Ziel, an
das sie das Signal geben kann.

## Einordnung

- **Wiederverwenden:** kein Treffer.
  - `Dialog` (`@when Confirmation with consequences (cancel, delete, approve)
    or a short form that accompanies an action.`) — zentriert und
    blockierend, für **Entscheidungen**. Sein eigenes JSDoc schickt den Fall
    weiter: „Bestehendes in den Drawer (UX-Guidelines L2/L3)".
  - `MasterDetail` (`@when Picking from a list, working on the selected item
    on the right.`) — das ist der **Seitenaufbau**, keine Überlagerung. Der
    Drawer ist genau für die Seiten da, die keine Detailspalte haben.
  - `Popover` / `HoverCard` (0038) — klein, ohne Scrim, für einen Satz oder
    ein kleines Feld. Ein Kontenblatt mit dreißig Buchungen passt nicht hinein.
- **Neu oder erweitert, weil:** `spec-schreiben` §3.3 — alles trifft zu: kein
  `@when` passt · kein Fachwort nötig (`drawer`, `slide-over`) · **29**
  Verwendungen statt der geforderten zwei · und Portal, Ein-/Ausblenden,
  Scrim, Escape und Footer-Slot sind an der Aufrufstelle nicht in ~15 Zeilen
  zu haben.
  **Kein Widerspruch zu §11.2** („Drawer/UrlDrawer bleibt Alt-Mechanik,
  bekommt v3-Optik, nicht verhandelbar"): Hier wird nichts neu erfunden. Die
  vorhandene Hülle zieht mit unverändertem Verhalten um (Skill
  `aus-app-holen`); neu sind nur Tokens statt Hex und `IconButton` statt
  eigenem Kreuz. Auch **kein shadcn-Sheet** — der shadcn-Abgleich (0034)
  führt „Sheet/Drawer → bleibt Alt-Mechanik" bereits als entschieden.
- **Zuschnitt:** Familie, eine Datei (§4). `Drawer` und `DrawerFooter` bilden
  ein Markup-Vokabular; `DrawerFooter` portaliert in die Fußleiste des
  umgebenden `Drawer` und ergibt allein keinen Sinn.
  **`UrlDrawer` bleibt in der App** — er hängt an `next/navigation`. Routing
  ist Verdrahtung des Aufrufers, nicht Sache des Sets (§5: die Komponente
  kennt kein Modul). Er baut weiter auf `Drawer` auf, künftig auf diesem.
- **Setzt auf:** `IconButton` (0012) für das Schließen-Kreuz. Sonst nichts.

## Schnittstelle

Übernommen aus der Vorlage, eine Prop gestrichen:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` | `boolean` | ja | Offen. Beim Schließen bleibt der Knoten für die Ausblende-Bewegung stehen | `Open` |
| `onClose` | `() => void` | ja | Escape, Klick aufs Scrim, Kreuz — alle drei Wege melden dasselbe | `Open` |
| `title` | `ReactNode` | ja | Kopfzeile. Ist er ein String, trägt er zugleich `aria-label` | `Open` |
| `meta` | `ReactNode` | nein | Zweite Zeile unter dem Titel — Saldo, Zeitraum, Herkunft | `Open` |
| `children` | `ReactNode` | ja | Der Inhalt; scrollt, Kopf und Fuß stehen | `LongContent` |
| `footer` | `ReactNode` | nein | Aktionsleiste. Weggelassen **und** ohne `DrawerFooter` → keine leere Leiste | `WithFooter` |
| `size` | `"sm" \| "md" \| "lg"` | nein | Breite, Default `md`. `sm` Fakten-Liste · `md` Detail · `lg` breite Tabelle (Kontenblatt) | `Sizes` |
| `ariaLabel` | `string` | nein | Nur nötig, wenn `title` kein String ist | `InUse` |

`DrawerFooter` nimmt nur `children` und wirft sie in die Fußleiste des
umgebenden `Drawer` — für Editoren, deren Aktionen denselben Formularzustand
brauchen wie der Body. Ohne umgebenden `Drawer` rendert er nichts.

**Gestrichen gegenüber der Vorlage:** `width?: string`. Sie steht dort mit dem
Kommentar „Escape-Hatch für Einzelfälle. Nicht benutzen." — eine Prop, deren
Dokumentation ihre eigene Benutzung verbietet, gehört nicht ins Set. Drei
Stufen reichen; wer eine vierte braucht, meldet einen Befund und bekommt eine
Stufe.

Typen: keine aus `src/ludwig/` — die Hülle kennt keine Entität. GLOSSARY:
kein Eintrag nötig; im UI heißt nichts „Drawer", der Titel benennt den Inhalt.

**Was die Komponente nicht kann (bewusst):**

- **Laden.** Sie bekommt fertigen Inhalt. Das Kontenblatt lädt der Aufrufer
  (`AccountLedgerDrawerProvider` in `ui/drawers`); ladende Komponenten gehören
  nicht ins Set.
- **Sich selbst öffnen.** `open` gehört dem Aufrufer — nur so kann eine Seite
  garantieren, dass genau **ein** Drawer für alle ihre Konten zuständig ist
  (heute über `AccountDrawerProvider`).
- **Stapeln.** Ein zweiter Drawer über dem ersten ist kein unterstützter
  Zustand. Wer verzweigen will, tauscht den Inhalt.

## Verhalten

- **Bewegung:** Beim Öffnen wird gemountet und im nächsten Frame
  eingeblendet; beim Schließen bleibt der Knoten 300 ms für die
  Ausblende-Bewegung stehen. Sonst springt der Drawer weg statt zu gleiten.
- **Tastatur:** `Escape` schließt (nur solange offen). Der Fokus steht nach
  dem Öffnen im Drawer und kehrt beim Schließen auf den auslösenden Knopf
  zurück — sonst tabbt die Tastatur hinter dem Scrim weiter (V10/V11).
  **Das kann die Vorlage heute nicht** (`Dialog` im Set kann es); es kommt
  beim Umzug dazu.
- **Maus:** Klick aufs Scrim schließt. Klick im Drawer nicht.
- **Kopf und Fuß stehen, der Body scrollt.** Die Fußleiste ist bei leerem
  Slot unsichtbar (`:empty`), damit kein leerer Streifen entsteht.
- **Zustände:** gefüllt ist der einzige eigene. Leer, lädt und Fehler gehören
  dem Inhalt (`EmptyState`, `Skeleton` 0016, `ErrorRow`) — die Hülle kennt
  keine Daten.
- **Client-Component** (`"use client"`): Portal, Transition, Escape.
- **CSS:** neue Klassen `.v2drawer*` in `v3.css`, ausschließlich aus Tokens;
  Breiten aus `--drawer-sm/md/lg` (stehen in `tokens.css`). Der Präfix ist
  frei geprüft. Die Vorlage in `booking.css` (`.lwdrawer*`) bleibt unberührt
  — sie trägt Hex (`#fff`, `#FAFBFC`, `rgba(...)`) und px und ist damit als
  v3-Regelsatz nicht zulässig.

## Stories

Abgeleitet nach §6. Titel `v3/Primitives/Dialog/Drawer`.

| Story | Beweist |
|---|---|
| `Open` | Rundlauf über `onClose` mit `useState`: Knopf öffnet, Kreuz/Escape/Scrim schließen; Titel und `meta` besetzt |
| `Sizes` | alle drei Werte von `size` nebeneinander, mit dem Inhalt, für den sie gedacht sind |
| `WithFooter` | Aktionsleiste über die Prop `footer`; daneben derselbe Drawer ohne sie — keine leere Leiste |
| `FooterFromBody` | dieselbe Leiste, gefüllt aus dem Body über `DrawerFooter` (der Editor-Fall) |
| `LongContent` | vierzig Zeilen: Body scrollt, Kopf und Fuß stehen |
| `InUse` | Kontenblatt zu Konto 6815 Bürobedarf — `size="lg"`, `Table` mit Buchungen, Saldo in `meta`. Der Fall aus 0013 |

Sechs Stories (Primitive-Untergrenze 3, Obergrenze 10). Ein Callback → eine
Rundlauf-Story; eine Enum-Prop → eine Story mit allen Werten; kein
Layout-Boolean.

**Nicht anwendbar:** `Leer`, `LaedtGerade`, `Fehler` — die Hülle hat keine
Daten; diese Zustände trägt der Inhalt und beweisen sie in ihren eigenen
Stories. Kein Rand-Fall: der Drawer formatiert und kürzt nichts — außer der
Höhe, und die beweist `LongContent`.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `size` liefert die drei Breiten aus `--drawer-sm/md/lg`, Default `md` (`Sizes`)
- [ ] Alle drei Schließwege melden `onClose`: Kreuz, `Escape`, Klick aufs Scrim (`Open`)
- [ ] Fokus steht nach dem Öffnen im Drawer und kehrt beim Schließen auf den Auslöser zurück (`Open`) — **Zugewinn gegenüber der Vorlage**
- [ ] Beim Schließen gleitet der Drawer hinaus, er verschwindet nicht (`Open`)
- [ ] `footer` und `DrawerFooter` belegen dieselbe Leiste; ohne beides ist keine Leiste sichtbar (`WithFooter`, `FooterFromBody`)
- [ ] Body scrollt, Kopf und Fuß stehen (`LongContent`)
- [ ] `.v2drawer*` steht in `v3.css` und enthält kein Hex und kein px
- [ ] Das Schließen-Kreuz ist `IconButton`, kein eigener Knopf
- [ ] `width` existiert nicht; die Vorlage hatte sie mit „nicht benutzen" markiert
- [ ] `@instead` schickt weiter: Entscheidung → `Dialog`, Seitenaufbau → `MasterDetail`, ein Satz → `Popover`/`HoverCard`
- [ ] Ersetzt `Drawer`/`DrawerFooter` in `ui/components/primitives/Drawer.tsx` ohne Funktionsverlust — **offen (App)**, siehe `docs/backlog/README.md`
- [ ] `UrlDrawer` baut in der App weiter darauf auf, unverändert in seiner Schnittstelle — **offen (App)**

## Offene Fragen

Alle drei ohne Antwort geblieben und nach dem jeweiligen Default gebaut:
`.v2drawer*` (1), Fokus-Führung mitgenommen (2), `UrlDrawer` bleibt in der App (3).

1. **Klassenpräfix.** `.v2drawer*` neu, oder `.lwdrawer*` aus der App
   beibehalten (dann greift der Wächter-Test der App weiter über die
   Set-Kopie)? *Ohne Antwort: `.v2drawer*`* — `booking.css` hält
   `.lwdrawer*` in diesem Repo bereits mit Hex belegt; zwei Regelsätze unter
   einem Namen sind der schlimmere Fall. Der Test der App wandert mit, wenn
   die App umzieht.
2. **Fokus-Führung mitnehmen?** Sie ist ein Verhaltenszugewinn gegenüber der
   Vorlage und könnte die 29 Aufrufstellen anders anfühlen lassen.
   *Ohne Antwort: ja* — V10/V11 sind Barrierefreiheit, und `Dialog` im Set
   macht es bereits so.
3. **`UrlDrawer` mit ins Set?** *Ohne Antwort: nein* — `next/navigation`
   macht ihn zur App-Verdrahtung. Er bleibt dort und importiert die Hülle.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
