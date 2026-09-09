# 0139 · `BusinessPartnerCell` — den Geschäftspartner in fremdem Markup nennen

| | |
|---|---|
| Status | **in Arbeit** — freigegeben 2026-09-09 (Owner) |
| Stufe | `entities/business-partner/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Geschäftspartner, Personenkonto, Kreditor/Debitor |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` (Status `geprüft`, 2026-09-09), Abschnitt „Formen", Zeile `BusinessPartnerCell` |
| Ersetzt | die drei handgeschriebenen Namensausgaben in v3: `CaseFacts` (`partnerHref` + `counterpartyPartnerId`), `account-columns` (`businessPartnerName`/`partnerHref`), `Account.tsx`/`AccountFacts` (`partnerName`) |
| Blockiert | 0140 (`businessPartnerColumns()`), 0142 (`BusinessPartnerFacts`), 0143 (`BusinessPartnerDrawer`) — alle drei nennen den Partner |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Der Geschäftspartner ist FK-Ziel von Sachverhalt, Konto, Rechnung,
Buchungssatz und Erwartung. Überall dort steht heute ein **String**, den die
aufrufende Komponente selbst kürzt und selbst verlinkt — dreimal in v3, jedes
Mal mit eigener Grenze und eigenem Callback. Das ist die Zelle, einmal.

**Die Zählung des Profils war zu hoch, der Grund trägt trotzdem.** Es nannte
sechs Stellen; die Prüfung hat drei davon widerlegt, weil dort gar kein
Partner steht: `case-columns` und `CaseCard` zeigen `counterpartyName`, und
`CaseListItem` trägt **keine** Partner-Id (L-69); `source-document-columns`
zeigt `partnerLegalName ?? vendorName`, also oft einen Lieferantennamen ohne
Stammsatz; `BankTransactionCell` zeigt den Gegenpart **vom Kontoauszug**
(`client_bank_transactions` hat `counterparty_name/iban/bic` und keine
`business_partner_id`).

Das ist keine Fußnote, sondern die schärfste Regel dieser Spec: **die Zelle
darf diese drei Strings nicht einsammeln.** Ein Name ohne Partner-Id ist kein
Partner, und eine Zelle, die ihn trotzdem als einen darstellt, verspricht
einen Weg, den es nicht gibt.

## Einordnung

- **Regel aus §3, die griff:** Nr. 5 — neue Entitäts-Form. Kein `@when` deckt
  „einen Geschäftspartner in fremdem Markup nennen"; `AccountCell` ist die
  Präzedenz für die Form, nicht für die Entität.
- **Zuschnitt:** eine Datei `BusinessPartner.tsx` für **Zelle und Fakten**
  (0142), wie `Account.tsx` es für Konto-Zelle und -Fakten macht. Die Fakten
  kommen mit 0142 dazu; diese Spec baut nur die Zelle, in dieselbe Datei.
- **Setzt auf:** `Link`, `MonoCell`, `Icons.partner`, und für die Kürzung das
  Muster `clipEnd()` aus `SourceDocument.tsx`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `name` | `string` | ja | Rang 1 — `legalName`. **Nicht** `shortName`: der ist derselbe Name auf 15 DATEV-Zeichen gestutzt (53 % liegen exakt am Anschlag), und wer ihn vorzieht, zeigt bevorzugt Abschnittenes (Owner-Entscheid 2026-09-09) | `Filled` |
| `shortName` | `string \| null` | nein | Rang 7 — steht **hinter** dem Namen, wenn er von ihm abweicht und Platz ist. Gleich, fehlend oder eine reine Kürzung des Namens: er entfällt | `WithShortName` |
| `href` | `string` | nein | Der Weg zum Partner. Ohne ihn ist die Zelle Text — nicht jeder Ort hat einen Weg (L3: ein Suchparameter, kein Kontext) | `Filled` |
| `account` | `{ number: string; role: "creditor" \| "debtor" } \| null` | nein | Rang 2 — die Personenkonto-Nummer, `mono`, hinter dem Namen. **Die Rolle kommt als Prop, nicht aus dem Satz:** `PartnerAccountRef` trägt nur `accountNumber` und `isInternal`; welche Rolle es ist, sagt der Schlüssel, unter dem der Aufrufer ihn geholt hat (`creditorAccount` gegen `debtorAccount`) | `WithAccount` |
| `limit` | `number` | nein | Wo gekürzt wird. Vorgabe **33** — `MAX_COUNTERPARTY` aus `SourceDocument.tsx`, und das deckt den p90 des Namens (21 Zeichen) mit Abstand | `Edges` |

**Kann bewusst nicht:**

