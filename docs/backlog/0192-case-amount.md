# 0192 · CaseAmount — Betrag und offener Rest des Sachverhalts

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-21, fremde Abnahme steht aus |
| Stufe | `entities/accounting-case/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: „offen" misst Belege gegen Zahlungen eines Sachverhalts, „gedeckt" ist ein Buchhaltungswort |
| Quelle | Owner-Entscheid 2026-09-21, überbracht von `acto`, wörtlich: „Soll ‚Betrag + offener Rest' ein Baustein im Design-System werden → ja do it" · B-01 aus 0190 · Nachtrag 0152 (`OpenRest` im Showcase) |
| Ersetzt | `OpenRest` in `src/showcase/case/CasePage.tsx`; in der App der Nachbau im Kopf des Sachverhalt-Details |
| Setzt voraus | `CaseHeaderVM.openAmount` im Spiegel (seit App `c478af21`) ✓ · `Amount` ✓ |
| Spec von / am | Claude, 2026-09-21 |

## Ziel

Der Kopf des Sachverhalts nennt den Betrag **einmal** (D24) und darunter, was
davon noch offen ist — aber nur, wo das etwas sagt. Die Regel dafür stand im
Showcase und wäre in der App ein zweites Mal entstanden. Sie gehört an genau
eine Stelle.

## Einordnung

**Regel 5 aus §3** (neue Entitäts-Form): keine vorhandene Form trägt den Fall.
`Amount` kennt keinen Rest, `CaseFacts` zeigt den Betrag bewusst nicht (er
steht im Kopf), `EntityHeader.metric` nimmt einen beliebigen Knoten. Zwei
Aufrufer: die Showcase-Seite (0152) und das Sachverhalt-Detail der App.

Größe XS — ein Wert mit einer Nebenzeile, gedacht für `EntityHeader.metric`.

## Schnittstelle

| Prop | Typ | Was | Nachweis |
|---|---|---|---|
| `amount` | `CaseHeaderVM["totalAmount"]` (`number \| null`) | der Betrag des Falls; `null` → die Komponente rendert **nichts** (kein „— €", D7) | `States` |
| `openAmount` | `CaseHeaderVM["openAmount"]` (`number \| null`) | Σ Belege − Σ Zahlungen, wie die App ihn rechnet (`openAmountOf`) | `States` |
| `currency` | `Currency \| null` | die Währung; die App verengt ihren `string` mit `asCurrency` | `States` |

**Die Regel (D24), an dieser einen Stelle:**

| `openAmount` | Nebenzeile |
|---|---|
| `null` | keine — kein Beleg, an dem sich ein Rest messen ließe |
| gleich dem Betrag (Beträge ohne Vorzeichen verglichen) | **keine** — nichts gezahlt, der Rest wäre der Betrag ein zweites Mal |
| `0` | „gedeckt" |
| sonst | „offen" + Betrag |

**Was sie bewusst nicht tut:** sie rechnet den Rest nicht aus (das ist
`openAmountOf` in der App) · sie färbt nichts (ein offener Rest ist kein
Fehler, V6) · sie erfindet kein Wort für einen negativen Rest — der steht als
„offen" mit Vorzeichen (siehe Offene Fragen).

## Stories

| Story | zeigt |
|---|---|
| `States` | die vier Fälle der Regel untereinander: teilweise bezahlt, gedeckt, nichts gezahlt, ohne Beleg — dazu ohne Betrag (rendert nichts) |
| `InHeader` | im Einsatz als `EntityHeader.metric` |
| `Edge` | großer Betrag, Rest in Cent, negativer Rest |

„Lädt" und „Fehler" entfallen: die Komponente zeigt zwei fertige Zahlen, sie
lädt nichts und kann nicht scheitern.

## Abnahmekriterien

1. Bei `openAmount: 690`, `amount: 1190` steht unter dem Betrag „offen 690,00 €".
2. Bei `openAmount: 0` steht „gedeckt".
3. Bei `openAmount` gleich `amount` — auch mit umgekehrtem Vorzeichen — steht
   **keine** Nebenzeile.
4. Bei `openAmount: null` keine Nebenzeile; bei `amount: null` rendert die
   Komponente nichts.
5. Kein Rot, keine Warnfarbe an der Nebenzeile.
6. `CasePage` im Showcase nutzt `CaseAmount`; `OpenRest` ist dort gelöscht.
7. `pnpm typecheck` und die Wächter grün, jede Story im Browser angesehen.

## Offene Fragen

1. **Braucht ein negativer Rest (überzahlt) ein eigenes Wort?** Ohne Antwort:
   nein — „offen −50,00 €", bis die App ein Wort dafür in der Domäne führt.

## Ausbau

Keiner geplant. Kommt eine Fremdwährung mit Kurs an den Fall, trägt die
Nebenzeile sie nicht — dafür wäre `CaseHeaderVM` der Ort, nicht diese Form.

## Stand des Baus (2026-09-21)

`src/ui/v3/entities/accounting-case/CaseAmount.tsx`, exportiert über den
Barrel; Stil `.v3camt__rest`; drei Stories unter
`v3/Entitäten/Sachverhalt/CaseAmount`. `OpenRest` ist aus
`src/showcase/case/CasePage.tsx` gelöscht, die Seite nutzt `CaseAmount`.

Im Browser nachgesehen (`--states`): „1.190,00 € · offen 690,00 €" ·
„2.380,00 € · gedeckt" · „595,00 €" ohne Nebenzeile · „2.975,00 €" ohne
Nebenzeile · ohne Betrag nichts. `--in-header`: die Nebenzeile klein und in
normaler Stärke unter dem Betrag, ohne Farbe. Keine Konsolenmeldung.
