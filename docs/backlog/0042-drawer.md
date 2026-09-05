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

Abnahme am 2026-09-05 (zweiter Agent, gegen Spec und Code). Alle sechs Stories
auf `localhost:6107` geöffnet und bedient: geöffnet, mit Escape, Kreuz und
Scrim geschlossen, gescrollt, Breiten gemessen.

**Story-Deckung.** Sechs Stories in der Spec, sechs Exporte in
`Drawer.stories.tsx`, sechs IDs in `index.json` (`--open`, `--sizes`,
`--with-footer`, `--footer-from-body`, `--long-content`, `--in-use`) — die
Ableitung (1 Callback-Rundlauf + 1 Enum-Prop + der Rest je Prop) geht auf und
bleibt unter der Obergrenze 10. Jede Prop hat ihre Story: `open`/`onClose`
(`Open`) · `title` und `meta` (`Open`) · `children` (`LongContent`) · `footer`
(`WithFooter`, mit Gegenprobe ohne sie) · `size` (`Sizes`, alle drei Werte) ·
`ariaLabel` (`InUse`, wo `title` kein String ist). `DrawerFooter` hat mit
`FooterFromBody` seine eigene. `Leer`, `LaedtGerade` und `Fehler` sind
begründet ausgeschlossen — die Hülle hat keine Daten.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme). `pnpm build` **nicht** neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Drawer.tsx` mit `Drawer` und `DrawerFooter` einer Familie, `Drawer.stories.tsx` daneben; Titel `v3/Primitives/Dialog/Drawer` deckt sich mit der Barrel-Gruppe (`src/ui/v3/index.ts:111` `/* Dialog */`, Export `:113`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` an beiden Exporten ✓ (`Drawer` `:56–59`, `DrawerFooter` `:146–149`), beide englisch. **Der Rest der Datei ist es nicht:** das Datei-JSDoc `:15–26` („Der Slide-over von rechts … die eine Drawer-Hülle des Sets") und fünf weitere Kommentare stehen auf Deutsch — `:28` („Breiten-Stufen statt ad-hoc-CSS je Aufrufer"), `:33` („Escape, Klick aufs Scrim, Kreuz — alle drei Wege melden dasselbe"), `:53` („Wie lange der Knoten nach dem Schließen … steht"), `:72` („Portal-Ziel für `<DrawerFooter>`"), `:79–80` („Der Fokus muss in den Drawer …"). `CLAUDE.md` verlangt Englisch für Kommentare und JSDoc; die Datei ist am 2026-09-03 neu entstanden, die Ausnahme „bestehende Bezeichner nicht in Masse umbenennen" greift nicht. Daneben stehen in derselben Datei englische Kommentare (`:36`, `:39–43`, `:45`, `:47`) — es ist ein Mischbestand, kein Stil | ✗ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}' Drawer.tsx` = 0, `grep -cE '[0-9]+px'` = 0 (`EXIT_MS = 300` ist eine Zeitkonstante, kein Maß). Keine Map, kein Status — die Hülle kennt keine Daten. `size={16}` am Schließen-Icon ist ein Sprossenwert der Icon-Leiter (A8), wie bei `Dialog` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, Beträge rechts (`InUse`: `AmountCell` in der letzten Spalte), nichts zentriert · keine Farbe ohne Wort — der Drawer färbt nichts · `aria-modal="true"` und `role="dialog"` am Panel, `aria-label` aus dem Titel oder `ariaLabel` · Bewegung über `--duration-slow`/`--ease-standard`, nicht hart · Schließen-Kreuz mit `aria-label="Schließen"` — kein Icon ohne Wort · die zwei App-Punkte übersprungen. **Reißt beim Punkt „Fokusring/Fokusführung" (V10/V11)** — siehe die variable Tabelle | ✗ |
| Im Browser angesehen, nicht nur gebaut | Alle sechs IDs am 2026-09-05 geöffnet und bedient; Breiten, Scrollhöhen und `document.activeElement` gemessen. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `size` liefert die drei Breiten aus `--drawer-sm/md/lg`, Default `md` (`Sizes`) | `--sizes` bei 1340 px Fenster: `sm` → 456 px (`clamp(340px, 34vw, 560px)` = 34 vw), `md` → 670 px (50 vw), `lg` → 1100 px (`min(1100px, 94vw)`). Die Klasse wandert mit (`v2drawer--sm/md/lg`), die Werte stehen in `tokens.css:217–219`. Default: `--open` und `--footer-from-body` setzen `size` nicht und stehen auf `v2drawer--md` | ✓ |
| Alle drei Schließwege melden `onClose`: Kreuz, `Escape`, Klick aufs Scrim (`Open`) | `--open`, dreimal geöffnet und je einmal anders geschlossen: `Escape` → Knoten weg nach ~300 ms · Klick auf `.v2drawer__scrim` → zu · Klick auf `.v2drawer__h button` → zu. Alle drei laufen im Code auf dasselbe `onClose` (`:99`, `:111`, `:130`) | ✓ |
| Fokus steht nach dem Öffnen im Drawer und kehrt beim Schließen auf den Auslöser zurück (`Open`) — **Zugewinn gegenüber der Vorlage** | **Die erste Hälfte fehlt.** `--open`, `document.activeElement` nach dem Klick auf „Kontenblatt ansehen", gemessen bei +20 / +80 / +200 / +600 / +1500 ms: jedes Mal `button.v2btn.v2btn--secondary` („Kontenblatt ansehen"), nie das Panel. Das Panel wäre erreichbar (`tabIndex=-1`; ein `aside.focus()` aus der Seite heraus setzt den Fokus sofort) — der Aufruf läuft nur zu früh: `panel.current?.focus()` steht im `requestAnimationFrame` von `:83–86`, zu diesem Zeitpunkt hat `setRender(true)` das `<aside>` noch nicht gemountet, `panel.current` ist `null`. Die zweite Hälfte stimmt nur deshalb trivial: der Fokus kehrt auf den Auslöser zurück, weil er ihn nie verlassen hat. Damit tabbt die Tastatur weiter durch die Seite hinter dem Scrim (V10/V11) — genau der Zugewinn, den die Spec als Grund für den Umzug nennt, ist nicht da | ✗ |
| Beim Schließen gleitet der Drawer hinaus, er verschwindet nicht (`Open`) | `--open`, direkt nach `Escape`: das `aside` steht noch im Baum, `transform: matrix(1,0,0,1,508.316,0)` — es ist mitten in der Bewegung nach rechts, die `is-open`-Klasse ist weg. 400 ms später ist der Knoten fort (`EXIT_MS = 300`, `:54`) | ✓ |
| `footer` und `DrawerFooter` belegen dieselbe Leiste; ohne beides ist keine Leiste sichtbar | `--with-footer`, „Mit Leiste": `.v2drawer__foot` `display: flex` mit „Abbrechen" und „Zuordnen". „Ohne Leiste": dasselbe Element `display: none` bei leerem `innerHTML` (`v3.css:851` `:empty`). `--footer-from-body`: die Knöpfe stehen im selben `.v2drawer__foot`, obwohl sie im Body gerendert werden — und sie teilen dessen Zustand: „Speichern" ist `disabled`, bis im `Textarea` etwas steht, danach nicht mehr | ✓ |
| Body scrollt, Kopf und Fuß stehen (`LongContent`) | `--long-content`: `.v2drawer__b` `overflow-y: auto`, `scrollHeight` 1501 bei `clientHeight` 667. Nach `scrollTop = 800`: Kopf weiter bei `top 0`, Fußleiste weiter bei `bottom 800` (= Fensterhöhe) — beide unbewegt | ✓ |
| `.v2drawer*` steht in `v3.css` und enthält kein Hex und kein px | Block `v3.css:790–851`: 13 Regeln, alle Farben, Abstände, Schriftgrößen, Rahmen und Zeiten über Tokens (`--color-scrim`, `--color-surface`, `--shadow-drawer`, `--space-*`, `--fs-ui-*`, `--border-1`, `--duration-*`). Kein `#`, kein `px` — `translateX(100%)` ist relativ. (Die Maße selbst stehen als `clamp`/`min` in `tokens.css`, wo sie hingehören) | ✓ |
| Das Schließen-Kreuz ist `IconButton`, kein eigener Knopf | `Drawer.tsx:127–131` rendert `<IconButton label="Schließen" icon={<ActionIcon action="close" …>} />`; im DOM `button.v2ibtn.v2ibtn--md` mit `aria-label="Schließen"` — dieselbe Klasse wie überall sonst, kein `.v2dlg__close`-Eigenbau | ✓ |
| `width` existiert nicht; die Vorlage hatte sie mit „nicht benutzen" markiert | `grep -n "width" src/ui/v3/primitives/Drawer.tsx` findet keine Prop; `DrawerProps` (`:31–49`) führt acht Felder, `width` ist keins davon | ✓ |
| `@instead` schickt weiter: Entscheidung → `Dialog`, Seitenaufbau → `MasterDetail`, ein Satz → `Popover`/`HoverCard` | `Drawer.tsx:58` nennt alle drei wörtlich in dieser Reihenfolge | ✓ |
| Ersetzt `Drawer`/`DrawerFooter` in `ui/components/primitives/Drawer.tsx` ohne Funktionsverlust | Betrifft `ludwig/app` (29 Aufrufstellen, Wächter-Test `ui/drawers/__tests__/drawer-catalog.test.ts`); in diesem Repo nicht erfüllbar | offen (App) |
| `UrlDrawer` baut in der App weiter darauf auf, unverändert in seiner Schnittstelle | Betrifft `ludwig/app` | offen (App) |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **`InUse` hält, was 0013 braucht.** `size="lg"` (1100 px), `title` als
  Fragment mit `span.lw-numeric` und deshalb `ariaLabel="Kontenblatt 6815
  Bürobedarf"` am Panel, Saldo als `meta` im Kopf, fünf Buchungszeilen in
  einer `Table` mit vier Spalten und Beträgen rechts.
