# 0161 · Zwei Quellen Zeile für Zeile (`ReconciliationTable`)

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, gegen 8efa8d5) |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: zwei Systeme Zeile für Zeile abgleichen (Vertragsbestand ↔ Zahlungseingang) gibt es überall, wo zwei Quellen dasselbe behaupten |
| Quelle | UI-Kit-Roadmap `docs/backlog/uikit-entity-roadmap-2026-09.md` (ludwig/app 9be34746), Abschnitt B, **B1** „ReconciliationPair / MatchTable"; Reihenfolge laut Übergabe: B1 vor Entität #2 (Spiegelbuchung). Auftrag über `ludwig-manager`, 2026-09-11 |
| Ersetzt | `modules/datev-truth/ui/StapelVergleich.tsx` (656 Z.: `VergleichCard`, `CompactTable`, `StapelVergleich`, `ReplayVergleich` — Karten „Ludwig ↔ DATEV" mit Inline-Stilen und eigenen Wortlisten `KIND_META`), `DatevCoveragePanel` in `banks/[accountId]/page.tsx` (Inline-Stile, Hex-Fallbacks) |
| Blockiert | Entität #2 `datev-mirror-entry` (Liste „Nachlese", Schritt 10), den Rahmen um `OpenItemLinkRow` (#11), OPOS ↔ Buchungshistorie (#9) |
| Spec von / am | Claude, 2026-09-11 |

## Ziel

Die Sachbearbeiterin will wissen: **stimmt Quelle A mit Quelle B überein — und
wo nicht?** Nach dem Export fragt sie, was DATEV aus Ludwigs Buchungen gemacht
hat; am Kontoauszug, welche DATEV-Buchung keine Bankbewegung hat. Heute
beantwortet die App das an drei Stellen mit drei handgebauten Oberflächen, und
jede zeigt die Übereinstimmungen gleichrangig neben den Abweichungen — bei 318
passenden und 5 abweichenden Paaren sucht sie die fünf.

## Einordnung

- **Wiederverwenden:** `ComparisonTable` vergleicht **Monate** gegen Vormonate,
  nicht Paare (Roadmap B, Lückenliste 14 war falsch). `OpenItemLinkRow` ist
  eine Paar-**Zeile** einer Entität ohne Rahmen. `DataTable` mit Abschnitten
  (0149) trägt Kopf, Spalten, fünf Zustände und benannte Sektionen.
- **Neu, weil:** `spec-schreiben` §3 Regel 4 — eine Komposition mit eigenem
  Zustand (Übereinstimmungen auf- und zuklappen) auf mindestens drei Screens
  (Stapel-Nachlese, Replay, Bank-Deckung), später Spiegel, OPOS, Ausgleich.
- **Zuschnitt:** eine Datei `patterns/ReconciliationTable.tsx`, ein Export
  plus seine Typen. Die Zellen beider Seiten bringt der Aufrufer — das Pattern
  kennt keine Entität.
- **Setzt auf:** `DataTable` (Abschnitte 0149), `TextButton`, `EmptyState`.

## Aufbau

- **Abschnitt „Abweichungen"** zuerst, nach Kritikalität: nur links · nur
  rechts · geändert · aufgeteilt · unklar.
- **Abschnitt „Übereinstimmend"** darunter, **zugeklappt**: eine Zeile „318
  Paare stimmen überein" mit dem Weg „anzeigen". Dieselbe Entscheidung wie
  `CheckItems` für bestandene Prüfpunkte (0148): das Gute ist eine Zahl, bis
  jemand es sehen will.
- **Je Paar:** linke Seite · Abgleich (Zustand) · rechte Seite · Unterschied ·
  Weg. Fehlt eine Seite, steht dort **ein Satz** — „nicht in DATEV" —, kein
  Strich.
- **Aufgeteilt** (1 ↔ n): die rechte Seite trägt n Zellen untereinander; die
  Summe nennt der Unterschied.
- **Alles stimmt:** kein leerer Abschnitt, sondern der Erfolg als Satz mit
  Zahl („Alle 318 Paare stimmen überein.").

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `title` · `sub` | `string` | ja · nein | Kopf der Karte | `Filled` |
| `leftLabel` · `rightLabel` | `string` | ja | die zwei Quellen („Ludwig exportiert", „DATEV heute"); Spaltenköpfe **und** Satz der fehlenden Seite | `Kinds` |
| `pairs` | `ReconciliationPair[]` | ja | die Paare, beliebig sortiert — das Pattern ordnet | `Filled` |
| `pairHref` | `(pair) => string` | nein | Weg ins Detail (Drawer, B3) — Zeilen sind Links wie in jeder `DataTable` | `Interactive` |
| `showSame` | `boolean` | nein (Default `false`) | Übereinstimmungen aufgeklappt beginnen | `Interactive` |
| `loading` · `error` | wie `DataTable` | nein | zwei der fünf Zustände | `LoadingAndError` |

```ts
type PairKind = "left_only" | "right_only" | "changed" | "split" | "unclear" | "same";

interface ReconciliationPair {
  key: string;
  kind: PairKind;              // ordnet und gruppiert — sagt nichts
  left: ReactNode | null;      // null = fehlt auf dieser Seite
  right: ReactNode | null;
  state: ReactNode;            // das Wort, über die Achse des Aufrufers (StatusBadge)
  difference?: ReactNode;      // „Betrag 1.190,00 → 1.200,00", „3 Teile, Summe gleich"
  action?: ReactNode;          // der Weg zur Auflösung
}
```

`kind` ordnet nur; das Wort kommt als `state` vom Aufrufer, aus seiner
Registry-Achse (`mirror_match`, `abgleich_lauf` …) — ein Pattern ohne Entität
hat keine eigene Wortliste.

Bewusst **nicht**: feldweiser Vorher/Nachher-Vergleich (das ist B3
`DiffView`), Beträge verteilen (B4), Paare bilden (das tut der Server —
das Pattern zeigt, es rechnet nicht), Pagination (eine Nachlese hat Dutzende
bis Hunderte Paare; `groups` und `pager` schließen sich in `DataTable` aus).

## Verhalten

Client-Komponente (Auf- und Zuklappen). „anzeigen" / „ausblenden" ist ein
`TextButton` im Kopf des Abschnitts, mit Tastatur erreichbar. Zeilen sind Links
über `pairHref`. Zustände: gefüllt · alles stimmt (Erfolg) · lädt · Fehler;
„leer nach Filter" gehört dem Aufrufer (das Pattern filtert nicht).

## Stories

Titel `v3/Patterns/Prüfen/ReconciliationTable`.

| Story | Beweist |
|---|---|
| `Filled` | Stapel-Nachlese Ludwig ↔ DATEV: Abweichungen oben, 40 Übereinstimmungen zugeklappt |
| `Kinds` | alle sechs `kind` nebeneinander, Reihenfolge nach Kritikalität, Satz der fehlenden Seite |
| `AllSame` | alles stimmt — ein Satz mit Zahl, kein leerer Abschnitt |
| `OneSided` | Bank-Deckung: DATEV-Buchungen ohne Kontoauszugszeile, nur eine Seite |
| `Interactive` | Auf- und Zuklappen, Zeile als Link (`pairHref`) |
| `LoadingAndError` | zwei der fünf Zustände |
| `Edges` | Aufteilung in fünf Teile, lange Texte, 500 Übereinstimmungen |
| `InUse` | die Nachlese wie `StapelVergleich`: KPI-Zeile darüber, Zeilen als Weg ins Detail |

Nicht anwendbar: „leer nach Filter" (das Pattern filtert nicht; der Aufrufer
nutzt den Leerzustand von `DataTable`).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Den Unterschied feldweise zeigen | `pairHref` führt in B3 `DiffView` | B3 ist gebaut |
| Paare auswählen und gesammelt auflösen | `selection` wie in `DataTable` | ein Screen will „alle unklaren als erledigt markieren" |
| Pagination | keine — ein Abgleich, der sie braucht, ist eine Liste (Spiegel-Liste #2) | — |

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

- [ ] Abweichungen stehen vor den Übereinstimmungen, in der Reihenfolge nur links · nur rechts · geändert · aufgeteilt · unklar (`Kinds`)
- [ ] Übereinstimmungen sind zugeklappt eine Zeile mit Zahl und Weg; aufgeklappt stehen alle Paare (`Filled`, `Interactive`)
- [ ] Eine fehlende Seite ist ein Satz mit dem Namen der Quelle, kein Strich (`Kinds`, `OneSided`)
- [ ] Alles stimmt: ein Satz mit Zahl, kein leerer Abschnitt (`AllSame`)
- [ ] Das Pattern kennt keine Entität: keine Fachtypen, das Wort des Zustands kommt vom Aufrufer
- [ ] Kein Querlauf bei 1440 und 1024; Tabelle scrollt in ihrer Karte (`Edges`)
- [ ] Ersetzt `StapelVergleich`/`ReplayVergleich` und `DatevCoveragePanel` ohne Funktionsverlust — belegt an einer `InUse`-artigen Story mit KPI-Zeile darüber

## Gebaut 2026-09-11

- `patterns/ReconciliationTable.tsx` (Client-Komponente), Export im Barrel
  unter „Prüfen" mit `PairKind` und `ReconciliationPair`.
- Gebaut auf `DataTable` mit Abschnitten (0149): „Abweichungen" mit der Zahl im
  Kopf; „Übereinstimmend" zugeklappt als **leerer Abschnitt mit Satz**
  (`emptyHint`) und dem Weg „anzeigen" / „ausblenden" im Kopf (`aside`) — keine
  neue Mechanik in `DataTable`.
- Nichts weicht ab: kein Abschnitt, sondern der Leerzustand von `DataTable`
  mit `done` — „Alle 318 Paare stimmen überein." — und demselben Weg.
- Die Spalte „Weg" erscheint nur, wenn ein Paar eine Handlung trägt.
- Acht Stories (`InUse` zusätzlich zur Tabelle oben, als Beleg für den Ersatz
  von `StapelVergleich`).

## Messung (6107)

| Kriterium | Ergebnis |
|---|---|
| `pnpm typecheck`, alle Wächter | grün |
| Reihenfolge der Abweichungen | `Filled`: nur links (RE-4492) · nur rechts (KB-0831, KB-0832) · geändert · aufgeteilt · unklar |
| Übereinstimmungen zugeklappt | `Filled` „40 Paare stimmen überein.", `OneSided` „47 …", `Edges` „500 …"; `Interactive`: „anzeigen" → 12 Zeilen, „ausblenden" → wieder die Zeile |
| Fehlende Seite als Satz | „nicht in DATEV heute", „nicht in Ludwig exportiert", „nicht in Kontoauszug" |
| Alles stimmt | `AllSame`: „Alle 318 Paare stimmen überein." mit „anzeigen" → 318 Zeilen |
| Zeilen als Link nur mit `pairHref` | `Interactive` 3, `InUse` 6 Links (`#paar=…`); `Filled` ohne `pairHref` 0 |
| Laden, Fehler | `LoadingAndError`: Kopf und Spaltenköpfe stehen, Skelett bzw. Satz |
| Querlauf, 16 px | 0 bei 1440, `Edges` bei 1024: 0; kein Text in 16 px |

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Fremde Abnahme am 2026-09-11 durch die Prüfer-Session (Auftrag `ludwig-manager`), gegen 8efa8d5: **fertig.** `Kinds`: fünf Abweichungen, dann „Übereinstimmend"; zugeklappt Satz, Zahl und „anzeigen"; `Interactive` 4 → 15 → 4 Zeilen; `OneSided` dreimal der Name der Quelle, kein Strich; `AllSame` Leerzustand mit `done` und 318 Zeilen nach „anzeigen"; Links nur mit `pairHref`; 8 × 2 Messungen ohne Querlauf; statische Checks grün.

