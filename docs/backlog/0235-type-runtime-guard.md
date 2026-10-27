# 0235 · Laufzeit-Wächter für Schriftgrößen: `check:type:runtime`

| | |
|---|---|
| Status | fertig |
| Stufe | Wächter (`scripts/check-type-runtime.mjs`), dazu ein Fund in `src/showcase/partner/partner-list.tsx` |
| Klassen-Test | entfällt, kein Baustein |
| Quelle | Owner 2026-10-27 über llcto: „festhalten, was die Policies für Schriftgrößen sind, und dann prüfen, ob die Policies angewandt sind“. Analyse der Designer-Sitzung vom selben Tag, Punkt 3 b; llcto: „Laufzeit-Wächter gern danach, App-Seite über ll-abnahme als Playwright-Check“ |
| Ersetzt | nichts; ergänzt `check:type` (statisch) |
| Blockiert | nichts |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

`check:type` liest den Quelltext. Was ein `span` ohne Klasse erbt, sieht es
nicht. Seit 0231 erbt Text in der Arbeitsfläche zwar 13,5 statt 16 px, aber eine
Inline-Größe, eine Kurzform in einer Variable oder ein fehlendes `h1` rutschen
weiter durch. Der neue Wächter misst, was die Arbeitsfläche wirklich zeigt, und
prüft es gegen die Rollentabelle (0220/A14).

## Einordnung

- **Laufzeit statt Quelltext:** Der Wächter öffnet jede Story, die die
  Arbeitsfläche zeigt, im laufenden Storybook. Er liest die berechnete Schrift
  jedes sichtbaren Textknotens in `.app__main`. Ausgewählt werden die Stories über
  ihre Dateien: jede `*.stories.tsx`, die `AppShell` oder `app__main` nutzt.
- **Drei Regeln, aus der Rollentabelle:**
  - **R1:** Jede Größe ist eine Stufe der produktiven Skala, `--fs-ui-*`. Die
    Werte liest der Wächter aus der Seite, so bleibt `tokens.css` die einzige
    Quelle.
  - **R2:** 16 px nur als Titel, also mit Gewicht 600 oder mehr. 16/400 hat
    keine Rolle.
  - **R3:** Genau ein `h1` je Story, in der Stufe Seitentitel (`--fs-ui-xl`,
    600).
- **Ausgenommen:** Text, der nur vorgelesen wird (`.v2vh`), und Text in SVG. Er
  hat keine Größe auf dem Schirm.
- **Nicht in `pnpm build`:** Der Wächter braucht einen Browser und den
  Dev-Server, er läuft deshalb wie die Messungen der Abnahmen. Für die App baut
  ll-abnahme denselben Check als Playwright-Test gegen Staging.

## Schnittstelle

`pnpm check:type:runtime`: Exit 0, wenn alle Stories die Regeln halten. Exit 1
listet je Story die Funde. Exit 2 heißt, dass kein Storybook auf 6107 läuft.
`--test` prüft die Regeln an festen Fällen, ohne Browser.

## Fund beim Bau

`Seiten/Geschäftspartner/Liste` (`InUse`) hatte kein `h1`. Die Seite begann mit
den Reitern. Sie bekommt einen `PageHeader` wie die anderen Seiten des Sets:
Overline „Musterbau GmbH“ (ohne Jahr, wie im Seitenprofil: „Kein Jahr in Kopf
oder Filter“), Titel „Geschäftspartner“ und als
Beschreibung den Job aus dem Seitenprofil.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Paare aus Größe und Gewicht je Rolle (z. B. 12,5 nur 400/600/700) | weitere Regel | ein Fund zeigt eine Stufe mit falschem Gewicht |
| Seiten- und Komponenten-Stories ohne `AppShell`, Text in Drawern, Dialogen und Toasts | Auswahl über `#storybook-root` | heute schon: 10 von 177 Seiten-Stories ohne `AppShell` zeigen Größen außerhalb der Skala (13/700, 12/600 `lw-overline`, 10,58/400; Abnahme H5) — die nächste Runde |
| schnellere Auswahl (Story statt Datei) | Liste der Story-IDs | der Lauf (121 s) bremst; Auswahl je Story spart etwa 90 s (Abnahme H2) |

