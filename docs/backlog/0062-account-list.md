# 0062 · `AccountRow` + `AccountList` — der Kontenplan als Liste

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-07, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/account/` (Zeile) + Spaltendefinition auf `DataTable` (Liste) |
| Quelle | Entitätsprofil `docs/entitaeten/account.md`, Abschnitte „Listen" (Zeile `AccountList` „Kontenplan") und „Formen" |
| Auftrag | Die Zeile eines Kontos im Kontenrahmen (Nummer, Name, Rolle, Buchungszahl, Kontostatus) und die Liste, die sie zeigt — nach Klasse gruppiert, 41.570 Zeilen je Mandant und Jahr. Ersetzt `AccountsTable`, `AccountsTableHeader`, `AccountsTableRow` und `AccountsGroupedTable` in `ludwig/app`. |
| Vertagt, weil | Die Liste hat eine **eigene Route** (`/clients/[slug]/[year]/accounts`) und braucht nach `docs/backlog/README.md` Schritt 0b erst ein Seitenprofil unter `docs/seiten/`. Sie wird außerdem eine **Spaltendefinition auf `DataTable`** (0057), nicht eine eigene Tabelle — 0057 steht auf `in Arbeit`. Kein Screen der laufenden Welle braucht sie: der Kontoauszug im Drawer ist eine andere Liste. |
| Setzt voraus | 0057 `DataTable` (Abnahme) · Seitenprofil `docs/seiten/kontenplan.md` — **angelegt 2026-09-07** · `AccountCell` aus der Konto-Welle |
| Angelegt von / am | Claude, 2026-09-04 (Skill `entitaet-analysieren`, §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`)

Die Wartebedingung ist weg: das Seitenprofil steht als
`docs/seiten/kontenplan.md`, `DataTable` (0057) ist gebaut.

### Einordnung

- **Klasse:** `entities/account/`. Kontonummer, SKR-Klasse und Buchungszahl
  sind Fachbegriffe; der Test aus §2 fällt gegen `primitives/` aus.
- **Regel aus §3:** Nr. 5 — eine Entitäts-Form, die das Profil führt und die
  keine vorhandene abdeckt. **Aber nicht als Komponente:** wie bei der
  Bewegungszeile (A11, `accountEntryColumns()`) ist die Zeile eine
  **Spaltendefinition**, keine `AccountRow`-Komponente. Sonst gäbe es für
  dieselbe Entität zwei Zeilen-Bauten — genau das, was R17 verbietet.
- **Zwei Exporte, eine Datei** (`account-columns.tsx`):
  `accountColumns(options)` und `accountTracks(columns)` — dieselbe Form wie
  `caseColumns` (0096) und `bankTransactionColumns` (0101).
- **Kein `AccountList`-Wrapper.** Der Kontenplan ist **eine** Liste mit einem
  Job; ein Wrapper, der nur `DataTable` mit dem Spaltensatz aufruft, entschiede
  nichts (0085 hat einen, weil dort der Leerfall, der Saldo-Fuß und die
  Mindestbreite zu entscheiden waren — hier tut das die Seite). Falls die
  Abnahme das anders sieht: der Wrapper kostet 40 Zeilen und wäre nachrüstbar.

### Der Katalog

Die Ränge kommen aus dem Entitätsprofil, die Auswahl aus dem Seitenprofil:

| Schlüssel | Kopf | Rang | Spur | Warum |
|---|---|---|---|---|
| `skrClass` | „SKR-Klasse" | 9 | 200px | Gruppierschlüssel; im flachen Satz eine Spalte, im gruppierten die Gruppenzeile. **Text über `ACCOUNT_CLASS_LABEL`, kein Badge**: die Klasse ist ein Platz im Rahmen, kein Zustand — kein Fortschritt, keine Kritikalität, also keine Farbe (V6, R1) |
| `number` | „Konto-Nr." | 1 | 110px | mono, sortierbar (`account_number`), **trägt den Zeilenlink** — sie ist, woran die Sachbearbeiterin die Zeile liest |
| `name` | „Name" | 2 | `minmax(200px, 1fr)` | die einzige dehnbare Spur; px als Boden, nie `ch` (Lehre aus 0070). Sortierbar — die App kann `account_name` |
| `role` | „Rolle" | 3 | 120px | Achse `konto_typ`, über `StatusBadge`, mit (i) im Kopf (Z4) |
| `partner` | „Geschäftspartner" | 8 | 200px | nur im Personenkonten-Satz — 52 % Füllgrad, dort ~100 %. **`AccountRow` trägt ihn nicht** (Befund L-89): der Name kommt als Callback vom Aufrufer, sonst bleibt die Spalte leer statt zu erfinden |
| `bookings` | „Buchungen" | 11 | 120px | rechts, `tnum`, sortierbar; **die Spalte, auf die es ankommt** |
| `lastBooking` | „Letzte Buchung" | 10 | 130px | sortierbar; 15 % Füllgrad, deshalb nicht vor M |
| `origin` | „Angelegt" | — | 140px | **`AccountRow.origin`, nicht `source`.** Sie trennt die zwei Hälften der Katalogansicht: das Konto, das dieser Mandant hat, und das, was der SKR kennt und niemand angelegt hat — Rang 6 des Seitenprofils. `source` bleibt draußen: 100 % `imported`, sagt nichts |