- **Einen Namen ohne Partner-Id darstellen.** Es gibt keine Prop, die einen
  Gegenpart-String entgegennimmt. Wer nur einen Namen hat, schreibt ihn hin —
  das ist ehrlicher als eine Zelle, die einen Stammsatz behauptet.
- **Den Reifegrad zeigen.** `onboardingState` ist zu 99,7 % `confirmed`; eine
  Marke, die fast immer dasselbe sagt, ist Rauschen. Sie steht in der Liste
  (0140) und in den Fakten (0142), wo man sie sucht.
- **Sich den Partner holen.** Daten kommen als Props, hier wie überall.
- **Den Ort zeigen.** Rang 6, und er löst nur 35 % der Namensdubletten
  (gemessen beim größten Mandanten: 149 Dubletten, PLZ löst 42 %, Ort 35 %).
  In XS ist dafür kein Platz; er gehört in die Zeile (0140).

## Verhalten

**Was in der Zelle steht, in dieser Reihenfolge:** Name — Kurzname, wenn er
abweicht — Kontonummer, wenn eine da ist. Mit `href` umschließt der Anker den
**Namen**, nicht die ganze Zelle: die Kontonummer hat ihren eigenen Weg
(0140), und zwei Ziele in einem Anker wären I11 verletzt.

**Kürzung.** Über `limit` hinaus wird hinten gekürzt, mit `title` am ganzen
Namen. Der p90 liegt bei 21 Zeichen und das Maximum bei 50 — bei 33 bleiben
neun von zehn Namen unangetastet, und die restlichen sind lesbar gekürzt statt
umgebrochen.

**Der Kurzname entfällt, wo er nichts sagt.** Nicht nur bei Gleichheit: wenn
er ein Präfix des Namens ist, ist er dessen Kürzung und wiederholt ihn. Das
betrifft die Mehrheit — 53 % stehen exakt bei 15 Zeichen, also am Anschlag.

## Stories

Nach §6: fünf Props, davon eine mit Enum-Charakter (`account.role`), eine
Kürzungsgrenze. Untergrenze für eine Entitäts-Form ist 3.

| Story | Beweist |
|---|---|
| `Filled` | Name mit `href` und ohne — der Regelfall in beiden Ausprägungen |
| `WithShortName` | Kurzname abweichend (steht), gleich (entfällt), Präfix des Namens (entfällt) |
| `WithAccount` | Kreditor- und Debitornummer nebeneinander; die Rolle kommt aus der Prop, nicht aus dem Satz |
| `Edges` | 50 Zeichen (Maximum im Bestand), genau 33, `shortName: null`, `account: null` — und ein Name, der aus einer Ziffernfolge besteht |
| `InUse` | Die Zelle in fremdem Markup: in einer `FieldList`-Zeile (wie `CaseFacts` sie stellt) und in einer Tabellenzelle (wie `account-columns`) |

Ausgelassen mit Grund: **lädt** und **Fehler** — eine Zelle hat keine eigenen
Datenzustände, sie zeigt, was sie bekommt (Präzedenz `AccountCell`). **Leer**
gibt es nicht: ohne Namen gibt es keine Zelle, und der Aufrufer rendert dann
nichts.

## Ausbau

Der **Grabstein** (`mergedIntoPartnerId`, Rang 16) wäre der eine Zustand, den
die Zelle später tragen müsste: ein zusammengeführter Partner soll auf seinen
Nachfolger zeigen, nicht ins Leere. Heute ist das Feld im ganzen Bestand
**null**, also gibt es die Prop nicht (A12). Auslöser wäre die erste
Zusammenführung.

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

- [ ] Es gibt **keine** Prop, die einen Gegenpart-String ohne Partner-Id
      entgegennimmt (`grep -n "counterparty" BusinessPartner.tsx` → 0 Treffer)
- [ ] `name` trägt `legalName`; `shortName` ist eine eigene, optionale Prop und
      wird nie als Ersatz gerendert (Story `WithShortName`)
- [ ] Der Kurzname entfällt bei Gleichheit **und** wenn er Präfix des Namens
      ist (`WithShortName`, dritte Zeile)
- [ ] Mit `href` umschließt der Anker nur den Namen; die Kontonummer liegt
      außerhalb (`WithAccount`, DOM geprüft — I11)
- [ ] Gekürzt wird bei `limit`, Vorgabe 33, mit `title` am ganzen Namen
      (`Edges`)
- [ ] Die Kontonummer ist `mono` und behält führende Nullen (`WithAccount`)
- [ ] Ersetzt die drei Namensausgaben in `CaseFacts`, `account-columns` und
      `Account.tsx` ohne Funktionsverlust

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
