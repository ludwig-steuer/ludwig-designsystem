# 0102 · BankTransactionFacts — alles, was an einer Zahlung steht

| | |
|---|---|
| Status | in Arbeit |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/bank-transaction/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: achtzehn Felder dieser Entität, fünf davon aus SEPA |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md` (Status `geprüft`, 2026-09-05), Formen-Tabelle Zeile `BankTransactionFacts`; Ränge 1–18 |
| Ersetzt | `modules/bank-transactions/ui/BankTransactionDetail.tsx` (150 Z.) samt `KV` aus `kontoauszug-presentation.tsx` |
| Voraussetzung | 0099 `BankTransactionPurpose` · 0095 `CaseCell` |
| Blockiert | `BankTransactionDrawer` (0103) — er muss Zone 3 aus dieser Komponente zeigen (0052) |
| Spec von / am | Claude, 2026-09-05 (Skill `spec-schreiben`, nach dem geprüften Profil) |

## Ziel

Wer eine Zahlung aufschlägt, will alles sehen, was an ihr hängt — und das
ist bei dieser Entität viel: achtzehn Punkte, von denen die Zeile acht zeigt.
Anders als beim Sachverhalt gibt es hier **eine** bestehende Fassung, und sie
ist gut: `BankTransactionDetail` zeigt schon fast den ganzen Satz in vier
Blöcken. Diese Spec hebt sie und ergänzt, was fehlt.

## Einordnung

- **Wiederverwenden:** `FieldList` trägt die Paare, `Amount`, `Time`,
  `MonoCell` die Werte, `RawRecord` (0051) die Rohdaten,
  `BankTransactionPurpose` (0099) den Zweck, `CaseCell` (0095) die
  zugeordneten Fälle. Es fehlt der Zuschnitt.
- **Neu, weil:** `spec-schreiben` §3 Regel 5, und tragend ist **0052**: der
  Drawer muss die Kernfakten aus derselben Komponente zeigen wie eine spätere
  Detailansicht. Ohne diese Datei hätte 0103 keine Zone 3.
- **Zuschnitt:** eine Datei, ein Export. Fünf Blöcke, keine fünf Exporte —
  sie teilen denselben Datensatz und treten nie getrennt auf (§4).
- **Setzt auf:** `FieldList`, `Amount`, `Time`, `MonoCell`, `RawRecord`,
  `BankTransactionPurpose`, `CaseCell`.

## Fünf Blöcke

| Block | Ränge | Inhalt |
|---|---|---|
| Zahlung | 2, 4, 9, 16 | Betrag, Buchungsdatum, Valuta, EUR-Wert (nur wenn abweichend) |
| Verwendungszweck | 1, 11 | Freitext plus die sieben SEPA-Chips (`variant="block"`) |
| Gegenpartei | 3, 10, 12 | Name, IBAN, BIC — die letzten beiden mono |
| Zuordnung | 5, 6, 7, 8, 13 | DATEV-Haken mit Match-Stufe im Klartext, die Sachverhalte mit Teilbetrag, Buchungs-Zustand, offene Klärungen |
| Import | 14, 15, 17, 18 | Quelle, Import-Lauf mit Zeitpunkt, externe ID, Rohdaten |

Die Reihenfolge ist die des Profils und über alle Formen dieselbe. Rang 18
(`raw_payload`) ist der einzige Zuwachs gegenüber der heutigen Fassung — er
kommt als `RawRecord`, nicht als Feldliste, weil der Spaltenkommentar ihn als
„für Audit/Debugging" führt.

## Der EUR-Wert erscheint bedingt

`amount_eur` ist zu 100 % gefüllt und heute **identisch** zu `amount`,
`fx_rate` ist immer 1 (Phase 1: nur EUR). Eine Zeile „Betrag (EUR): 89,90 €"
neben „Betrag: 89,90 €" sagt nichts. Sie erscheint deshalb nur, wenn die
beiden Werte auseinandergehen — so macht es die heutige Fassung schon, und
das bleibt.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transaction` | `BankTransactionDetailData` | ja | Die Position mit allen achtzehn Punkten | `Filled` |
| `caseHref` | `(caseId: string) => string` | ja | Reicht an `CaseCell` durch | `Filled` |
| `blocks` | `BankTransactionFactBlock[]` | nein, Default alle fünf | Welche Blöcke. Der Drawer lässt „Import" weg — das ist Herkunft, keine Kernfrage | `InDrawer` |
| `tone` | `"surface" \| "bare"` | nein, Default `surface` | Durchgereicht an `FieldList` | `InDrawer` |

**Kann bewusst nicht:**

- **Zuordnen oder umbuchen.** Kein Schreibpfad. An dieser Entität schreibt
  ohnehin keine Nutzerhand — vier Schreibpfade gibt es, alle sind Import,
  Matcher, Agent oder Watchdog.
- **Die Match-Stufe färben.** Für `match_stage` gibt es keine Achse (L-57).
  Der Klartext steht als Wort, ohne Ton, bis es sie gibt.
- **Den Zweck kürzen.** Hier steht er ganz (`variant="block"`); das Kürzen
  ist Sache der Zeile.

## Verhalten

