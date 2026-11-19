# 0249 · JournalEntryEditor: Entwurf von Hand ohne Status

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-19 (schlank, mit einer Messung) |
| Stufe | `entities/journal-entry/` (Erweiterung von `JournalEntryEditor`, 0015) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein: Buchungssatz, Belegfeld, Gegenkonto |
| Quelle | ll-ceo 2026-11-19; App-Spec F760 (`docs/backlog/F760-hand-back-document-too-complex.md`, T760.4 „Selbst buchen“) |
| Ersetzt | nichts; die App öffnet den Editor für „Selbst buchen“ heute mit `status="proposed"` und zeigt „Vorschlag“ |
| Blockiert | F760 T760.4 (Editor mit Entwurf) |
| Spec von / am | Designer-Sitzung, 2026-11-19 |

## Ziel

Für „Selbst buchen“ öffnet die Kanzlei einen Fall ohne Vorschlag im Editor,
mit einem vorbefüllten Entwurf. Heute steht dann im Kopf das Abzeichen
„Vorschlag“. Das ist falsch: Der Entwurf ist kein Vorschlag von Ludwig, und
gespeichert ist noch nichts. Der Kopf soll nichts behaupten, was nicht gilt.

## Einordnung

- **Wiederverwenden:** `JournalEntryEditor` trägt den Fall ganz, bis auf
  das Abzeichen im Kopf.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2. Die Achse
  `journal_entry` bildet `client_journal_entry.status` ab (`ENTRY_STATUS`:
  `proposed`, `accepted`, `posted`, `reversed`). Einen Wert „Entwurf“ gibt es
  dort nicht. Ein neuer Wert mit neuem Wort wäre ein neuer Status im Set
  ohne Gegenstück in der App (CLAUDE.md §7: Owner-Frage) und eine zweite
  Quelle. Ein Entwurf, der noch nicht gespeichert ist, hat keinen Status.
  Deshalb wird `status` optional: Fehlt er, fehlt das Abzeichen. Das ist
  keine neue Prop und kein neues Wort.
- **Verworfen:** `status="draft"` mit „Entwurf“ (neuer Status ohne
  Datenmodell, s. o.) und ein Schalter `hideStatus`. Der Schalter ließe einen
  falschen Wert in den Props stehen, den die Logik des Editors weiter liest
  (`status === "posted"` sperrt „Bearbeiten“).
- **Zuschnitt:** dieselbe Datei, eine Typänderung, eine Bedingung im Kopf.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `status` | `EditorStatus` | **nein** (vorher ja) | gespeicherter Status des Satzes; fehlt er, ist der Satz ein Entwurf, der noch nicht gespeichert ist, und der Kopf zeigt kein Abzeichen | `DraftByHand`; mit Status alle übrigen |

Ohne `status` verhält sich der Editor sonst wie mit `proposed`: bearbeitbar
nach `editable`, kein Storno-Hinweis. Nach dem Speichern übergibt die App den
Status, den sie geschrieben hat (F760: `accepted`).

Was der Editor **nicht** tut (bewusst): Er setzt kein eigenes Wort für
„Entwurf“. Braucht der Kopf ein sichtbares Wort, ist das ein neues Label und
damit eine Owner-Entscheidung, am besten mit einem Wert im Datenmodell der
App.

## Verhalten

Keine neue Interaktion. Der Kopf behält Belegnummer, Betrag, Rest und den
Schalter „Einfach/Voll“; nur das Abzeichen entfällt.

Bestand (gemessen 2026-11-19, nicht Teil dieser Aufgabe): Der Kopf des
Editors steht heute in **drei Zeilen untereinander** (Beleg · Abzeichen ·
Rest und „Einfach/Voll“), nicht in einer. Grund ist ein Namenskonflikt in
`v3.css`: `.bse__head` ist zugleich der Kopf des Editors (Flex-Zeile,
Z. 1941) und der Spaltenkopf der Tabelle (`.bse__head, .bse__cells` als
Grid mit `--bse-cols`, Z. 1974). Die spätere Regel gewinnt, und ohne
`--bse-cols` wird das Grid einspaltig. Das ist so seit der Erstbestückung
(`5ec5da6`) und betrifft auch `JournalEntryGrid`. Ohne Abzeichen entfällt
hier nur dessen Zeile, Rest und „Einfach/Voll“ rücken eine Zeile hoch. Die
Behebung ist eine eigene Aufgabe (Ausbau).

## Stories

Eine neue Story `DraftByHand` in `v3/Entitäten/Buchungssatz/JournalEntryEditor`:
„Selbst buchen“ für eine Rechnung ohne Vorschlag, Entwurf mit Belegdatum,
Betrag und Belegfeld 1 aus der Rechnung, Konto noch offen, ohne `status`,
bearbeitbar, mit „Speichern & freigeben“.

