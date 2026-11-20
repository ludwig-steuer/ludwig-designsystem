# 0252 · Quellenart „Modell“: ein Zeichen für Werte, die ein Sprachmodell geschlossen hat

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-20 (schlank) |
| Stufe | `patterns/` (`Provenance.tsx`, `SOURCE_ICON`, `FactSourceKindMark`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, sobald es dort Herkunftsangaben gibt; deshalb Pattern (0247) |
| Quelle | ll-ceo 2026-11-20; App-Spec F763, App-Commit `5b2dc5c40` auf dem App-Branch `booking-v3` (`FACT_SOURCE_KINDS` + `model`, Registry `fact_source_kind.model` „Modell“) |
| Ersetzt | nichts |
| Blockiert | den App-Typecheck auf `booking-v3`: `SOURCE_ICON` ist erschöpfend (TS2741 an `Provenance.tsx:90`) |
| Spec von / am | Designer-Sitzung, 2026-11-20 |

Arbeitsort: DS-Branch `booking-v3` (Worktree `../designsystem-bv3`), nicht
`main`. `staging` der App kennt `model` noch nicht. Mit dem Eintrag in
`main` bräche dort der Typecheck (überzählige Eigenschaft in
`Record<FactSourceKind, …>`), sobald der Zeiger nachzieht.

## Ziel

An einem Fakt steht, woher sein Wert kommt. Neu ist die Art „Modell“: Ein
Sprachmodell hat den Wert aus dem Belegtext geschlossen, etwa die Verwendung
einer Position. Die Sachbearbeiterin soll das auf einen Blick vom
„Standardwert“ unterscheiden. Der Standardwert gilt, weil nichts
dagegenspricht; das Modell hat dagegen etwas gelesen und daraus geschlossen.

## Einordnung

- **Wiederverwenden:** `FactSourceKindMark` (0247) zeichnet Icon und Wort je
  Art. Das Wort kommt aus der Achse `fact_source_kind` der App („Modell“),
  das Zeichen aus `SOURCE_ICON`. Es fehlt nur der Eintrag.
- **Zeichen:** `ACTION_ICON.agent` (`Bot`), Bedeutung im Set: „Kommt von
  Ludwig — nicht von einem Menschen“. Gründe:
  - Ein Modellaufruf ist Ludwigs Schluss. Die App nennt Modellaufrufe in der
    Herkunft eines Satzes ebenso „Vorschlag von Ludwig“
    (`journal_entry_origin_method.model_call`/`model_agent`).
  - Das Zeichen gibt es schon, mit dieser einen Bedeutung. Kein neues Symbol.
  - Es unterscheidet sich deutlich von `default` (`CircleDashed`, gestrichelter
    Kreis).
  - Unter den Quellenarten ist es noch frei: ein Zeichen je Art, eine Art je
    Zeichen.
- **Verworfen:** `ScanText` o. Ä. (Text lesen). Das läse sich wie der
  Belegleser, dessen Werte als Art `source_doc` kommen (F734). `Sparkles`
  verbietet die Haltung (nichts Verspieltes).
- **Spiegel:** `fact-source.ts` aus `5b2dc5c40`. Die Achse
  `FACT_SOURCE_KIND` bekommt in `status-registry.ts` den Eintrag `model` und
  den Doc-Satz, als Patch nach der App, Achse danach gleich.

## Schnittstelle

Keine neue Prop. `FactSourceKind` hat einen Wert mehr; `FactSourceKindMark
kind="model"` zeichnet `Bot` + „Modell“.

## Stories

Keine neue Story. `FactTable` · `Certainty` bekommt eine Zeile „Verwendung
der Position · Verbrauch · erschlossen“ mit der Quelle „Modell (line_use)“
der Art `model`. Sie steht neben „Unternehmer · ja · angenommen“ mit
`default`, damit beide Zeichen nebeneinander zu sehen sind.

## Ausbau

Keiner.

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

- [ ] Spiegel `fact-source.ts` gleich App `5b2dc5c40` (bis auf den üblichen Importpfad `@/ludwig/core`); Achse `FACT_SOURCE_KIND` im Spiegel gleich der App
- [ ] `SOURCE_ICON.model` ist `ACTION_ICON.agent.icon`; kein anderes Zeichen in `SOURCE_ICON` ist `Bot` (ein Zeichen je Art)
- [ ] `FactTable` · `Certainty`: Zeile mit Quelle „Modell (line_use)“ zeigt `Bot` + Wort „Modell“ aus der Registry; „Standardwert“ daneben zeigt den gestrichelten Kreis
- [ ] Kein lokales Wort „Modell“ im Set außerhalb des Registry-Spiegels und der Story-Daten
- [ ] `check:icons` grün (Ausnahme `Provenance.tsx` bleibt die einzige Aufzählung)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün | Im Worktree `designsystem-bv3` mit dem uncommitteten Diff: `pnpm typecheck` Exit 0 · `pnpm build --output-dir <Scratchpad>` Exit 0 („Storybook build completed successfully“, Ausgabe danach gelöscht) · `pnpm check:type` Exit 0 (Baseline 0), `--test` Exit 0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Keine neue Datei. `patterns/Provenance.tsx` neben `Provenance.stories.tsx`; die Story-Zeile liegt in `FactTable.stories.tsx`, Titel `v3/Patterns/Prüfen/FactTable` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Kein neuer Export. Neue Kommentare englisch (`Provenance.tsx:87–88`, `:106–107`, `FactTable.stories.tsx:171–173`). Deutsch steht nur im App-Spiegel und in Texten für Nutzer · `pnpm check:language` Exit 0, `pnpm check:when` Exit 0, beide `--test` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Der Diff enthält weder Hex noch px. Das Wort kommt aus `resolveStatus("fact_source_kind", kind)` (`Provenance.tsx:124`), der Eintrag steht nur in der Registry (`status-registry.ts:1391`, `kind: "neutral"`) · `pnpm check:contrast` Exit 0, `pnpm check:domain-paths` Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Die Spec verlangt keine neue Story, nur eine Zeile in `Certainty`. Die Zeile ist da (`FactTable.stories.tsx:183`), direkt vor `is_business`/`default` (`:184`). Es gibt keinen neuen Baustein, die Zustände von `FactSourceKindMark` bleiben wie in 0247 | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Geprüft wurden die betroffenen Punkte: Lucide 1,5 px, Maß 13 wie bei den anderen Arten (unverändert) · Zeichen nur mit Wort (`Bot` + „Modell“) · keine Farbe (neutral) · Status über die Registry · Texte T1–T5, s. H1 und H2. Maße und Kontraste sind nach 0119 vertagt (schlanke Abnahme) | ✓ (H1, H2) |
| Im Browser angesehen (Storybook), nicht nur gebaut | Storybook auf :6118, der Prozess läuft im Worktree `designsystem-bv3`; geprüft mit Playwright. 30 Stories: FactTable 8, Provenance 9, FactRecordView 10, SourceDocumentCard/-Facts „with-provenance“/„provenance-empty“ 3. Alle zeigen Inhalt, die beiden „in-use“ im Drawer. In der Konsole steht nur die bekannte 404 `vite-inject-mocker-entry.js`. Screenshot von `v3-patterns-prüfen-facttable--certainty` | ✓ |
| Spiegel `fact-source.ts` gleich App `5b2dc5c40`; Achse `FACT_SOURCE_KIND` im Spiegel gleich der App | `git show 5b2dc5c40:apps/web/src/modules/fact-records/domain/fact-source.ts \| sed 's#from "@/core/#from "@/ludwig/core/#' \| diff - src/ludwig/modules/fact-records/domain/fact-source.ts` ist leer (Exit 0). Doc-Satz und `const FACT_SOURCE_KIND` sind gleich, `diff` Exit 0 (App Z. 1435–1474, Spiegel Z. 1354–1393) · `pnpm check:mirror` Exit 0 | ✓ |
| `SOURCE_ICON.model` ist `ACTION_ICON.agent.icon`; kein anderes Zeichen in `SOURCE_ICON` ist `Bot` | `Provenance.tsx:108`. Die übrigen 14 Einträge sind Entitätszeichen sowie `History`, `Ruler`, `Scale`, `Globe`, `BadgeCheck`, `CircleDashed` und `UserCheck`, keiner davon `Bot`. `grep -rnE '\bBot\b' src` findet nur `Icons.tsx:14` und `:421` (`ACTION_ICON.agent`, „Kommt von Ludwig — nicht von einem Menschen“). Sonst erscheint das Zeichen nur über `ActionIcon action="agent"` (`Process.tsx:108`, Partei „Ludwig“), mit derselben Bedeutung. Im Browser steht `svg.lucide-bot` nur in `Certainty` (1×), in den übrigen 29 Stories 0× | ✓ |
| `FactTable` · `Certainty`: Zeile mit Quelle „Modell (line_use)“ zeigt `Bot` + Wort „Modell“ aus der Registry; „Standardwert“ daneben zeigt den gestrichelten Kreis | `v3-patterns-prüfen-facttable--certainty`, DOM ausgewertet und Screenshot: Die Zeile „Verwendung der Position“ zeigt `svg.lucide-bot` und `.ki__art` „Modell“. Die Zeile „Unternehmer“ direkt darunter zeigt `svg.lucide-circle-dashed` und „Standardwert“ | ✓ |
| Kein lokales Wort „Modell“ im Set außerhalb des Registry-Spiegels und der Story-Daten | `grep -rn "Modell" src` ohne `src/ludwig/` findet nur `FactTable.stories.tsx:172` (Kommentar) und `:183` (Story-Daten). Dazu kommt ein fremder Treffer ohne Bezug: `LogBrowser.stories.tsx:342` („Layout-Modell v4“, ein Logtext) | ✓ |
| `check:icons` grün (Ausnahme `Provenance.tsx` bleibt die einzige Aufzählung) | `pnpm check:icons` Exit 0, `--test` Exit 0. `scripts/check-icons.mjs` ist unverändert, `EXEMPT` hat keinen neuen Eintrag. `Bot` kommt über die Registry, nicht als Direktimport aus `lucide-react` | ✓ |

Abgenommen von / am: fremder Agent, 2026-11-20 — schlanke Abnahme (Schnittstelle) · Offene Punkte: keine Mängel. H1 ist eine Frage an den Owner, H2 ein Befund an die App, H3 geht an 0119.

Mängel: keine.

Hinweise:

- **H1 · Das Zeichen passt, aber zwei Wörter für dasselbe Zeichen.** `Bot` hat im Set genau eine Bedeutung: „Kommt von Ludwig — nicht von einem Menschen“. Laut F763 bleibt die Interpretation in Ludwig (Owner 2026-11-20), und die App nennt Modellaufrufe auch sonst „Vorschlag von Ludwig“. Vom gestrichelten Kreis des Standardwerts ist es klar zu unterscheiden (im Browser nebeneinander geprüft). Neben dem Zeichen steht aber „Modell“, wo dasselbe Zeichen sonst „Ludwig“ heißt (GLOSSARY „Ludwig (KI)“: in der Oberfläche Ludwig, nie „Agent“ oder „KI“). Frage an den Owner nach CLAUDE.md §7 (neues Wort): Soll das Wort der Achse `fact_source_kind.model` in der App „Ludwig“ statt „Modell“ heißen? Bis zur Antwort bleibt der Spiegel, wie die App ihn liefert.
- **H2 · Das Label der Quelle verdoppelt das Wort und zeigt einen internen Schlüssel.** Die App liefert als `label` „Modell (line_use)“. In der Zelle steht deshalb „Modell  Modell (line_use)“, mit dem Feldschlüssel `line_use` als Text für die Sachbearbeiterin (verstößt gegen „Technik hinter Klartext“, Owner 2026-09-27). Befund an die App: Der Zweck soll im Klartext stehen (etwa „Verwendung der Position“), der Schlüssel gehört hinter „Technisch“. Diese Lieferung erfüllt die Spec trotzdem, denn die Story-Daten bilden ab, was die App liefert.
- **H3 · Art und Name brechen je nach Länge des Labels verschieden um.** `.v3prov__sources li` ist ein Flex mit `wrap` (`v3.css:4550`). Ein kurzes Label wie „Modell (line_use)“ steht deshalb in derselben Zeile wie die Art, ein längeres wie „Ltd. ohne Gegenangabe“ in einer zweiten. Das gab es schon vor dieser Lieferung (0163/0246). Es gehört zur vertagten visuellen Prüfung 0119.