Server-Component. `FieldList` je Block, Blöcke untereinander mit
Überschrift. Zahlen rechts mit `tnum`, IBAN und BIC mono, Zeitpunkte über
`Time`.

Ein Feld ohne Wert lässt seine Zeile weg — mit **einer** Ausnahme: die
Zuordnung. Dort heißt kein Wert etwas („noch keinem Sachverhalt
zugeordnet"), und das steht als Satz, nicht als Lücke. 65 % der Positionen
sind dieser Fall.

Zustände: gefüllt · nicht zugeordnet · ohne SEPA-Tags (10 %). Lädt und Fehler
gehören dem Aufrufer.

## Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionFacts`. Abgeleitet
nach §6: 3 anwendbare Zustände + 1 Enum (`blocks`) + 1 Enum (`tone`) +
0 Callbacks + 1 „im Einsatz" + 1 Rand = 7.

| Story | Beweist |
|---|---|
| `Filled` | Alle fünf Blöcke, ein zugeordneter Fall, sieben SEPA-Chips |
| `Unassigned` | Der Zuordnungs-Block sagt den Satz, statt leer zu bleiben |
| `WithoutTags` | Ohne SEPA-Block: der Zweck steht als Freitext, keine leere Chip-Reihe |
| `InDrawer` | `blocks` ohne „Import", `tone="bare"` — die Fassung für 0103 |
| `RawPayload` | Rang 18 als `RawRecord`, aufklappbar |
| `Split` | Rand: drei Sachverhalte mit Teilbeträgen und Rest |
| `InUse` | Unter einem Kopf mit Gegenpartei und Betrag — nichts steht zweimal |

Nicht anwendbar: `leer nach Filter`, `lädt`, `Fehler`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Der Beleg, aus dem die Zeile stammt | `sourceDocument?: SourceDocumentLink` | L-45 ist entschieden und die Kante hat einen FK |
| Die Match-Stufe als Chip statt als Wort | keine Prop — eine Achse (L-57) | die Achse ist da |

## Befunde für `ludwig/app`

- **B1 (L-56)** — Der Detail-Typ liegt nicht im Spiegel; lokal
  deckungsgleich definiert.
- **B2 (L-57)** — Ohne Achse für `match_stage` steht die Stufe hier als
  Klartext ohne Ton. Die vier offenen Klassen bekommen damit **hier** zum
  ersten Mal ein Wort — in der Zeile sind sie unsichtbar.
- **B3 (L-45)** — Die Kante zum Beleg ist weich und hat keinen FK; solange
  der Owner-Entscheid aussteht, zeigt kein Block „dieser Umsatz stammt aus
  Beleg X".

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

- [ ] Die fünf Blöcke stehen in der Reihenfolge oben, die Punkte darin in der Rang-Reihenfolge (Story `Filled`)
- [ ] Der EUR-Wert erscheint **nur** bei Abweichung (Story `Filled`: nicht sichtbar)
- [ ] Der Zuordnungs-Block sagt bei 0 Fällen einen Satz, keine Lücke (Story `Unassigned`)
- [ ] Ohne SEPA-Tags fehlt die Chip-Reihe ganz, nicht als leere Zeile (Story `WithoutTags`)
- [ ] Die Match-Stufe steht als Wort ohne Ton, solange L-57 offen ist (Story `Filled`)
- [ ] Rohdaten kommen über `RawRecord`, nicht als Feldliste (Story `RawPayload`)
- [ ] `blocks` und `tone` reichen durch und ändern nichts an der Reihenfolge (Story `InDrawer`)
- [ ] Kein Schreibpfad in der Datei (`grep`: kein `onChange`, kein `action`)
- [ ] offen (App): ersetzt `BankTransactionDetail.tsx` samt `KV`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. Gehören die Rohdaten (Rang 18) überhaupt hierher? *Ohne Antwort: ja, als
   letzter Block und aufgeklappt geschlossen. Der Spaltenkommentar nennt sie
   „für Audit/Debugging", und genau dann sucht man sie hier statt in der DB.*
2. Fünf Blöcke oder vier? *Ohne Antwort: fünf. Der Zweck ist Rang 1 und
   trägt sieben Referenzen — als Zeile im Zahlungs-Block ginge er unter.*
3. Zeigt der Zuordnungs-Block den Buchungs-Zustand je Fall oder einmal?
   *Ohne Antwort: je Fall. Er gehört dem Ereignis, und bei mehreren Fällen
   gibt es mehrere Ereignisse — das ist der Satz, der die ganze Familie
   trägt.*

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Entscheide: 1 Rohdaten als letzter Block, zugeklappt · 2 fünf Blöcke · 3 Buchungs-Zustand je Fall (Familienregel).

Vor dem Bau in die Spec: (a) Zuordnungs-Block: `match_stage` als Rohwert der Spalte, mono, unübersetzt, ohne Ton, bis L-57 — nicht „Klartext" (R1, keine lokale Map); Kriterium entsprechend; (b) Typ-Satz aus 0100, mit dem Ereignis-Zustand je Fall, den `CaseLink` (0095) nicht trägt; (c) Story-Formel zählt `RawPayload` mit (Kosmetik).
