# 0062 · `AccountRow` + `AccountList` — der Kontenplan als Liste

| | |
|---|---|
| Status | fertig |
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
| `partner` | „Geschäftspartner" | 8 | 200px, gekürzt | nur im Personenkonten-Satz — 52 % Füllgrad, dort ~100 %. **`AccountRow` trägt ihn nicht** (Befund L-89): der Name kommt als Callback vom Aufrufer, sonst bleibt die Spalte leer statt zu erfinden |
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
| `partnerName` | `(a) => string \| null` | nein | Der Name des Geschäftspartners. Als Callback, weil `AccountRow` ihn nicht trägt (L-89) — ohne ihn bleibt die Spalte leer, statt zu erfinden | `Personal` |
| `partnerHref` | `(a) => string \| undefined` | nein | Wohin der Partner führt | `Personal` |
| `originLabels` | `{ client, catalog }` | nein | Die zwei Wörter der Spalte „Angelegt" — sie stehen nicht in der Domäne (L-96), also einmal hier als Vorgabewert | `Catalog` |

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

## Nach der Abnahme vom 2026-09-07

**Zwei Spuren waren gegen die Fixtures bemessen statt gegen ihren
Wertebereich** — und das ist genau der Fehler, den der Abschnitt „Beim Bauen
gemessen" eine Spalte weiter selbst beschreibt. Die Abnahme hat ihn dort
gefunden, wo dieser Bau nicht hingesehen hat: bei der **Mindestbreite, die
die Komponente selbst ausgibt**.

- **Der Kontoname (M1).** Das Entitätsprofil sagt „p50 19 · p90 39 · max 50
  Zeichen — kürzen ab 40, voller Name im `title`". Gebaut war weder das eine
  noch das andere. Gemessen bei 986 px (= `accountMinWidth`) und einem
  p90-Namen: 244 px Text in einer 200-px-Spur, Zeile **67 px** statt 47.
- **Der Geschäftspartner (M2).** 200 px feste Spur, keine Obergrenze in den
  Daten: „Musterbau Handels- und Beteiligungs GmbH & Co. KG" (49 Zeichen)
  trieb die Zeile bei **jeder** Breite auf 67 px.

Beide kürzen jetzt mit Ellipse und tragen den vollen Wert im `title` — dieselbe
Regel, die `caseColumns` seit 0096 hat. Sie heißt jetzt `.v2trunc` statt
`.v2caserow__name`: es war nie eine Regel der Fallzeile, sondern die eine
Regel, die **jede** Zelle braucht, in der ein Name steht, dessen Länge niemand
begrenzt. Gemessen: 49 Zeichen in beiden Spalten, Zeile bleibt bei 986 **und**
1440 px auf 47 px.

Dazu:

- **M3** — die vier Sortierschlüssel hängen jetzt über `satisfies AccountSortKey`
  an der Domäne. Vorher waren es nackte Strings, die stumm brechen, sobald
  drüben einer umbenannt wird.
- **M4** — die zwei Spuren, die von der Spec-Tabelle abwichen (130/140 statt
  120/130), stehen wieder auf den Spec-Werten. Gemessen tragen sie: Kopf
  „Buchungen" 69 px, „Letzte Buchung" 94,8 px.
- **M5** — Entitätsprofil und Seitenprofil sind nachgezogen: Rang 12 steht in
  keinem Satz mehr, dafür 8–10; die Grundgesamtheit nennt die Voreinstellung
  und L-90; der Leerfall ist zweigeteilt; und `AccountRow` trägt im Profil den
  Nachtrag, dass daraus ein **Spaltensatz** wird — wie bei `accountEntryColumns()`.
- **M6** — die zwei Wörter der Spalte „Angelegt" sind in der Domäne nicht
  vorhanden (Befund **L-96**). Sie stehen jetzt als überschreibbarer
  Vorgabewert an einer Stelle statt als Literale in der Zelle.
- **M9** — der Cast auf `AccountClass` ist weg: ein unbekannter Wert fällt
  jetzt sichtbar als Rohwort durch, statt die Zelle still zu leeren.
- **M10** — der handgebaute Kopf der gruppierten Vorlage trägt jetzt
  Sortierlinks. Ohne sie hätte die Vorlage Rang 5 des Seitenprofils verloren —
  dieselbe Lücke, die sie an der heutigen Ansicht anprangert.
- **M8** (`accountColumns()` ohne Argument), **M12** (`Link` statt rohem `<a>`),
  **M13** (L-89/L-90 vor L-91 einsortiert) sind mit erledigt.