## Abnahmekriterien

- [ ] `node scripts/check-type-runtime.mjs --test` endet mit Exit 0; jede Regel hat einen Fall, der sie verletzt, und einen, der sie hält
- [ ] `pnpm check:type:runtime` gegen den Dev-Server endet mit Exit 0 und nennt die Zahl der gemessenen Stories
- [ ] Gegenprobe: Ein künstliches 13-px-Element, ein 16/400-Text und ein zweites `h1` in einer Story mit Arbeitsfläche lassen den Wächter mit Exit 1 enden und die richtige Regel nennen (Laufzeit-Probe, nicht im Repo)
- [ ] Ohne laufendes Storybook endet er mit Exit 2 und einem Satz
- [ ] `Seiten/Geschäftspartner/Liste` hat genau ein `h1` mit 20/600, darunter die Reiter wie vorher
- [ ] Code englisch; `check:language`, `check:type` grün

## Abnahme

Gemessen gegen HEAD `2a5c741` und den uncommitteten Diff an
`scripts/check-type-runtime.mjs`, `package.json` und
`src/showcase/partner/partner-list.tsx`. Gemessen wurde am Dev-Server 6107, der
dafür weder gestoppt noch neu gebaut wurde. Messbrowser war der Headless Shell
1247 über `CHROME_BIN` und `scripts/cdp.mjs`. Die Proben laufen als Kopien des
Wächters im Scratchpad der Sitzung und ändern keine Datei im Repo:

- `probe-guard.mjs` fügt vor dem Messen per `Session.eval` DOM in `.app__main` ein.
- `port-guard.mjs` fragt Port 6199 ab.
- `diag.mjs` liest jede Story der Auswahl einzeln aus, auch die ohne Arbeitsfläche,
  und dazu alle Seiten-Stories ohne `AppShell`.
- `partner-shots.mjs` macht die Bilder vorher und nachher. Für „vorher“ wird der
  Kopf per DOM entfernt.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `--test` endet mit Exit 0, jede Regel hat einen Fall, der sie verletzt, und einen, der sie hält | `node scripts/check-type-runtime.mjs --test` → „self-test ok.“, Exit 0, ohne Browser. Es gibt sieben Fälle. R1 hält bei 13,5/400 und verletzt bei 13. R2 hält bei 16/600 und verletzt bei 16/400. R3 hält mit einem `h1` 20/600 (in jedem Fall der Basis) und verletzt mit 0 `h1`, mit 2 `h1` und mit einem `h1` 16/600 | ✓ |
