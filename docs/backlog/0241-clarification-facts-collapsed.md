# 0241 · ClarificationCard: Grundlage eingeklappt mit Anzahl

| | |
|---|---|
| Status | fertig — abgenommen 2026-11-03 (fremde Abnahme, keine Mängel, H1–H6) |
| Stufe | `entities/clarification/` (Änderung an `ClarificationCard`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein, die Fakten einer Rückfrage zu Beleg, Konto und Buchung |
| Quelle | llcto 2026-11-03, DS-Wunsch 0241 (Owner 2026-11-02): „Rückfragen tragen inzwischen sehr viele Fakten und werden dadurch lang.“ |
| Ersetzt | den offenen Block „Grundlage“ (`Block` mit `h4`/`h3`) in `ClarificationCard.tsx`, Karte und Schritt-Form |
| Blockiert | nichts. Den DS-Zeiger in der App setzt llcto |
| Spec von / am | Designer-Sitzung, 2026-11-03 |

## Ziel

Seit 0238 trägt eine Rückfrage ihre Fakten als Tabelle mit Quelle. Eine Frage
mit zehn Fakten schiebt die Antwortoptionen weit nach unten. Die
Steuerfachangestellte, die 40 Fragen nacheinander beantwortet, liest die Frage
und die Empfehlung und entscheidet meist ohne die Fakten. Nur wenn sie zweifelt,
schaut sie nach. Künftig steht „Grundlage“ eingeklappt mit der Anzahl
(„Grundlage 5“) zwischen Empfehlung und Quellen. Ein Klick öffnet die Tabelle.

## Einordnung

- **Wiederverwenden:** `Disclosure` (`@when` „Secondary content that has a
  place but not the first look — … a long list under a summary“). Er deckt den
  Fall ganz ab, mit `count` am rechten Rand. Dieselbe Karte nutzt ihn schon für
  die Evidenz („Belege“, „Zahlungen“ …). §3 Regel 1.
- **Neu oder erweitert:** nichts. Kein neuer Export, keine neue Prop, kein neues
  Wort, kein Token.
- **Zuschnitt:** eine Stelle in `ClarificationCard.tsx`, um Zeile 1120.
- **Setzt auf:** `Disclosure` (ohne `defaultOpen`, also zu), darin `Facts`
  (0238) unverändert.

## Schnittstelle

Unverändert. Kein Prop kommt dazu und keiner fällt weg.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `clarification.facts` | wie 0238 | nein | Mit Fakten steht „Grundlage“ eingeklappt mit der Anzahl `facts.length`. Ohne Fakten fehlt der Fold-out ganz, wie bisher | `InBatchReview`, `Step`, `ByHand` |

**Kann bewusst nicht:**
- Sie öffnet die Grundlage nicht von außen. Ein Prop dafür (`factsOpen`) wäre
  eine Option auf Vorrat, siehe Ausbau.
- Sie zeigt keine Vorschau der ersten Zeilen und hat keinen Knopf
  „alle anzeigen“. Der Owner zieht Einklappen vor (Nicht-Scope).
- Sie merkt sich nicht, ob die Grundlage offen war. Beim Blättern zur nächsten
  Frage (`key={c.id}`) startet sie wieder zu.

## Verhalten

- **Ort:** an derselben Stelle wie bisher: nach Text und Empfehlung, vor
  „Quellen und Kontext“ (Karte) bzw. vor „Verlauf dieser Frage“
  (Schritt-Form). Die Reihenfolge aus 0214 bleibt.
- **Darstellung:** der Standard-`Disclosure`, wie die Evidenz-Fold-outs der
  Karte. Chevron links, „Grundlage“ in Textfarbe 500, die Anzahl in
  `--color-text-muted` am rechten Rand, eine Linie `--color-border-subtle`
  darüber. Kein eigener Ton und keine eigene Regel in `v3.css`.
- **Beide Formen gleich.** Karte und Schritt-Form zeigen denselben Fold-out. Der
  Kopf ist kein `h3`/`h4` mehr, sondern die `summary` (siehe Offene Frage 1).
- **Bleibt offen:** die Empfehlung (`recommendationNote`), die Antwortoptionen,
  das Feld und die Evidenz-Fold-outs, jeweils wie bisher.
- **Tastatur:** `summary` ist ein Fokusziel in der Lesefolge. `Enter` und
  `Leertaste` klappen auf und zu, nativ von `<details>`. Die Quellen in der
  Tabelle (0238) sind erst im offenen Zustand Fokusziele.
- **Hover:** die `summary` bekommt `--color-bg-soft`, wie jeder `Disclosure`.
- **Zustände:** Die Karte hat ihre fünf Zustände schon (0214). Für den
  Fold-out gilt: Ohne Fakten fehlt er. Laden, Fehler und Filter gibt es hier
  nicht, denn er lädt nichts.
- **Server/Client:** unverändert. `Disclosure` ist ein natives `<details>` ohne
  Zustand.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationCard`. Keine neue Story ist nötig, nur
ein geänderter Startzustand:

| Story | Beweist |
|---|---|
| `InBatchReview` (und jede andere Story mit Fakten) | Karte: „Grundlage“ zu, mit Anzahl. Empfehlung und Antwortoptionen sind sichtbar |
| `Step` | Schritt-Form: „Grundlage“ zu, mit Anzahl. Die Optionen stehen sichtbar darunter |
| `ByHand` | ohne Fakten: kein Fold-out „Grundlage“ |
| `FactsWithSources`, `FactsWithoutSources`, `FactsSourcePick`, `FactsInDrawer` | aufgeklappt. Diese vier Stories zeigen die Tabelle aus 0238. Sie öffnen die Grundlage beim Laden wie ein Klick, über eine Hilfsfunktion in der Story-Datei, ohne neuen Prop |

Ausgeschlossen: lädt, Fehler und leer nach Filter, wie in 0238 begründet.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Grundlage offen starten, wenn die Frage ohne Fakten nicht zu entscheiden ist | `ClarificationDetailVM.factsOpen?: boolean` → `defaultOpen` | die App meldet Fragen, deren Antwort an einem Fakt hängt, oder die Abnahme sieht, dass alle die Grundlage öffnen |
| Offen-Zustand beim Blättern behalten | Schlüssel des `Disclosure` von `c.id` lösen | Nutzerinnen öffnen die Grundlage bei jeder Frage eines Stapels |

## Offene Fragen

1. **Kopf als `summary` statt als Überschrift.** Default: ja. In der
   Schritt-Form fällt damit das `h3` „Grundlage“ aus der Gliederung, in der Karte
   das `h4`. So halten es auch die Evidenz-Fold-outs. Eine Überschrift in der
   `summary` würde den Fold-out gegen alle anderen im Set abheben.
   - Die Alternative: `h3`/`h4` in der `summary`.
   - Ohne Antwort gilt der Default.

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

- [ ] Karte: „Grundlage“ ist ein `details` ohne `open`. Die `summary` zeigt „Grundlage“ und die Anzahl `facts.length`, die Tabelle ist nicht sichtbar (`InBatchReview`)
- [ ] Schritt-Form: dasselbe, die Antwortoptionen stehen sichtbar (`Step`)
- [ ] Ohne Fakten kein Fold-out „Grundlage“ (`ByHand`)
- [ ] Die Empfehlung und die Antwortoptionen bleiben offen und sichtbar, die Evidenz-Fold-outs unverändert (`InBatchReview`, `Step`)
- [ ] Gleiches Bild wie die Evidenz-Fold-outs: dieselbe Klasse `v2disc` ohne Ton, Schrift, Farbe, Polster und Linie gemessen gleich wie „Belege“ derselben Karte (`InBatchReview`)
- [ ] Tastatur: `Tab` erreicht die `summary` in der Lesefolge, `Enter` klappt auf und zu, der Fokusring ist sichtbar und ganz (`Step`, `InBatchReview`)
- [ ] Trefferfläche der `summary` ≥ 24 px hoch, gemessen
- [ ] Die vier Facts-Stories zeigen die Tabelle offen, wie in 0238 abgenommen. Ein Klick auf die `summary` klappt sie zu (`FactsWithSources`, `FactsInDrawer`)
- [ ] Beim Blättern zur nächsten Frage startet die Grundlage wieder zu (`StepPaging`)
- [ ] Kein neuer Prop, kein neuer Export, keine neue CSS-Regel (Diff)

## Abnahme

Gemessen auf dem laufenden Dev-Server (Port 6107), der weder neu gestartet noch
neu gebaut wurde. Messbrowser war die Headless Shell 1247 über `CHROME_BIN` und
`scripts/cdp.mjs`, ein Browser je Skript. Gemessen wurde bei 1280 px, mit
Stichproben bei 1920 px. Die Proben (`card.mjs`, `step.mjs`, `sweep.mjs`,
`drawer.mjs`, `rest.mjs`, `srcfocus.mjs`, `note.mjs`) und die Screenshots liegen
im Scratchpad der Sitzung und ändern keine Datei im Repo. Geprüft wurde der Diff
gegen `HEAD` (`c74bef4`). Story-IDs unten ohne das Präfix
`v3-entitäten-klärung-clarificationcard`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` lief nach Auftrag nicht im Arbeitsbaum. `pnpm exec storybook build -o <Scratchpad>` endet mit Exit 0 („Storybook build completed successfully“) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Die Änderung steht in `entities/clarification/ClarificationCard.tsx`, die Stories in `ClarificationCard.stories.tsx` daneben, Titel `v3/Entitäten/Klärung/ClarificationCard`. Es gibt keine neue Datei | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Der neue Kommentar am `Disclosure` und die Story-Hilfe `useFactsOpen` mit JSDoc sind englisch. Deutsch steht nur im sichtbaren Wort „Grundlage“. Es gibt keinen neuen Export, `ClarificationCard` behält `@when`/`@instead`. `check:when` meldet „in Ordnung“, die Selbstprüfung (`--test`) 11 Fälle grün. `check:language` meldet „0 German comment lines“ | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Im Diff steht kein Hex und kein px. Es gibt keine Label-Map, und kein Status ist berührt. `check:type` meldet „ok“, `check:contrast` und `check:icons` enden mit Exit 0. `check:classes` endet mit Exit 1 und genau den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--in-batch-review`, `--step`, `--by-hand`, `--facts-with-sources`, `--facts-without-sources`, `--facts-source-pick` und `--facts-in-drawer` stehen im Index und rendern. Wie die Spec sagt, gibt es keine neue Story. Lädt, Fehler und leer nach Filter sind ausgeschlossen, mit dem Grund „er lädt nichts“ und dem Verweis auf 0238. `--loading` und `--error-state` (Senden, Fehler am Knopf) zeigen die Grundlage zu wie jede Karte mit Fakten | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Die Stufe bleibt, `Disclosure` kommt aus `primitives/`, der Import geht abwärts. Das Wort steht links, die Anzahl rechts. Die Schrift kommt aus der Skala: Kopf 13,5 px/500, Anzahl 13,5 px/400. Das Chevron ist Lucide über `ActionIcon`, 14 px, Strich 1,5 px, nie ohne Wort. Kontrast, aus den gemessenen Farben gerechnet: Kopf `rgb(45, 45, 45)` 13,77:1 auf Weiß und 12,71:1 auf `rgb(244, 246, 248)`. Anzahl und Chevron `rgb(92, 92, 92)` 6,69:1 und 6,17:1. Fokusring `rgb(59, 143, 196)` 3,55:1 und 3,28:1. Unter `prefers-reduced-motion: reduce` dauert die Drehung des Chevrons `1e-05s`. Es gibt keine neue Farbe und keinen neuen Zustand. Hover, Tastatur und Trefferfläche stehen in den Zeilen darunter | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Bei 1280 px geladen: 27 Stories von `ClarificationCard`, 11 von `ClarificationRow`, `seiten-deck--questions`, `seiten-deck--question-detail` und acht Sachverhalt-Seiten (`seiten-sachverhalt-einzelfall--clarification-open-firm`, `-reiter--clarifications`, vier aus `-einträge`, `-seite--in-use`, `-crud--full-cycle`). Keine Seite läuft quer (`scrollWidth` = `clientWidth`). Die Konsole meldet 0 Fehler, 0 Warnungen und 0 Ausnahmen. 25 Fold-outs „Grundlage“ in 21 Stories starten zu, dazu die zwei im Deck. Im DOM steht kein Blockkopf `h3`/`h4` „Grundlage“ mehr. Screenshots `0241-in-batch-review-1280.png`, `-1920.png`, `0241-step-open-1280.png`, `0241-seiten-deck--question-detail-1280.png` | ✓ |
| Karte: „Grundlage“ ist ein `details` ohne `open`, die `summary` zeigt „Grundlage“ und `facts.length`, die Tabelle ist nicht sichtbar | `--in-batch-review` bei 1280 und 1920: `details.v2disc` mit `open` false, `summary` „Grundlage“ mit der Anzahl „4“. Die Fixture hat 4 Fakten, im Rumpf stehen 8 Zellen. Der Rumpf meldet `checkVisibility()` false, im Bild steht nur die Kopfzeile (`0241-in-batch-review-1280.png`) | ✓ |
| Schritt-Form: dasselbe, die Antwortoptionen stehen sichtbar | `--step` bei 1280 und 1920: zu, „Grundlage“ mit „3“ bei 3 Fakten, Rumpf `checkVisibility()` false. Die drei Optionen stehen bei y = 318, 414 und 463 px, also im ersten Fenster von 900 px, und sind sichtbar (`0242-step-1280.png`) | ✓ |
| Ohne Fakten kein Fold-out „Grundlage“ | `--by-hand`: kein `details` „Grundlage“ und kein alter Blockkopf. Ebenso `--in-portal` und die Sachverhalt-Seiten, deren Fixtures keine Fakten tragen | ✓ |
| Empfehlung und Antwortoptionen bleiben offen und sichtbar, die Evidenz-Fold-outs unverändert | `--in-batch-review`: „Empfehlung: Reisekosten (4670)“ steht offen über der Grundlage (y = 229–272). Die Optionen stehen bei y = 755 und 804. Die sieben Fold-outs von „Sachverhalt“ bis „Weitere Quellen“ sind zu wie vorher, ohne `defaultOpen`. `--step`: „Warum empfohlen: …“ steht offen unter den Optionen (y = 520–583). Im Kasten „Kontext“ sind „Sachverhalt“ und „Belege“ offen und die vier anderen zu, wie in 0222 | ✓ |
| Gleiches Bild wie die Evidenz-Fold-outs: dieselbe Klasse `v2disc` ohne Ton, Schrift, Farbe, Polster und Linie gemessen gleich wie „Belege“ | `--in-batch-review` bei 1280 und 1920, gemessen mit `getComputedStyle` und `getBoundingClientRect`. Beide sind `details.v2disc` ohne Ton. Kopf 13,5 px, 500, `rgb(45, 45, 45)`, Zeilenhöhe 20,93 px, Polster 8 px rundum, Radius 2 px, 36,92 × 760 px. Linie oben 1 px solid `rgb(236, 239, 243)`. Chevron 14 × 14 px bei x = 24, `rgb(92, 92, 92)`, Strich 1,5 px. Anzahl `rgb(92, 92, 92)`, 400, rechte Kante bei 768. Hover bei beiden `rgb(244, 246, 248)` mit Cursor `pointer`, ohne Maus `rgba(0, 0, 0, 0)`. Nur der Abstand zum Nachbarn weicht ab: zur Grundlage 12 px, zwischen den Evidenz-Fold-outs 8 px (H1). In der Schritt-Form sieht der Kasten „Kontext“ anders aus (H4) | ✓, H1, H4 |
| Tastatur: `Tab` erreicht die `summary` in der Lesefolge, `Enter` klappt auf und zu, der Fokusring ist sichtbar und ganz | `--in-batch-review`: Die Tab-Folge geht vom Link „Sachverhalt 2026-0042 · Bewirtung Musterfirma“ zu „Grundlage 4“ und dann zu „Sachverhalt 1“. `--step`: Von der `h2` führt ein Tab auf „Grundlage 3“, der nächste auf die erste Option (H5). Die `summary` ist `:focus-visible` mit `2px solid rgb(59, 143, 196)` und Abstand −2 px, der Ring liegt also innen. Kein Vorfahr schneidet ab: In der Schritt-Form umschließt `.v2clc__main` (`overflow: clip`) die `summary` ganz (`0241-in-batch-review-focus.png`, `0241-step-focus.png`). `Enter` öffnet, der Fokus bleibt auf der `summary`, und die Zellen werden sichtbar (8 bzw. 6). Ein zweites `Enter` schließt, die Leertaste ebenso. Zu ist keine Quelle ein Tab-Stopp: In `--facts-source-pick` springt Tab von „Grundlage 5“ zur Option, offen auf die drei Quellen | ✓, H5 |
| Trefferfläche der `summary` ≥ 24 px hoch, gemessen | Die `summary` ist 36,92 px hoch, in der Karte 760 px und in der Schritt-Form 774 px breit, bei 1280 und 1920. Im Drawer `sm` ist sie 36,92 × 395 px | ✓ |
| Die vier Facts-Stories zeigen die Tabelle offen, wie in 0238 abgenommen. Ein Klick auf die `summary` klappt sie zu | `--facts-with-sources` (5 Fakten), `--facts-without-sources` (4), `--facts-source-pick` (beide Formen) und `--facts-in-drawer` (6, im Drawer) stehen nach dem Laden offen, der Rumpf meldet `checkVisibility()` true. Ein Mausklick auf die `summary` schließt, ein zweiter öffnet wieder, auch im Drawer. Die Tabelle hält, was 0238 gemessen hat: Quellen 24,0 px hoch, im Drawer `sm` bei 1280 kein Überlauf (`scrollWidth` 435 = `clientWidth`), „Beleg RE-2026-4471“ auf einer Zeile, die lange Zahlung auf 5 Zeilen (101,5 px). Sie ist jetzt um das Polster des Fold-outs eingerückt (H2) (`0241-facts-with-sources-1280.png`, `0241-facts-in-drawer-1280.png`) | ✓, H2 |
| Beim Blättern zur nächsten Frage startet die Grundlage wieder zu | `--step-paging`: „Grundlage 3“ per Klick geöffnet (`open` true), dann „Speichern und weiter“ geklickt. Es folgt Frage 2 von 3 mit „Grundlage 2“ zu, und `document.activeElement` ist die `h2` „Gegenpartei weicht ab: …“. Wieder geöffnet und weiter: Frage 3 mit „Grundlage 1“ zu, der Fokus auf der `h2`. Zurück über den Pfeil des Pagers: Frage 2 zu, der Fokus bleibt auf dem Pfeil wie in 0222 (`0241-0242-step-paging-after-1280.png`) | ✓ |
| Kein neuer Prop, kein neuer Export, keine neue CSS-Regel | `git diff HEAD`: Typen und `src/ui/v3/index.ts` bleiben unverändert. `v3.css` verliert nur `.v2clc__topic` (0242) und bekommt keine Regel dazu. `useFactsOpen` ist lokal in der Story-Datei, nicht exportiert | ✓ |

Abgenommen von / am: fremde Abnahme, 2026-11-03 · Offene Punkte: keine Mängel; H1–H6 nicht blockierend

### Hinweise

- **H1 · In der Karte steht die Grundlage allein über „Quellen und
  Kontext“.** Vorher waren beide Blöcke gleichrangig, je mit `h4`. Jetzt sieht
  die Grundlage aus wie ein Eintrag der Gruppe darunter, steht aber über deren
  Kopf, mit 12 px statt 8 px Abstand (Lücke von `.v2clc` gegen
  `.v2clc__evidence`, `0241-in-batch-review-1280.png`). Das folgt aus Offene
  Frage 1 (Default ohne Überschrift).
  Beobachten, ob die Kanzlei die Grundlage als Teil der Quellen liest.
- **H2 · Die Tabelle ist 16 px schmaler.** Der Rumpf des `Disclosure` hat
  8 px Polster links und rechts. Die Tabelle misst in der Karte 744 statt
  760 px, im Drawer `sm` 379 px. Der Umbruch im Drawer bleibt wie in 0238
  gemessen. Der Nachtrag in 0238 nennt die Tabelle „unverändert“. Genauer wäre
  „Inhalt unverändert, eingerückt wie die Evidenz-Tabellen“.
- **H3 · In Story-Rahmen ohne eigene Fläche ist der Hover unsichtbar.** In
  `--in-batch-review`, `--filled` und den Facts-Stories liegt die Karte auf
  `rgb(244, 246, 248)`, dem Ton des Hovers. Das gilt für jeden Fold-out der
  Karte und bestand schon vor 0241. In der Schritt-Form und im Deck liegt die
  Karte auf Weiß, dort ist der Hover sichtbar (`0241-step-hover.png`).
- **H4 · In der Schritt-Form stehen zwei Bilder von Fold-outs
  nebeneinander.** Die Grundlage hat das Standardbild (13,5 px/500,
  `rgb(45, 45, 45)`). Die Gruppen im Kasten „Kontext“ sind Gruppenköpfe
  (12,5 px/700, `rgb(92, 92, 92)`, Polster 18 px). Das ist spec-gerecht, denn
  der Vergleich gilt den Evidenz-Fold-outs der Karte. Die Leserin sieht aber im
  selben Schritt zwei Arten Aufklapper.
- **H5 · Ein Kommentar zählt die Tabs nicht mehr richtig.**
  `ClarificationCard.tsx:847` sagt „one Tab to its first option“. Mit Fakten
  sind es jetzt zwei (`h2` → „Grundlage“ → Option), gemessen in `--step`.
- **H6 · Das Entitätsprofil ist veraltet.** `docs/entitaeten/clarification.md`
  Zeile 211 nennt für `ClarificationCard` noch „Fakten als `FieldList`“. Seit
  0238 ist es eine Tabelle, seit 0241 eingeklappt. Nachziehen bei der nächsten
  Pflege des Profils.

### Nach der Abnahme (2026-11-03)

- H2: Nachtrag in 0238 nennt jetzt die 16 px Polster statt „unverändert“.
- H5: Kommentar zum Fokus in `ClarificationCard.tsx` nennt den Tab-Stopp „Grundlage“.
- H6: `docs/entitaeten/clarification.md` nennt Tabelle (0238), eingeklappt (0241), statt `FieldList`.
- H1, H3, H4 bleiben, wie die Spec sie will oder wie sie vor 0241 waren.