Die Datei hat schon 13 Stories, mehr als die Obergrenze 10. Sie spielt die 24
Zustände der Vorlage nach (Kopfkommentar der Stories). Der Zuschnitt wird
hier nicht neu verhandelt; die eine Story ist der verlangte Nachweis.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ein sichtbares Wort für den Entwurf im Kopf | ein Wert der Achse `journal_entry` aus der App | Owner will das Wort; die App führt einen Entwurfs-Status |
| Kopf des Editors in einer Zeile, wie entworfen | eigene Klasse für den Kopf statt `.bse__head` (keine Prop) | eigene Aufgabe; prüft auch `JournalEntryGrid` |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `status` ist optional; alle bisherigen Aufrufer kompilieren unverändert (`pnpm typecheck`)
- [ ] Ohne `status` kein Abzeichen im Kopf, kein anderes Wort an seiner Stelle (`DraftByHand`)
- [ ] Ohne `status` bearbeitbar wie mit `proposed`; kein Storno-Hinweis (`DraftByHand`)
- [ ] Ohne Abzeichen entfällt nur dessen Zeile im Kopf; „Einfach/Voll“ steht rechts an derselben waagrechten Stelle wie mit Abzeichen, kein anderes Element verschiebt sich seitlich (`DraftByHand` gegen `S1_EditWithWarning`, gemessen)
- [ ] Mit `status` unverändert: Abzeichen aus der Achse `journal_entry` (übrige Stories)
- [ ] Keine neue Registry-Zeile, kein neues Wort im Set

## Abnahme