| `pnpm check:type:runtime` endet mit Exit 0 und nennt die Zahl der Stories | „ok. 16 stories with a working surface, every text on the scale, one h1 each.“, Exit 0, Laufzeit 121 s. `diag.mjs` hat unabhängig nachgezählt: 73 Stories aus 13 Dateien geladen, 16 davon mit `.app__main`. In `main` kommen nur 20 · 16 · 14 · 13,5 · 12,5 · 11,5 · 11 px vor; 16 px steht nur zweimal, beide Male als 16/600 | ✓ |
| Gegenprobe: 13 px, 16/400 und ein zweites `h1` geben Exit 1 und die richtige Regel | `probe-guard.mjs` an `seiten-geschäftspartner-liste--in-use`. Ohne Probe: Exit 0. Mit `span` 13 px: Exit 1, „R1 13px/400 off the scale: span „Probe dreizehn““. Mit `p` 16/400: Exit 1, „R2 16px/400 is no role“. Mit nacktem `h1`: Exit 1, „R3 2 h1 instead of one“. Mit allen drei: Exit 1 und drei Zeilen R1, R2, R3 | ✓ |
| Ohne Storybook Exit 2 und ein Satz | `port-guard.mjs` fragt 6199 ab: „check:type:runtime — Storybook is not running on 6107 (`pnpm storybook`).“, Exit 2 nach unter 1 s, ohne Messbrowser. Der Satz nennt 6107, weil in der Kopie nur die Abfrage umgebogen ist | ✓ |
| `Seiten/Geschäftspartner/Liste` hat genau ein `h1` mit 20/600, darunter die Reiter wie vorher | `seiten-geschäftspartner-liste--in-use` bei 1280 und 1440 px: ein `h1.v2phead__title` „Geschäftspartner“ mit 20px/600 und kein weiteres `h1` in `#storybook-root`. Overline 11,5/600, Beschreibung 13,5/400. Darunter stehen Reiter, FilterBar und Karte unverändert, nur 102 px tiefer. Suche und erste Zeilen bleiben bei 900 px Höhe ohne Scrollen sichtbar. `--proposals` hat dieselbe Folge, dann `h2` „Vorschläge“. Bilder: `before-in-use-1280.png`, `after-in-use-1280.png` (Scratchpad). Zur Overline siehe M2, zum Kartenkopf H1 | ✓ |
| Code englisch; `check:language`, `check:type` grün | `pnpm check:language` → Exit 1: „scripts/check-type-runtime.mjs: 2 German comment lines, baseline 0“. Gemeint sind die Zeilen 4–5, das Zitat des Owners. `pnpm check:type` → Exit 0. Selbstprüfungen: `check:type --test` und `check:language --test` grün | ✗ M1 |
| Dazu: `typecheck`, `check:when` | `pnpm typecheck` Exit 0 · `pnpm check:when` „in Ordnung“, Exit 0 | ✓ |
| Dazu: Auswahl der Stories | `app__main` setzt nur `AppShell.tsx`. `AppShell` importiert kein Modul außer den 13 Story-Dateien (und `index.ts`), also erfasst `surfaceFiles` jede Story mit Arbeitsfläche. Stories ohne `.app__main` liefern `null` und werden weder gemessen noch gezählt. 57 von 73 werden trotzdem geladen (H2) | ✓ |
| Dazu: Ausnahmen `.v2vh` und `svg` | Keine der 16 Stories hat Text in SVG, und auch keine der 177 Seiten-Stories ohne `AppShell`. `.v2vh` deckt 80 Knoten in `seiten-konto-seite--in-use` und `…ledgeraccountview--in-use` ab: die Diagrammtabelle, alle 13,5 px in einer Box von 1 × 1 px. `.v2vh` hat keinen Fokus-Zustand, der den Text zeigt. Heute verdecken die Ausnahmen also keinen Fund. Proben: 13 px in `svg` und in `.v2vh` werden wie spezifiziert übergangen | ✓ |
| Dazu: Rundung | Proben in `.app__main`: `calc(25px / 2)` und `0.84375rem` gehen durch (12,5 und 13,5, kein falscher Treffer). 13,49 px und 12,51 px meldet R1. 13,504 px geht durch, die Toleranz liegt also bei 0,005 px. Die berechneten Größen in den 16 Stories sind glatte Werte (`12.5px`, `13.5px` …) | ✓ |
| Dazu: Laufzeit | 121 s für 16 gemessene Stories. Im Schnitt dauert eine Story 1,6 s, 57 Stories ohne Arbeitsfläche kosten zusammen rund 94 s. Nach dem Lauf läuft kein Messbrowser mehr | ✓, H2 |
| Spec gegen Seitenprofil `partner-liste.md` | Die Beschreibung gibt den Job wieder. Die Overline „Musterbau GmbH · 2026“ widerspricht dem Profil: „Kein Jahr in Kopf oder Filter“ | ✗ M2 |

Abgenommen von / am: fremde Abnahme, 2026-10-27 · Offene Punkte: M1, M2; H1–H6 nicht blockierend

### Mängel

- **M1 · `check:language` ist rot.** Das Kopf-JSDoc von `check-type-runtime.mjs`
  zitiert den Owner auf Deutsch (Zeilen 4–5). Der Wächter zählt das als zwei neue
  deutsche Kommentarzeilen und endet mit Exit 1. Nächster Schritt: das Zitat
  englisch wiedergeben oder nur auf 0235 verweisen. Der Wortlaut steht schon in der
  Spec unter „Quelle“.
