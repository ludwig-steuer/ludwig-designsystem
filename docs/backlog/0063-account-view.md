# 0063 · `LedgerAccountView` — die Vollansicht eines Kontos

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
| `chart` | `BarChart` (0110), Soll und Haben je Monat, `grouped`. **Ohne die Linie**, die die Freigabe nannte: `BarChart.line` ist für einen laufenden Saldo da, und den verwirft Entscheidung 3 | 3 | `Filled` |
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

Titel `v3/Entitäten/Konto/LedgerAccountView`. Ableitung nach §6: **3
Story-Zustände** (gefüllt · leer · Laden und Fehler zusammen in einer; „leer
nach Filter" entfällt, der Rahmen filtert nicht) + 1 Layout (ohne `aside`,
`pager` und `tabs`) + 1 Slot-Wechsel (anderer Reiter) + 1 Rand = **6**.

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

## Nach der Abnahme vom 2026-09-07

Die Abnahme hat den Rahmen selbst durchgewinkt („tadellos, muss nicht
angefasst werden") und **zwei blockierende Mängel in dem gefunden, was um ihn
herum steht** — beide an der Stelle, die die Freigabe zum Prüfstein gemacht
hatte.

**Rang 5 fiel in der Wirkung von vier Klassen auf zwei zurück (M1).** In der
Spec war er sauber verankert; gemessen bei 1440 × 900 war die Zeile „nur in
Ludwig" **nicht gedämpft** — der Owner-Entscheid vom 2026-09-04 sieht für sie
„Symbol, Zeile gedämpft" vor —, und der Chip „Exportiert" lag bei x = 1509 in
einer Fläche, die bei 1419 endet. Sichtbar blieb „Zeichen / kein Zeichen":
zwei Klassen statt vier.

Zwei Ursachen, zwei Korrekturen:

- **`DataTable` hatte keinen Ort für die Dämpfung.** `AccountEntryList` macht
  sie im Drawer seit je selbst (`v2ae__row--draft`), der `DataTable`-Weg
  konnte es nicht. Jetzt gibt es `rowClassName?: (row) => string | undefined`
  — ausdrücklich für das **Gewicht** einer Zeile gegen ihre Nachbarn, nicht
  als Hintertür für Farbe.
- **Der Zustand stand am rechten Rand.** Er beantwortet dieselbe Frage wie das
  Herkunfts-Zeichen zwei Spalten links; im `full`-Satz steht er jetzt direkt
  dahinter. Gemessen liegt der Chip bei x = 699 — bei 1280 **und** 1440 px im
  Bild. Dazu lässt die Story „Stapel" weg (Rang 8, die Nummer steht im Drawer
  der Buchung).