Schlanke Abnahme (Schnittstelle), dazu das eine gemessene Layout-Kriterium.
Gelesen: `git diff` (zwei Dateien, +30/−3) und diese Spec, nicht der Chat.
Story-IDs mit dem Präfix `v3-entitäten-buchungssatz-journalentryeditor--`;
Storybook-Dev-Server 6118, Playwright (Chromium).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün | `pnpm typecheck` Exit 0; `pnpm check:type` Exit 0 („0 older findings“), `--test` Exit 0; `pnpm build --output-dir <scratchpad>` Exit 0 („Storybook build completed successfully“) — eigenes Ausgabeverzeichnis, damit `storybook-static/` neben dem laufenden Dev-Server nicht geleert wird | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | keine neue Datei; `DraftByHand` steht in `JournalEntryEditor.stories.tsx` unter `v3/Entitäten/Buchungssatz/JournalEntryEditor` (Index: `…--draft-by-hand`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Diff: JSDoc und Bezeichner englisch („Belegfeld 1“ ist DATEV-Ausnahme nach GLOSSARY, „Selbst buchen“/„Vorschlag“ zitieren UI-Wörter); kein neuer Export außer der Story; `pnpm check:language` Exit 0 („0 German comment lines“), `--test` Exit 0; `pnpm check:when` Exit 0, `--test` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `git diff -U0` auf `+`-Zeilen gegen `#hex`, `\dpx`, `className`, `label`: kein Treffer; Abzeichen weiter nur `StatusBadge axis="journal_entry"`; `pnpm check:icons` Exit 0, `check:contrast` Exit 0 (`--test` Exit 0), `check:domain-paths` Exit 0 (`--test` Exit 0); `check:classes`: der Diff führt keine CSS-Klasse ein, also kein neuer Fund | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | die eine verlangte Story `DraftByHand` vorhanden; 14 Stories in der Datei (13 + 1), die Überschreitung der 10 ist in „Stories“ begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | für diese Änderung tragende Punkte: kein Hex/px, kein eigener Status-Text, Status nur über Registry (V13, Z2–Z4), keine neue Interaktion, keine neue Klasse, Schrift unverändert (`check:type`); übrige Punkte unberührt (Kopf und Felder unverändert) | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 14 Stories bei 1400 px geladen, jede rendert `.bse` (1–3 Editoren, 319–1634 Zeichen Text); Konsole: 0 Fehler, 0 Warnungen, 0 `pageerror`, keine Antwort ≥ 400; Screenshot `.playwright-mcp/0249-abnahme-draft-by-hand-1400.png` (ignoriert, nicht im Repo) | ✓ |
| `status` ist optional; alle bisherigen Aufrufer kompilieren unverändert | `status?: EditorStatus` in Props und `Head`; Aufrufer im Repo: `BookingReview.stories.tsx` (2×, `status="proposed"`), `JournalEntryEditor.stories.tsx` (13 Stories über `BASE` bzw. explizit), Re-Export `src/ui/v3/index.ts:768–775`; keiner im Diff angefasst; `pnpm typecheck` Exit 0. App (nur gelesen): `Step3WithoutProposal.tsx:364` übergibt `status="proposed"`, kompatibel | ✓ |
| Ohne `status` kein Abzeichen im Kopf, kein anderes Wort an seiner Stelle (`DraftByHand`) | `…--draft-by-hand`: Kopf `.bse > .bse__head` hat 2 Kinder (`bse__doc`, rechte Gruppe), Text „Beleg RE-4471 · 1.475,60 € Voll ▸ · Alt+V“; kein `.bdg`; Regex `Vorschlag\|Entwurf\|Freigegeben\|Gebucht\|Zurückgezogen` im Kopf: kein Treffer | ✓ |
| Ohne `status` bearbeitbar wie mit `proposed`; kein Storno-Hinweis (`DraftByHand`) | `…--draft-by-hand`: Datum, Umsatz, S/H, BU, Konto, Belegfeld 1, Buchungstext alle `disabled=false`, `readOnly=false`; „Speichern & freigeben“ vorhanden und aktiv, „Abbrechen“, „+ Zeile (Split)“, Feld „Grund der Änderung“; Umsatz auf 1.000,00 getippt → Kopf zeigt „Rest 475,60 €“; kein `.v2note`, kein „storniert“, kein „Buchung bearbeiten“. Code: `status === "reversed"` (Z. 306) und `status !== "posted"` (Z. 514) verhalten sich bei `undefined` wie bei `proposed` | ✓ |
| Ohne Abzeichen entfällt nur dessen Zeile; „Einfach/Voll“ an derselben waagrechten Stelle, nichts verschiebt sich seitlich (gemessen) | `getBoundingClientRect`, `…--draft-by-hand` gegen `…--s-1-edit-with-warning` bei 700/1100/1280/1400/1920 px: Knopf „Voll ▸ · Alt+V“ left 589,4 (700) bzw. 821,4 (übrige), Breite 75,6 — in beiden Stories gleich; `bse__doc` [35, 35, Breite 630 bzw. 862] gleich; nur senkrecht: Knopf top 88,5 → 60,4, Kopfhöhe 79,8 → 51,8, Tabelle top 124,8 → 96,8 (−28,1 = Abzeichenzeile 22,1 + Spalt 6) | ✓ |
| Mit `status` unverändert: Abzeichen aus der Achse `journal_entry` (übrige Stories) | 13 übrige Stories: jeder Kopf trägt `.bdg`; `proposed` → „Vorschlag“ `bdg-info` (14 Editoren), in `…--s-20-editor-only` `reversed` → „Zurückgezogen“ `bdg-neutral`, `accepted` → „Freigegeben“ `bdg-success` — wie `JOURNAL_ENTRY_STATUS` (`status-registry.ts:1178–1183`) | ✓ |
| Keine neue Registry-Zeile, kein neues Wort im Set | `git diff --stat`: nur `JournalEntryEditor.tsx` und `.stories.tsx`; Registry unberührt; der Diff bringt keinen neuen sichtbaren String | ✓ |
| Zusatz (Auftrag der Abnahme, kein Spec-Kriterium): Einordnung trägt | `ENTRY_STATUS` (`src/ludwig/modules/entries/domain/entry.ts:23`) kennt nur `proposed`, `accepted`, `posted`, `reversed`; ein `draft` wäre ein Status ohne Datenmodell und ein neues Wort (CLAUDE.md §7: Owner-Frage, §2 „keine zweite Quelle“). Ein `hideStatus` ließe einen falschen Wert stehen, den der Editor an zwei Stellen liest (Z. 306 Storno-Hinweis, Z. 514 „Buchung bearbeiten“) — die Spec nennt nur die zweite, beide stützen sie. Fehlender Status = fehlendes Abzeichen sagt nichts Falsches (Zustand hat einen Ort, Z1–Z7) | ✓ |

Abgenommen von / am: fremder Agent, 2026-11-19 · Offene Punkte: keine

Mängel: keine.

Hinweise:

- **H1** `EditorStatus` (Z. 53) ist eine lokale Neudefinition von `EntryStatus` aus `src/ludwig/modules/entries/domain/entry.ts`; das ist Bestand, nicht aus dieser Änderung, widerspricht aber der schlanken Abnahme („Typen aus `src/ludwig/`“) und gehört in eine eigene Aufgabe.
- **H2** Der Bestand aus „Verhalten“ ist gemessen bestätigt: `grid-template-columns` des Editor-Kopfs löst zu einer Spur auf (630 px bzw. 862 px), der Kopf steht in drei bzw. ohne Abzeichen in zwei Zeilen; die Behebung trägt die zweite Zeile unter „Ausbau“.
- **H3** Für den Vier-Wochen-Test trägt der Entwurf sein „noch nicht gespeichert“ nur über das fehlende Abzeichen und „Speichern & freigeben“; ob das reicht, ist die Owner-Frage aus „Ausbau“, Zeile 1.
- **H4** Die App öffnet „Selbst buchen“ heute mit `status="proposed"` (`Step3WithoutProposal.tsx:364`); die Wirkung dieser Änderung entsteht erst, wenn T760.4 `status` weglässt.