- **M2 · Die Overline bringt das Jahr in den Kopf, gegen das Seitenprofil.**
  `partner-liste.md` sagt unter „Was hier nicht hingehört“: „Partner gelten
  mandantweit … Kein Jahr in Kopf oder Filter.“ Die Overline lautet „Musterbau
  GmbH · 2026“, und die Spec schreibt das unter „Fund beim Bau“ selbst so vor.
  Nächster Schritt: Overline „Musterbau GmbH“, Code und Fund-Absatz zusammen
  ändern. Die Brotkrume der Story trägt das Jahr schon vorher; sie gehört zur
  Story und nicht zu dieser Spec.

### Hinweise

- **H1 · Der Kartenkopf wiederholt jetzt den Seitentitel.** Die Gliederung lautet
  `h1` „Geschäftspartner“ → Reiter „Geschäftspartner“ → `h2` „Geschäftspartner“.
  §2a, Box-Kopf: Der Kartenkopf „wiederholt nicht den Seitentitel, sondern nennt
  die Menge“. Vor 0235 gab es keinen Seitentitel, also auch keine Doppelung.
  Ein anderes Wort für Kopf oder Reiter wäre ein neues Label und geht deshalb an
  den Owner (CLAUDE.md §7).
- **H2 · Laufzeit.** 78 % der 121 s gehen an Stories, die keine Arbeitsfläche
  haben. Der Grund: die Auswahl nach Datei lädt alle 73 Stories der 13 Dateien.
  Wählt der Wächter je Story aus (Render mit `AppShell`, oder eine erste Prüfung
  ohne die 900 ms Wartezeit), läge er bei etwa 30 s. Mit 2 min taugt er vor dem
  Commit, nicht für den schnellen Blick.
- **H3 · Eine kaputte Story fällt still heraus.** Wirft eine Story mit
  `AppShell`, fehlt `.app__main`. Der Wächter überspringt sie dann und meldet „ok“
  mit einer kleineren Zahl. Nächster Schritt: die Fehleranzeige von Storybook
  (`.sb-show-errordisplay`) als Fund melden.
- **H4 · Fehlt der Browser, endet der Wächter mit Exit 1.** Ohne `CHROME_BIN`
  sucht `cdp.mjs` den Pfad `chromium-1243`, den es auf dieser Maschine nicht
  gibt. Der Wächter endet dann mit einem ENOENT-Stacktrace und Exit 1, also mit
  demselben Code wie bei Funden. Die Schnittstelle der Spec nennt `CHROME_BIN`
  nicht. Vorschlag: fehlender Browser → Exit 2 mit einem Satz.
- **H5 · Reichweite.** 177 Seiten-Stories rendern ohne `AppShell` und werden
  nicht gemessen. Mit R1 über `#storybook-root` zeigen 10 davon Größen außerhalb
  der Skala:
  - `seiten-stapelabnahme--bookings`: 13/700 und 13/400
  - sechs Stories `seiten-sachverhalt-reiter--*`: 12/600, `lw-overline`
    „Leerzustand“
  - drei Stories `seiten-beleg-reiter-vorsteuer--*`: 10,58/400

  Text in Portalen (Drawer, Dialog, Toast) liegt außerhalb von `.app__main`. Beim
  Laden ist in den 16 Stories keiner offen. Vorschlag: eine Ausbau-Zeile
  „Seiten-Stories ohne Arbeitsfläche“ und eine für Portale.
- **H6 · Kleinigkeiten am Code.**
  - R2 prüft gegen die Zahl `16` und nicht gegen die gelesene Stufe `--fs-ui-lg`
    (`scale[1]`). Ändert sich die Stufe, prüft R2 nichts mehr.
  - Die Ausgabe zeigt höchstens 8 Funde je Story und sagt nicht, dass es mehr
    gibt.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Der Kopf des Skripts zitiert den Owner nicht mehr auf Deutsch; er sagt dasselbe auf Englisch. `check:language` grün |