Zwei benannte Sätze:

```
ACCOUNT_LIST_COLUMNS    = skrClass · number · name · role · bookings · lastBooking
ACCOUNT_CATALOG_COLUMNS = skrClass · number · name · role · origin
```

Der Katalog-Satz (`scope=all`) lässt Buchungen und letzte Buchung weg — eine
Katalogzeile, die im Mandanten nicht existiert, hat beides nicht, und eine
Spalte, die in der halben Liste leer ist, ist keine Antwort.

**Der Kontostatus steht in keinem der beiden Sätze.** Er ist zu 99 %
`active`, für Katalogzeilen `null`, und die Frage, für die er da zu sein
scheint — welches Konto ist eine Karteileiche —, beantwortet die
Buchungsspalte. Eine Spalte, die konstant ist, ist keine Antwort. Dahinter
steckt ein Befund: die App setzt `usedOnly` mit `status='active'` gleich,
während die Bedingung des Profils `usage_booking_count > 0` lautet, und die
Registry beschreibt `konto.inactive` als „angelegt, nie bebucht" — was den
Daten widerspricht (**L-90**).

### Die zwei Entscheidungen

**1. Die Voreinstellung zeigt bebuchte Konten — und das ist keine neue
Entscheidung.** `AccountFilter.usedOnly` steht in der App bereits auf `true`;
das Seitenprofil hat sie nicht erfunden, sondern gelesen. Der Grund ist der
Bestand: 85 % der 41.570 Zeilen haben **null** Buchungen, und eine Liste, in
der Leerlauf und Arbeit gleich aussehen, ist ein Katalog, kein Prüfwerkzeug.
Getroffen wird die Entscheidung von der **Seite** — der Spaltensatz kann sie
nicht treffen —, aber sie erklärt, warum die Buchungsspalte im Standardsatz
steht und im Katalog-Satz fehlt. Was der Filter heute tatsächlich tut, ist
etwas anderes als das, was er verspricht: Befund **L-90**.

**2. Die Gruppierung ist eine Prop, keine zweite Tabelle.** Heute gibt es
`AccountsTable` **und** `AccountsGroupedTable` — derselbe Inhalt, zwei Bauten,
und der gruppierten fehlt der Pager (bei 41.570 Zeilen kein Detail). `GroupRow`
gibt es in `Table`; `DataTable` gruppiert die **Seite**, nicht den Bestand.

### Schnittstelle — `accountColumns(options)`

| Option | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `href` | `(a) => string` | nein | Wohin die Zeile führt — Drawer oder Kontoseite, das entscheidet die Seite | `Filled` |
| `columns` | `AccountColumn[]` | nein | Wählt aus; **ordnet nicht um** | `Catalog` (verwürfelt übergeben) |
| `partnerHref` | `(id) => string` | nein | Der Geschäftspartner als Inline-Link | `Personal` |

`accountTracks(columns)` gibt die Spurliste; `accountMinWidth(columns)` die
Breite, unterhalb derer waagerecht gerollt wird — beides wie in 0070, wo die
fehlende Zahl gemessen eine Spalte gekostet hat.

**Kann bewusst nicht:**

- **Gruppieren.** `GroupRow` ist Sache des Aufrufers; der Katalog liefert
  Zellen, keine Ordnung.
- **Den Saldo zeigen.** Er gilt je Jahr und je Quelle und braucht die
  Bewegungen — das ist die Kontoseite (0063).