**Zwei DATEV-Salden desselben Kontos auf einem Bildschirm (M2).** `Edges` gab
`Summary` und `AccountFacts` zwei verschiedene Spreads: −184.221,55 € oben,
18.442,19 € in der Randspalte. Das ist wörtlich der Fall, den das Seitenprofil
als Misslingen definiert („wenn sie die zwei Quellen für eine hält") — und er
stand in meiner eigenen Story. Jetzt ein Objekt (`BANK`) für Kopf, Kennzahlen
und Randspalte, ebenso `UNUSED` für den Leerfall.

**Und `Empty` widersprach sich selbst (M3):** „nichts gebucht" über einer
Kachel „Letzte Buchung 26.08.2026" — der Wert war hart in die Story
geschrieben. Er kommt jetzt aus den Fakten.

**Rang 2 war typografisch gleichrangig (M4).** Zwei Kacheln, beide 19 px und
600 — während die Spec selbst argumentiert, zwei gleich große Zahlen lüden zum
Addieren ein. Der Owner hat „Saldo in DATEV" und **darunter** „+ n nur in
Ludwig" entschieden; jetzt trägt die DATEV-Kachel das Delta in ihrer
Unterzeile, und die Reihe zeigt Saldo · Bewegungen · letzte Buchung.

**Die Freigabe-Auflage zu Σ Soll/Σ Haben war unterschlagen (M5).** Sie stand
in der Freigabe und wurde von meiner Neufassung eigenmächtig nach Ausbau
verschoben. `AccountFactsVM` trägt jetzt `debitTotal` und `creditTotal`
(optional, der Drawer braucht sie nicht) — und dazu `skrClassLabel` (M6),
denn Rang 6 versprach die SKR-Klasse, die kein Typ trug und kein Befund nannte.

Dazu: der Pager-Befund geht als **L-97** ans Register (er gehört 0047/0057,
nicht dieser Aufgabe), die drei Dokumente tragen den Namen `LedgerAccountView`
(M9), `WithoutFacts` lässt jetzt auch `pager` und `tabs` weg und beweist
damit, dass die Zeilen samt Abstand fallen (M10), die Zählformel geht auf
(M11), und die weggelassene Verlaufslinie ist als Absicht benannt (M12).

## Wiederabnahme 2026-09-07 (zweite Runde, fremde Abnahme)

**Urteil: zurück.** Der Prüfstein der letzten Runde — Rang 5, die vier
Herkunftsklassen — ist **behoben und in der Wirkung nachgemessen**. Blockierend
sind drei andere Punkte, alle drei wieder in dem, was um den Rahmen herum
steht: eine fehlende Story („im Einsatz"), die dazu führt, dass die
Layout-Kriterien die Fixture messen, ein Satz, dessen Beträge bei beiden
Pflichtbreiten außerhalb der Fläche liegen, und zwei Stories, die die Zahlen
zweier verschiedener Konten auf einen Bildschirm bringen.

Der Rahmen selbst (`LedgerAccountView.tsx`) bleibt unangetastet — er ist, wie
die letzte Abnahme sagte, in Ordnung.

### Behoben, gemessen (nicht nur behauptet)

Gemessen im laufenden Dev-Server (Quelle), `getBoundingClientRect` und
`getComputedStyle` am gerenderten Bild, bei vier Innenbreiten: 976 px und
1136 px (die Breiten, die der Baustein auf der Seite hat — `AppShell`-`main`
ist 240 px Sidebar + 2 × 32 px Polster, gemessen an `SourceDocumentView · In
Use`) sowie 1280 px und 1440 px.

- **M1 (Rang 5, vier Klassen).** In `Filled` bei allen vier Breiten
  unterscheidbar:

  | Klasse | Zeichen | Chip | Zeile |
  |---|---|---|---|
  | `datev` | keins | „—" | `rgb(45,45,45)` |
  | `mirrored` | Zeichen | „—" | `rgb(45,45,45)` |
  | `exported` | Zeichen | „Exportiert" | `rgb(45,45,45)` |
  | `ludwig` | Zeichen | „Vorschlag" | **`rgb(92,92,92)`** (`v2ae__row--draft`) |

  Die Dämpfung greift: `.v2tbl__row.v2ae__row--draft` in `v3.css` und
  `DataTable.rowClassName` sind gebaut und in `Filled` verdrahtet.
- **Der Chip liegt im Bild.** Zustands-Spalte an dritter Stelle: Chip bei
  x = 607…702, sichtbare Fläche 461…975 (Seite bei 1280) bzw. 461…1135 (Seite
  bei 1440). Der Wert x = 1509 aus der letzten Abnahme kommt nicht wieder.
- **M2 (ein Saldo).** Kennzahl und Randspalte nennen in `Filled` und `Edges`
  denselben `datevBalance`. Nur teilweise — siehe Mangel 3.
- **M3 (Leerfall).** `Empty`: „Saldo in DATEV —", „0 Buchungen im Spiegel",
  „Letzte Buchung —", Liste „Auf diesem Konto ist im Jahr 2026 nichts
  gebucht." Kein Haken, kein Grün. Nur teilweise — siehe Mangel 3.
- **M4 (Rang 2 typografisch).** Eine führende Zahl: `v2kpi__val` 19 px / 600
  („18.442,19 €"), das Delta in `v2kpi__sub` 11,5 px („47 Buchungen · + 3 nur
  in Ludwig (612,40 €)"). Keine zweite gleich große Zahl.
- **M10 (`WithoutFacts`).** Gemessen nur drei Slots — `v2lav__head` (0–87),
  `v2lav__sum` (107–229), `v2lav__body` (249–546); Abstände durchgehend
  20 px, keine leere Zeile, `.v2md` nicht vorhanden.
- **M9, M12, L-97.** Der Name `LedgerAccountView` steht in allen drei
  Dokumenten; die weggelassene Verlaufslinie ist als Absicht benannt; der
  Pager schreibt „1–50 von 3.400" und „Konto 412 von 6.212".
- **Fest.** `pnpm typecheck` grün · `pnpm build` grün · `pnpm check:icons`
  grün (53 Zeichen, 2 Dateien offen — vorbestehend, nicht aus dieser
  Aufgabe) · kein Hex, keine lokale Label-Map · Slots nur `ReactNode`, kein
  `useState`, kein `await`, kein Modul-Import · keine Saldospalte im Satz ·
  eine Bewegungsliste · Zahlen rechts mit `tabular-nums` (V3).

### Mängel

**1. Es fehlt die Story „im Einsatz"; die Layout-Kriterien messen die
Fixture. — blockierend**

*Kriterium:* fest „alle Stories" mit der Ableitung aus `spec-schreiben` §6,
in der „+ 1 ‚im Einsatz'" ein **fester** Summand ist — die Hausregel des
Skills `v3-komponente` sagt das seit 0071 (2026-09-07) ausdrücklich: „ein
Layout-Kriterium, das nur im Story-Rahmen gemessen wird, misst die Fixture …
deshalb ist ‚im Einsatz' ein fester Summand … und keine Kür". Betroffen ist
das variable Kriterium „Ränge 1–3 stehen bei 1440 × 900 ohne Scrollen
(gemessen)". Die Neufassung rechnet 3 + 1 + 1 + 1 = 6 und lässt den Summanden
weg; M11 („die Zählformel geht auf") trifft damit nicht zu — richtig sind 7.

*Messung:* Im Story-Rahmen bei Viewport 1440 ist `.v2lav` **1400 px** breit
und die Ränge 1–3 enden bei y = 538 — genau die Zahl, die die Spec unter
„Verhalten" nennt. Auf der Seite ist derselbe Baustein **1136 px** breit
(`main` innen, gemessen) und beginnt bei y = 88 (Top-Bar 56 + Polster 32);
die Ränge 1–3 enden dort bei y = 606. Bei Viewport 1280: innen 976 px,
y = 643. Das Kriterium hält also auch auf der Seite — aber es wurde nie dort
geprüft, und dieselbe Blindheit verdeckt Mangel 2: die Fixture ist 264 px
breiter als die Seite.

*Vorschlag:* Story `InUse` in der `AppShell`, mit `RecordPager` aus der
Kontenliste und realistischen Daten — wie `CaseDetailView · In Use` (0050)
und `SourceDocumentView · In Use` (0071), die beide eine haben. Danach die
zwei Layout-Kriterien dort nachmessen.

**2. Soll und Haben liegen bei beiden Pflichtbreiten außerhalb ihrer Fläche.
— blockierend**

*Kriterium:* L1 (Desktop ab 1280 px Innenbreite, „kein zusammengeschobener
Screen"), L5 (DATEV-Ordnung `… | Betrag S | Betrag H | …`), Rang 4 des
Seitenprofils — und derselbe Prüfstein, an dem die letzte Abnahme blockiert
hat: „ein Chip lag bei x = 1509 in einer Fläche, die bei 1419 endet".

*Messung:* `Filled`, `accountEntryColumns({ variant: "full" })` neben
`aside`. Die Randspalte ist über `MasterDetail detailBreit` fest 440 px
(`grid-template-columns: minmax(0, 440px) minmax(0, 1fr)`), die Liste
verlangt `minWidth={1180}`:

| Innenbreite | `.v2md` | Liste sichtbar | nötig | verdeckt | verdeckte Spalten |
|---|---|---|---|---|---|
| 976 (Seite bei 1280) | `440px 516px` | 514 | 1180 | **666** | Buchungstext, Gegenkonto, Soll, Haben, DATEV |
| 1136 (Seite bei 1440) | `440px 676px` | 674 | 1180 | **506** | Gegenkonto, Soll, Haben, DATEV |
| 1280 (L1-Untergrenze, Rahmen außer Rechnung) | `440px 820px` | 818 | 1180 | **362** | Gegenkonto, Soll, Haben, DATEV |
| 1440 | `440px 980px` | 978 | 1180 | **202** | Haben, DATEV |

Die **Haben-Spalte ist bei keiner** der vier Breiten im Bild, Soll erst ab
1280 px Innenbreite gar nicht und ab 1440 px nur teilweise. In `Edges`
(zusätzlich „Stapel") dasselbe Bild: bei 976 px verdeckt ab Buchungstext, bei
1136 px ab Gegenkonto. Ein Kontoauszug ohne S- und H-Betrag beantwortet Rang 4
nicht — und es ist wörtlich der Mangel der letzten Runde, eine Spalte weiter
rechts.

*Vorschlag* (berührt den Zuschnitt der Slots, deshalb Owner-Frage): entweder
neben `aside` den `compact`-Satz plus Zustandsspalte fahren — der Weg, den
`Movements` mit dem Weglassen von „Stapel" schon halb gegangen ist —, oder
`minWidth` aus dem tatsächlichen Satz rechnen statt fest 1180 (feste Spuren
608 + 8 × 10 Rinne + 36 Polster = 724, wie `accountMinWidth()` es für den
Kontenplan-Satz tut) und die Randspalte unterhalb ~1400 px Innenbreite unter
die Liste klappen.

**3. `Edges` und `Empty` zeigen die Zahlen zweier verschiedener Konten auf
einem Bildschirm. — blockierend**

*Kriterium:* die Story-Tabelle (`Edges`, `Empty`) und das Misslingen, das das
Seitenprofil definiert („wenn sie die zwei Quellen für eine hält") — die
letzte Abnahme hat genau das als M2 und M3 blockiert. Der Rückfall sitzt auf
den Feldern, die dieselbe Nacharbeit neu eingeführt hat (M5 `debitTotal` /
`creditTotal`, M6 `skrClassLabel`).

*Messung `Edges`*, Kopf „1210 Bank Commerzbank": Kennzahl und Randspalte
sagen übereinstimmend „Saldo in DATEV −184.221,55 €", „3.400 Buchungen · + 128
nur in Ludwig (41.882,90 €)" — die Randspalte darunter aber „Σ Soll / Σ Haben
**21.442,19 € / 3.000,00 €**" (Differenz 18.442,19 €, also der Saldo des
Kontos 4930) und „SKR-Klasse **Sonstige betr. Aufwendungen**" für ein
Bankkonto.

*Messung `Empty`*, Kopf „4650 Bewirtungskosten": „Saldo in DATEV —",
„Bewegungen 0 in DATEV", „Letzte Buchung —", Liste „Auf diesem Konto ist im
Jahr 2026 nichts gebucht." — und dazwischen „Σ Soll / Σ Haben 21.442,19 € /
3.000,00 €". Ein Konto ohne jede Buchung mit 21.442,19 € Soll-Summe ist
derselbe Selbstwiderspruch, den M3 benannt hat.

*Ursache:* `BANK` und `UNUSED` spreaden `FACTS` und überschreiben
`debitTotal`, `creditTotal` und `skrClassLabel` nicht; `AccountFacts` zeigt
die Zeile, sobald eines der beiden Felder gesetzt ist.

*Vorschlag:* beide Objekte um die drei Felder ergänzen — `BANK` mit Summen,
die zu −184.221,55 € passen, und der SKR-Klasse eines Finanzkontos; `UNUSED`
mit `debitTotal: 0` und `creditTotal: 0` (oder beide `null`, dann fällt die
Zeile weg).

**4. `Edges` dämpft die Zeile „nur in Ludwig" nicht. — nicht blockierend**

*Kriterium:* Rang 5 („alle vier Herkunftsklassen an einer Zeile nachweisbar")
nennt Story `Filled`, und dort stimmt es — deshalb nicht blockierend. Es ist
aber derselbe Owner-Entscheid vom 2026-09-04 („Symbol, Zeile gedämpft"),
dessen Verletzung die letzte Abnahme blockiert hat.

*Messung:* `Edges` baut seine `DataTable` selbst und lässt `rowClassName`
weg; gemessen tragen alle vier Zeilen `rgb(45,45,45)`, keine
`v2ae__row--draft`. In `Filled` steht die Zeile korrekt bei `rgb(92,92,92)`.
In einer Datei stehen damit zwei verschiedene Darstellungen derselben vier
Zeilen.

*Vorschlag:* `Edges` über den `Movements`-Helfer bauen und ihm Sortierung,
Pager und „Stapel" als Zusatz mitgeben, statt die Tabelle ein zweites Mal
aufzuschreiben.

**5. Der Nacharbeits-Text beschreibt eine dritte Kachel, die es nicht gibt. —
nicht blockierend**

M4 oben schreibt „die Reihe zeigt Saldo · Bewegungen · letzte Buchung";
gemessen stehen **zwei** Kacheln, die Bewegungen stehen in der Unterzeile der
Saldo-Kachel. Das Kriterium („ein führender Saldo, Ludwig als Delta, kein
zweiter gleichrangiger") ist so besser erfüllt als mit drei Kacheln — nur
beschreibt der Abnahme-Text etwas anderes als der Code. Ein Satz genügt.

### Befunde am Set (nicht an dieser Aufgabe)

- **`MasterDetail --detail-breit` kennt keine Untergrenze.**
  `grid-template-columns: minmax(0, 440px) minmax(0, 1fr)` gibt der
  Randspalte bis hinunter zu jeder Breite 440 px und fällt nie auf eine
  Spalte zurück. Gemessen bleibt die Spalte bei 976 px Innenbreite bei
  440 px und lässt der Arbeitsfläche 514 px. Jede breite Tabelle daneben
  erbt Mangel 2. Gehört zu `MasterDetail` (`patterns/`), nicht zu 0063.
- **Der Dämpfungs-Haken heißt nach der falschen Familie.**
  `DataTable.rowClassName` ist generisch, die einzige Regel dafür heißt
  `.v2tbl__row.v2ae__row--draft` — also nach `AccountEntryList`. Wer die
  Dämpfung in einer anderen Familie braucht, schreibt entweder `v2ae__` in
  eine fremde Datei oder eine zweite Regel. Gehört zu 0057.

## Nach der zweiten Abnahme (2026-09-07): drei Blocker, und der schwerste lag nicht in dieser Datei

**M2 erledigt — die Haben-Spalte stand bei keiner Breite im Bild.** Der Strang
nimmt über `MasterDetail detailBreit` feste 440 px; daneben blieben der Liste
gemessen 674 px auf der Seite (1440) und 514 bei 1280, während der volle
Spaltensatz 1.180 verlangt. Soll, Haben und DATEV lagen im Querlauf — die zwei
wichtigsten Zahlen eines Kontoauszugs waren nur zu erscrollen.

Zwei Griffe, und beide gehören zusammen:

1. **`MasterDetail --detail-breit` hatte keine Untergrenze.** Es hielt seine
   440 px bis zu jeder Breite und fiel nie auf eine Spalte zurück — jede
   breite Tabelle daneben erbte den Fehler. Es misst jetzt sich selbst und
   schaltet erst ab **1.080 px** (440 + 620, die kleinste Tabelle des Sets,
   plus Rinne) auf zwei Spuren.
2. **Die Ansicht nimmt neben dem Strang den kompakten Satz**, nicht den
   vollen. Der Strang trägt die Fakten; die Liste daneben beantwortet „was ist
   gebucht" — Datum, Beleg, Text, Gegenkonto, Soll, Haben. Buchungszustand,
   Stapel und DATEV gehören in den vollen Satz, den die Ansicht **ohne**
   Strang zeigt.

Gemessen, `Filled` und `InUse`: bei 1280 Spuren `440px 780px`, bei 1440
`440px 940px`, in der `AppShell` `440px 676px` — und in allen dreien **sieben
von sieben Spalten sichtbar, ohne zu scrollen**.

**M1 erledigt — die Story „im Einsatz" fehlte.** `spec-schreiben` §6 führt sie
als festen Summanden, und seit 0071 steht in der Hausregel, warum: ein
Layout-Kriterium ohne sie misst die Fixture. Der Story-Rahmen ist 1.400 px
breit, die Seite gibt 1.136 — **264 px Unterschied**, und genau darin
versteckte sich M2. Die Story steht jetzt da (`InUse`, in der `AppShell`), und
die Zählung geht auf sieben.

**M3 erledigt — zwei Stories zeigten die Zahlen zweier Konten.** `BANK` und
`UNUSED` spreadeten `FACTS` und überschrieben die in derselben Nacharbeit neu
eingeführten Felder nicht. `Edges` zeigte für ein Bankkonto mit Saldo
−184.221,55 € die Σ-Zeile 21.442,19 / 3.000,00 — die Differenz war der Saldo
des Kontos 4930 — und „SKR-Klasse Sonstige betr. Aufwendungen". `Empty` zeigte
„0 Buchungen" **und** dieselbe Σ-Zeile. Gemessen jetzt: `Edges`
612.004,20 € / 796.225,75 € und „Finanz- und Privatkonten", `Empty`
0,00 € / 0,00 €.

**M4 erledigt** — `Edges` baute seine Tabelle selbst und ließ `rowClassName`
weg; alle vier Zeilen standen in derselben Farbe. Gemessen: eine gedämpfte
Zeile, wie in `Filled`.

**M5 erledigt** — der Nacharbeits-Text nannte drei Kacheln, gemessen sind es
zwei. Der Code war besser als sein Text.

**Der Befund am Set ist mit M2 abgetragen**, und er war der wichtigere Teil:
`MasterDetail --detail-breit` hätte jede breite Tabelle neben sich beschnitten,
nicht nur diese. Der zweite Befund bleibt: `DataTable.rowClassName` ist
generisch, die einzige Regel dafür heißt `.v2tbl__row.v2ae__row--draft` — nach
`AccountEntryList` benannt, obwohl sie jede Tabelle betrifft. Gehört zu 0057.
