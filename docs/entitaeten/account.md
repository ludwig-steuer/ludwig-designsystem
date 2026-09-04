# Konto · `ledger account` — Entitätsprofil

| | |
|---|---|
| Status | analysiert |
| GLOSSARY | `### Ledger account (Konto)` — englisch `ledger account`, Ordner `entities/account/` (Abweichung, siehe Befund 5) |
| Tabelle | `ludwig.client_ledger_accounts` · View `client_ledger_accounts_current` (jahresfreie Leser) · Semantik separat in `client_account_enrichment` |
| Typen | `src/ludwig/modules/accounts/domain/account.ts` — `ACCOUNT_TYPES`, `CLEARING_ACCOUNT_TYPES`; `core/datev/main-function.ts` — `DATEV_MAIN_FUNCTION_NUMBER`; `core/datev/account-number.ts` — Kontonummern-Kanon |
| Status-Achsen | `konto` (Kontostatus) · `konto_typ` (Rolle) · `konto_datev_sync` · `verrechnungskonto`; für die Bewegungen `buchung`, `buchung_datev`, `buchung_origin`, `mirror_match` |
| Wichtigkeit | hoch — Kontonummer ist der Anker jeder Buchung |
| Datenstand | Staging über den Pooler, 2026-09-04, nur `SELECT`: 41.570 Konten · 611 Ludwig-Buchungssätze · 41.826 DATEV-Spiegel-Sätze |
| Rückfrage | gestellt am 2026-09-04 · unbeantwortet (Defaults gelten) |
| Analyse von / am | Claude, 2026-09-04 |

## Was sie ist

Eine Zeile im Kontenrahmen des Mandanten: Nummer, Name, Rolle. Die
Sachbearbeiterin benutzt sie fast nie als Stammsatz, sondern als **Frage**:
Sie steht in einer Buchung auf `1210` und will wissen, was sonst noch auf
diesem Konto liegt — bevor sie das Konto übernimmt. Das Konto ist damit
weniger ein Objekt als ein **Schnitt durch die Buchungen**.

Anzeige-Regeln aus dem GLOSSARY, wörtlich:

- **„Ein Kontenplan existiert nicht ohne Wirtschaftsjahr (F64)."** Jede Zeile
  trägt `fiscal_year_id`, der Unique-Key ist `(client_id, fiscal_year_id,
  account_number)`. Jede Ansicht eines Kontos ist die Ansicht **eines Jahres**.
- **„Quelle ist DATEV"** — Ludwig legt keine Sachkonten an, die DATEV nicht
  kennt (Ausnahme: der 89xxxx-Platzhalter-Range).
- **„Speichern = Anzeigen = logische Nummer"** (Kontonummern-Kanon,
  Owner 2026-08-01). Es gibt keine separate Anzeigeform. `0420` trägt die
  führende Null, nie numerisch casten.
- **„Use `ledger account` in code and docs to avoid collision with
  user-identity 'account'."**
- `datev_sync_state` ist **orthogonal zu `status`**: aktiv/inaktiv ist eine
  fachliche Aussage, keine Sync-Aussage.

## Schaubild

```mermaid
erDiagram
  CLIENT_FISCAL_YEARS ||--o{ CLIENT_LEDGER_ACCOUNTS : "Vollkopie je WJ"
  CLIENT_BUSINESS_PARTNERS ||--o{ CLIENT_LEDGER_ACCOUNTS : "52 % · nur Personenkonten"
  REFERENCE_ACCOUNT_FRAMEWORK_ENTRIES ||--o{ CLIENT_LEDGER_ACCOUNTS : "33 % · SKR-Katalog"
  CLIENT_LEDGER_ACCOUNTS ||--o{ CLIENT_JOURNAL_ENTRY_LINE : "85 % ohne · p90 3"
  CLIENT_LEDGER_ACCOUNTS ||--o{ CLIENT_ACCOUNTING_CASE : "fy_personal_account_id"
  CLIENT_LEDGER_ACCOUNTS ||--o| CLIENT_PAYMENT_ACCOUNTS : "fy_ledger_account_id"
  CLIENT_LEDGER_ACCOUNTS ||..o| CLIENT_ACCOUNT_ENRICHMENT : "(client_id, account_number), jahresfrei"
  CLIENT_LEDGER_ACCOUNTS ||..o{ CLIENT_DATEV_MIRROR_ENTRIES : "lines[].account_number · p50 4 · max 3400"
  CLIENT_LEDGER_ACCOUNTS ||..o{ PLATFORM_AUDIT_EVENTS : "resource_kind/resource_id"
```

