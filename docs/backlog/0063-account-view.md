# 0063 · `AccountView` — die Vollansicht eines Kontos

| | |
|---|---|
| Status | Abnahme |
| Freigabe | zurück 2026-09-07 — Zuschnitt neu nach Abschnitt „Freigabe" (Rahmen, DATEV führt), nach 0071, danach ohne zweite Runde freigegeben |
| Stufe | `entities/account/` |
| Quelle | Entitätsprofil `docs/entitaeten/account.md`, Abschnitt „Formen“ (Zeile `AccountView`) · Seitenprofil `docs/seiten/konto-detail.md` |
| Auftrag | Die Seite hinter dem Fuß-Knopf des `AccountDrawer` (A10): alles über ein Konto in einem Jahr. Heute vier Tabs in `app/(app)/clients/[clientSlug]/[year]/accounts/[accountNumber]/page.tsx` — Übersicht (6 Kennzahlen, 6-Monats-Verlauf, je fünf neueste Bewegungen beider Quellen, Stammdaten), Buchungen, Monatsübersicht, LLM-Profil. Zeigt alle Datenpunkte ab 20 % Füllgrad. |
| Vertagt, weil | Eigene Route mit vier Tabs → nach `docs/backlog/README.md` Schritt 0b erst ein Seitenprofil unter `docs/seiten/`; jedes Element muss dort einer Frage der Rolle dienen, und ob es bei vier Tabs bleibt, entscheidet das Profil, nicht die Spec. Der Teil, den View und Drawer teilen, wird als `AccountFacts` in der laufenden Welle gebaut — der Drawer wartet damit nicht auf den View (Präzedenz `SourceDocumentFacts`, 0052). |
| Setzt voraus | Seitenprofil `docs/seiten/konto-detail.md` — **angelegt 2026-09-07** · `AccountFacts` und `AccountEntryList` aus der Konto-Welle · 0057 `DataTable` für den Tab „Buchungen" · offene Frage 1 des Profils (Saldo je Quelle) |
| Angelegt von / am | Claude, 2026-09-04 (Skill `entitaet-analysieren`, §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`)

Die Wartebedingung ist weg: das Seitenprofil steht als
`docs/seiten/konto-detail.md`. Es beantwortet die Frage, die die Spec sonst
geraten hätte — **vier Reiter oder zwei** — und begründet, warum die zwei
Auszüge zu einer Liste werden.

### Einordnung

- **Klasse:** `entities/account/`, Größe L.
- **Regel aus §3:** Nr. 5 — die Form existiert in der App (846 Zeilen) und
  keine vorhandene deckt sie ab. Der Drawer (0068) beantwortet die eine Frage,
  die woanders aufkam; der View beantwortet alle sieben Ränge.
- **Eine Datei, ein Export** (`AccountView.tsx`). Sie komponiert, was es schon
  gibt: `AccountFacts`, `AccountEntryList`, `accountEntryColumns()`,
  `BarChart` (0110), `KpiRow`, `Tabs`.
- **Kein `AccountEditor`** — das Profil hat ihn verworfen: die einzigen
  änderbaren Punkte sind `clearingAccountType` (0 % gefüllt) und die
  Enrichment-Beschreibung. Beide werden `InlineEdit` im View, sobald jemand sie
  braucht (Ausbau).

### Die drei Entscheidungen

**1. Ein Auszug, nicht zwei.** Heute stehen „Buchungen in DATEV" und
„Buchungen in Ludwig" als getrennte Tabellen mit je eigener Suche und eigenem
Pager. Das Entitätsprofil hat die Trennung am 2026-09-04 verworfen: *die Frage
ist eine* — was liegt auf dem Konto —, *die Quelle ist eine Eigenschaft der
Zeile*. Der View zeigt **eine** Liste mit der Herkunft als Spalte; das ist
zugleich der Ort, an dem der Abgleich (Achse `mirror_match`) sichtbar wird,
und der ist der eigentliche Grund, warum jemand hier ist.

**2. Der Saldo steht je Quelle.** Offene Frage 1 des Entitätsprofils. Die
Kontoseite ist genau der Ort, an dem der Unterschied zählt — ein vereinigter
Saldo verbirgt die Abweichung, die zu finden die Rolle hergekommen ist. Zwei
Zahlen nebeneinander, und die **Differenz** als dritte, wenn es eine gibt.

**3. Zwei Reiter, nicht vier.** „Monate" zeigt dieselben Daten wie der
Verlauf, nur vollständig — dann zeigt der Verlauf eben das ganze Jahr.
„Buchungen" geht in die Hauptfläche auf (Entscheidung 1). Es bleiben **Konto**
und **LLM-Profil**.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `account` | `AccountVM` | ja | Rang 1 und 6 | `Filled` |
| `totals` | `{ source, balance, debit, credit, count }[]` | ja | Rang 2 — **je Quelle**, nie vermischt | `Filled`, `Diverging` |
| `months` | `{ month, debit, credit }[]` | nein | Rang 3 — der Verlauf über das ganze Jahr | `Filled` |
| `entries` | `AccountEntryVM[]` | ja | Rang 4 — **eine** Liste, Herkunft als Spalte | `Filled` |
| `entryHref` | `(e) => string` | nein | Rang 4b — die einzelne Buchung im Drawer | `Filled` |
| `listHref`, `sort`, `pager` | wie `DataTable` | nein | p99 250, max 3.400 → Blättern ist Pflicht | `Filled` |
| `tabs` | `{ key, label, content }[]` | nein | Was **neben** dem Konto steht — heute das LLM-Profil | `Tabs` |
| `activeTab`, `tabHref` | wie 0071 | nein | Reiter sind Links, kein lokaler Zustand | `Tabs` |
| `pagerNav` | `{ prevHref?, nextHref?, position? }` | nein | Vor/Zurück in der Kontenliste; die **Seite** kennt sie | `InUse` |
| `loading`, `error` | wie üblich | nein | Zwei der fünf Zustände | `LoadingAndError` |

**Kann bewusst nicht:**

- **Buchen.** Der View ist lesend; gebucht wird am Sachverhalt.
- **Die Quellen verrechnen.** Er stellt sie nebeneinander; wer sie addiert,
  verliert die Abweichung.
- **Den Kontenplan zeigen.** Vor und Zurück ja, keine eingebettete Liste.
- **Nachladen.** `entries` sind die Zeilen dieser Seite; das Blättern läuft
  über die URL.

### Stories

Titel `v3/Entitäten/Konto/AccountView`. Ableitung nach §6: 4 Zustände
(gefüllt · leer · lädt · Fehler; „leer nach Filter" entfällt — der View
filtert nicht) + 1 Layout (`tabs`) + 1 Rand (die Quellen gehen auseinander) +
1 Enum (Kontoart: Sach-, Debitoren-, Kreditorenkonto nebeneinander) + 1 „im
Einsatz" = **8**.

| Story | Beweist |
|---|---|
| `Filled` | Kopf, Kennzahlen je Quelle, Verlauf, **eine** Bewegungsliste mit Herkunft |
| `Kinds` | Sach-, Debitoren-, Kreditorenkonto — dieselbe Ansicht, andere Fakten |
| `Diverging` | Die Quellen sagen Verschiedenes: die Differenz steht da, nicht nur zwei Zahlen |
| `Tabs` | Das LLM-Profil als zweiter Reiter, als Link |
| `Empty` | „Auf diesem Konto ist im Jahr 2026 nichts gebucht." — ein Befund, kein Fehler |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und Weg |
| `Edges` | 3.400 Bewegungen (das Bankkonto), Namen an der Kürzungsgrenze |
| `InUse` | In der `AppShell`, mit Vor/Zurück aus der Kontenliste |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 ·
im Browser angesehen.

Variabel:

- [ ] **Eine** Bewegungsliste, Herkunft als Spalte — keine zwei Tabellen (`grep`, Story `Filled`)
- [ ] Der Saldo steht je Quelle; die Differenz erscheint nur, wenn es eine gibt (Story `Diverging`)
- [ ] Der Verlauf deckt das ganze Jahr, nicht sechs Monate (Story `Filled`, gemessen: 12 Balken)
- [ ] Die Zeile führt in den Drawer, nicht auf den Sachverhalt (Story `Filled`)
- [ ] Reiter sind Links über `tabHref` (`grep`: kein `useState`)
- [ ] Der View lädt nichts (`grep`: kein Modul-Import, kein `await`)
- [ ] Der Leerfall ist ein **Befund**, kein Fehler und kein Erfolg — kein Haken (Story `Empty`)
- [ ] Kopf und Zeilen der Bewegungsliste an derselben Kante bei vier Breiten (gemessen)
- [ ] offen (App): ersetzt `accounts/[accountNumber]/page.tsx` (846 Z.) samt beider Auszugstabellen

### Offene Fragen

1. **Zwei Reiter oder vier?** *Ohne Antwort: zwei* (Konto, LLM-Profil) — der
   View merkt davon nichts, er bekommt die Liste, die er bekommt.
2. **Saldo je Quelle?** *Ohne Antwort: ja*, nebeneinander plus Differenz.
3. **Trägt der View die `InlineEdit`-Werte?** *Ohne Antwort: nein* — die zwei
   änderbaren Punkte (0 % Füllgrad, Enrichment-Text) warten auf einen Bedarf.

### Ausbau (A12)

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Verrechnungskonto bestätigen | `onConfirmClearing` | sobald `clearingAccountType` im Bestand vorkommt (heute 0 %) |
| Beschreibung ändern | `onEditDescription` über `InlineEdit` | wenn jemand die LLM-Beschreibung korrigieren will |
| Vergleich zweier Jahre | `compareYear` | wenn die Abschlussprüfung danach fragt |

### Befunde für `ludwig/app`

- **Neu (L-88):** Die Kontoseite lädt zwei Auszüge mit zwei Pagern und zwei
  Suchfeldern für **eine** Frage. Das Entitätsprofil hat die Trennung
  verworfen; die Vereinigung braucht eine Abfrage, die beide Quellen mit einer
  `origin`-Spalte liefert — heute sind es `loadAccountLedgerPage` und
  `listAccountMirrorEntries` getrennt.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: zurück.** Zwei Gründe: Entscheidung 2 („Saldo je Quelle, zwei Zahlen plus Differenz") öffnet eine Frage neu, die der Owner am 2026-09-04 im Entitätsprofil beantwortet hat — **DATEV führt, Ludwig ist Delta**, genau so ist `AccountFacts` (0066) gebaut; `totals` beantwortet Rang 2 damit ein zweites Mal. Und Rang 5 („sagen Ludwig und DATEV dasselbe?") hat kein Element. Owner-Entscheide: Rahmen mit Slots wie 0050 (kein Durchreicher um `DataTable`) · Saldo: DATEV führend plus Ludwig-Delta, `totals` entfällt, „Differenz" ist `ludwigOnlyAmount` · Rang 5: die gebaute Herkunft-Spalte aus 0067 (vier Klassen) reicht, `mirror_match` je Zeile ist Ausbau (R1, ein Status je Zeile) · laufender Saldo entfällt ohne Quellfilter, Quellfilter ist Ausbau · Name `LedgerAccountView`, weil `AccountView` im Spiegel ein Typname ist (`"flat" | "grouped"`). Entscheide 1 (zwei Reiter) und 3 (kein InlineEdit) wie Default.

Neuer Zuschnitt (vorab freigegeben, wenn die Neufassung dem folgt): Slots `pager` · `header` · `summary` (`AccountFacts` im `EntityHeader metric/facts` oder als `KpiGrid` mit denselben Zahlen; Σ Soll/Σ Haben als zwei optionale Felder am `AccountFactsVM`, Profil Rang 7) · `chart` (`BarChart` 0110, zwei Serien plus Linie) · `tabs` · `aside` (Fakten in der Randspalte, Zweifel 4) · `children` (die Liste: `DataTable` + `accountEntryColumns({ variant: "full" })`, von der Seite gebaut). Typen: `AccountFactsVM` (v3, Spiegel-Tausch als „offen (App)"), `AccountEntry`, `Bar[]`; kein `AccountVM`, kein `AccountEntryVM`. Rang 5 als Kriterium mit Story über die Herkunft-Spalte. Abhängigkeiten ehrlich: L-30 (Saldo im DATEV-Auszug) und L-88 sind Voraussetzungen für den Einsatz drüben; „Zeile führt in den Drawer" ist „offen (App)". „Verhalten" ergänzen, Seitenprofil unter „Quelle", Zählformel der Stories korrigieren (`Kinds` ist keine Enum-Story), `Edges` konkret (Pager „50 von 3.400").

Seitenprofil `konto-detail.md` nachziehen: offene Frage 2 ist beantwortet (Owner 2026-09-04); Rang 5 ohne `StatusBadge`/`mirror_match` je Zeile (Herkunft-Spalte); Rang 6 (Kontenfunktion, Steuersatz) hat in keinem Typ ein Feld — Befund; `KpiRow` → `KpiGrid`, `Chip` → `Badge`; Nebenjob „Buchung aufschlagen" mit einem Param; die Profil-Empfehlung „Saldospalte kehrt im View wieder, wo eine Quelle allein gezeigt wird" als bewusste Abweichung nennen.

Reihenfolge: nach 0071 — der View erbt dessen Muster. Befunde ins Register: **L-94** — `AccountFactsVM` im Spiegel trägt weder `datevBalance` noch `ludwigOnlyAmount` noch `currency`; L-13 ist nur halb erledigt. **L-95** — Σ Soll/Σ Haben je Konto und Jahr, Monatswerte `{ month, debit, credit }` und Kontenfunktion/Automatik-Steuersatz haben keinen Spiegel-Typ (heute inline in `accounts/[accountNumber]/page.tsx`). L-30 in 0063 verlinken.

## Neufassung 2026-09-07 nach der Freigabe — Rahmen mit Slots, DATEV führt

Die erste Fassung ist an zwei Stellen zurückgewiesen worden, und beide
Zurückweisungen waren berechtigt:

1. **„Saldo je Quelle, zwei Zahlen plus Differenz"** hat eine Frage neu
   aufgemacht, die der Owner am 2026-09-04 im Entitätsprofil beantwortet hat:
   **DATEV führt, Ludwig ist das Delta.** Genau so ist `AccountFacts` (0066)
   gebaut — die Spec hätte Rang 2 also ein zweites Mal beantwortet, anders als
   der Baustein, der ihn schon beantwortet.
2. **Rang 5 hatte kein Element.** „Sagen Ludwig und DATEV dasselbe?" stand in
   der Rangfolge und in keiner Zeile der Schnittstelle.

### Einordnung

- **Klasse:** `entities/account/`, Größe L. **Name `LedgerAccountView`**, nicht
  `AccountView`: `AccountView` ist im gespiegelten Datenmodell bereits ein
  Typname (`"flat" | "grouped"`, die Ansichtsform des Kontenplans). Eine
  Komponente, die einen Domänentyp verdeckt, ist eine Namenskollision, die auf
  den ersten Import wartet.
- **Regel aus §3:** Nr. 5. Kein Durchreicher um `DataTable` — ein Rahmen mit
  Slots wie 0050 und 0071.
- **Setzt auf:** `AccountFacts` (0066), `accountEntryColumns()` (0067),
  `BarChart` (0110), `EntityHeader`, `RecordPager`, `MasterDetail`.

### Die drei Entscheidungen

**1. Rang 2: DATEV führt, Ludwig ist das Delta.** Kein zweiter, gleichrangiger
Saldo und keine vereinigte Zahl. Zwei gleich große Zahlen nebeneinander laden
dazu ein, sie zu addieren; eine vereinigte verbirgt die Abweichung, wegen der
jemand hier ist. Der View bekommt dafür **keine** Datenprop `totals` — die
Zahlen stehen in `AccountFactsVM` (`datevBalance`, `datevCount`,
`ludwigOnlyAmount`, `ludwigOnlyCount`), und die Seite baut daraus ihre
`KpiGrid`. Σ Soll und Σ Haben (Rang 7 des Profils) fehlen dort und sind
Befund **L-94**.

**2. Rang 5 ist die Herkunft-Spalte.** Sie ist gebaut (0067) und trägt vier
Klassen: nur in DATEV · von Ludwig gebucht und in DATEV bestätigt · von Ludwig
exportiert und noch nicht wiedergefunden · nur in Ludwig. Damit steht der
Abgleich **in der Zeile**, wo die Frage entsteht. Ein zweiter Status je Zeile
(`mirror_match`) wäre ein Statuszeichen zu viel (R1) und ist Ausbau.

**3. Kein laufender Saldo.** Er stimmt nur bei genau einer Sortierung **und**
einer Quelle; die Liste vereinigt beide. Mit einem Quellfilter kommt er wieder
— der Filter ist Ausbau, und das Seitenprofil nennt die Abweichung von der
Profil-Empfehlung ausdrücklich.

### Schnittstelle — sieben Slots, keine Datenprops

| Slot | Was hineingehört | Rang | Nachweis |
|---|---|---|---|
| `pager` | `RecordPager` mit `back` („← Konten") und `total` | — | `Filled` |
| `header` | `EntityHeader` — Nummer und Name, Kontoart als Zustand | 1 | `Filled` |
| `summary` | `KpiGrid` aus `AccountFactsVM`: Saldo in DATEV, „nur in Ludwig", letzte Buchung | 2 | `Filled` |
| `chart` | `BarChart` (0110), Soll und Haben je Monat, `grouped` | 3 | `Filled` |
| `tabs` | `Tabs` — zwei: Konto und LLM-Profil | 7 | `OtherTab` |
| `aside` | `AccountFacts` in der Randspalte; leer → eine Spalte | 6 | `Filled`, `WithoutFacts` |
| `children` | Die Bewegungen: `DataTable` mit `accountEntryColumns({ variant: "full" })` | 4, 5 | `Filled`, `Edges` |

**Kann bewusst nicht:**

- **Laden.** Kein Reiter-Inhalt, keine Bewegungen — die Seite lädt.
- **Die Quellen verrechnen.** Sie stehen nebeneinander, DATEV führend.
- **Zwei Auszüge zeigen.** Eine Liste, Herkunft als Spalte (L-88).
- **Einen laufenden Saldo führen.** Siehe Entscheidung 3.
- **Den Kontenplan zeigen.** Vor und Zurück ja, keine eingebettete Liste.

### Verhalten

- **Tastatur:** `J`/`K` kommen von `RecordPager`; der Rahmen bindet nichts.
- **Reiterwechsel:** die Reiter sind Links; kein lokaler Zustand.
- **Server/Client:** der Rahmen ist eine Server-Komponente. `MasterDetail`
  bringt den Zweispalter mit, `DataTable` seine eigenen Inseln.
- **Ränge 1–3 ohne Scrollen:** gemessen enden sie bei 1440 × 900 auf y = 538.

### Stories

Titel `v3/Entitäten/Konto/LedgerAccountView`. Ableitung nach §6: 4 Zustände
(gefüllt · leer · lädt · Fehler; „leer nach Filter" entfällt — der Rahmen
filtert nicht, Laden und Fehler teilen sich eine Story) + 1 Layout (`aside`
leer) + 1 Slot-Wechsel (anderer Reiter) + 1 Rand = **6**.

| Story | Beweist |
|---|---|
| `Filled` | Die sieben Slots, DATEV führend, alle vier Herkunftsklassen in der Liste |
| `WithoutFacts` | Ohne Randspalte nimmt die Liste die ganze Breite — der Rahmen erzwingt keinen Zweispalter |
| `OtherTab` | Derselbe Rahmen, anderer Inhalt; der View lädt nichts |
| `Empty` | Konto ohne Bewegung: ein **Befund**, kein Fehler und kein Erfolg; der Verlauf fällt weg statt zwölf leerer Balken |
| `LoadingAndError` | Kopf, Zahlen und Reiter bleiben stehen |
| `Edges` | Das Bankkonto: 3.400 Bewegungen, Pager „50 von 3.400" |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 ·
im Browser angesehen.

Variabel:

- [ ] Der Rahmen hat **keine** Datenprops (`grep`: nur `ReactNode`-Slots)
- [ ] Rang 2 zeigt **einen** führenden Saldo (DATEV) und Ludwig als Delta — kein zweiter gleichrangiger, keine Summe (Story `Filled`, gemessen)
- [ ] Rang 5 steht in der Zeile: alle **vier** Herkunftsklassen sind an einer Zeile nachweisbar (Story `Filled`, gemessen)
- [ ] **Eine** Bewegungsliste, kein zweiter Auszug (`grep`, Story `Filled`)
- [ ] Kein laufender Saldo (`grep`: keine Saldospalte im Satz)
- [ ] Ränge 1–3 stehen bei 1440 × 900 ohne Scrollen (gemessen)
- [ ] Ohne `aside` eine Spalte, ohne `tabs`/`pager` fallen die Zeilen samt Abstand (Story `WithoutFacts`)
- [ ] Der Rahmen lädt nichts (`grep`: kein Modul-Import, kein `await`, kein `useState`)
- [ ] offen (App): ersetzt `accounts/[accountNumber]/page.tsx` (846 Z.) samt beider Auszugstabellen — **abhängig von L-88** (eine Abfrage über beide Quellen) und **L-30** (Saldo im DATEV-Auszug)
- [ ] offen (App): die Zeile führt in den Drawer, mit **einem** URL-Parameter

### Ausbau (A12)

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Quellfilter (nur DATEV / nur Ludwig) | eine Prop an der Liste der Seite | wenn jemand die Quellen einzeln lesen will — dann kommt auch der laufende Saldo wieder |
| Abgleich je Zeile (`mirror_match`) | eine Spalte im Satz 0067 | wenn die vier Herkunftsklassen nicht mehr reichen; heute wäre es ein zweiter Status je Zeile (R1) |
| Σ Soll / Σ Haben in den Kennzahlen | zwei Felder an `AccountFactsVM` | sobald L-94 steht |
| Zwei Jahre vergleichen | `compareYear` | wenn die Abschlussprüfung danach fragt |

### Befunde für `ludwig/app`

- **L-94** — `AccountFactsVM` trägt im Spiegel weder `datevBalance` noch
  `ludwigOnlyAmount` noch `currency`; L-13 ist damit nur halb erledigt.
- **L-95** — Σ Soll/Σ Haben je Konto und Jahr, die Monatswerte
  (`{ month, debit, credit }`) und Kontenfunktion/Automatik-Steuersatz haben
  keinen Spiegel-Typ; sie stehen heute inline in
  `accounts/[accountNumber]/page.tsx`.
- **L-88** (zwei Auszüge für eine Frage) und **L-30** (Saldo im DATEV-Auszug)
  sind Voraussetzungen für den Einsatz drüben, nicht für den Bau hier.
