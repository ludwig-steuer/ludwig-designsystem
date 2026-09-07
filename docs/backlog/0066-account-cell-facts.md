# 0066 · `Account` — Zelle und Fakten eines Kontos

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Kontonummer, Kontenrahmen, Soll/Haben-Saldo und DATEV-Sync sind Buchhaltung |
| Quelle | Entitätsprofil `docs/entitaeten/account.md` (Status `geprüft`, 2026-09-04), Abschnitte „Datenpunkte", „Formen" · Anfrage Owner 2026-09-04 („Drawer für Konto, z.B. 1210") |
| Ersetzt | `AccountRef` in `ludwig/app` (`ui/booking/AccountRef.tsx`, 5 `<AccountRef>`-Stellen, 13 Dateien am Drawer-Context) · den `meta`- und `tfoot`-Teil von `AccountLedgerDrawer.tsx` · den Stammdaten-Block der Kontoseite |
| Blockiert | 0067 (die Zeile nennt das Gegenkonto als Zelle) · 0068 (`AccountDrawer`, Zone 3) · 0063 (`AccountView`) |
| Setzt voraus | nichts Offenes |
| Spec von / am | Claude, 2026-09-04 |
| Freigegeben | Owner, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 — `Account.tsx`, sieben Stories, CSS-Block `.v2acc*` |

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
| `FieldList` — „Master data and properties of an item, read-only" | Trägt die Geometrie der Fakten, kennt aber nicht die Ordnung der Konto-Punkte und nicht die Regel, dass der Saldo zweigeteilt steht (Owner 2026-09-04). `AccountFacts` **setzt darauf auf**, wie `SourceDocumentFacts` (0052). |
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

## Ausbau

Nachgetragen nach A12 (die Spec entstand davor). Die Liste unter „Was die
Familie bewusst nicht kann" sind **Grenzen**, keine Vertagungen — hier steht
nur, was später dazukommen soll.

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Kontenrahmen erklären (SKR-Klasse, Kontenfunktion) | eigener Baustein neben `AccountFacts`, keine Prop hier | ein Screen fragt „warum dieses Konto?"; heute beantwortet das niemand |
| Zelle öffnet den Drawer über einen Callback statt `href` | `onOpen?: (number) => void` — additiv neben `href`, das bleibt der Normalweg | die App zieht den Drawer aus dem Search-Param in einen Context zurück (offene Frage 1) |
| Fakten für mehrere Jahre nebeneinander | keine — der Jahreswechsel gehört dem Drawer (0068) | ein Screen vergleicht zwei Jahre; dann ist es `ComparisonTable`, nicht diese Familie |

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

## Abweichungen von der Spec

| Punkt | Spec | Gebaut | Grund |
|---|---|---|---|
| Kopfzeile von `AccountFacts` | Kopf mit Nummer · Name · Rolle-Chip · Jahr über den Fakten | **entfällt**; die Rolle wurde die erste Fakten-Zeile („Kontoart") | Im ersten Browser-Durchgang stand „Commerzbank" dreimal auf einem Schirm: im Drawer-Titel, in dessen `meta` und im Fakten-Kopf; „2.937 in DATEV, 4 nur in Ludwig" zweimal. Überall, wo der Block steht, benennt schon etwas anderes das Konto — der Drawer-Titel, der Anker der `HoverCard`, der Seitenkopf des Views. |
| `accountHref` an `AccountFacts` | macht die Nummer im Kopf zum Link | **entfällt** | Sie trug ausschließlich den entfallenen Kopf. Eine Prop ohne Wirkung ist tote Fläche. |
| Reihenfolge der Fakten | Kopf · Saldo · + nur Ludwig · Bewegungen · Partner · letzte Buchung · Sync | Kontoart · Saldo **des Jahres** · + nur Ludwig · Bewegungen · Partner · letzte Buchung · Sync | Folgt aus dem entfallenen Kopf; die Ränge und ihre Reihenfolge sind unverändert. |
| Wirtschaftsjahr (Rang 4) | im entfallenen Kopf | **am Label des Saldos**: „Saldo in DATEV 2026" | Nachbesserung aus der ersten Abnahme: mit dem Kopf war das Jahr aus der Darstellung verschwunden und `fiscalYear` ein totes VM-Feld. Am Label steht es dort, wo es gebraucht wird — eine Zahl ohne Jahr ist in einer `HoverCard` wertlos —, ohne den Jahresschalter des Drawers zu doppeln. |

Die Abnahmekriterien zur Kopfzeile (Reihenfolge „Kopf · Saldo · …", Link im
Kopf) sind damit gegenstandslos; die übrigen gelten unverändert.

## Abnahme

Zwei Runden. Runde 1 (2026-09-04) schickte die Aufgabe mit zwei ✗ zurück,
Runde 2 prüfte die Nachbesserung aus Commit `0ae2dad` nach — Storybook auf
Port 6122, DOM-Messungen im Preview-Frame, `pnpm typecheck` und `pnpm build`
je Exit 0 (in beiden Runden).

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | beide Läufe Exit 0, in Runde 2 wiederholt | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel `v3/Entitäten/Konto/Account` | `src/ui/v3/entities/account/Account.tsx` + `.stories.tsx`; `index.json` zeigt `v3-entitäten-konto-account--*` | ✓ |
| Code englisch; `@when`/`@instead` an **beiden** Exporten | `Account.tsx` an `AccountCell` und `AccountFacts`; Bezeichner und Kommentare englisch, Deutsch nur in Labels | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-f]{3,8}|[0-9]+px" Account.tsx` findet nichts; keine `Record<…>`-Map; `StatusBadge axis="konto_typ"`/`"konto_datev_sync"` | ✓ |
| Alle sieben Stories vorhanden; ausgeschlossene Zustände begründet | `Filled`, `Unvollstaendig`, `Personenkonto`, `NurDatev`, `SyncOffen`, `InUse`, `Edges` — 7/7; „lädt"/„Fehler"/„leer nach Filter" in der Spec begründet ausgeschlossen | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Runde 1 ✗ (Linkfarbe, Befund 1). Runde 2 nachgemessen: `a.v2acc .v2mono` = `rgb(46,120,168)` = `--color-accent-700` gegen `rgb(45,45,45)` in der Nachbarzelle — die verlinkte Zelle ist im Ruhezustand als Link erkennbar, Unterstrich bei Hover, Fokusring vorhanden | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sieben Stories in beiden Runden gerendert und gemessen | ✓ |
| `number`/`name` wie Zeile 1–2; ohne `href` **kein** fokussierbares Element | `Filled`: Wurzel ist `<span class="v2acc">`, `querySelectorAll("a[href],button,input,select,textarea,[tabindex]")` → **0** | ✓ |
| Mit `href` ist die Zelle ein `<a>`, kein `<button>` | `InUse`: zwei `A`-Elemente (`?konto=1210`, `?konto=4210`), `button`-Zahl im Story-Root **0** | ✓ |
| Kontoname wird ab 40 Zeichen gekürzt, voller Name im `title` | `Edges`: gezeigt „Betriebs- und Geschäftsausstattung, ger…" (40 Zeichen inkl. Ellipse), `title` = der volle Name (48); der 37-Zeichen-Name daneben bleibt ungekürzt | ✓ |
| Führende Nullen bleiben stehen | `Edges`: `<span class="v2mono">0420</span>` | ✓ |
| Reihenfolge Kopf · Saldo · + nur Ludwig · Bewegungen · Partner · letzte Buchung · Sync | durch Abweichung 1 **gegenstandslos**. Gebaute Reihenfolge im DOM (`Personenkonto`): Kontoart · Saldo in DATEV 2026 · + 2 nur in Ludwig · Bewegungen · Geschäftspartner · Letzte Buchung; `SyncOffen` hängt DATEV-Abgleich an | ✓ (gegenstandslos) |
| Wirtschaftsjahr (Rang 4) ist dargestellt, `fiscalYear` ist kein totes Feld (A12) | Runde 2, alle sieben Stories gemessen: das Label trägt überall das Jahr („Saldo in DATEV 2026") (`Filled`/`InUse`/`Edges` 2026, `ImKontext` folgt dem Schalter bis 2024). Den Jahresschalter des Drawers doppelt es nicht: der Schalter listet die wählbaren Jahre, das Label qualifiziert **eine** Zahl (Anmerkung 4) | ✓ |
| `ludwigOnlyCount === 0` lässt die Nachtrags-Zeile verschwinden | `NurDatev`: vier Zeilen, kein „0 nur in Ludwig"; `Filled` hat fünf | ✓ |
| `syncState === "synced"` zeigt keinen zweiten Chip; `local_only` zeigt ihn | `Filled`: keine Sync-Zeile · `SyncOffen`: Zeile „DATEV-Abgleich · Nur in Ludwig" | ✓ |
| Fehlende Werte zeigen den Geviertstrich und behalten ihre Zeile | `Unvollstaendig`: „Saldo in DATEV 2026 —", „Letzte Buchung —"; Zeilen stehen | ✓ |
| Rolle und Sync-Zustand aus der Registry | `konto_typ.general_ledger` → „Sachkonto", `konto_datev_sync.local_only` → „Nur in Ludwig"; keine Label-Map in der Datei | ✓ |
| `AccountFacts` rechnet nichts | `grep -nE "\.reduce\(|\.filter\(|\.sort\("` findet nichts; nur `toLocaleString` | ✓ |
| Abweichungen von der Spec stichhaltig begründet | Runde 1 ✗ (Abweichung 1 nahm Rang 4 mit). Runde 2: die Abweichungs-Tabelle trägt jetzt die Zeile „Wirtschaftsjahr (Rang 4) → am Label des Saldos", der Grund deckt sich mit dem gemessenen Verhalten; Abweichungen 2 und 3 waren schon in Runde 1 tragfähig (A12) | ✓ |
| Ersetzt `AccountRef` in `ludwig/app` | Ablösung in der App ist ein eigener Schritt (`docs/backlog/README.md`) | **offen (App)** |

**Befunde der ersten Runde — beide behoben.**

| # | Befund (Runde 1) | Behebung, in Runde 2 nachgemessen |
|---|---|---|
| 1 | Die verlinkte Zelle sah aus wie Text: `.v2acc--link` setzte `--color-accent-700`, `.v2mono` überschrieb es mit `--color-text`; gemessen `rgb(45,45,45)`, identisch zur Zelle ohne `href`. | `.v2acc--link .v2mono` trägt die Akzentfarbe (`v3.css`), gemessen `rgb(46,120,168)`. Dass der Name gedämpft bleibt, ist richtig: er beschreibt, der Anker ist die Nummer. |
| 2 | `fiscalYear` wurde nirgends gerendert — der Saldo in der `HoverCard` stand ohne Jahr, das VM-Feld war nach A12 tot. | Das Jahr steht am Label des Saldos („Saldo in DATEV 2026"), in allen sieben Stories vorhanden und im Drawer dem Schalter folgend. Rang 4 ist damit dargestellt, ohne eine eigene Zeile zu kosten. |

| # | Anmerkung (kein ✗) | Beleg |
|---|---|---|
| 4 | Im Drawer erscheint das Jahr zweimal, sobald der Schalter fehlt: `EinJahr` zeigt „2026" als Text in der `meta`-Zeile (so verlangt es 0068) und zwei Zeilen tiefer im Saldo-Label. Kein Widerspruch zu Abweichung 1 — dort ging es um die doppelte **Identität** —, aber die eine Stelle, an der das Jahr redundant liest. | Story `AccountDrawer/EinJahr`, DOM: fünf Jahreszahlen im Drawer, davon zwei im Kopf-/Fakten-Paar |

Abgenommen von / am: Claude (Abnahme), 2026-09-04 (Runde 1) · 2026-09-04
(Runde 2, nach Commit `0ae2dad`) · Ergebnis: **fertig** · Offene Punkte:
keine; Anmerkung 4 ist Textpflege, das App-Kriterium bleibt planmäßig
**offen (App)**.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-94 und zwei Drittel von L-95 sind erledigt** (App-Commit `eaf73d45`):
`AccountFactsVM` und `AccountMonth` stehen in
`accounts/domain/account-entry.ts`, und `accountFacts()` summiert Σ Soll und
Σ Haben aus den Monatswerten — die Doppelmontage aus L-13 ist damit weg.

Beim Tausch sind vier Dinge aufgefallen:

- **Feldnamen folgen dem Spiegel:** `role` → `accountingRole`, `datevCount` →
  `datevEntryCount`, `debitTotal`/`creditTotal` → `totalDebit`/`totalCredit`.
- **`accountingRole` ist nullable.** Ein Konto ohne Rolle im Kontenrahmen zeigt
  das Wort der Achse für „unbekannt", keine leere Zelle.
- **Σ Soll / Σ Haben sind im Spiegel Pflicht und werden `0`,** wenn der
  Aufrufer keine Monatswerte hat — der Drawer lädt keine. Zwei Nullen zu
  zeigen hieße „nichts gebucht" zu behaupten, wo „nicht geladen" gemeint ist;
  die Zeile steht deshalb erst, wenn eine der beiden Summen etwas trägt.
- **`ludwigOnlyCount` bleibt lokal.** Der Spiegel hat den Betrag, nicht die
  Anzahl; `ludwigEntryCount` ist etwas anderes (alle Ludwig-Sätze des Jahres).
  Das Feld zu tauschen hätte aus „+ 3 nur in Ludwig" eine größere, falsche
  Zahl gemacht — **L-209** im Register.

Zum letzten Drittel von L-95 (Kontenfunktion und Automatik-Steuersatz): die
Behauptung des Registers, sie stünden inline auf der Kontoseite, war falsch.
Sie sind Spalten von `client_ledger_accounts` (`datev_main_function`,
`datev_main_function_number`, `datev_tax_rate`), die Seite zeigt sie nicht, und
kein Typ trägt sie. Das ist im Register berichtigt.

**Der Typtausch kam nach der letzten Abnahme.** Er ist typgeprüft
(`typecheck`, `build`, `check:icons`, `check:contrast` grün über den
Exit-Code) und ändert kein Kriterium — aber gebaut hat ihn, wer auch hier
schreibt. Eine kurze Bestätigung steht aus.
