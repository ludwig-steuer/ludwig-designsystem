# 0206 · Prüfpunkte in Ausprägungen und Größen — und der Reiter „Vorsteuer"

| | |
|---|---|
| Status | Abnahme — Nachprüfung 2026-09-27: M1–M3 behoben, M4 offen (Ausnahme nicht in der Guideline) |
| Stufe | `patterns/Review.tsx` (Erweiterung `CheckItem`/`CheckItems`, neu `checkSummary`) · Seiten-Komposition `src/showcase/document/InputTaxTab.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Prüfregeln mit Ergebnis, Fakten mit Antwort und Herkunft — nichts USt-Spezifisches im Baustein |
| Quelle | Owner über ll-cto2, 2026-09-27: „nichts Spezielles für die USt-Prüfung, Prüfpunkte generell mit Ausprägungen/Größen" · App F310 (`modules/invoices/ui/tabs/VorsteuerTab.tsx`, `FactRows` als Platzhalter für diese Aufgabe) |
| Ersetzt | App `FactRows` (Tabelle) → `CheckItems kind="fact"`; `verdictTitle` → `checkSummary` |
| Spec von / am | Claude, 2026-09-27 |
| Abgenommen von / am | fremder Abnahme-Agent, 2026-09-27 |

## Ziel

Die Kanzlei sieht auf einem Blick, ob aus dem Beleg Vorsteuer gezogen werden
darf, woran es hängt und was zu klären ist — mit demselben Prüfpunkt-Bild wie
im Buchungseditor und im Reiter Plausibilität. Regeln (bestanden/verletzt)
und Fakten (eine Antwort je Frage) sind zwei Ausprägungen **eines** Musters.

## Einordnung

- **Erweitert (Regel §3.2):** `CheckItem` um `result?` (das Antwort-Wort, z. B.
  `StatusBadge`) und `origin?` ({ actor, fields }); `CheckItems` um
  `kind?: "rule" | "fact"`, das die Gruppenwörter wählt. Der Journal-Editor und
  die Plausibilität bleiben unverändert (`kind` = `rule`, Vorgabe).
- **Neu:** `checkSummary(items, kind)` — eine reine Funktion, kein Baustein.
- **Kein `CheckReport`:** Der Bericht ist Komposition an der Seite (Verdikt =
  `StatusCallout` mit `checkSummary` als Titel, Folgen als `sub`, darunter die
  Karten). Ein eigener Rahmen kommt, sobald eine zweite Seite ihn braucht
  (Ausbau).

### Die Größen

| Größe | Was | Baustein |
|---|---|---|
| XS | die Zählzeile „1 verletzt · 2 offen · 9 bestanden" | `checkSummary(items, kind)` |
| S | eine Regel: Frage · Code · Begründung · Zustand | `CheckItem` (wie bisher) |
| M | ein Fakt: Frage · Antwort-Wort · Begründung · Herkunft, „Technisch: Schlüssel, Felder" | `CheckItem` mit `result` + `origin` |
| L | der Bericht: Verdikt, Behandlung, Regeln, Fakten, Rohwerte | Komposition (`InputTaxTab` im Showcase) |

### Zustände und Wörter je Ausprägung

| `state` | `kind="rule"` | `kind="fact"` |
|---|---|---|
| `red` | verletzt (steht allein) | widersprüchlich (steht allein) |
| `yellow` | offen (steht allein) | zu klären (steht allein) |
| `open` | nicht prüfbar (gefaltet, 0148) | nicht erhoben (gefaltet) |
| `green` | bestanden (gefaltet) | geklärt (gefaltet) |

**Zu 0148:** „nicht prüfbar" (`open`) bleibt eine Aussage über die Daten. Eine
Regel, deren Ergebnis **ermittelt werden muss** (Vorsteuer: `unknown` →
Verdikt „Fakten klären"), ist Arbeit und damit `yellow`, nicht `open`. Das
entscheidet der Aufrufer beim Abbilden; das Muster kennt beides.

**T4:** Der Code einer Regel (VST-03) ist, was man zitiert — er steht neben der
Frage. Der Schlüssel eines Fakts (`business_use`) und die Quellfelder
(`client_invoices.service_date`) sind Technik und stehen klein unter der
Begründung als „Technisch: …".

## Schnittstelle

| Name | Typ | Nachweis |
|---|---|---|
| `CheckItem.result` | `ReactNode?` | `Checklist › CheckItemsFacts` |
| `CheckItem.origin` | `{ actor: string; fields?: readonly string[] }?` | `CheckItemsFacts` |
| `CheckItems.kind` | `"rule" \| "fact"` (Vorgabe `rule`) | `CheckItemsFacts`, `CheckItemsMixed` |
| `checkSummary` | `(items, kind?) => string` | `CheckSummaryLine` |
| `CheckKind` | Typ | — |

## Der Reiter „Vorsteuer" (Seite)

Frage: „Darf aus diesem Beleg Vorsteuer gezogen werden — und wie wird er
umsatzsteuerlich behandelt?" Aufbau, von oben:

1. **Verdikt** — `StatusCallout`, Ton aus der Achse `input_tax_verdict` (App,
   F310: Abzug möglich · Fakten klären · Abzug gesperrt), Titel =
   `checkSummary(regeln)`, `sub` = die Folge („Nicht verwendbar für diesen
   Beleg: Steuerschlüssel 9, 19").
2. **Umsatzsteuerliche Behandlung** — `FieldList` (Behandlung `vat_treatment`,
   Stand `vat_assessment_status`) + `ProvenanceRows` (wer, wann, Begründung).
3. **Regeln** — `CheckItems kind="rule"`; Fuß „Nicht von Ludwig geprüft —
   bitte selbst beurteilen: …" (Klartext statt „Playbook/Judge", T4).
4. **Fakten** — `CheckItems kind="fact"`, Kopf mit `checkSummary(fakten, "fact")`.
5. **Auf der Rechnung erkannt** — `Disclosure`, zu: die Werte der Auslese.

Herkunft in Worten: `derived` → „abgeleitet", `agent` → „Ludwig" (T1),
`human` → „Kanzlei".

Zustände (Showcase `Seiten/Beleg/Reiter Vorsteuer`): `NeedsFacts` (gefüllt,
der Regelfall) · `Allowed` · `Forbidden` · `NoExtraction` (leer, nie befüllt,
mit Grund) · `Loading` · `LoadError` (Was · Ursache · „Erneut prüfen"). „Leer
nach Filter" gibt es nicht (kein Filter).

## Befunde an die App (F310-Nachzug)

- `FactRows` → `CheckItems kind="fact"` mit `result` (`StatusBadge input_tax_fact`) und `origin`.
- `verdictTitle` → `checkSummary`.
- Herkunftswörter: „Agent" → „Ludwig", „System" → „abgeleitet", „Mensch" → „Kanzlei".
- Fuß: „Nicht maschinell geprüft (Playbook/Judge)" → „Nicht von Ludwig geprüft — bitte selbst beurteilen: ‹Titel›" (Titel statt Codes).
- Kein Leertext „Keine Prüfung möglich — der Beleg hat (noch) keine Rechnungs-Extraktion" (Technik): Showcase `NoExtraction`.

## Ausbau

| Was fehlt | Prop | Wann |
|---|---|---|
| ein Rahmen `CheckReport` (Verdikt + Abschnitte) | eigener Baustein | eine zweite Seite zeigt einen Prüfbericht |
| Fakt korrigieren | `CheckItem.gate` (vorhanden) oder `onAnswer?` | die Kanzlei soll Fakten im Reiter beantworten |

## Abnahmekriterien

Fest: typecheck, build, englischer Code, `@when`/`@instead`, kein Hex/px in TSX, Stories, §9, im Browser.

Variabel:
- [ ] `kind="rule"` sieht aus wie vor 0206 (Stories `CheckItemsMixed`, `CheckItemsAllOpen`, `CheckItemsAllGreen` unverändert)
- [x] `kind="fact"`: Antwort-Wort rechts, Herkunft + „Technisch:" unter der Begründung, kein Schlüssel neben der Frage
- [x] `checkSummary` in beiden Ausprägungen, schlimmstes zuerst
- [ ] Reiter Vorsteuer in sechs Stories, T4 eingehalten (keine Rohwerte im Lesetext)

## Abnahme

Gemessen in Storybook (localhost:6107) bei 1280 × 900, Stand `a465ca1`. Die
Vorfassung von `kind="rule"` ist gegen den Code von `da6d127^` verglichen: der
alte `CheckRow` schrieb `{item.question} <span className="v2pp__code">` — mit
Leerzeichen; dieser Textknoten ist im Browser nachgestellt und vermessen.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` | grün | ✓ |
| `pnpm build` | Storybook-Build erfolgreich | ✓ |
| `pnpm check:language` | „0 German comment lines" | ✓ |
| `pnpm check:when` / `@when`+`@instead` | **rot:** `Review.tsx:263 checkSummary — @when und @instead fehlt` (M2) | ✗ |
| Kein Hex/px in TSX | grep über `InputTaxTab.tsx`, Stories, Diff `Review.tsx`: nichts; `2px` nur in `v3.css` | ✓ |
| `kind="rule"` wie vor 0206 — Gruppenzeilen | `CheckItemsAllOpen` „12 Prüfpunkte nicht prüfbar", `CheckItemsAllGreen` „12 von 12 Prüfpunkten bestanden", `CheckItemsEmpty` „Keine Prüfpunkte für diesen Fall." — Text und Codes wie `da6d127^` | ✓ |
| `kind="rule"` wie vor 0206 — Zeile | **abweichend:** das Leerzeichen zwischen Frage und Code fehlt (JSX-Kommentar zwischen zwei Ausdrücken schluckt es). Abstand Frage → Code **4,0 px** statt **7,5 px** (vorher, nachgestellt), `textContent` „Passt der Steuerschlüssel zum Beleg?P07" statt „… Beleg? P07" — die Vorlesehilfe liest Frage und Code zusammen. Betrifft `CheckItemsMixed` (7 Zeilen), die Zeilen in den Gruppen von `AllOpen`/`AllGreen`, `CaseTabs.stories` (Aufrufer ohne `kind`) und jeden App-Aufrufer (M1) | ✗ |
| Andere Aufrufer im Repo | `grep CheckItems src`: `CaseTabs.stories.tsx:400` (ohne `kind`) → derselbe Befund M1; sonst nur Stories und `InputTaxTab` | ✗ (M1) |
| `kind="fact"`: Antwort-Wort rechts | `CheckItemsFacts`: `.v2pp__result` bei allen 4 Zeilen rechts der Frage, 16 px vom Zeilenrand, `StatusBadge input_tax_fact` („Unsicher", „Unbekannt", „Nein", „Nicht relevant") | ✓ |
| `kind="fact"`: Herkunft + „Technisch:" unter der Begründung | `.v2pp__origin` liegt bei allen 4 Zeilen unter `.v2pp__why`: „Ludwig · Technisch: business_use, client_invoices.delivery_address" | ✓ |
| `kind="fact"`: kein Schlüssel neben der Frage | `.v2pp__q` ohne `.v2pp__code` (4/4); Gruppenzeile „2 von 4 Fakten geklärt" ohne Schlüssel | ✓ |
| `checkSummary` in beiden Ausprägungen, schlimmstes zuerst | `CheckSummaryLine`: „2 zu klären · 2 geklärt" · „1 verletzt · 1 offen · 2 bestanden"; Reiter: „1 verletzt · 3 bestanden" (Forbidden) | ✓ |
| Reiter Vorsteuer in sechs Stories | `seiten-beleg-reiter-vorsteuer--needs-facts/allowed/forbidden/no-extraction/loading/load-error`, alle rendern, Reiter „Vorsteuer" `aria-selected`, kein Querlauf bei 1280 | ✓ |
| Zustände des Reiters | gefüllt (NeedsFacts, Allowed, Forbidden) · leer nie befüllt mit Grund („Noch keine Prüfung möglich — Ludwig hat die Rechnungsdaten … noch nicht ausgelesen") · lädt (Skeleton „Die Vorsteuer wird geprüft …") · Fehler (Was „Prüfung nicht geladen" · Ursache · „Erneut prüfen", 114 × 30 px); leer nach Filter entfällt (kein Filter) | ✓ |
| T4 im Reiter: Schlüssel/Felder nur unter „Technisch" | Textknoten-Suche nach `snake_case`, ISO-Zeit, „Playbook/Judge/Pipeline/Agent/System": `business_use`, `client_invoices.*` nur in `.v2pp__origin` nach „Technisch:"; Daten als 13.09.2026; Fuß „Nicht von Ludwig geprüft — bitte selbst beurteilen: ‹Titel›" | ✓ |
| T4/T1 im Reiter: kein Systemwort im Lesetext | **„Agent prüft"** im Block „Umsatzsteuerliche Behandlung", Stand — Registry-Label `vat_assessment_status.needs_agent` (NeedsFacts). Die Spec ersetzt selbst „Agent" → „Ludwig", der Reiter zeigt es trotzdem (M3) | ✗ |
| Status nur über Registry, keine lokale Label-Map (§9, Z2) | `InputTaxTab.tsx` `VERDICT` schreibt die Wörter der Achse `input_tax_verdict` lokal aus („bis der Spiegel sie trägt") — Achse fehlt in `status-registry.ts`, Ausnahme ohne Owner/Datum in der Guideline (M4). `ACTOR` (Herkunftswörter) ist Spec-Inhalt, kein Status | ✗ |
| Kontrast Text ≥ 4,5:1 | alle sichtbaren Textknoten der sechs Reiter-Stories gemessen: kein Wert < 4,5; `CheckItemsFacts`: Frage 12,71, Begründung 6,17–12,71, Herkunft/`code` 6,17 | ✓ |
| Fokus und Tastatur beim Aufklappen | Tab erreicht die `summary` „2 von 4 Fakten geklärt"; `:focus-visible`, Ring 2 px `rgb(59,143,196)`, 3,28:1 gegen `#f4f6f8`; Enter öffnet, Fokus bleibt; Leertaste öffnet „Auf der Rechnung erkannt" (Rohwerte sichtbar) | ✓ |
| Trefferfläche ≥ 24 × 24 | Reiter-Seite: kleinste Fläche 24 × 24 ((i)-Knöpfe), `summary` 1238 × 40 | ✓ |
| Farbe nur Kritikalität, nie allein | Verdikt Warnung/Erfolg/Fehler mit Wort als Kicker; Fakten-Badges mit Wort; Icons mit Wort | ✓ |
| Vergleich App-Fassung `VorsteuerTab.tsx` | Aufbau der fünf Blöcke deckt sich; Befunde an die App (oben) treffen zu („System/Agent/Mensch", `verdictTitle`, `FactRows`) | ✓ |

### Mängel

- **M1** `src/ui/v3/patterns/Review.tsx`, `CheckRow`: zwischen `{item.question}` und dem Code steht nach 0206 ein JSX-Kommentar; das Leerzeichen der Vorfassung ist weg. `kind="rule"` sieht nicht mehr aus wie vorher (Abstand 4,0 statt 7,5 px) und liest sich für die Vorlesehilfe als „…?P07". Trifft alle Aufrufer ohne `kind`. Leerzeichen zurück (z. B. `{kind === "rule" ? <> <span …/></> : null}`) und Kommentar über die Zeile.
- **M2** `checkSummary` ohne `@when`/`@instead` — `pnpm check:when` rot.
- **M3** Reiter NeedsFacts zeigt „Agent prüft" (Registry-Label `vat_assessment_status.needs_agent`) im Lesetext. Label-Änderung ist Systementscheid → Owner fragen (z. B. „Ludwig prüft") oder als benannte Ausnahme/Befund in die Spec.
- **M4** `InputTaxTab.tsx` `VERDICT`: lokale Label-Map für `input_tax_verdict` ohne Registry-Achse und ohne benannte Ausnahme (Owner, Datum).

Nebenbei, kein Mangel: Karte „Fakten" nennt die Zählung doppelt (Kopf „2 zu klären · 4 geklärt", Gruppe „4 von 6 Fakten geklärt"); `Steuerbetrag` in der Fixture als fertiger String statt über `formatAmount`.

**Nacharbeit 2026-09-27 (Bauer), zur Nachprüfung:**
M1 — das Leerzeichen zwischen Frage und Code ist zurück (`<> <span …>`); `kind="rule"` wieder wie vor 0206.
M2 — `checkSummary` trägt `@when`/`@instead`.
M3 — **kein Mangel des Sets, sondern ein offener App-Befund:** „Agent prüft" ist das Registry-Label von `vat_assessment_status.needs_agent`; die Umbenennung „Agent" → „Ludwig" hat der Owner am 2026-09-27 entschieden (Guideline T1), sie läuft als App-F307 (Befund L-355) und kommt mit dem nächsten Spiegel-Lauf ins Set. Das Set schreibt Registry-Labels nicht lokal um (keine zweite Quelle).
M4 — **benannte Ausnahme** (Claude, 2026-09-27, bis zum Spiegel-Lauf nach F310): Die Wörter von `input_tax_verdict` stehen im Showcase (`InputTaxTab.tsx`, `VERDICT`) ausgeschrieben, weil die Achse erst mit App-F310 entsteht. Sie ist Showcase, kein Baustein; beim Spiegel-Lauf ersetzt `resolveStatus("input_tax_verdict", …)` die Map und die Ausnahme fällt.

**Nachprüfung 2026-09-27 (fremder Abnahme-Agent), Stand `fe0b47e`:**

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M1 | `CheckItemsMixed` bei 1280: Abstand Frage → Code **7,5 px** in allen 7 Zeilen (wie vor 0206), `textContent` „Passt der Steuerschlüssel zum Beleg? P07" | ✓ |
| M2 | `pnpm check:when` → „in Ordnung" | ✓ |
| M3 | trägt: Guideline T1 (Owner 2026-09-27) und Befund L-355 in `docs/befunde-app.md` sind vorhanden; die Registry ist der Spiegel der App, das Set schreibt ihre Labels nicht lokal um. Hinweis: L-355 nennt `document_status.agent_review`, aber `vat_assessment_status.needs_agent` nicht ausdrücklich; „F307" ist im Repo nirgends belegt. Beides beim nächsten Pflegen von L-355 nachtragen | ✓ |
| M4 | inhaltlich trägt die Begründung: `input_tax_verdict` kam mit App-F310 (`91a441fa`), die drei Wörter in `VERDICT` stimmen Zeichen für Zeichen mit `INPUT_TAX_VERDICT` der App überein, und der Spiegel läuft erst im Integrationszug (Owner 2026-09-07). **Formal fehlt:** CLAUDE.md §3 verlangt die Ausnahme **in der Guideline** mit Owner und Datum; sie steht nur hier in der Spec, und als Owner ist „Claude" eingetragen, nicht der Owner (oder eine Freigabe über den Manager). Eintrag in `docs/design-guidelines.md` (wie die Ausnahmen zu A5 und T8) mit Owner-Freigabe | ✗ |

Ergebnis: nicht bestanden, nur noch M4 als Doku-Nachtrag. Code ist abgenommen.

**Nacharbeit 2 (2026-09-27):** M4 ist **keine Ausnahme mehr** — die lokale Wortliste `VERDICT` ist entfernt. Das Urteil kommt als Daten (`verdict: { label, tone }`), so wie die App es aus `input_tax_verdict` auflöst; die drei Wörter stehen nur noch in den Story-Fixtures (Beispieldaten, wie Regeltitel und Begründungen). Damit entfällt die benannte Ausnahme oben. Zu M3: `vat_assessment_status.needs_agent` („Agent prüft") ist ab jetzt ausdrücklich in L-355 genannt; die App-Spec dazu heißt F307 im App-Repo (`app/docs/backlog/F307-*`), nicht in diesem.