Gestrichelt = ohne FK. Die beiden wichtigsten Kanten des Kontos sind
gestrichelt: der DATEV-Spiegel trägt die Kontonummer als **Text im
`lines`-JSONB**, das Enrichment hängt an `(client_id, account_number)` ohne
Jahresbezug.

## Datenpunkte

| Datenpunkt | Quelle | Rolle | Füllgrad | heute in | änderbar | Rang | ab Form | Beleg |
|---|---|---|---|---|---|---|---|---|
| Kontonummer (`accountNumber`) | Spalte | Identität | 100 % | `AccountRef`, `AccountsTableRow`, Drawer-Titel, `AccountField` | nie | 1 | XS | Füllgrad · heute in `AccountRef` |
| Kontoname (`accountName`) | Spalte | Identität | 100 % | dieselben | Server (DATEV-Import) | 2 | XS | Nachtrag Owner 2026-09-03 zu 0013: „immer beides" |
| Rolle (`accountingRole`) | Spalte, Achse `konto_typ` | Zustand | 100 % — debtor 46 %, general_ledger 43 %, creditor 7 %, revenue 4 % | `AccountClassBadge`, Drawer-`meta` | nie | 3 | S | Registry-Achse `konto_typ` · Verteilung |
| Wirtschaftsjahr (`fiscalYear`) | `fiscal_year_id` → `client_fiscal_years.year` | Kontext | 100 % | Drawer-`meta`, Route, `YearSwitcher` | Nutzer (wechselt das Jahr) | 4 | XS **im Drawer**, sonst S | GLOSSARY F64 · der Drawer steht außerhalb seines Kontexts (§5 Rolle Kontext) |
| Saldo im Jahr (`balance`) | `abgeleitet: Σ Soll − Σ Haben der Bewegungen` | Maß | — | Kontoseite `Stat` „Saldo" | nie | 5 | S | heute in `accounts/[accountNumber]` Z. 302 |
| Bewegungen im Jahr (`entryCount`) | `abgeleitet: count(Bewegungen)` | Maß | — | Drawer-`meta` („n in Ludwig, m in DATEV"), Kontoseite `Stat` | nie | 6 | S | heute in `AccountLedgerDrawer.tsx` Z. 93 |
| Σ Soll / Σ Haben | `abgeleitet` | Maß | — | Kontoseite `Stat`, Drawer-`tfoot` | nie | 7 | M | heute in beiden |
| Geschäftspartner (`partnerName`) | Relation `business_partner_id` | Identität | 52 % (nur Personenkonten, dort ~100 %) | `AccountsTab` im Partner | Server | 8 | M | Füllgrad · GLOSSARY „Creditor account" |
| SKR-Klasse (`skrClass`) | Spalte | Kontext | 100 % — 46 % `personal_debtor` | `AccountsTableRow` | nie | 9 | M | Verteilung |
| Letzte Buchung (`lastBookingDate`) | Spalte | Zeit | 15 % | Kontoseite `Stat` | Server | 10 | M | Füllgrad 15 % → §5 nicht vor M |
| Buchungen insgesamt (`usageBookingCount`) | Spalte | Maß | 100 %, davon 85 % = 0 · p90 3 · max 5.474 | Kontoseite `Stat`, `AccountsTableRow` | Server | 11 | M | Verteilung |
| Kontostatus (`status`) | Spalte, Achse `konto` | Zustand | 100 %, davon 99 % `active` | `AccountsTableRow` | Server | 12 | M | Verteilung — als Zustand fast konstant, deshalb nicht ab XS trotz §5 („Zustand ab XS") |
| DATEV-Sync (`datevSyncState`) | Spalte, Achse `konto_datev_sync` | Zustand | 100 %, davon 100 % `synced` (15 Zeilen `local_only`) | — | Server | 13 | M, **nur wenn ≠ `synced`** | Verteilung · GLOSSARY „orthogonal zu `status`" |
| Kontenfunktion (`datevMainFunctionNumber`) | Spalte | Kontext | 47 % | — | nie (Fremdsystem) | 14 | M, **nur wenn sie etwas sperrt** (12 = Buchungssperre) | GLOSSARY „Kontenfunktion" · `konten.md` R18 |
| Verrechnungskonto (`clearingAccountType`) | Spalte, Achse `verrechnungskonto` | Zustand | 0 % auf Staging | — | Nutzer (bestätigt) | 15 | L | Füllgrad |
| Automatik-Steuersatz (`datevTaxRate`) | Spalte | Kontext | 7 % | — | nie | 16 | L | Füllgrad |
| Kontoherkunft (`source`) | Spalte | Kontext | 100 %, davon 100 % `imported` | `AccountsTableRow` (`accountSourceLabel`) | nie | 17 | L | Verteilung — trägt heute keine Unterscheidung |
| Beschreibung (`description`) | Relation `client_account_enrichment` | Erklärung | nicht erhoben (eigene Tabelle) | Kontoseite Tab „LLM-Profil" | Nutzer | 18 | L, gekürzt ab ~200 Zeichen | heute nur im eigenen Tab |

Ausgelassen (Technik): `id`, `tenant_id`, `client_id`, `created_at`,
`updated_at`, `account_framework_entry_id`, `datev_addressee_id`,
`datev_account_id`, `datev_synced_at`, `datev_main_function` (bewusst ohne
Consumer, GLOSSARY), `original_account_number` (0 %), `is_default`
(durchgehend `false` → Befund 1), `account_kind` (redundant zu
`accountingRole` für die Anzeige: `personal` ⇔ creditor/debtor).

Freitext-Grenzen: `accountName` p50 19 · **p90 39** · max 50 Zeichen — kürzen
ab 40, voller Name im `title`. `description` (Enrichment) nur in L.

### Datenpunkte einer Bewegung

Die Bewegung ist **keine eigene Tabelle**, sondern die Vereinigung zweier
Quellen auf demselben Konto: `client_journal_entry` (+ `_line`) und
`client_datev_mirror_entries`. Sie trägt die Zeile des Kontoauszugs und
bekommt deshalb ihre eigene Bewertung.

| Datenpunkt | Quelle | Rolle | Füllgrad | heute in | Rang | ab Form | Beleg |
|---|---|---|---|---|---|---|---|
| Buchungsdatum (`postingDate`) | beide | Zeit | 100 % | beide Auszüge | 1 | XS | Füllgrad |
| Betrag Soll / Haben (`debit`/`credit`) | beide, auf **diesem** Konto summiert | Maß | 100 % | beide Auszüge | 2 | XS | Füllgrad — die Seite steht darin, in welcher Spalte die Zahl steht |
| Buchungstext (`text`) | beide | Erklärung | 99 % · p50 14 · **p90 31** · max 60 | beide Auszüge | 3 | S | Füllgrad · EXTF-Grenze 60 |
| Gegenkonto (`contraAccounts`) | beide | Identität | 100 % — 56 % genau eins, p90 3 Legs, max 5 | beide Auszüge, als `AccountRef` klickbar | 4 | S | Verteilung — eines nennen, Rest als „+n" |
| **Herkunft** (`origin`) | `abgeleitet: match_state` (DATEV-Seite) bzw. `datev_mirror_entry_id`/`exported_at` (Ludwig-Seite, Achse `buchung_datev`) | Zustand | siehe Tabelle unten | heute **getrennt**: zwei Tabs, ✓-Häkchen nur im Ludwig-Tab | 5 | XS | Anfrage Owner 2026-09-04 |
| Belegfeld 1 (`belegfeld1`) | beide | Identität | 100 % im Spiegel | beide Auszüge | 6 | S | Füllgrad |
| Laufender Saldo (`runningBalance`) | `abgeleitet`, **nur Ludwig-Auszug** | Maß | — | Ludwig-Tab | 7 | S, mit Vorbehalt (offene Frage 1) | heute nur einseitig |
| Stapel (`accountingSequenceId`) | nur Spiegel | Kontext | 100 % | DATEV-Tab | 8 | M | Füllgrad |
| Buchungszustand (`status`, Achse `buchung`) | nur Ludwig | Zustand | 100 % | Ludwig-Tab, `StatusBadge` | 9 | M | Registry |
| DATEV-Herkunftskennzeichen (`markOfOrigin`) | nur Spiegel | Kontext | 47 % | — | 10 | M | Füllgrad |
| Beleglink (`documentLinkGuid`) | nur Spiegel | Kontext | 33 % | — | 11 | L | Füllgrad |
| Sachverhalt (`ludwigCaseNumber` / `caseId`) | beide | Kontext | **2 %** im Spiegel; Ludwig-Seite über `event_id`/`case_id` | DATEV-Tab als **eigene Spalte** | 12 | M | Füllgrad 2 % → Befund 3 |
| Kreditor (`creditorName`) | nur Ludwig | Identität | 32 % | Ludwig-Tab, hinter dem Text | 13 | M | Füllgrad |

**Die Herkunft in Zahlen** (Staging 2026-09-04) — sie ist der Kern der
Anfrage und der einzige Punkt, den die Zeile selbst ableitet:

| Klasse | Regel | Zahl | Anteil |
|---|---|---|---|
| nur in DATEV | Spiegelsatz, `match_state ∈ {new_unprocessed, unclear, NULL}` | 41.497 | 97 % aller Sätze |
| gespiegelt | Spiegelsatz, `match_state LIKE 'matched_%'` (+ `matched_journal_entry_id`) | 297 | 1 % |
| exportiert, nicht wiedergefunden | Ludwig-Satz, `exported_at` gesetzt, `datev_mirror_entry_id` NULL | 111 | 18 % der Ludwig-Sätze |
| nur in Ludwig | Ludwig-Satz, weder exportiert noch gespiegelt | 216 | 35 % der Ludwig-Sätze |

Die Vereinigung ist damit sauber und doppelfrei: **alle** Spiegelsätze plus
die Ludwig-Sätze **ohne** `datev_mirror_entry_id`. Ein gespiegelter Satz
erscheint genau einmal — als DATEV-Zeile mit Ludwig-Zeichen.

Die Achse dafür ist bereits da: `buchung_datev` (`BUCHUNG_DATEV_STAGE`)
linearisiert Vorschlag → Freigegeben → Exportiert → In DATEV bestätigt und
hält im eigenen Kommentar fest, warum „exportiert" und „angekommen" zwei
Stufen sind. Auf der Spiegel-Seite trägt `mirror_match` dieselbe Frage aus
DATEVs Sicht.

## Relationen

| Relation | Richtung | Kardinalität | Rolle | ab Form | Darstellung | Beleg |
|---|---|---|---|---|---|---|
| Bewegungen im DATEV-Spiegel | Kind, ohne FK (`lines[].account_number`) | p50 4 · **p90 20** · p99 250 · max 3.400 je Konto+Jahr; 90 % der Konto-Jahre ≤ 20 | Maß | Zähler (S) · Liste (L) | Staging |
| Bewegungen in Ludwig | Kind über `client_journal_entry_line.account_id` | 85 % der Konten ohne · p90 3; unter den bebuchten p50 1,5 · p90 6 · max 139 | Maß | Zähler (S) · Liste (L) | Staging |
| Wirtschaftsjahr | Eltern (composite FK) | 1:1, NOT NULL | Kontext | XS im Drawer, sonst S | Inline im `meta`, wechselbar | GLOSSARY F64 |
| Geschäftspartner | Eltern (composite FK) | 52 % gesetzt; je Partner n Jahre × 2 Rollen | Identität | M | Inline (Name, ein Klick) → Profil `business-partner` fehlt | Füllgrad |
| Konten-Anreicherung | 1:0..1, ohne FK, **jahresfrei** | nicht erhoben | Erklärung | L | jüngstes (Beschreibung) | GLOSSARY |
| Zahlungskonto | Kind, 1:0..1 | selten | Kontext | L | Zähler/Inline | Schema |
| Sachverhalte (`fy_personal_account_id`) | Kind | nicht erhoben | Kontext | L | Liste → Profil `accounting-case` fehlt | Schema |
| Historie (`platform_audit_events`) | ohne FK | viele | Verantwortung | L | Liste → Profil des Audit-Events | Skill §6 |

## Heutige Darstellung

| Komponente | Ort | Form | zeigt | fehlt | zu viel |
|---|---|---|---|---|---|
| `AccountRef` | `ui/booking` | Inline | Nummer (mono) + Name; Klick öffnet den Drawer | Rolle, Jahr | — |
| `AccountField` | **v3** `entities/account` | Auswahl | Nummer + Name, Kandidaten, `onOpenLedger` | — | — (0013 abgenommen) |
| `AccountClassBadge` | `modules/accounts/ui` | Badge | Rolle | — | — |
| `AccountsTableRow` | `modules/accounts/ui` | Zeile | Nummer, Name, Rolle, SKR-Klasse, Status, Herkunft, `usageBookingCount`, letzte Buchung, Beschreibung | Saldo | `source` (100 % `imported`) |
| `AccountLedgerDrawerProvider` | `ui/drawers` | Drawer | Titel `Konto <nr>`, `meta` mit Name · Rolle · „n in Ludwig, m in DATEV"; **zwei Tabs**; Fuß „Volles Konto öffnen" | eine Sicht statt zweier · Jahreswechsel · Saldo auf der DATEV-Seite | Spalte „Sachverhalt" (2 % gefüllt) |
| Kontoseite `accounts/[accountNumber]` | `app/(app)/…` | Detail | 4 Tabs: Übersicht (6 `Stat`, 6-Monats-Verlauf, je 5 neueste beider Quellen), Buchungen (zwei Auszüge, je Suche + Pagination), Monatsübersicht, LLM-Profil | — | — |

Der Drawer der App ist die Vorlage, nicht die Neuerfindung: 365 Zeilen,
`Drawer size="lg"`, Fuß mit genau einem Knopf — er erfüllt A10 bereits.

## Listen

| Liste | Job | Grundgesamtheit | Sortierung | Spalten (Ränge) | Filter | Massenaktion | Leerfall | Umfang p50 · p90 | Beleg |
|---|---|---|---|---|---|---|---|---|---|
| `AccountEntryList` „Kontoauszug" | Wenn die Sachbearbeiterin mitten in einer Buchung auf einem Konto steht, will sie sehen, **was sonst noch auf diesem Konto liegt**, damit sie das Konto bestätigen oder verwerfen kann. | Alle Bewegungen des Kontos **in einem Wirtschaftsjahr**, beide Quellen vereinigt: alle Spiegelsätze + Ludwig-Sätze ohne `datev_mirror_entry_id` | neueste zuerst | 1–6 der Bewegungs-Tabelle | Jahr (Pflicht, kein Filter — Grundgesamtheit) · Herkunft: nein (Default) | keine — der Auszug ist lesend | „Auf diesem Konto ist im Jahr <n> nichts gebucht." (kein Fehler, ein Befund) | 4 · 20; p99 250, max 3.400 → Nachladen nötig | Staging · `AccountLedgerDrawer` |
| `AccountList` „Kontenplan" | Wenn die Kanzlei den Kontenrahmen prüft, will sie alle Konten des Jahres nach Klasse gruppiert sehen, damit sie Lücken und Karteileichen findet. | alle Konten des Mandanten im WJ | Nummer aufsteigend | 1–3, 11, 12 | Rolle, Status, Volltext | keine | „Kein Konto im Jahr <n>." | 41.570 / Mandant+Jahr | `AccountsGroupedTable`, Route `accounts/` |

Der Kontoauszug hat **keine eigene Route** — er lebt im Drawer und im Tab
„Buchungen" der Kontoseite. Der Kontenplan hat eine (`/accounts`) und braucht
deshalb zusätzlich ein Seitenprofil; er geht auf den Backlog.

**Eine Liste, nicht zwei.** Die beiden Tabs von heute unterscheiden sich in
Grundgesamtheit *und* Spaltensatz, wären nach §8 also zwei Komponenten wert —
die Owner-Entscheidung vom 2026-09-04 verwirft die Trennung trotzdem: die
Frage ist eine („was liegt auf dem Konto"), die Quelle ist eine Eigenschaft
der Zeile, kein Sichtwechsel. Damit fällt der Tab-Umschalter weg und die
Herkunft rückt in die Zeile.

**Mechanik nach §8:** p90 = 20 Zeilen, aber p99 = 250 und max 3.400 (das
Bankkonto — genau der Fall aus der Anfrage). Also: kein virtuelles Scrollen,
kein Serverfilter, aber **Nachladen in Seiten** wie heute
(`LEDGER_PAGE_SIZE`), mit Vorratszähler „25 von 2.937".

## Formen

| Form | Größe | Empfehlung | Grund (§7 Nr.) | zeigt (Ränge) | Relationen | setzt auf | ersetzt |
|---|---|---|---|---|---|---|---|
| `AccountCell` | XS | ja | 3 — FK-Ziel jeder Buchungszeile; 5 Aufrufstellen von `<AccountRef>`, 13 Dateien am Drawer-Context | 1–2, Jahr nur außerhalb des Kontexts | — | `MonoCell`, `TextButton` | `AccountRef` |
| `AccountEntryRow` | S | ja | 1 — existiert zweimal (Ludwig-`<tr>` und DATEV-`<tr>` im Drawer) und ein drittes Mal auf der Kontoseite | Bewegung 1–6 | Gegenkonto als `AccountCell` | `Row`, `MonoCell`, `AmountCell`, `StatusBadge`, `Time` | die beiden `<tbody>`-Blöcke in `AccountLedgerDrawer.tsx` und die zwei Auszüge der Kontoseite |
| `AccountEntryList` | L | ja | 6 — ein Listen-Job, von zwei Screens belegt | die Zeile + Kopfzeile + Σ-Fuß + Nachladen | beide Bewegungs-Relationen, vereinigt | `Table`, `AccountEntryRow`, `EmptyState`, `Skeleton`; auf der **Seite** stattdessen `DataTable` (0057) | `loadAccountLedgerPage`-Tabelle + `listAccountMirrorEntries`-Tabelle |
| `AccountFacts` | M | ja | 5 — Zone 3 des Drawers, dieselbe Komponente wie später der View (0052) | 1–7 | Partner als Inline | `FieldList bare`, `Amount`, `StatusBadge` | den `meta`- und `tfoot`-Teil des heutigen Drawers · Präzedenz `DocumentFacts` |
| `AccountDrawer` | L | ja | 5 — `AccountRef` verweist von 5 Stellen aus auf das Konto, ohne es zeigen zu können | Zonen 1 · 3 · 4 · 5 (Zone 2 entfällt: ein Konto hat kein Original) | Kontoauszug als Zone 3b | `Drawer`, `AccountFacts`, `AccountEntryList` | `AccountLedgerDrawerProvider` |
| `AccountPicker` | S | **erledigt** | — | — | — | — | steht als `AccountField` (0013, Abnahme) |
| `AccountRow` | S | Backlog | 1 — `AccountsTableRow` existiert, aber kein Screen dieser Welle braucht sie | 1–3, 11, 12 | — | `DataTable`-Spaltendefinition | `AccountsTable*` |
| `AccountView` | L | Backlog | 1 — die Kontoseite existiert mit vier Tabs; sie braucht erst ein Seitenprofil (`docs/seiten/`) | alles ab 20 % Füllgrad | alle | `AccountFacts`, `AccountEntryList`, `BarChart` | `accounts/[accountNumber]/page.tsx` |
| `AccountCard` | M | verworfen | kein Screen zeigt ein Konto im Kontext einer anderen Entität — dort steht die Cell | | | | |
| `AccountEditor` | XL | verworfen | die einzigen Punkte mit änderbar = Nutzer sind `clearingAccountType` (0 % gefüllt, eigenes Bestätigungs-Form) und die Enrichment-Beschreibung (eigener Tab) — `InlineEdit` im View reicht | | | | |

Bau-Reihenfolge: `AccountCell` → `AccountEntryRow` → `AccountEntryList` →
`AccountFacts` → `AccountDrawer`. Der Drawer folgt zuletzt, er komponiert die
anderen vier.

**Warum die Bewegung in `entities/account/` liegt und nicht in
`journal-entry/`:** Sie beantwortet eine Konto-Frage („was liegt auf diesem
Konto") und trägt Konto-Ordnung — Gegenkonto und laufender Saldo. Die Zeile
eines Buchungs**satzes** (0044 `JournalEntryCard`: Konto · Kontoname ·
Buchungstext · Soll · Haben) beantwortet die andere Frage, wie der Satz
gebaut ist. Zwei Tabellen, dieselben Zellen-Primitives, keine gemeinsame
Komponente mit Spaltenkonfiguration.

## Zuschnitt

| Form / Liste | Marke | Grund | Backlog |
|---|---|---|---|
| `AccountCell` | jetzt | trägt Zeile, Liste und Drawer (Gegenkonto) | — |
| `AccountEntryRow` | jetzt | trägt die Liste; existiert heute dreimal von Hand | — |
| `AccountEntryList` „Kontoauszug" | jetzt | der Listen-Job der Anfrage | — |
| `AccountFacts` | jetzt | Zone 3 des Drawers, Kriterium aus 0052 | — |
| `AccountDrawer` | jetzt | die Anfrage vom 2026-09-04 | — |
| `AccountRow` + `AccountList` „Kontenplan" | Backlog | eigene Route → erst Seitenprofil; wird eine Spaltendefinition auf `DataTable` (0057), keine eigene Tabelle | `docs/backlog/0062-account-list.md` |
| `AccountView` | Backlog | vier Tabs, eigene Route, braucht Seitenprofil; `AccountFacts` ist der Teil, den er mit dem Drawer teilt | `docs/backlog/0063-account-view.md` |
| `AccountCard` | verworfen | kein Screen | — |
| `AccountEditor` | verworfen | keine Punkte mit änderbar = Nutzer außerhalb eigener Forms | — |

Fünf Formen „jetzt" — die Obergrenze aus §9.

## Befunde für `ludwig/app`

1. **`client_ledger_accounts.is_default` ist tot** — 41.570 von 41.570 Zeilen
   `false`. Entweder befüllen oder droppen; die Anzeige lässt sie aus.
2. **GLOSSARY „Ledger account status" widerspricht dem Schema**: der Eintrag
   nennt `'active' | 'archived'`, der DB-CHECK erlaubt `'active' |
   'inactive'`, und die Registry (`KONTO_STATUS`) folgt der DB. Der
   GLOSSARY-Satz („`archived` blendet Konten in der Buchungsmaske aus") hat
   damit keinen Wert hinter sich.
3. **Die Spalte „Sachverhalt" im DATEV-Tab ist zu 2 % gefüllt**
   (`ludwig_case_number`, 41.826 Spiegelsätze). Eine Spalte, die in 98 % der
   Zeilen einen Geviertstrich zeigt, kostet Breite, die das Gegenkonto
   braucht. In der neuen Zeile steht sie ab M, nicht ab S.
4. **Kein GLOSSARY-Eintrag für den Kontoauszug** als Sicht — „Kontenblatt",
   „Konto-Auszug" und „Konto-Historie" stehen nebeneinander im Code
   (`AccountLedgerDrawer`, `getAccountLedger`, `listAccountMirrorEntries`,
   Fuß-Text „Volles Konto öffnen"). Ein Wort wählen.
5. **Ordnername** — das GLOSSARY verlangt `ledger account`, „to avoid
   collision with user-identity 'account'". Der v3-Ordner heißt
   `entities/account/`, das Profil folgt ihm. Umbenennen wäre ein eigener
   Auftrag; bis dahin gilt der Ordner.
6. **Der DATEV-Auszug kennt keinen Saldo.** `listAccountMirrorEntries`
   summiert Soll und Haben je Satz, aber die Kontoseite rechnet den laufenden
   Saldo nur über die Ludwig-Sätze. Führt der Spiegel die Liste an, führt er
   auch den Saldo — siehe offene Frage 1.

**Befund fürs Design-System** (nicht die App): `MIRROR_MATCH` in
`src/ui/v3/patterns/status-registry.ts` kennt sechs Werte plus `unreconciled`,
der DB-CHECK aber sieben — **`matched_corrected` fehlte**. Er gehört zur
Klasse „gespiegelt"; ein Umzugsfehler, die App-Registry
(`app/apps/web/src/ui/status/status-registry.ts:1470`) hat ihn. Am 2026-09-04
wortgleich nachgetragen — erledigt.

## Offene Fragen

1. **Saldo in der vereinigten Liste.** Ludwig rechnet heute einen laufenden
   Saldo, der Spiegel keinen; über beide Quellen zusammen wäre er eine
   Mischung aus Ist und Noch-nicht-angekommen. — *Ohne Antwort: der laufende
   Saldo je Zeile entfällt. Der Kopf trägt stattdessen zwei Zahlen — „Saldo
   in DATEV" und darunter „+ n nur in Ludwig" —, weil das die Frage ist, die
   der Drawer beantwortet. Die Saldospalte kehrt im View wieder, wenn dort
   eine Quelle allein gezeigt wird.*
2. **Vier Klassen statt drei.** Neben „nur DATEV", „gespiegelt" und „nur
   Ludwig" gibt es „exportiert, aber in DATEV nicht wiedergefunden" (111
   Sätze, 18 % der Ludwig-Sätze). — *Ohne Antwort: eigene Ausprägung, nicht
   mit „nur Ludwig" zusammengelegt. Die Achse `buchung_datev` trennt sie
   bereits, und ihr Registry-Kommentar begründet warum: „Exportiert ≠
   angekommen."*
3. **Wirkt der Jahreswechsel im Drawer über den Drawer hinaus?** — *Ohne
   Antwort: nein, er bleibt lokal. Der Drawer ist ein Nachschlag neben der
   Arbeit; die Seite dahinter darf nicht mitspringen. Der Schalter steht in
   Zone 1 (`meta`), nicht im Fuß — der gehört nach A10 der Vollansicht.*

## Prüfung

Gehört dem zweiten Agenten. Er prüft zuerst alle Zeilen mit Beleg `Annahme`,
dann die Ränge gegen „Heutige Darstellung", dann die Formen gegen §7.

| Zeile / Form | Einwand | Ergebnis | Geprüft von / am |
|---|---|---|---|
| … | … | bestätigt · geändert auf … · offen | … |

## Weiter

Prüfprompt (neue Sitzung, anderer Agent):

```
Prüfe das Entitätsprofil docs/entitaeten/account.md nach Skill entitaet-analysieren §5–§9.
Zuerst jede Zeile mit Beleg „Annahme": belege oder widerlege sie mit Füllgrad, heutiger
Komponente oder GLOSSARY. Dann die Ränge: deck die Punkte ab Rang k ab — erkennt eine
Sachbearbeiterin das Konto und die Bewegung noch? Prüf besonders die Tabelle „Die Herkunft
in Zahlen" gegen die DB (nur SELECT, Staging über den Pooler) und die Behauptung, die
Vereinigung sei doppelfrei. Dann die Formen: hat jede empfohlene einen Grund aus §7, fehlt
eine, die die App heute hat? Dann die Listen: hat jede einen Job-Satz, und ist jede
Ausprägung nach §8 eine eigene Komponente wert oder nur ein Prop — trägt die
Owner-Entscheidung „eine Liste statt zwei Tabs" das? Zuletzt der Zuschnitt: sind höchstens
fünf Formen „jetzt", und trägt jede Backlog-Zeile ihren Grund? Trag jeden Einwand in
„Prüfung" ein, ändere die Tabellen, wo du sicher bist, und setze den Status auf „geprüft".
Kundendaten bleiben in der Datenbank; nur SELECT.
```

Startprompt (neue Sitzung, nach Status `geprüft`):

```
Für die Entität Konto (`ledger account`) liegt das geprüfte Profil unter
docs/entitaeten/account.md. Schreibe mit Skill spec-schreiben je Form eine Spec, in dieser
Reihenfolge — nur die Formen mit Marke „jetzt" aus dem Abschnitt Zuschnitt:
AccountCell, AccountEntryRow, AccountEntryList, AccountFacts, AccountDrawer. Was dort
„Backlog" trägt, bleibt liegen (0062, 0063). Jede Spec verlinkt das Profil als Quelle und nimmt
Datenpunkte, Ränge, Relationen und „ersetzt" von dort, nicht aus dem Chat; die Punkte einer
Form sind die Ränge bis zu ihrer Größe, in derselben Reihenfolge. Der Drawer folgt A10
(design-guidelines §13) und dem Zonen-Schema aus 0052.
Danach baut Skill v3-komponente jede Spec in derselben Reihenfolge, die größere Form
komponiert die kleinere. Abgenommen wird von einem anderen Agenten gegen die Spec. Nur
eigene Dateien stagen. Setze am Ende den Status des Profils auf „in Specs" und trage die
Backlog-Nummern ein.
```