- **Filtern und sortieren.** Beides läuft über die URL, wie bei jeder
  `DataTable`.

### Stories

Titel `v3/Entitäten/Konto/AccountColumns`. Ableitung nach §6: 3 Zustände
(gefüllt · leer · leer nach Filter — die beiden Leerfälle teilen sich eine
Story, weil ihr Unterschied genau das ist, was sie zeigt; lädt und Fehler
trägt `DataTable` und sind dort bewiesen) + 1 Enum (`columns`: die zwei
Sätze) + 1 Layout (gruppiert) + 1 Prop (`partner`) + 1 „im Einsatz" = **6**.

| Story | Beweist |
|---|---|
| `Filled` | Der Standardsatz, Sortierung am Kopf, Zeilenlink an der Nummer |
| `Catalog` | Der Katalog-Satz mit „Quelle" — verwürfelt übergeben, Reihenfolge bleibt |
| `Grouped` | **Die Vorlage für die Seite:** `DataTable` gruppiert nicht, also baut der Aufrufer den Rahmen selbst — `Table` mit `accountTracks()`, eine `GroupRow` je Klasse, und der **Pager bleibt**. Genau das fehlt der heutigen gruppierten Ansicht (L-87). Die SKR-Spalte fällt weg, weil die Gruppenzeile sie sagt |
| `Personal` | Personenkonten mit Geschäftspartner (52 % Füllgrad) |
| `EmptyCases` | Die **zwei** Leerfälle nebeneinander, ausdrücklich als Vorlage für die Seite: Bestand („In diesem Wirtschaftsjahr gibt es keinen Kontenrahmen") ≠ Filter („Keine Treffer", mit Weg zurück). Die App kennt heute nur einen Satz und schickt damit auch den in den Filter, dessen Mandant gar keinen Rahmen hat (L-86) |
| `InUse` | Mit Kennzahlen und `FilterBar` darüber — die ganze Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 ·
im Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei vier Breiten an derselben Kante, Zellüberlauf 0 (gemessen)
- [ ] Keine feste Spur ist schmaler als ihr breitester Wert (gemessen: „Sonstige betr. Aufwendungen" 190 px in 200, Rollen-Badge 77 px in 120)
- [ ] `columns` ordnet nicht um (Story `Catalog`, verwürfelt)
- [ ] Die Nummer ist mono und trägt den Zeilenlink; keine verschachtelten Anker (gemessen)
- [ ] Buchungszahl rechts mit `tnum`; die **Null** steht als Zahl da, nicht als Gedankenstrich (gemessen)
- [ ] Die SKR-Klasse ist Text, kein Badge (`grep`: kein `StatusBadge` an `skrClass`)
- [ ] Der Kontostatus steht in keinem Satz (`grep`)
- [ ] Die zwei Leerfälle sagen Verschiedenes (Story `EmptyCases`)
- [ ] `accountMinWidth()` deckt beide Sätze; unterhalb wird gerollt, nicht abgeschnitten (gemessen bei 900 px)
- [ ] offen (App): ersetzt `AccountsTable`, `AccountsTableHeader`, `AccountsTableRow` und `AccountsGroupedTable`

### Offene Fragen

1. **Braucht es doch einen `AccountList`-Wrapper?** *Ohne Antwort: nein* — die
   Seite ruft `DataTable` mit dem Satz auf. Sobald zwei Seiten dieselbe
   Kombination aus Leerfall und Breite bauen, wird daraus einer.
2. **Führt die Zeile in den Drawer oder auf die Kontoseite?** *Ohne Antwort:
   der Aufrufer entscheidet* (`href`). Das Seitenprofil empfiehlt den Drawer.
3. **Bleibt „SKR-Klasse" die erste Spalte?** *Ohne Antwort: ja* im flachen
   Satz; in der gruppierten Ansicht fällt sie weg, weil die Gruppenzeile sie
   sagt — das ist die einzige Stelle, an der die Seite den Satz kürzt.

### Befunde für `ludwig/app`

- **Neu (L-86):** Der Leerfall des Kontenplans kennt nur einen Satz („Keine
  Konten gefunden — passe die Filter an"). Er steht auch dann da, wenn der
  Mandant im Jahr gar keinen Kontenrahmen hat — zwei verschiedene Lagen, ein
  Satz (V9).
- **Neu (L-87):** Die gruppierte Ansicht hat **keinen Pager**. Bei 41.570
  Zeilen je Mandant und Jahr ist das kein Detail: die Gruppierung gruppiert
  heute den Bestand, nicht die Seite.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Quelle, Ränge, Job, Leerfall und „ersetzt" stimmen mit Entitäts- und Seitenprofil überein; der Spaltensatz statt einer `AccountRow` folgt dem Hausmuster. Entscheide: 1 kein Wrapper `AccountList` — `DataTable` trägt `empty`/`filtered` · 2 Ausgang per `href`, der Aufrufer entscheidet Drawer oder Seite · 3 SKR-Klasse als erste Spalte, gruppiert weglassen; die Story `Grouped` ist `Table` + `GroupRow` + `Pagination` von Hand (`DataTable` gruppiert nicht) — so hinschreiben, das ist die Vorlage für die Seite · `name` ist sortierbar (die App kann `account_name`).

Vor dem Bau in die Spec: (a) Typen aus `modules/accounts/domain/account.ts`: `AccountRow`, `AccountClass` + `ACCOUNT_CLASS_LABEL`, `AccountScope`, `ACCOUNT_SORT_KEYS`; Sortierschlüssel `account_number` / `account_name` / `usage_booking_count` / `last_booking_date`; (b) Spalte „Quelle" zeigt `AccountRow.origin` (Mandant / SKR-Katalog, das ist Rang 6 des Seitenprofils), Kopf „Angelegt"; `source` (100 % `imported`) bleibt draußen, der Satz dazu bezieht sich auf `source`; (c) `status` aus beiden Sätzen streichen — 99 % konstant, für Katalogzeilen `null`, die Karteileichen-Frage beantwortet `bookings ↑`; (d) `skrClass` als Text über `ACCOUNT_CLASS_LABEL`, keine Farbe (kein Status, R1); (e) `partner`: Feld `businessPartnerId` + Name lokal deckungsgleich, Befund L-89; (f) die Voreinstellung „bebucht" ist keine neue Entscheidung — `AccountFilter.usedOnly` hat Default `true`; Spec und Seitenprofil nennen das und den Befund L-90 (die App setzt `usedOnly` mit `status='active'` gleich, die Bedingung des Profils ist `usage_booking_count > 0`); (g) `Empty`/`EmptyAfterFilter` als Seiten-Vorlage kennzeichnen oder in `InUse` ziehen; (h) Seitenprofil: `KpiRow` → `KpiGrid`/`KpiTile`.

Befunde ins Register: **L-89** — `AccountRow` trägt keinen Geschäftspartner (52 % Füllgrad, Profil Rang 8). **L-90** — `AccountFilter.usedOnly` verspricht „mindestens eine Buchung", filtert aber über `status='active'` (99 % `active`, 85 % ohne Buchung); zugleich widerspricht Registry `konto.inactive` („angelegt, nie bebucht") den Daten. L-86/L-87 stehen und stimmen.

### Beim Bauen gemessen

**Zwei feste Spuren waren falsch bemessen, in beide Richtungen.**
„Sonstige betr. Aufwendungen" misst 190 px und stand in einer 180-px-Spur —
gemessen brach die Klasse auf zwei Zeilen und trieb die Zeile von 47 auf
**67 px**. Eine feste Spur, die schmaler ist als ihr breitester Wert, kostet
also nicht Breite, sondern Höhe; das ist derselbe Fehler wie in 0085, nur mit
anderem Ausgang, weil hier ein Text umbricht statt eines Badges überzulaufen.
Umgekehrt war die Rollenspalte mit 150 px zu breit: das breiteste Wort der
Achse misst als Badge 77 px. Jetzt 200 und 120; gemessen alle Zeilen bei
47 px, Zellüberlauf 0, Kanten deckungsgleich bei 1100, 1440 und 1920 px.

**`columns` ordnet nicht um** — die Story `Catalog` übergibt
`["origin","role","name","number","skrClass"]` und bekommt gemessen
„SKR-Klasse · Konto-Nr. · Name · Rolle · Angelegt".

**Die gruppierte Ansicht behält ihren Pager.** Gemessen: fünf Gruppenzeilen
mit Zähler, darunter `Pagination` — genau das, was der heutigen Ansicht fehlt
(L-87). Und die Gruppenzeile spannt jetzt über die volle Tabellenbreite; bis
zur `colSpan`-Korrektur dieser Sitzung endete sie bei 239 px.
