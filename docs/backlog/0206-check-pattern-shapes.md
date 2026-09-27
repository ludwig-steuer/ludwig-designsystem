# 0206 · Prüfpunkte in Ausprägungen und Größen — und der Reiter „Vorsteuer"

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-27; fremde Abnahme steht aus |
| Stufe | `patterns/Review.tsx` (Erweiterung `CheckItem`/`CheckItems`, neu `checkSummary`) · Seiten-Komposition `src/showcase/document/InputTaxTab.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Prüfregeln mit Ergebnis, Fakten mit Antwort und Herkunft — nichts USt-Spezifisches im Baustein |
| Quelle | Owner über ll-cto2, 2026-09-27: „nichts Spezielles für die USt-Prüfung, Prüfpunkte generell mit Ausprägungen/Größen" · App F310 (`modules/invoices/ui/tabs/VorsteuerTab.tsx`, `FactRows` als Platzhalter für diese Aufgabe) |
| Ersetzt | App `FactRows` (Tabelle) → `CheckItems kind="fact"`; `verdictTitle` → `checkSummary` |
| Spec von / am | Claude, 2026-09-27 |

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
- [ ] `kind="fact"`: Antwort-Wort rechts, Herkunft + „Technisch:" unter der Begründung, kein Schlüssel neben der Frage
- [ ] `checkSummary` in beiden Ausprägungen, schlimmstes zuerst
- [ ] Reiter Vorsteuer in sechs Stories, T4 eingehalten (keine Rohwerte im Lesetext)

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |
