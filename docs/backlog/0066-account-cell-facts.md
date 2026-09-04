# 0066 · `Account` — Zelle und Fakten eines Kontos

| | |
|---|---|
| Status | spec |
| Stufe | `entities/account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Kontonummer, Kontenrahmen, Soll/Haben-Saldo und DATEV-Sync sind Buchhaltung |
| Quelle | Entitätsprofil `docs/entitaeten/account.md` (Status `geprüft`, 2026-09-04), Abschnitte „Datenpunkte", „Formen" · Anfrage Owner 2026-09-04 („Drawer für Konto, z.B. 1210") |
| Ersetzt | `AccountRef` in `ludwig/app` (`ui/booking/AccountRef.tsx`, 5 `<AccountRef>`-Stellen, 13 Dateien am Drawer-Context) · den `meta`- und `tfoot`-Teil von `AccountLedgerDrawer.tsx` · den Stammdaten-Block der Kontoseite |
| Blockiert | 0067 (die Zeile nennt das Gegenkonto als Zelle) · 0068 (`AccountDrawer`, Zone 3) · 0063 (`AccountView`) |
| Setzt voraus | nichts Offenes |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Die Sachbearbeiterin steht in einer Buchung auf `1210` und will wissen, was
das für ein Konto ist — ohne die Zeile zu verlassen. Heute steht dort
`AccountRef`: Nummer, Name, ein Klick, der einen Drawer öffnet, wenn zufällig
ein Provider darüberhängt. Was das Konto **ist** — Rolle, Saldo des Jahres,
wie viele Bewegungen — steht erst hinter dem Klick, und dort in einer
`meta`-Zeile, die der Drawer selbst zusammensetzt.

Hier sind es zwei Stufen derselben Sache: die **Zelle** nennt das Konto in
fremdem Markup, die **Fakten** beantworten „was ist das für ein Konto"
in sieben Zeilen — im Drawer, in einer `HoverCard` über der Zelle und
später im View.

## Einordnung

**Wiederverwenden — geprüft, reicht nicht:**

| `@when`-Treffer | warum er nicht reicht |
|---|---|
| `AccountField` — „Choosing an account … and, with `onOpenLedger`, the way to its account sheet" (0013) | Deckt die **Auswahl** ab (Form Picker, S). Ein Konto zu *nennen* ist kein Auswählen: die Zelle steht in einer fertigen Zeile, hat kein Feld, keine Kandidaten, keinen Zustand. |
| `MonoCell` — „A key made of digits or codes in a cell" | Trägt die Nummer, kennt aber nicht Name, Rolle und den Weg zum Kontenblatt. Die Zelle **setzt darauf auf**. |
| `FieldList` — „Master data and properties of an item, read-only" | Trägt die Geometrie der Fakten, kennt aber nicht die Ordnung der Konto-Punkte und nicht die Regel, dass der Saldo zweigeteilt steht (Owner 2026-09-04). `AccountFacts` **setzt darauf auf**, wie `DocumentFacts` (0052). |
| `HoverCard` — „A preview of what an anchor leads to — **the account behind an account number** … read without leaving the list" | Nennt genau diesen Fall — aber als **Klammer**: „the card — the „preview" form of the entity, **composed by the caller**". Der Inhalt fehlt, und das ist `AccountFacts`. |
| `KpiTile` | Zahl mit Label im Seitenkopf, nicht sieben Fakten im Drawer. |

**Neu, weil:** §3.5 — `ui-repraesentationen.md` führt für Sachkonto/
Personenkonto heute `AccountRef` (Inline) und den Stammdaten-Block der
Kontoseite; das Entitätsprofil empfiehlt `AccountCell` mit Grund 3 (FK-Ziel
jeder Buchungszeile) und `AccountFacts` mit Grund 1 (existiert heute als
`meta`+`tfoot` des Drawers, wird ersetzt).

**Zuschnitt: Familie, eine Datei** `Account.tsx`, zwei Exporte. Grund nach §4:
gemeinsames Vokabular (Nummer in `MonoCell`, Name gedämpft daneben, Rolle über
die Registry-Achse `konto_typ`) und dieselbe Datenquelle
(`client_ledger_accounts` plus zwei abgeleitete Summen). Kein Trenn-Trigger:
zusammen 7 Stories, je Export ≤ 3 Props, geschätzt ~160 Zeilen, kein eigener
Zustand.

**Warum drei Specs für fünf Formen** (0066–0068): Das Profil empfiehlt fünf
*Formen*; §4 schneidet *Dateien*. `AccountCell` und `AccountFacts` bilden eine
Familie (hier), `accountEntryColumns()` und `AccountEntryList` eine zweite
(0067), der Drawer komponiert beide (0068).

**Setzt auf:** `MonoCell`, `FieldList` (`bare`), `Amount`, `StatusBadge`
(Achsen `konto_typ`, `konto_datev_sync`), `Link`. Kein `"use client"` — beide
Exporte sind Prop-in/JSX-out.

## Schnittstelle

`AccountCell` — XS, ein Konto in fremdem Markup:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `number` | `string` | ja | Kontonummer, **logische DATEV-Nummer** wie gespeichert — führende Nullen bleiben, nie numerisch casten (GLOSSARY „Account number canon") | `Filled` |
| `name` | `string \| null` | nein | Kontoname; `null` → nur die Nummer, kein Platzhalter | `Filled` |
| `href` | `string` | nein | Weg zum Kontenblatt. Gesetzt → die Zelle ist ein Link; weggelassen → reiner Text, kein toter Klick | `InUse` |

Kein `showName`: der Owner hat am 2026-09-03 zu 0013 entschieden „wir wollen
im Normalzustand Konto-Nr und Name anzeigen, **immer beides**" — eine Prop,
die das wieder aufmacht, wäre eine zweite Wahrheit.

`AccountFacts` — M, „was ist das für ein Konto":

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `facts` | `AccountFactsVM` | ja | Die Fakten in Rangfolge; fehlende Punkte behalten ihre Zeile und zeigen den Geviertstrich | `Filled`, `Unvollstaendig` |
| `accountHref` | `(number: string) => string` | nein | Macht die Kontonummer im Kopf zum Link (im View steht sie schon oben, dort weglassen) | `InUse` |

```ts
/** Die Fakten eines Kontos in einem Wirtschaftsjahr. Strukturell aus
 *  `client_ledger_accounts` plus zwei Aggregaten der Bewegungen. */