| M2 | Overline „Musterbau GmbH“ ohne Jahr, in Code und Spec |
| H3 | Eine Story, die nicht rendert (Storybook-Fehleranzeige), ist ein Fund „the story failed to render“ statt still zu fehlen |
| H4 | Ohne Browser endet der Wächter mit Exit 2 und einem Satz, wie ohne Storybook |
| H6 | R2 vergleicht mit der gemessenen Stufe `--fs-ui-lg` statt der Zahl 16; mehr als acht Funde je Story enden mit „… and n more“ |
| H1 | geht als Frage an llcto: „Geschäftspartner“ steht jetzt als `h1`, als Reiter und als Kartenkopf. Ein anderes Wort für Reiter oder Karte wäre ein neues Label; bis zur Antwort bleibt es |
| H2, H5 | als Ausbau notiert, mit Zahlen |

## Nachprüfung 1 (2026-10-27)

Geprüft wurde der Arbeitsbaum nach der Nachbesserung 1, am Dev-Server 6107. Proben
liefen über `probe2-guard.mjs`, eine Kopie des neuen Wächters im Scratchpad der
Sitzung. Sie misst nur `seiten-geschäftspartner-liste--in-use` und ändert keine
Datei im Repo.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 | `pnpm check:language` → „ok. 0 German comment lines left in 0 files.“, Exit 0. Der Kopf des Skripts ist englisch | ✓ |
| M2 | `partner-list.tsx`: `overline="Musterbau GmbH"`, mit englischem Kommentar „No year …“. Der Absatz „Fund beim Bau“ der Spec sagt „Musterbau GmbH“ (ohne Jahr) | ✓ |
| H3 | Zwei Proben. In der ersten setzt die Kopie `sb-show-errordisplay` am `body`. In der zweiten bricht das Rendern wirklich: `Page.addScriptToEvaluateOnNewDocument` lässt `Intl.NumberFormat#format` und `Number#toLocaleString` werfen. Beide Proben enden mit Exit 1 und „✗ seiten-geschäftspartner-liste--in-use · the story failed to render“. Die Schlusszeile lautet dann „1 of 0 stories …“, weil die kaputte Story nicht als gemessen zählt; das ist nur eine Frage der Wortwahl | ✓ |
| H4 | Ohne Browser kommt jetzt ein Satz statt eines Stacks, Exit 2. `CHROME_BIN=/nonexistent node scripts/check-type-runtime.mjs` → „no browser to measure with at /nonexistent — set CHROME_BIN.“ Ohne `CHROME_BIN` nennt derselbe Satz den Ersatzpfad. Dieser Pfad steht jetzt zweimal, im Wächter und in `cdp.mjs`. Nicht blockierend | ✓ |
| H6 | Erste Probe: 16/400 gibt „R2 16px/400 is no role“. Zweite Probe: `--fs-ui-lg` am `html` auf 17px gesetzt. Dann gibt 17/400 „R2 17px/400 is no role“ und 16/400 „R1 … off the scale“; R2 folgt also der gemessenen Stufe. Dritte Probe: zwölf Größen außerhalb der Skala geben acht Zeilen und „… and 4 more“. `--test` gibt Exit 0 | ✓ |
| `pnpm check:type:runtime` | „ok. 16 stories with a working surface, every text on the scale, one h1 each.“, Exit 0, 120 s. Das ist dasselbe Ergebnis wie in der Abnahme. Das Portal des Drawers aus 0236 ändert den Lauf nicht | ✓ |
| `pnpm typecheck` · `pnpm check:type` | Exit 0 · „ok. 0 older findings left in 0 files (baseline).“, Exit 0 | ✓ |
| H1, H2, H5 | H1 liegt als Frage beim Owner. H2 und H5 stehen als Ausbau in der Spec. Keiner der drei blockiert | – |

Abgenommen von / am: fremde Abnahme, 2026-10-27 (Nachprüfung 1) · Offene Punkte: keine blockierenden. H1 wartet auf die Antwort des Owners; H2 und H5 sind Ausbau