- **Der Drawer stapelt sich nicht selbst.** In `--sizes` schaltet ein zweiter
  Knopf nur `size` um, statt einen zweiten Drawer zu öffnen — die Story hält
  sich an „Stapeln kann sie bewusst nicht".
- **Auch die Story-Datei ist deutsch kommentiert** (`Drawer.stories.tsx:15–20`
  und weitere). Das ist hier verbreitet und kein eigener Mangel dieser
  Aufgabe, gehört aber zum selben Befund wie die Datei.

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`.

**Offene Punkte**

1. **Der Fokus kommt beim Öffnen nicht in den Drawer.** `panel.current` ist im
   `requestAnimationFrame` von `Drawer.tsx:83–86` noch `null`, weil das
   `<aside>` erst nach `setRender(true)` gemountet wird. Der Fokus muss
   gesetzt werden, wenn der Knoten steht (eigener Effect auf `render`/`shown`,
   oder `panel` per Callback-Ref). Ohne das ist der versprochene Zugewinn
   gegenüber der App-Vorlage nicht vorhanden.
2. **Datei-JSDoc und fünf Kommentare in `Drawer.tsx` sind deutsch**
   (`:15–26`, `:28`, `:33`, `:53`, `:72`, `:79–80`) — `CLAUDE.md` verlangt
   Englisch, und die Datei ist neu.

## Die zwei offenen Punkte — behoben, und ein dritter dazu

**1 — der Fokus kommt in den Drawer.** Behoben mit 0092: der Aufruf saß im
`requestAnimationFrame`, wo `panel.current` noch `null` ist, und steht jetzt
in einem eigenen Effekt auf `render` — dort ist der Knoten da. Die Abnahme von
0092 hat es an drei Stellen gemessen (`aside.v2drawer` bei 50/200/500 ms), die
Rückgabe an den Auslöser ebenfalls, auch wenn der Aufrufer den Drawer
**aushängt** statt `open` umzulegen.

**2 — die deutschen Kommentare sind weg.** Datei-JSDoc, `onClose`,
`DrawerSize`, `EXIT_MS`, das Portal-Ziel und der Fokus-Kommentar stehen auf
Englisch. Nutzer-Strings („Schließen") bleiben deutsch.

**3 — die Fokusfalle, die der Kommentar behauptet hatte, gibt es jetzt
wirklich** (Befund B5 der Abnahme von 0092). Der Satz „sonst tabbt die
Tastatur hinter dem Scrim weiter" stand im Code, die Falle nicht: gemessen
verließ der Fokus den Drawer zweimal je Runde — einmal auf `body`, einmal auf
den Auslöser **hinter** dem Scrim.

`trapTab` wohnt deshalb nicht mehr in `Dialog`, sondern in
`primitives/focus.ts`. Beide Hüllen sind Primitives und dürfen einander nicht
importieren; und eine Regel, die zwei Bausteine verschieden auslegen, driftet.
Dieselbe Begründung wie bei `hotkey.ts` in 0004.

Nachgemessen mit **echten** Tastendrücken (CDP `Input.dispatchKeyEvent`,
Story `InUse`): 12× Tab und 12× Shift-Tab wandern zwischen Kreuz und
Fußzeilen-Knopf im Kreis, in keinem der 24 Schritte außerhalb von
`aside.v2drawer`.

**Nebenbei aus derselben Abnahme (B6):** weder `Dialog` noch `Drawer` löschen
den Auslöser-Merker beim Aufräumen. Unter `reactStrictMode` läuft der
Mount-Effekt doppelt; ein Aufräumen, das den Merker leert, nähme der zweiten
Runde den Weg zurück. Überschrieben wird er beim nächsten Öffnen.

## Abnahmekriterien (Nachtrag)

- [ ] Tab und Shift-Tab verlassen den Drawer nicht (Story `InUse`, echte Tastendrücke)
- [ ] `trapTab` steht in `primitives/focus.ts`, und `Dialog` wie `Drawer` benutzen dieselbe Funktion (`grep`)
- [ ] Kein deutscher Kommentar mehr in `Drawer.tsx` (`grep`)
- [ ] Der Auslöser-Merker wird beim Aufräumen nicht geleert (`grep opener.current = null` findet nichts)
