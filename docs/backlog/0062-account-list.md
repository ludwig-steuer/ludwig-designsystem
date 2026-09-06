# 0062 · `AccountRow` + `AccountList` — der Kontenplan als Liste

| | |
|---|---|
| Status | spec |
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
| `skrClass` | „SKR-Klasse" | 9 | 160px | Gruppierschlüssel; im flachen Satz eine Spalte, im gruppierten die Gruppenzeile |
| `number` | „Konto-Nr." | 1 | 110px | mono, sortierbar, **trägt den Zeilenlink** |
| `name` | „Name" | 2 | `minmax(200px, 1fr)` | die einzige dehnbare Spur; px als Boden, nie `ch` (Lehre aus 0070) |
| `role` | „Rolle" | 3 | 140px | Achse `konto_typ`, über `StatusBadge` |
| `partner` | „Geschäftspartner" | 8 | 200px | nur im Personenkonten-Satz — 52 % Füllgrad |
| `bookings` | „Buchungen" | 11 | 120px | rechts, `tnum`, sortierbar; **die Spalte, auf die es ankommt** |
| `lastBooking` | „Letzte Buchung" | 10 | 130px | sortierbar; 15 % Füllgrad, deshalb nicht vor M |
| `status` | „Konto" | 12 | 110px | Achse `konto`, mit (i) im Kopf (Z4) |
| `origin` | „Quelle" | 17 | 120px | **nicht** im Standardsatz: 100 % `imported`. Nur im Katalog-Satz, wo sie „Mandant" von „SKR-Katalog" trennt |

Zwei benannte Sätze:

```
ACCOUNT_LIST_COLUMNS   = skrClass · number · name · role · bookings · lastBooking · status
ACCOUNT_CATALOG_COLUMNS = skrClass · number · name · role · origin · status
```

Der Katalog-Satz (`scope=all`) lässt Buchungen und letzte Buchung weg — eine
Katalogzeile, die im Mandanten nicht existiert, hat beides nicht, und eine
Spalte, die in der halben Liste leer ist, ist keine Antwort.

### Die zwei Entscheidungen

**1. Die Voreinstellung zeigt bebuchte Konten.** 85 % der 41.570 Zeilen haben
**null** Buchungen. Eine Liste, in der Leerlauf und Arbeit gleich aussehen, ist
ein Katalog, kein Prüfwerkzeug (Seitenprofil, Zweifel 4). Das ist eine
Entscheidung der **Seite** — der Spaltensatz kann sie nicht treffen —, aber sie
steht hier, weil sie erklärt, warum die Buchungsspalte im Standardsatz vorne
steht und im Katalog-Satz fehlt.

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
(gefüllt · leer · leer nach Filter; lädt und Fehler trägt `DataTable` und sind
dort bewiesen — hier begründet ausgelassen) + 1 Enum (`columns`: die zwei
Sätze) + 1 Layout (gruppiert) + 1 „im Einsatz" + 1 Rand = **7**.

| Story | Beweist |
|---|---|
| `Filled` | Der Standardsatz, Sortierung am Kopf, Zeilenlink an der Nummer |
| `Catalog` | Der Katalog-Satz mit „Quelle" — verwürfelt übergeben, Reihenfolge bleibt |
| `Grouped` | Die Gruppierung als Prop des Aufrufers, mit Pager darunter |
| `Personal` | Personenkonten mit Geschäftspartner (52 % Füllgrad) |
| `Empty` | „Kein Konto in diesem Jahr" — der Bestandsfall |
| `EmptyAfterFilter` | „Keine Treffer" mit Weg zurück — heute derselbe Satz wie oben |
| `InUse` | Mit Kennzahlen und `FilterBar` darüber — die ganze Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 ·
im Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei vier Breiten an derselben Kante, Zellüberlauf 0 (gemessen)
- [ ] Keine feste Spur ist schmaler als ihr breitester Achsenwert (gemessen, alle Werte von `konto_typ` und `konto`)
- [ ] `columns` ordnet nicht um (Story `Catalog`, verwürfelt)
- [ ] Die Nummer ist mono und trägt den Zeilenlink; keine verschachtelten Anker (gemessen)
- [ ] Buchungszahl rechts mit `tnum` (gemessen)
- [ ] Die zwei Leerfälle sagen Verschiedenes (Stories `Empty`, `EmptyAfterFilter`)
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