**Offen und benannt:** M7 ist in die Schnittstellen-Tabelle eingearbeitet;
M11 (camelCase-Schlüssel neben snake_case-Sortierschlüsseln) und M14
(`accountMinWidth` gibt für unbekannte Spurformen still 0 zurück) bleiben —
beide betreffen das Muster aller drei Kataloge und gehören in eine eigene
Runde, nicht in diese Datei allein.

**Freigegeben in der Nachabnahme vom 2026-09-07**, mit vier Kleinigkeiten, die
im selben Zug mitgegangen sind: der tote `AccountClass`-Import ist weg (M15);
die Story `Catalog` übergibt jetzt `originLabels` und zeigt damit das Wort,
das die App heute benutzt („SKR-Katalog") statt nur den Vorgabewert (M16);
der handgebaute Sortierkopf der Vorlage trägt `aria-sort` und den
ausgeschriebenen Namen und benutzt `Link` statt eines rohen `<a>` — er ist
die Datei, die in die App kopiert wird, und ein Sortierkopf, der seinen
Zustand nur mit einem Pfeil sagt, sagt ihn nicht (M17); und die
Zuschnitt-Tabelle des Entitätsprofils steht nicht mehr auf „Backlog" (M18).

Zu `AccountScope`: die Freigabe hat ihn namentlich verlangt, er ist **nicht**
importiert — und das ist Absicht. Der Spaltensatz bekommt keinen Scope, er
**ist** zweimal einer: `ACCOUNT_LIST_COLUMNS` und `ACCOUNT_CATALOG_COLUMNS`,
und die Wahl trifft der Aufrufer über `columns`. Ein Typ, den niemand
braucht, ist Rauschen — der Beweis stand eine Zeile darüber (M15).

## Wiederabnahme 2026-09-07 — gegen den Wertebereich, nicht gegen die Fixtures

**Urteil: freigegeben.** Der wiederkehrende Fehler dieses Sets — eine Spur
gegen die Beispieldaten zu bemessen statt gegen ihren Wertebereich — ist weg,
und zwar an beiden Stellen, die die Abnahme gefunden hatte. Gemessen wurde
nicht mit den Namen der Story: in die laufende Seite eingesetzt wurden echte
Werte an der Obergrenze des Profils — Kontoname **50 Zeichen** (Profil:
p50 19 · p90 39 · max 50) und Geschäftspartner „Musterbau Handels- und
Beteiligungs GmbH & Co. KG" (**49 Zeichen**) — über Chrome/CDP gegen den
Dev-Server, der die Quelle serviert. Der Weg ist derselbe, den die Zelle
nimmt (`<span class="v2trunc" title={name}>{name}</span>`), die Werte gehen
also durch dieselbe Regel.

**M1 und M2 — behoben. Zeilenhöhe bleibt 47 px, bei jeder Breite:**

| Satz | `accountMinWidth` | gemessen bei | Zeilenhöhe | Zellüberlauf | Kopf-/Zeilenkante |
|---|---|---|---|---|---|
| `ACCOUNT_LIST_COLUMNS` (`Filled`, `InUse`) | **966 px** | 700 · 900 · 966 · 1100 · 1280 · 1400 · 1440 · 1920 | 47,1 px | 0 | deckungsgleich |
| `ACCOUNT_CATALOG_COLUMNS` (`Catalog`) | **846 px** | 846 · 900 · 1036 · 1100 · 1280 · 1440 · 1920 | 47,1 px | 0 | deckungsgleich |
| Satz mit `partner` (`Personal`) | **1036 px** | 846 · 900 · 1036 · 1100 · 1280 · 1440 · 1920 | 47,1 px | 0 | deckungsgleich |
| gruppiert, ohne `skrClass` (`Grouped`) | **756 px** | 756 · 900 · 1280 · 1920 | 47,1 px | 0 | deckungsgleich; Gruppenzeile = volle Tabellenbreite |

(Die letzte Zeile jeder Tabelle misst 46,1 px — ihr fehlt die Trennlinie.)

**`accountMinWidth` ist die richtige Zahl, nicht bloß eine Zahl.** Bei genau
966 px steht die dehnbare Namensspur exakt auf ihrem Boden (200,0 px) und
jede feste Spur auf ihrem Sollwert (200 · 110 · 200 · 120 · 120 · 130); die
Zeile misst 966 = 880 Spuren + 5 × 10 Rinne + 2 × 18 Zeilenpolster. Ein Pixel
weniger, und der Boden fiele. Darunter wird **gerollt, nicht abgeschnitten**:
bei 900 px `scrollWidth` 966 gegen `clientWidth` 932, Zellüberlauf weiter 0.
Dasselbe für 846 (Katalog), 1036 (Personenkonten), 756 (gruppiert) — jeweils
an der eigenen Zahl geprüft, nicht an der des Standardsatzes. Für L1 ist das
ohnehin nur Reserve: der breiteste Satz passt bei 1280 px ohne Rollbalken.

**Kürzen statt wachsen — an der Wirkung geprüft.** Beide Spuren tragen
`.v2trunc` (`nowrap`, `overflow: hidden`, `text-overflow: ellipsis`,
`min-width: 0`); der volle Wert steht im `title` (50 bzw. 49 Zeichen
gemessen, kein gekürzter Text ohne `title`). Weil die Ellipse rein optisch
ist, bleibt der ganze Name im DOM — die Vorlesehilfe verliert nichts. Bei
1280 px wird der 50-Zeichen-Name im Standardsatz gar nicht erst gekürzt (Spur
480 px), der 49-Zeichen-Partner in seiner festen 200-px-Spur schon.

**Die festen Spuren gegen ihren geschlossenen Wertebereich**, jeder Wert
einzeln in die Zelle gesetzt und gemessen:

| Spur | Breite | Wertebereich | breitester Wert |
|---|---|---|---|
| `skrClass` | 200 px | alle 14 `ACCOUNT_CLASS_LABEL` | „Sonstige betr. Aufwendungen" **189,5 px**, dahinter „Unentgeltliche Wertabgaben" 182,2 px |
| `role` | 120 px | alle 5 `konto_typ` | 67,5 px als Badge |
| `origin` | 140 px | beide Vorgabewörter | „nur im SKR-Katalog" 124,7 px |
| `number` | 110 px | 4- bis 7-stellig | 56,4 px |
| `bookings` | 120 px | bis „999.999" | Zellüberlauf 0; Kopf mit Pfeil 85 px |
| `lastBooking` | 130 px | Datum kurz | 71,6 px; Kopf mit Pfeil 110,7 px |

Für den Kopf wurde der Sortierpfeil versuchsweise **jeder** sortierbaren
Spalte gegeben — der ungünstigste Zustand, den die URL herstellen kann.
Kopfhöhe bleibt 38,4 px, einzeilig, Überlauf 0.

**Die übrigen Kriterien, einzeln nachgemessen:**

- `columns` ordnet nicht um: `Catalog` übergibt
  `["origin","role","name","number","skrClass"]`, der Kopf liest
  „SKR-Klasse · Konto-Nr. · Name · Rolle · Angelegt".
- Die Nummer ist mono und trägt den Zeilenlink (`a.v2rowlink > span.v2mono`,
  eigener Text, kein `aria-label` nötig); `a a` = **0** in allen sechs
  Stories. Der Partnerlink liegt mit `z-index: 2` über der Zeilenabdeckung —
  `elementFromPoint` trifft ihn, daneben die Zeile (I11).
- Buchungen rechts mit `tabular-nums`, alle Zahlenkanten auf demselben Wert
  (V3); die **Null steht als „0"** da, der unbekannte Wert als „—".
- Die SKR-Klasse ist Text: `<span>Sonstige betr. Aufwendungen</span>`, kein
  `StatusBadge` (V6, R1). Einzige Label-Map ist die importierte
  `ACCOUNT_CLASS_LABEL` der Domäne.
- Der Kontostatus steht in keinem Satz (`grep`: `status` erscheint nur in
  Kommentaren und als `status={a.accountingRole}` am Rollen-Badge).
- Die zwei Leerfälle sagen Verschiedenes: „In diesem Wirtschaftsjahr gibt es
  keinen Kontenrahmen." samt Hinweis auf den DATEV-Import gegen „Keine
  Treffer für … · Filter zurücksetzen".
- Die gruppierte Vorlage trägt fünf Gruppenzeilen mit Zähler, die Gruppenzeile
  spannt über die volle Tabellenbreite (756/866/1246/1298 px = Tabellenbreite),
  darunter `Pagination` („1–50 von 6.212"), und die Sortierköpfe tragen
  `aria-sort`, den ausgeschriebenen Namen und `Link` (M10/M17 bestätigt).
- Sechs Stories, wie abgeleitet; Titel `v3/Entitäten/Konto/AccountColumns`.
- `pnpm typecheck`, `pnpm build`, `pnpm check:icons` grün. Keine Hex-Farbe.

**Ein Mangel, der nicht blockiert:**

- **M19 — zwei Kommentare der Komponente sind deutsch.**
  `account-columns.tsx` bei `bookings` („120 px: der Kopf misst 69 px …") und
  bei `lastBooking` („130 px: der Kopf misst 94,8 px …"), dazu die Überschrift
  „**Kürzen, nicht wachsen.**" im Namens-Kommentar. Das feste Kriterium heißt
  „Code englisch"; die drei Schwestern desselben Musters (`case-columns`,
  `bank-transaction-columns`, `source-document-columns`) sind durchgehend
  englisch, und die Sätze sind erst mit M4 dieser Runde hineingekommen.
  Vorschlag: beim nächsten Anfassen der Datei übersetzen. Deutsche Kommentare
  in **Story**-Dateien bleiben — die sind im Set Hausbrauch. Blockiert nicht:
  kein Bezeichner, keine Wirkung, keine Messung berührt.

**Weiter offen, weiter richtig so:** M11 (camelCase-Schlüssel neben
snake_case-Sortierschlüsseln) und M14 (`accountMinWidth` gibt für unbekannte
Spurformen still 0) betreffen alle drei Kataloge und gehören in eine eigene
Runde. Neu in derselben Klasse und deshalb hier nur notiert: `origin` ist eine
feste 140-px-Spur, deren Text der **Aufrufer** setzt (`originLabels`), ohne
Kürzung. Der Vorgabewert passt (124,7 px in 140), ein längeres Wort des
Aufrufers bräche die Zeile — sobald `origin` in der Domäne eine Label-Map
bekommt (L-96), gehört die Spur noch einmal gemessen.

## Freigegeben (2026-09-07, Wiederabnahme)

Der wiederkehrende Fehler ist weg, und die Abnahme hat ihn **gegen den
Wertebereich** geprüft, nicht gegen die Story: Kontoname mit 50 Zeichen und
Geschäftspartner mit 49 in die laufende Seite eingesetzt, durch dieselbe Zelle
und dieselbe Regel wie die echten Werte. **Zeilenhöhe 47,1 px bei jeder
Breite und in jedem Spaltensatz**, Zellüberlauf null, Kanten deckungsgleich —
gemessen bei 700, 900, 966, 1100, 1280, 1400, 1440 und 1920 px.

`accountMinWidth` ist mitgeprüft: bei exakt 966 px steht die dehnbare
Namensspur genau auf ihrem Boden (200,0 px), und 966 rechnet sich auf 880
Spuren + fünf Rinnen + zweimal Zeilenpolster. Darunter wird gerollt, nicht
abgeschnitten. Die festen Spuren sind gegen ihren **geschlossenen**
Wertebereich geprüft — alle 14 SKR-Labels, alle 5 Achsenwerte der Rolle —, und
für den Kopf hat die Abnahme versuchsweise jeder sortierbaren Spalte den Pfeil
gegeben: einzeilig, kein Überlauf.

**Ein nicht blockierender Mangel, erledigt:** drei Kommentare in
`account-columns.tsx` waren deutsch — sie kamen erst mit der letzten
Nacharbeit hinein, während die drei Schwesterdateien desselben Musters
durchgehend englisch sind. Übersetzt.

**Notiert, nicht als Mangel:** die Spur `origin` ist fest 140 px und trägt
Text, den der Aufrufer setzt (`originLabels`), ohne Kürzung. Der Vorgabewert
passt mit 124,7 px; ein längeres Wort des Aufrufers bräche die Zeile.
Nachmessen, sobald `origin` in der Domäne eine Label-Map bekommt (L-96).

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**L-89, L-90 und L-96 sind erledigt** (App-Commits `0f3c4358` und `eaf73d45`).

- **Der Geschäftspartner steht in der Zeile.** `AccountRow` trägt
  `businessPartnerId` und `businessPartnerName`; die Spalte liest den Namen
  von dort. `partnerName` bleibt als **Überschreibung** für einen Aufrufer,
  der es besser weiß, `partnerHref` bleibt ohnehin seine Sache — die Route
  gehört der Seite. Die Story reicht nur noch die Route herein und baut sie
  aus der Partner-Id.
- **`usedOnly` filtert jetzt über `usage_booking_count > 0`** statt über
  `status` — die Bedingung, die der Kopf der Liste behauptet.
- **Die zwei Wörter der Spalte „Angelegt" kommen aus `ACCOUNT_ORIGIN_LABEL`.**
  Die Prop bleibt als Überschreibung; die Vorgabe ist nicht mehr die
  Nachahmung dessen, was die App anderswo sagt, sondern das, was sie sagt.

**Der Typtausch kam nach der letzten Abnahme.** Er ist typgeprüft
(`typecheck`, `build`, `check:icons`, `check:contrast` grün über den
Exit-Code) und ändert kein Kriterium — aber gebaut hat ihn, wer auch hier
schreibt. Eine kurze Bestätigung steht aus.