export interface AccountFactsVM {
  accountNumber: string;
  accountName: string | null;
  /** `client_ledger_accounts.accounting_role` — Achse `konto_typ`. */
  role: string;
  /** Das Jahr, dessen Kontenplan diese Zeile ist (GLOSSARY F64). */
  fiscalYear: number;
  currency: Currency;
  /** Σ Soll − Σ Haben der **Spiegelsätze** des Jahres. `null` = kein Abgleich. */
  datevBalance: number | null;
  datevCount: number;
  /** Ludwig-Sätze ohne `datev_mirror_entry_id` — Zahl und Summe. */
  ludwigOnlyCount: number;
  ludwigOnlyAmount: number | null;
  /** Personenkonto: der Geschäftspartner dahinter (52 % der Konten). */
  partnerName?: string | null;
  /** `client_ledger_accounts.last_booking_date` (15 % gefüllt). */
  lastBookingDate?: string | null;
  /** Achse `konto_datev_sync`. **Nur zeigen, wenn ≠ `synced`** — auf Staging
   *  sind 41.555 von 41.570 Konten `synced`, der Normalfall ist stumm. */
  syncState?: string | null;
}
```

**Typen:** `Currency` aus `@/ludwig/shared/money`. **GLOSSARY:** englisch im
Code (`accountNumber`, `ledger account`, `fiscalYear`), deutsch im Label
(„Konto", „Saldo in DATEV", „Sachkonto").

**Befund an `ludwig/app`:** `AccountFactsVM` hat kein Gegenstück in
`src/ludwig/` — die App setzt die Fakten heute im Drawer und auf der
Kontoseite je einzeln zusammen (`AccountLedgerDrawer.tsx:88–97`,
`accounts/[accountNumber]/page.tsx:302–318`). Der Typ ist hier definiert,
strukturell aus vorhandenen Spalten und zwei Aggregaten; ein kanonisches VM
in der App wäre sauberer.

**Was die Familie bewusst nicht kann:**

- **nicht laden** — kein Aggregat wird hier gerechnet, `datevBalance` und
  `ludwigOnlyAmount` kommen fertig. (`@instead`: die Seite lädt.)
- **nicht das Jahr wechseln** — die Fakten zeigen **ein** Jahr. Der Schalter
  gehört dem Drawer (0068). (`@instead`: `AccountDrawer`.)
- **keine Bewegungen zeigen** — kein Auszug, keine Zeilen. (`@instead`: 0067.)
- **sich nicht selbst öffnen** — die Zelle bekommt ein `href`, sie kennt
  weder Routing noch Drawer-Context. (`@instead`: die Seite baut die URL.)
- **keinen Kontenrahmen erklären** — SKR-Klasse, Kontenfunktion,
  Steuerautomatik stehen erst im View (Rang 9, 14, 16).

## Verhalten

**Server-Components**, beide. Kein State, kein Handler, kein Effekt — `href`
statt `onClick` ist der Grund: der Weg zum Kontenblatt läuft über einen
Search-Param (L3, wie `DataTable`s `RowAction`), nicht über einen Context.

**Zelle:** Nummer in `MonoCell`, Name gedämpft dahinter, gekürzt ab 40
Zeichen mit Ellipse (p90 der Kontonamen ist 39, max 50) — der volle Name im
`title`. Mit `href` ein `Link`, ohne `href` ein `<span>`; nie ein Knopf, der
nichts tut.

**Fakten**, in dieser Reihenfolge (Ränge 1–7 des Profils, kumulativ):

| Zeile | Inhalt | wenn leer |
|---|---|---|
| Kopf | `1210 Commerzbank` · `StatusBadge axis="konto_typ"` · `2026` | Name entfällt, Nummer bleibt |
| Saldo in DATEV | `Amount`, Σ Soll − Σ Haben der Spiegelsätze | „—" |
| + n nur in Ludwig | Zahl **und** Summe, gedämpft; entfällt ganz bei `ludwigOnlyCount === 0` | die Zeile fehlt (kein „0 nur in Ludwig") |
| Bewegungen | `datevCount` in DATEV, `ludwigOnlyCount` nur in Ludwig | „—" |
| Geschäftspartner | Name, wenn Personenkonto | Zeile fehlt |
| Letzte Buchung | `Time` | „—" |
| DATEV-Sync | `StatusBadge axis="konto_datev_sync"` — **nur wenn ≠ `synced`** | Zeile fehlt |

Zwei Zeilen verschwinden statt leer zu stehen, die übrigen behalten ihren
Platz: „+ n nur in Ludwig" und „DATEV-Sync" sind Befunde — ihre Abwesenheit
ist die gute Nachricht, ein Geviertstrich dort wäre eine Frage ohne Antwort.
Der Kontrast dazu ist „Letzte Buchung" (15 % gefüllt): dass sie unbekannt
ist, will die Leserin sehen.

**Warum der Saldo zweigeteilt ist** (Owner-Entscheid 2026-09-04): Ein
laufender Saldo über beide Quellen mischt Ist und Noch-nicht-angekommen. Die
DATEV-Zahl ist die Wahrheit, die Ludwig-Zahl der Nachtrag.

**Zustände:** „lädt" und „Fehler" gibt es nicht — beide Exporte laden nichts
(`@instead`: `Skeleton`, `ErrorRow` beim Aufrufer). „leer nach Filter" gibt
es nicht, sie filtern nicht. „leer" heißt hier: einzelne Punkte fehlen, nicht
die ganze Komponente — dafür `Unvollstaendig`.

**Tastatur:** die Zelle mit `href` ist ein Link und liegt im Tab-Fluss; ohne
`href` ist kein Element fokussierbar. Die Fakten sind fokussierbar nur über
`accountHref`.

**CSS:** neue Wurzel `.v2acc` in `src/styles/v3.css` (`grep -n "\.v2acc" `
zeigt heute nichts; `.v2kf` gehört `AccountField`). Neuer Abschnitt **am Ende**
der Datei mit Aufgabennummer — hier arbeiten mehrere Sitzungen parallel.

## Stories

Titel `v3/Entitäten/Konto/Account`. Jede Story zeigt beide Exporte
untereinander, damit die Stufen im Vergleich lesbar sind.

| Story | Beweist |
|---|---|
| `Filled` | Sachkonto `1210 Commerzbank`, Saldo in DATEV, 2.937 Bewegungen, vier nur in Ludwig — `number`, `name`, `facts` |
| `Unvollstaendig` | `accountName: null`, `datevBalance: null`, `lastBookingDate: null` — Geviertstriche, Zeilen bleiben stehen |
| `Personenkonto` | `role: "creditor"`, `partnerName` gesetzt — die Partner-Zeile erscheint, der Chip wechselt |
| `NurDatev` | `ludwigOnlyCount: 0` — die Nachtrags-Zeile **fehlt**, kein „0 nur in Ludwig" |
| `SyncOffen` | `syncState: "local_only"` — der zweite Chip erscheint; im Normalfall ist er weg |
| `InUse` | Zelle als Gegenkonto in einer `Table`-Zeile mit `href`; Fakten in einer `HoverCard` über derselben Zelle — wie auf der Seite |
| `Edges` | Kontoname 50 Zeichen (Ellipse + `title`), Nummer `0420` (führende Null), Saldo negativ und `0,00 €`, sechsstellige Personenkontonummer `890001` |

Sieben Stories: 2 Zustände (gefüllt, unvollständig) + 3 Datenzweige, die eine
Zeile erscheinen oder verschwinden lassen + 1 „im Einsatz" + 1 Rand. Keine
Enum-Props, keine Callbacks, keine Layout-Booleans.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt (`Account.tsx`), Story daneben, Titel `v3/Entitäten/Konto/Account`
- [ ] Code englisch; `@when`/`@instead` an **beiden** Exporten
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle sieben Stories vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `number`/`name` wie Zeile 1–2 der Schnittstelle; ohne `href` **kein** fokussierbares Element (Story `Filled`, im DOM nachgemessen)
- [ ] Mit `href` ist die Zelle ein `<a>`, kein `<button>` (Story `InUse`)
- [ ] Kontoname wird ab 40 Zeichen gekürzt, voller Name im `title` (Story `Edges`)
- [ ] Führende Nullen bleiben stehen — `0420` wird nicht zu `420` (Story `Edges`)
- [ ] Die Fakten stehen in der Reihenfolge Kopf · Saldo DATEV · + nur Ludwig · Bewegungen · Partner · letzte Buchung · Sync (Story `Filled`, DOM-Reihenfolge)
- [ ] `ludwigOnlyCount === 0` lässt die Nachtrags-Zeile **verschwinden**, nicht leer stehen (Story `NurDatev`)
- [ ] `syncState === "synced"` zeigt **keinen** zweiten Chip; `local_only` zeigt ihn (Stories `Filled` vs. `SyncOffen`)
- [ ] Fehlende Werte zeigen den Geviertstrich und behalten ihre Zeile (Story `Unvollstaendig`)
- [ ] Rolle und Sync-Zustand kommen aus der Registry (`konto_typ`, `konto_datev_sync`), nicht aus einer lokalen Map (`grep` findet keine Label-Map in `Account.tsx`)
- [ ] `AccountFacts` rechnet nichts: kein `reduce`, keine Summenbildung in der Datei
- [ ] Ersetzt `AccountRef` in `ludwig/app` ohne Funktionsverlust — bis auf den Context-Weg, der zu einem `href` wird → **offen (App)**

## Offene Fragen

1. **`href` statt Callback.** Die App öffnet den Drawer heute über einen
   Context (`useAccountDrawer`), nicht über eine URL. — *Ohne Antwort:
   `href`. Es hält beide Exporte server-tauglich, entspricht L3 („drawer over
   a search param") und `DataTable`s `RowAction`, und die App kann den
   Context-Weg beim Umzug in einen Search-Param drehen. Wer den Callback
   wirklich braucht, wickelt die Zelle in eine eigene Client-Insel.*
2. **Gehört der Kontoname des Gegenkontos in die Zeile?** In 0067 steht die
   Zelle in einer Spalte von ~130 px; Nummer plus Name passen dort selten. —
   *Ohne Antwort: ja, mit Ellipse — die Kürzung ist ohnehin gebaut, und
   „immer beides" ist ein Owner-Entscheid. Wenn die Spalte in der Abnahme
   nicht trägt, kürzt die Spaltenbreite, nicht die Komponente.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
