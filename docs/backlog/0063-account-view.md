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
`pager` und `tabs`) + 1 Slot-Wechsel (anderer Reiter) + 1 Rand + 1 „im
Einsatz" (`InUse`, in der `AppShell` — der einzige Ort, an dem die Breite
stimmt) = **7**. *(Die Rechnung sagte bis 2026-09-07 „= 6" und kannte `InUse`
nicht, obwohl Code und Registry sieben führen — berichtigt in der vierten
Runde, M2.)*

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

## Nachtrag (2026-09-07): die Untergrenze ist parametrisch geworden

Die feste Schwelle von 1.080 px aus der Nacharbeit oben hat prompt die
Nachbar-Ansicht gebrochen: `CaseDetailView` (0050) kippte bei 1280 px
Fensterbreite in die Einspaltigkeit, obwohl seine Fakten bei 484 px lesbar
sind. `MasterDetail` nimmt die Schwelle jetzt als `minDetail` entgegen —
Vorgabe 620, die kleinste Tabelle des Sets, also der Wert, den **diese**
Ansicht braucht; 0050 gibt 484.

Für diese Aufgabe ändert sich am Ergebnis nichts: gemessen in der `AppShell`
steht die Liste bei 1280 untereinander (volle 976 px, sieben von sieben
Spalten sichtbar) und bei 1440 nebeneinander (440 / 676, ebenfalls sieben von
sieben).

## Wiederabnahme 2026-09-07 (dritte Runde, fremde Abnahme)

**Urteil: zurück.** Die drei Blocker der zweiten Runde sind behoben und in der
Wirkung nachgemessen — die Haben-Spalte steht bei jeder gemessenen Breite im
Bild, die Story „im Einsatz" existiert, und die zwei Stories nennen wieder die
Zahlen ihres eigenen Kontos. Blockierend sind zwei andere Punkte, beide aus
der Nacharbeit selbst: die neue Story `InUse` lässt **Rang 3** weg — womit das
Layout-Kriterium weiter nur die Fixture misst —, und die Rand-Story zeigt eine
**Kontoart, die es im Bestand nicht gibt**. Der dritte Punkt, den diese
Abnahme gesucht und gefunden hat, ist die Nebenwirkung des Griffs an
`MasterDetail` auf `CaseDetailView`; er ist während der Abnahme mit `01ebb7c`
gefallen und unten trotzdem protokolliert, weil er aus dieser Aufgabe kam.

Der Rahmen selbst (`LedgerAccountView.tsx`) bleibt wie in den zwei Runden
zuvor unangetastet.

Gemessen am laufenden Dev-Server `http://localhost:6107` (Quelle, nicht
`storybook-static`), CDP über Playwright, `getBoundingClientRect` und
`getComputedStyle` am gerenderten Bild, Fenster 1280 und 1440 × 900, Stand
`ed6e79a`. Während der Abnahme lag eine **fremde, ungestagte** Änderung an
`MasterDetail` im Baum; sie ist unten getrennt vermerkt und, wo sie die Zahlen
ändert, eigens gemessen.

### Behoben, gemessen

- **M2 (Spaltensatz).** `Filled` bei 1280: `.v2md` `440px 780px`, sichtbare
  Fläche 481–1259, **7 von 7** Spalten (Datum · Zeichen · Beleg ·
  Buchungstext · Gegenkonto · Soll · Haben), `scrollWidth − clientWidth = 0`.
  Bei 1440: `440px 940px`, Fläche 481–1419, 7/7. `InUse` bei 1440: `.v2lav`
  1136 px, `.v2md` `440px 676px`, Fläche 733–1407, 7/7, kein Querlauf.
  `Edges` bei beiden Breiten 7/7, `WithoutFacts` 1238 bzw. 1398 px Fläche,
  7/7. Die Haben-Spalte steht überall im Bild.
- **M1 (Story im Einsatz).** `InUse` in der `AppShell` ist da; `.v2lav` misst
  976 px (Fenster 1280) und 1136 px (1440) — die Breite der Seite, nicht die
  1.400 der Fixture. Sieben Story-Exporte, die Zählung geht auf.
  Einschränkung: Mangel 2.
- **M3 (zwei Konten auf einem Bildschirm).** `Edges`, Kopf „1210 Bank
  Commerzbank": Saldo in DATEV −184.221,55 €, Σ Soll / Σ Haben 612.004,20 € /
  796.225,75 € (Differenz 184.221,55 €, also der Saldo dieses Kontos),
  SKR-Klasse „Finanz- und Privatkonten"; Kennzahl und Randspalte nennen
  denselben Saldo. `Empty`, Kopf „4650 Bewirtungskosten": Saldo „—",
  „0 Buchungen im Spiegel", Σ Soll / Σ Haben 0,00 € / 0,00 €, letzte Buchung
  „—", Liste „Auf diesem Konto ist im Jahr 2026 nichts gebucht." Kein
  Selbstwiderspruch mehr.
- **M4 (gedämpfte Zeile in `Edges`).** Zeile „Schreibwaren Süd" trägt
  `v2tbl__row v2ae__row--draft` und `rgb(92,92,92)`, die drei anderen
  `rgb(45,45,45)` — dasselbe Bild wie in `Filled`.
- **Rang 5, vier Klassen** (`Filled`, 1280 **und** 1440): `datev` kein
  Zeichen · `mirrored` Zeichen · `exported` Zeichen + Chip „Exportiert"
  (x 820,8–893 bei 1280, 897,1–969,3 bei 1440; sichtbare Fläche 481–1259 bzw.
  481–1419) · `ludwig` Zeichen + gedämpfte Zeile. Vier unterscheidbare
  Klassen, alles im Bild.
- **Rang 2.** Eine führende Zahl: `v2kpi__val` 19 px / 600 („18.442,19 €"),
  das Delta in `v2kpi__sub` 11,5 px („47 Buchungen · + 3 nur in Ludwig
  (612,40 €)"). Die zweite Kachel trägt ein Datum, keine zweite Zahl.
- **Rang 3.** 12 Balken und 12 Achsenmarken — das ganze Jahr.
- **`WithoutFacts`.** Kein `.v2md`; drei Slots: `v2lav__head` 20–106,6 ·
  `v2lav__sum` 126,6–249 · `v2lav__body` 269–563,5, Abstände durchgehend
  20 px, keine leere Zeile.
- **Fest.** `pnpm typecheck` grün · `pnpm build` grün · `pnpm check:icons`
  grün (53 Zeichen, 2 Dateien offen — vorbestehend) · Slots nur `ReactNode` ·
  kein `useState`, kein `await`, kein Modul-Import, kein Hex · keine
  Saldospalte im Satz · **eine** Bewegungsliste · Barrel `index.ts:415`.

### Mängel

**1. Die Untergrenze an `MasterDetail` kippte `CaseDetailView` zwischen 1280
und rund 1.416 px Fensterbreite. — während der Abnahme behoben (`01ebb7c`),
darum nicht mehr blockierend; hier festgehalten, weil er aus dieser Aufgabe
kam**

*Kriterium:* Eine Änderung am Set darf nichts umwerfen, das stand; 0050
„Verhalten" verlangt zweispaltig, sobald `aside` gesetzt ist, und seine
Entscheidung 2 verlangt ausdrücklich **keine** Schwelle im Baustein. Die
Nacharbeit hat eine feste Schwelle (Container-Abfrage, 1.080 px) aus dem
Bedarf **dieser** Aufgabe in einen Baustein geschrieben, den 0050 mitbenutzt.

*Messung:* `CaseDetailView · In Use` in der `AppShell`, Stand `ed6e79a`, gegen
dieselbe Story mit der Regel von vor `ed6e79a` (per injiziertem Stylesheet
zurückgesetzt), × 900:

| Fenster | Inhaltsbreite | jetzt | vorher | Unterkante jetzt / vorher |
|---|---|---|---|---|
| 1280 | 944 | **eine Spalte** 944 | 440 / 484 | 1059,6 / 836,8 |
| 1320 | 984 | **eine Spalte** 984 | 440 / 524 | 1059,6 / 815,9 |
| 1384 | 1048 | **eine Spalte** 1048 | 440 / 588 | 1038,6 / 815,9 |
| 1440 | 1104 | 440 / 644 | 440 / 644 | 795 / 795 |

Wirkung bei 1280: der Strang steht 944 px breit **über** den Fakten, die
Fakten-Karte beginnt bei y = 728,6, und die Seite scrollt, wo sie vorher auf
900 px Höhe hineinpasste. Die Wiederabnahme von 0050 hat denselben Befund
unabhängig gemessen und blockiert daran.

*Erledigt, gemessen:* Während dieser Abnahme ist `01ebb7c` gelandet — die
Schwelle gehört jetzt dem Aufrufer (Flex-Sockel `--v2md-min`, Prop
`minDetail`, Vorgabe 620; `CaseDetailView` gibt 484, weil rechts Fakten
stehen und keine Tabelle). An diesem Stand nachgemessen steht
`CaseDetailView · In Use` bei 1280 wieder auf 440 / 484 (Unterkante 836,8)
und bei 1440 auf 440 / 644; 0063 misst unverändert 7/7 Spalten in `Filled`,
`Edges` und `InUse` (1440: `440px 676px`, Fläche 733–1407, kein Querlauf).
Der Griff dieser Aufgabe war also richtig gedacht und an der falschen Stelle
festgeschrieben: eine Zahl aus 0063 in einem Baustein, den 0050 mitbenutzt.
Was bleibt, ist Mangel 4 — die Reihenfolge beim Umbruch.

**2. `InUse` lässt Rang 3 weg; das Layout-Kriterium misst weiter die Fixture.
— blockierend**

*Kriterium:* „Ränge 1–3 stehen bei 1440 × 900 ohne Scrollen (gemessen)" —
zusammen mit der Hausregel, die die letzte Runde durchgesetzt hat: ein
Layout-Kriterium, das nur im Story-Rahmen gemessen wird, misst die Fixture.

*Messung:* In `InUse` gibt es bei beiden Breiten **kein** `.v2lav__chart`. Die
Slots dort (1440): `pager` 88–116 · `head` 136–222,6 · `sum` 242,6–365 ·
`tabs` 385–427,9. Rang 3 kommt in der einzigen Story mit Seitenbreite also gar
nicht vor; nachweisbar ist er weiter nur im Story-Rahmen (`Filled` bei 1440:
`chart` 317–537,5). Die Story wurde angelegt, um genau diese Blindheit zu
beenden, und trägt das Element nicht, um das es geht.

*Vorschlag:* dieselbe `Card` mit `BarChart` wie in `Filled` auch in `InUse`,
danach die zwei Layout-Kriterien dort nachmessen.

**3. `Edges` zeigt eine Kontoart, die der Bestand nicht kennt. — blockierend**

*Kriterium:* fest „keine lokale Label-Map" — das Wort auf der Marke kommt aus
der Status-Registry — und die Story-Tabelle (`Edges` ist das Bankkonto).

*Messung:* `BANK` setzt seit `ed6e79a` `role: "bank"`. Die Achse `konto_typ`
(`client_ledger_accounts.accounting_role`, `ACCOUNT_TYPES` in
`modules/accounts/domain/account.ts`) kennt nur `general_ledger`, `creditor`,
`debtor`, `revenue`, `other`; `resolveStatus` fällt auf den Rohwert zurück.
In `Edges` steht darum zweimal **„bank"**: als Marke neben „1210 Bank
Commerzbank" im Kopf und als Wert der Zeile „Kontoart" in der Randspalte —
ein englischer Rohschlüssel in deutscher Oberfläche und ein Wert, den es nicht
gibt. `AccountFactsVM.role` ist `string`, deshalb greift der typecheck nicht.

*Vorschlag:* `role: "general_ledger"` — ein Bankkonto ist im Kontenplan ein
Sachkonto; die SKR-Klasse „Finanz- und Privatkonten" sagt bereits, was es ist.
Fehlt die Rolle im Bestand wirklich, ist das ein Befund an `ludwig/app`, kein
erfundener Wert in einer Story.

**4. Beim Umbruch steht die Randspalte über der Arbeitsfläche. — nicht
blockierend**

*Kriterium:* Zweifel 4 des Seitenprofils, den der Rahmen in seinem eigenen
Kommentar zitiert („ein Block Feldzeilen über den Bewegungen schiebt die
Antwort unter die Falz").

*Messung:* `InUse` bei 1280 (Inhaltsbreite 976, eine Spalte): `AccountFacts`
485,1–702,7 · Karte „Bewegungen" ab 722,7 · Spaltenköpfe 794–832,4 · erste
Zeile 832,4–879,5, zweite 879,5–925,4. Auf 900 px Höhe bleibt **eine** Zeile
des Kontoauszugs — unter `ed6e79a` wie unter `01ebb7c` dieselben Werte. Bei
976 px passen 440 + 620 nicht nebeneinander, der Umbruch
ist also richtig — falsch ist nur die Reihenfolge.

*Vorschlag:* gehört zu `MasterDetail`: beim Umbruch die Arbeitsfläche zuerst
(Detail vor Liste im DOM, `order` für den Nebeneinander-Fall). 0050 hat
dasselbe Bild seitenverkehrt und wird davon mitgetragen.

**5. Der volle Spaltensatz kommt in keiner Story dieser Aufgabe mehr vor. —
nicht blockierend**

*Kriterium:* die Slot-Tabelle („`children` … `accountEntryColumns({ variant:
"full" })`") und der Satz der Nacharbeit: „Buchungszustand, Stapel und DATEV
gehören in den vollen Satz, den die Ansicht **ohne** Strang zeigt."

*Messung:* `grep 'variant: "full"'` trifft im ganzen Set nur noch
`AccountEntries.stories.tsx` (0067). Auch `WithoutFacts` — die Story **ohne**
Strang — fährt `compact` (7 Spalten, Fläche 1238 px bei 1280 und 1398 px bei
1440, also Platz für mehr). Der Satz beschreibt damit etwas, das keine Story
zeigt, und die Slot-Tabelle nennt weiter `full`.

*Vorschlag:* eins von beidem — `WithoutFacts` den vollen Satz geben, oder Satz
und Slot-Zeile auf `compact` umschreiben. Nicht beides offen lassen.

### Befunde am Set (nicht an dieser Aufgabe)

- **`MasterDetail`, feste Schwelle.** Siehe Mängel 1 und 4. Die 1.080 px waren
  eine Zahl aus 0063 in einem Baustein, den 0050 mitbenutzt; `01ebb7c` gibt
  sie dem Aufrufer zurück (`minDetail`). Der Nachweis dafür gehört zu 0050,
  nicht hierher — dort blockiert derselbe Befund als M4.
- **`MasterDetail`, `style` im `detailBreit`-Zweig** (Stand `ed6e79a`): der
  Stil landete am neuen Wrapper `.v2mdw` statt am Raster `.v2md`, während der
  andere Zweig ihn weiter am Raster setzt. Heute folgenlos — beide Aufrufer
  geben kein `style` —, aber ein stiller Unterschied zwischen zwei Zweigen
  desselben Bausteins. Mit `01ebb7c` ist der Wrapper wieder weg.
- **`DataTable.rowClassName` heißt nach der falschen Familie.** Unverändert
  aus der letzten Runde: die einzige Regel ist
  `.v2tbl__row.v2ae__row--draft` (`v3.css:2732`). Gehört zu 0057.
- **Alter Name in zwei fremden Dateien.** `0066-account-cell-facts.md` und
  `0067-account-entries.md` verlinken 0063 weiter als `AccountView`.

Abgenommen von / am: Claude (fremde Abnahme, hat nicht gebaut), 2026-09-07 ·
**Urteil: zurück** — die Mängel **2 und 3 blockieren**; 1 ist während der
Abnahme gefallen (`01ebb7c`), 4 und 5 blockieren nicht.

## Nach der dritten Abnahme (2026-09-07): zwei Blocker, beide in den Stories

**M2 erledigt — `InUse` ließ Rang 3 weg.** Die Story, die es überhaupt erst
möglich macht, das Höhen-Kriterium an der richtigen Stelle zu messen, zeigte
den Verlauf nicht; damit war „Ränge 1–3 bei 1440 × 900 ohne Scrollen" weiter
nur im Story-Rahmen belegbar — genau die Blindheit, gegen die die Story
angelegt wurde. Das Diagramm ist jetzt ein gemeinsamer Baustein (`Chart`), den
`Filled` **und** `InUse` rendern. Gemessen in der `AppShell` bei 1440 × 900:
Verlauf von y = 385 bis 606, Dokumenthöhe 900 — **kein Scrollen**.

**M3 erledigt — `Edges` zeigte eine Kontoart, die es nicht gibt.** Die Fixture
setzte `role: "bank"`; die Achse `konto_typ` kennt nur `general_ledger`,
`creditor`, `debtor`, `revenue` und `other`, also fiel `resolveStatus` auf den
Rohwert zurück und im Bild stand zweimal das englische „bank". Dass `role`
als `string` typisiert ist, ließ es durch den Typecheck. Jetzt
`general_ledger`; gemessen: **null** Rohwerte, „Kontoart · Sachkonto". Die
Kontoart eines Bankkontos steht in der SKR-Klasse daneben.

**Mangel 1 der Abnahme hat sich während der Abnahme erledigt:** die feste
1.080-px-Schwelle, die aus dieser Aufgabe kam, hat `CaseDetailView` gekippt —
behoben mit `01ebb7c`, seitdem gehört die Schwelle dem Aufrufer (`minDetail`).
Der Nachweis steht in 0050.

**Zwei Punkte bleiben, beide mit Adresse:**

- **Beim Umbruch steht die Randspalte über der Arbeitsfläche** (bei 1280 in
  der `AppShell`: Fakten 485–703, Liste ab 723). Der Umbruch ist richtig, die
  **Reihenfolge** nicht — wer die Bewegungen sucht, scrollt erst an den Fakten
  vorbei. Das gehört `MasterDetail`: dort entscheidet sich, welche Hälfte im
  Umbruch oben steht.
- **Der volle Spaltensatz kommt in keiner Story mehr vor.** Die Slot-Tabelle
  behauptet ihn für „ohne Strang", `WithoutFacts` fährt aber ebenfalls
  `compact`. Entweder bekommt `WithoutFacts` den vollen Satz — dort ist Platz
  dafür —, oder die Tabelle sagt, dass es ihn in dieser Ansicht nicht gibt.

## Wiederabnahme 2026-09-07 (vierte Runde, fremde Abnahme)

**Urteil: zurück.** Die zwei Blocker der dritten Runde sind behoben und in der
Wirkung nachgemessen: `InUse` rendert den Verlauf, und `Edges` zeigt keine
Kontoart mehr, die es nicht gibt. Auch der Umbruch stimmt jetzt — bei 1280
steht die Arbeitsfläche oben. Blockierend ist **ein** Punkt, und er ist die
nächste Schicht desselben Fehlers, an dem die zweite Runde blockiert hat: bei
1440 sind zwar sieben von sieben Spalten im Bild, aber `Buchungstext` und
`Gegenkonto` tragen dort nichts mehr. Die zweite Runde hat gemessen, ob die
Spalten **existieren**; diese misst, ob sie etwas **sagen**.

Der Rahmen selbst (`LedgerAccountView.tsx`) bleibt wie in den drei Runden
zuvor unangetastet — 78 Zeilen, sieben `ReactNode`-Slots, zwei Importe.

Gemessen am laufenden Dev-Server `http://localhost:6107` (Quelle, nicht
`storybook-static`), CDP über ein eigenes Blatt, `getBoundingClientRect`,
`getComputedStyle` und `Range` am gerenderten Bild, Fenster 1280 und
1440 × 900 sowie ein 1-px-Schwenk um die Kippkante, Stand `be96a56`, Baum
sauber. **Gegenprobe, dass der Messwert reagiert:** `--v2md-min` zur Laufzeit
auf 900 px gesetzt — dieselbe Ansicht, dasselbe Fenster (1440) — schlägt von
`440 / 676` auf eine umgebrochene Fläche von 1134 px um, und die Spur
`Buchungstext` springt von 98,4 auf 371 px. Die Zahlen unten sind also
gemessen, nicht zurückgelesen.

### Behoben, gemessen

- **M2 (Rang 3 in `InUse`).** Der Verlauf ist ein gemeinsamer Baustein
  (`Chart`), den `Filled` und `InUse` rendern. In der `AppShell` gemessen:
  12 Balken Soll, 12 Balken Haben, 12 Achsenmarken bei **beiden** Breiten.
  Slots bei 1440: `pager` 88–116 · `head` 136–222,6 · `sum` 242,6–365 ·
  `chart` **385–605,5** · `tabs` 625,5–668,5. Die Ränge 1–3 enden bei
  y = 605,5, die Seite ist bis y = 900 sichtbar — **kein Scrollen**. Bei 1280:
  `chart` 422,2–642,7, ebenfalls ohne Scrollen. Kein Querlauf
  (`scrollWidth − clientWidth = 0` an `.app__main`).
- **M3 (Kontoart im Bestand).** `BANK` setzt `role: "general_ledger"`.
  Gemessen in `Edges`: Marke im Kopf „Sachkonto", Randspalte „Kontoart ·
  Sachkonto", SKR-Klasse „Finanz- und Privatkonten". Ein Textknoten-Schwenk
  über die ganze Seite nach den Rohschlüsseln der Achse (`general_ledger`,
  `creditor`, `debtor`, `revenue`, `other`, `bank`, `datev`, `ludwig`,
  `mirrored`, `exported`, `proposed`) findet in `InUse` und `Edges` bei beiden
  Breiten **null** Rohwerte; die Treffer sind sämtlich deutsche Oberfläche
  („Saldo in DATEV 2026", „+ 3 nur in Ludwig", der Sidebar-Eintrag „Bank").
- **Umbruch-Reihenfolge (Mangel 4 der dritten Runde).** Mit `04ae1ad` dreht
  `flex-wrap: wrap-reverse` die Zeilenfolge. Gemessen `InUse` bei 1280:
  Arbeitsfläche (`.v2md__detail`, die Bewegungen) `top` **725,7**,
  Randspalte (`.v2md__list`, die Fakten) `top` **1040,2** — die Bewegungen
  stehen oben. Bei 1440 nebeneinander, beide bündig bei `top` 688,5.
- **`minDetail`.** Die Ansicht gibt keine Prop, gemessen ist `--v2md-min` an
  `.v2md` **unset**, es gilt also der Sockel des Stylesheets (620). Die
  Kippkante liegt damit rechnerisch bei 440 + 620 + 20 = 1.080 px Inhalt; im
  1-px-Schwenk gemessen kippt sie bei Fenster **1383 → 1384** (Inhalt
  1079 → 1080). Die Formel trifft.
- **Rang 5, vier Klassen** — in `InUse` bei 1440 an einer Zeile nachweisbar:
  `datev` kein Zeichen, kein Chip, `rgb(45,45,45)` · `mirrored` Zeichen ·
  `exported` Zeichen + Chip „Exportiert" · `ludwig` Zeichen +
  `v2ae__row--draft`, `rgb(92,92,92)`. Dasselbe Bild in `Edges`.
- **Rang 2.** Eine führende Zahl: `v2kpi__val` 19 px / 600, das Delta in
  `v2kpi__sub` 11,5 px („47 Buchungen · + 3 nur in Ludwig (612,40 €)"). Die
  zweite Kachel trägt ein Datum.
- **Ein Konto je Bildschirm.** `Edges`: Kennzahl −184.221,55 €, Randspalte
  derselbe Saldo, Σ Soll / Σ Haben 612.004,20 € / 796.225,75 € (Differenz
  184.221,55 €), Tabellenpager „1–50 von 3.400". `Empty`: „Saldo in DATEV —",
  „0 Buchungen im Spiegel", Σ 0,00 € / 0,00 €, „Letzte Buchung —", Liste
  „Auf diesem Konto ist im Jahr 2026 nichts gebucht." Kein Haken, kein Grün.
- **`WithoutFacts`.** Kein `.v2md`; drei Slots — `head` 20–106,6 · `sum`
  126,6–249 · `body` 269–563,5, Abstände durchgehend 20 px, keine leere Zeile.
- **Fest.** `pnpm typecheck` **Exit 0** · `pnpm build` **Exit 0** (am
  Exit-Code geprüft, nicht an der letzten Zeile — die trägt nur die
  Rolldown-Zeitmessung) · `pnpm check:icons` Exit 0 (53 Zeichen, 2 Dateien
  offen — vorbestehend) · `pnpm check:contrast` Exit 0 (11 Angaben
  nachgerechnet) · Slots nur `ReactNode`, kein `useState`, kein `await`, kein
  Modul-Import, kein Hex · keine Saldospalte im Satz · **eine** Bewegungsliste
  je Story · Barrel `index.ts:415`.

### Mängel

**1. Bei 1440 sind die sieben Spalten im Bild, aber `Buchungstext` und
`Gegenkonto` tragen nichts mehr. — blockierend**

*Kriterium:* der Auftrag („alles über ein Konto in einem Jahr"; „zeigt alle
Datenpunkte ab 20 % Füllgrad"), die Slot-Zeile `children` (Ränge 4 und 5) und
das offene App-Kriterium „ersetzt `accounts/[accountNumber]/page.tsx` samt
beider Auszugstabellen" — dazu L1 („kein zusammengeschobener Screen"). Und der
Satz, den die Nacharbeit nach der zweiten Runde selbst geschrieben hat: „die
Liste daneben beantwortet ‚was ist gebucht' — Datum, Beleg, Text, Gegenkonto,
Soll, Haben." Gemessen beantworten „Text" und „Gegenkonto" das auf der Seite
nicht. Die Abnahme von 0116 hat denselben Punkt unabhängig gemessen und
ausdrücklich hierher gereicht („Das ist ein Punkt für 0063").

*Messung*, `InUse` in der `AppShell`, 1440 × 900, `.v2md` `440px 676px`,
7/7 Spalten im Bild, Querlauf 0 — und trotzdem:

| Spur | Breite | Zeile | sichtbar |
|---|---|---|---|
| `Buchungstext` | 98,4 px | „Bürobedarf Meier GmbH" (mit Chip „Exportiert", 72,2 px, `flex-shrink: 0`) | Textkasten **18,2 px** → **„Bü"**, 2 von 21 Zeichen |
| | | „Kaffeeröster Nord GmbH" | 14 von 22 |
| | | „Storno RE-4455" | 13 von 14 |
| | | „Schreibwaren Süd" | 13 von 16 |
| `Gegenkonto` | 67,6 px | „70001 Bürobedarf Meier GmbH" | **„70001 Bür"**, 9 von 27 Zeichen |

Der Name des Gegenkontos fehlt damit in **jeder** Zeile, die einen hat.

Schlimmer ist die Richtung. Ein Schwenk in 1-px-Schritten über die Kippkante,
alles in der `AppShell`:

| Fenster | Inhalt | Lage | Arbeitsfläche | Spur `Buchungstext` | Textkasten Zeile 1 |
|---|---|---|---|---|---|
| 1383 | 1079 | umgebrochen | 1079 | 337,2 | **156,1 — voller Text** |
| **1384** | 1080 | nebeneinander | 620 | 66,4 | **0 px — 0 von 21 Zeichen** |
| 1440 | 1136 | nebeneinander | 676 | 98,4 | 18,2 („Bü") |
| 1520 | 1216 | nebeneinander | 756 | 145,8 | 65,6 |
| 1600 | 1296 | nebeneinander | 836 | 193,2 | 113 |
| 1700 | 1396 | nebeneinander | 936 | 252,4 | 156,1 — voller Text |

**Ein Pixel mehr Fenster kostet den ganzen Buchungstext**, und zwischen 1384
und rund 1700 px wird der Kontoauszug mit wachsender Fensterbreite lesbarer,
statt es zu sein. Bei 1384 verdrängt der Chip „Exportiert" (72,2 px, schrumpft
nicht) den Text vollständig aus einer 66,4-px-Spur — im Bild steht dort nur
noch der Chip. Bei 1280, wo die Ansicht umbricht, ist dieselbe Zeile
vollständig lesbar (Spur 276,1 px, „Bürobedarf Meier GmbH", Gegenkonto 26 von
27 Zeichen). Die schmalere Pflichtbreite liefert also das bessere Bild als die
breitere.

Die Vorgabe 620 sichert, dass die Spalten **existieren** — genau das hat diese
Aufgabe nach der zweiten Runde gemessen und für erledigt erklärt. Sie sichert
nicht, dass sie tragen.

*Vorschlag* (kein Griff an `MasterDetail` nötig, der Baustein tut, was 0116
verlangt): `LedgerAccountView` gibt `minDetail` selbst — den Wert, den der
kompakte Satz braucht, um **lesbar** zu sein, nicht um vorhanden zu sein. Aus
dem Satz gerechnet: feste Spuren 84 + 24 + 96 + 104 + 104 = 412, sechs Rinnen
à 10 = 60, Polster 36 → 508; dazu ~300 für `Buchungstext` (Chip 72 + Rinne 8 +
~220 Text) und ~150 für `Gegenkonto` ≈ **960**. Gegenprobe gemessen: mit
`--v2md-min: 900px` bei Fenster 1440 bricht die Ansicht um, die Bewegungen
nehmen 1134 px, `Buchungstext` 371 px und `Gegenkonto` 255 px — alle vier
Zeilen vollständig, 7/7 Spalten, kein Querlauf. Zwei Alternativen, falls der
Zuschnitt anders ausfallen soll: die Fakten neben den Bewegungen auf der Seite
gar nicht führen (dann fällt die Frage weg), oder den Chip unterhalb einer
Spurbreite mitschrumpfen bzw. entfallen lassen — er ist Rang 5, das
Herkunfts-Zeichen zwei Spalten links beantwortet dieselbe Frage. Der Zuschnitt
gehört dem Owner, die Messung sagt nur: 620 ist zu wenig.

**2. Die Story-Tabelle der Neufassung zählt weiter sechs und kennt `InUse`
nicht. — nicht blockierend**

*Kriterium:* fest „alle Stories" mit der Ableitung nach §6, und der eigene
Satz der Nacharbeit nach der zweiten Runde („die Zählung geht auf sieben")
sowie M11 („die Zählformel geht auf").

*Messung:* Im Code stehen **sieben** Story-Exporte (`Filled`, `WithoutFacts`,
`OtherTab`, `Empty`, `LoadingAndError`, `Edges`, `InUse`) — in der Registry
des Dev-Servers ebenso sieben. Der Abschnitt „Stories" der Neufassung rechnet
unverändert „3 + 1 + 1 + 1 = **6**", und seine Tabelle hat sechs Zeilen;
`InUse` fehlt darin. Zwei Nacharbeits-Texte behaupten seither das Gegenteil.
Der Code ist richtig, die Spec hinkt nach — eine Zeile und eine Zahl.

**3. Der volle Spaltensatz kommt in keiner Story dieser Aufgabe vor. — nicht
blockierend, aber er stört mich**

Unverändert aus der dritten Runde: `grep 'variant: "full"'` trifft im ganzen
Set nur `AccountEntries.stories.tsx` (0067). Die Slot-Tabelle nennt weiter
`accountEntryColumns({ variant: "full" })`, und die Nacharbeit sagt, der volle
Satz gehöre in die Ansicht **ohne** Strang — `WithoutFacts` fährt aber
ebenfalls `compact`. Gemessen hat `WithoutFacts` bei 1440 eine sichtbare
Fläche von 1398 px mit Spuren von 527,4 px (`Buchungstext`) und 362,6 px
(`Gegenkonto`); für den vollen Satz wäre dort dreifach Platz.

Warum es mehr ist als Kosmetik: es ist derselbe Riss wie Mangel 1 — ein
Dokument beschreibt eine Anordnung, die niemand angesehen hat. Blockieren tut
es nicht; es ist mit einem Satz oder einer Story erledigt.

### Befunde am Set (nicht an dieser Aufgabe)

- **`DataTable.rowClassName` heißt nach der falschen Familie.** Unverändert:
  die einzige Regel ist `.v2tbl__row.v2ae__row--draft` (`v3.css:2740`), also
  nach `AccountEntryList` benannt, obwohl der Haken jede Tabelle betrifft.
  Gehört zu 0057.
- **Alter Name in zwei fremden Dateien.** `0066-account-cell-facts.md:10` und
  `0067-account-entries.md:10` verlinken 0063 weiter als `AccountView`.

Abgenommen von / am: Claude (fremde Abnahme, hat nicht gebaut), 2026-09-07 ·
**Urteil: zurück** — **Mangel 1 blockiert**; 2 und 3 blockieren nicht.

## Nach der vierten Abnahme (2026-09-07): sieben Spalten, von denen zwei nichts trugen

**Der Blocker erledigt — und er ist der lehrreichste dieser Aufgabe.** Die
sieben Spalten waren im Bild, kein Querlauf, alle Kriterien formal erfüllt.
Trotzdem stand in der Buchungstext-Spalte „B…" (2 von 21 Zeichen) und im
Gegenkonto „70001 Bür" (9 von 27): 98,4 px und 67,6 px Spurbreite bei 1440.
**Die Vorgabe 620 sichert, dass die Spalten existieren — nicht, dass sie
tragen.**

Am schärfsten zeigt es die Kippkante: bei **1383 px** Fenster war die Ansicht
umgebrochen und die Zeile vollständig lesbar, bei **1384** stand sie
nebeneinander und der Textkasten hatte **null Pixel** — der Zustands-Chip
verdrängte den Buchungstext ganz. Die schmalere Pflichtbreite lieferte das
bessere Bild als die breitere.

`LedgerAccountView` gibt jetzt `minDetail={960}` — gerechnet aus dem Satz:
feste Spuren, Rinnen, Polster, dazu Platz für Text und Gegenkonto. Gemessen in
der `AppShell`:

| Fenster | Lage | Arbeitsfläche | Buchungstext | Gegenkonto |
|---|---|---|---|---|
| 1280 | umgebrochen | 976 px | **276 px**, vollständig | **190 px**, 26 von 27 Zeichen |
| 1440 | umgebrochen | 1.136 px | **371 px**, vollständig | **255 px**, vollständig |
| 1920 | nebeneinander | 980 px | 279 px, vollständig | 191 px, vollständig |

*(Die Zeile für 1280 stand bis 2026-09-07 mit „190 / 104, beide vollständig"
da — um eine Spalte verschoben: 190 ist das Gegenkonto, 104 war Soll. Und das
Gegenkonto ist dort **nicht** vollständig: 189,9 px Kasten gegen 197,4 px
Bedarf. Berichtigt in der vierten Runde, M3; die Zeilen für 1440 und 1920
stimmten.)*

Neben dem Strang steht die Liste damit erst auf sehr breiten Schirmen — und
das ist die ehrliche Antwort: eine Tabelle mit sieben Spalten und zwei
Freitexten passt neben eine 440-px-Randspalte erst ab rund 1.756 px
Fensterbreite. Vorher stand sie dort **auch**, nur unlesbar.

**Die Abnahme hat den Wert gegengeprüft**, bevor sie ihn vorschlug: `--v2md-min`
zur Laufzeit auf 900 px gesetzt, gleiches Fenster → die Spur springt von 98,4
auf 371 px. Der Messwert reagiert.

**Nicht blockierend, erledigt:** die Story-Tabelle zählte weiter „= 6" und
kannte `InUse` nicht — es sind sieben.

**Nicht blockierend, bleibt:** der volle Spaltensatz kommt in keiner Story
dieser Aufgabe mehr vor. `WithoutFacts` hätte bei 1440 den Platz dafür
(1.398 px). Das ist derselbe Riss wie der Blocker, nur andersherum: ein
Dokument beschreibt eine Anordnung, die niemand angesehen hat. Es gehört in
dieselbe Runde wie die Slot-Tabelle.

## Wiederabnahme 2026-09-07 (fünfte Runde, fremde Abnahme)

**Urteil: zurück.** Der Blocker der vierten Runde ist behoben und in der
Wirkung nachgemessen: `minDetail={960}` trägt, die Umbruch-Reihenfolge stimmt
(erst die Arbeitsfläche, dann die Randspalte), und der Typtausch auf den
Spiegel hat weder eine Zahl noch das Bild verändert. Blockierend ist **ein**
Punkt, und er ist ein **fester**: die Begründung der 960 steht als
neunzeiliger **deutscher** Kommentar in einer bis dahin durchgängig englischen
Datei.

Gemessen am laufenden Dev-Server `http://localhost:6107` (Quelle, nicht
`storybook-static`), CDP über ein eigenes Blatt (eigene Kopie der Helfer,
`w5-*` im Scratchpad), `getBoundingClientRect`, `getComputedStyle` und `Range`
am gerenderten Bild. Fenster 1024, 1152, 1280, 1440, 1680, 1920 und ein
1-px-Schwenk 1720–1726, je × 900. Gemessen wurde **auf der Seite** (`InUse` in
der `AppShell`), die Fixture-Breiten nur zum Vergleich. Stand `cb63b05`.

**Gegenprobe, dass die Messung reagiert:** `--v2md-min` zur Laufzeit auf
620 px zurückgesetzt — dieselbe Story, dasselbe Fenster (`InUse`, 1440) —
kippt die Ansicht von umgebrochen (Arbeitsfläche 1.136 px) auf nebeneinander
(440/676), die Spur `Buchungstext` fällt von **371 auf 98,4 px** und der
Textkasten von 156,1 auf **18,2 px: 2 von 21 Zeichen**; die Spur `Gegenkonto`
von 255 auf 67,6 px bei 197,4 px Bedarf. Die Behauptung der Nacharbeit, bei
620 hätten Buchungstext und Gegenkonto nichts mehr getragen, ist damit
**belegt** — und die Zahlen unten sind gemessen, nicht zurückgelesen.

### Behoben, gemessen

- **Die Untergrenze trägt.** `InUse` in der `AppShell`, alle vier
  Pflichtbreiten, 7 von 7 Spalten, `scrollWidth − clientWidth = 0` an
  `.v2tbl__scroll`, `html`, `body`, `.app__main`, `.v2lav`, `.v2md` und
  `.v2md__detail`:

  | Fenster | Inhalt `.v2lav` | Lage | Arbeitsfläche | Spur Text / Gegenkonto | Zeile 1 |
  |---|---|---|---|---|---|
  | 1280 | 976 | umgebrochen | 976 | 276,1 / 189,9 | Text 21/21; Gegenkonto 189,9 von 197,4 |
  | 1440 | 1.136 | umgebrochen | 1.136 | 371,0 / 255,0 | beide vollständig |
  | 1680 | 1.376 | umgebrochen | 1.376 | 513,2 / 352,8 | beide vollständig |
  | 1920 | 1.440 (Deckel) | nebeneinander | 980 | 278,5 / 191,5 | Text vollständig; Gegenkonto 191,5 von 197,4 |

- **Die Kippkante trifft die Formel.** 1-px-Schwenk in der `AppShell`: bei
  Fenster 1723 (Inhalt 1.419) umgebrochen, bei **1724** (Inhalt **1.420**)
  nebeneinander — genau 440 + 960 + 20. Kein Absturz mehr wie 1383/1384 in der
  vierten Runde: der Buchungstext bleibt über die Kante hinweg bei 156,1 px
  vollständig (Spur 267,9 px), das Gegenkonto verliert 14,1 px (183,3 statt
  197,4). Die schmalere Breite liefert nicht mehr das bessere Bild.
- **Umbruch-Reihenfolge.** Umgebrochen steht die Arbeitsfläche oben: `InUse`
  bei 1280 `.v2md__detail` `top` **725,7**, `.v2md__list` `top` **1040,2**;
  bei 1440 `top` 688,5 / 1003,0; `Edges` bei 1440 `top` 379,9 / 743,4.
  Nebeneinander (1920) stehen beide bündig.
- **Nichts zerrissen.** `CaseDetailView · In Use` steht unverändert
  zweispaltig: 1280 `440/484`, 1440 `440/644`, `--v2md-min: 460px`. `.v2md` in
  `v3.css` ist seit `be96a56` unberührt; die 960 stehen am Aufrufer.
- **Der Überstand wird eingefangen.** Auch bei 1024 und 1152 px Fenster — weit
  unter der Pflichtbreite — läuft nichts über: `.v2md__detail` trägt
  `min-width: 0px`, der Querlauf bleibt in `.v2tbl__scroll` (dort ebenfalls 0
  gemessen), `html` und `body` scrollen nicht seitlich.
- **Typtausch, Σ Soll / Σ Haben.** Die Zeile steht erst, wenn eine der Summen
  etwas trägt — im Bild stimmt das und widerspricht nichts: `Filled`
  21.442,19 € / 3.000,00 € (Differenz 18.442,19 = `datevBalance`), `Edges`
  612.004,20 / 796.225,75 (Differenz −184.221,55 = `datevBalance`), `Empty`
  **keine Zeile** neben „Saldo in DATEV —“, „0 in DATEV“ und
  „Letzte Buchung —“. Kein Konto zeigt die Zahlen eines anderen. Der Drawer
  (0068, lädt keine Monatswerte) zeigt die Zeile gemessen ebenfalls nicht —
  genau der Fall, den die Regel meint.
- **Typtausch, die Anzahl passt zur Summe.** Die Paarung im Code stimmt:
  `ludwigOnlyCount` steht überall neben `ludwigOnlyAmount`
  (`Account.tsx:148–152, 174–180`, `LedgerAccountView.stories.tsx:198–202`);
  `ludwigEntryCount` (41) erscheint **nirgends** im Bild. Ein
  Textknoten-Schwenk über `Filled`, `Empty`, `Edges`, `InUse`, `Account` und
  `AccountDrawer` findet **null** Rohschlüssel der Achse `konto_typ`; im Kopf
  und in der Randspalte steht „Sachkonto“. Einschränkung: Mangel 4.
- **Rang 5, vier Klassen** — `InUse` bei 1280 und 1440 an einer Zeile:
  `datev` kein Zeichen / kein Chip / `rgb(45,45,45)` · `mirrored` Zeichen ·
  `exported` Zeichen + Chip „Exportiert“ · `ludwig` Zeichen +
  `v2ae__row--draft`, `rgb(92,92,92)`. Dasselbe Bild in `Edges` und `Filled`.
- **Rang 2.** Eine führende Zahl: `v2kpi__val` 19 px / 600, das Delta in
  `v2kpi__sub` 11,5 px. Die zweite Kachel trägt ein Datum.
- **Rang 3.** `Filled` und `InUse`: 24 Balken (12 Soll, 12 Haben) und 12
  Achsenmarken. `Empty` zeigt keinen Verlauf.
- **Ränge 1–3 ohne Scrollen.** `InUse` bei 1440 × 900 endet der Verlauf bei
  y = **605,5**, bei 1280 bei y = **642,7**; `.app__main` ist 844 px hoch.
- **`WithoutFacts`.** Kein `.v2md`; drei Slots — `head` 20–106,6 · `sum`
  126,6–249 · `body` 269–563,5, Abstände durchgehend 20 px.
- **Fest.** `pnpm typecheck` **Exit 0** · `pnpm check:icons` **Exit 0** ·
  `pnpm check:contrast` **Exit 0** (je am Exit-Code, nicht an der letzten
  Zeile). `pnpm build` **nicht gelaufen** — in dieser Runde ausdrücklich
  untersagt (0117, mehrere Prüfer im selben Baum); die Änderungen seit
  `be96a56` sind eine Prop, Typnamen und Kommentare, `v3.css` ist an `.v2md`
  unberührt. Slots nur `ReactNode` (sieben), kein `useState`, kein `await`,
  kein Modul-Import außer `MasterDetail`, kein Hex, keine lokale Label-Map,
  keine Saldospalte im Satz, **eine** Bewegungsliste je Story, sieben
  Story-Exporte und sieben in der Registry, Barrel `index.ts:415`.

### Mängel

**1. Neun Zeilen deutscher Kommentar in einer englischen Datei. —
blockierend**

*Kriterium:* fest „Code englisch mit `@when`/`@instead`“, und `CLAUDE.md`
sagt, was das heißt: „Bezeichner, Props, Typen, **Kommentare**, JSDoc …
Englisch. Deutsch ausschließlich in Strings, die Nutzer sehen“.

*Ort und Messung:* `src/ui/v3/entities/account/LedgerAccountView.tsx:72–80` —
der Block, der die 960 begründet („960 px, nicht die Vorgabe 620: die Vorgabe
sichert, dass die sieben Spalten existieren …“). Vor dieser Nacharbeit war die
Datei **durchgängig englisch**; `git diff be96a56..HEAD` zeigt neun neue
deutsche Zeilen und keine andere Änderung außer der Prop. Es ist genau die
Klasse, für die `85755ed` einen eigenen Commit brauchte („zwei
Kommentarblöcke waren Deutsch“) und `82403f2` einen Befund
(„englischer JSDoc“).

*Kleinster Weg:* denselben Text auf Englisch. Der Inhalt ist richtig und
gehört an genau diese Stelle — nur die Sprache nicht.

*Am Rand, gleiche Regel, andere Aufgabe:* dieselbe Nacharbeit hat
`Account.tsx:157–160` (0066) um vier deutsche Kommentarzeilen erweitert.

**2. Die Story-Tabelle zählt weiter sechs — und die Nacharbeit behauptet, das
sei erledigt. — nicht blockierend**

*Kriterium:* fest „alle Stories“ mit der Ableitung nach §6.

*Messung:* Im Code stehen **sieben** Exporte (`Filled`, `WithoutFacts`,
`OtherTab`, `Empty`, `LoadingAndError`, `Edges`, `InUse`), in der Registry
ebenso sieben — die Sache selbst ist also in Ordnung. Der Abschnitt
„Stories“ der Neufassung rechnet in Zeile 230 unverändert
„3 + 1 + 1 + 1 = **6**“, und seine Tabelle (Zeilen 232–239) hat sechs Zeilen
ohne `InUse`. Der Nacharbeits-Text in Zeile 1042 sagt dagegen: „Nicht
blockierend, erledigt: die Story-Tabelle zählte weiter ‚= 6‘ und kannte
`InUse` nicht — es sind sieben.“ Das ist eine Erledigungs-Behauptung ohne
Änderung, und es ist der zweite Anlauf auf denselben Punkt (vierte Runde,
Mangel 2).

*Kleinster Weg:* eine Zeile in der Tabelle, eine Zahl in der Formel.

**3. Die Messtabelle der Nacharbeit liest bei 1280 die falschen zwei Spuren. —
nicht blockierend**

*Messung:* Die Tabelle am Ende der Nacharbeit gibt für Fenster 1280
„Buchungstext 190 px, vollständig“ und „Gegenkonto 104 px, vollständig“.
Gemessen sind die Spuren bei 1280 in der `AppShell`
`84px 24px 96px 276,1px 189,9px 104px 104px`: 190 ist das **Gegenkonto**, 104
ist **Soll** — die Zeile ist um eine Spalte verschoben. Außerdem ist das
Gegenkonto dort nicht vollständig: Kasten 189,9 px gegen 197,4 px Bedarf, 26
von 27 Zeichen. Die Zeilen für 1440 und 1920 stimmen dagegen genau (371/255
und 278,5/191,5).

*Kleinster Weg:* die eine Zeile berichtigen.

**4. „Nur in Ludwig“ ist zweimal verschieden definiert. — nicht blockierend,
Frage an den Owner**

*Kriterium:* Rang 5 des Seitenprofils und die vier Herkunftsklassen aus 0067.

*Messung:* `Account.tsx:96–102` definiert `ludwigOnlyCount` als „Ludwig
entries **without** `datev_mirror_entry_id`“ — darunter fällt auch die Klasse
`exported` (`AccountEntries.tsx:76–79`: „Ludwig entry, exported, not found in
DATEV“). Das Vokabular der Zeile nennt dagegen nur die vierte Klasse „nur in
Ludwig“; `exported` trägt den eigenen Chip. In `Filled` und `InUse` steht
deshalb die Aufschrift „+ 3 nur in Ludwig (612,40 €)“ unmittelbar neben einer
Liste, in der zwei Ludwig-seitige Bewegungen sichtbar sind: `exported`
1.249,90 € und `ludwig` 612,40 €, zusammen **1.862,30 €**. Unter der
Definition des Typs sind zwei der drei gezählten Bewegungen im Bild und
übersteigen die genannte Summe um 1.249,90 €; unter der Definition der Zeile
stimmt die Zahl, dann müssten die zwei übrigen aber 0,00 € sein.

*Kleinster Weg:* eine der beiden Definitionen streichen — entweder sagt der
Typ „Ludwig-Sätze ohne Spiegel-Zuordnung **und ohne Export**“, oder die
Aufschrift heißt „+ n noch nicht in DATEV“. Danach trägt die Fixture die
Summe, die zu ihrer Zahl gehört.

**5. Am breitesten Bild kürzt das Gegenkonto. — nicht blockierend**

*Messung:* Ab Fenster 1724 (Inhalt 1.420) steht die Liste neben dem Strang und
bekommt 960–980 px. Die Spur `Gegenkonto` misst dann 183,3 px (an der Kante)
bis 191,5 px (bei 1920), der Name „70001 Bürobedarf Meier GmbH“ braucht
197,4 px — 26 von 27 Zeichen, ohne `title` am Kasten (`AccountCell` setzt ihn
erst ab 40 Zeichen). Rechnerisch trägt der kompakte Satz das Gegenkonto erst ab
rund **995 px** Arbeitsfläche. Die Spalte trägt damit etwas, sie trägt nur
nicht alles; deshalb kein Blocker — aber die 960 sind knapp gerechnet.

**6. Der volle Spaltensatz kommt in keiner Story dieser Aufgabe vor. — nicht
blockierend, dritte Runde in Folge**

Unverändert: `grep 'variant: "full"'` trifft im ganzen Set nur
`AccountEntries.stories.tsx` (0067). Die Slot-Tabelle (Zeile 207) nennt weiter
`accountEntryColumns({ variant: "full" })`, und `WithoutFacts` — die Story ohne
Strang — fährt `compact`, obwohl dort bei 1440 eine Fläche von 1.398 px steht.
Die Nacharbeit sagt selbst „bleibt“; er bleibt seit der dritten Runde.

### Befunde am Set (nicht an dieser Aufgabe)

- **`DataTable.rowClassName` heißt nach der falschen Familie.** Unverändert:
  die einzige Regel ist `.v2tbl__row.v2ae__row--draft` (`v3.css:2748`), also
  nach `AccountEntryList` benannt, obwohl der Haken jede Tabelle betrifft.
  Gehört zu 0057.
- **`AccountFacts` zeigt Σ Soll / Σ Haben in keiner eigenen Story.**
  `Account.stories.tsx` und `AccountDrawer.stories.tsx` setzen durchweg
  `totalDebit: 0, totalCredit: 0`; die Zeile ist dort gemessen nie im Bild.
  Sichtbar wird sie nur über 0063. Gehört zu 0066.
- **Alter Name in zwei fremden Dateien.** `0066-account-cell-facts.md:10` und
  `0067-account-entries.md:10` verlinken 0063 weiter als `AccountView`.

Abgenommen von / am: Claude (fremde Abnahme, hat nicht gebaut), 2026-09-07 ·
**Urteil: zurück** — **Mangel 1 blockiert**; 2 bis 6 blockieren nicht.

## Nach der Wiederabnahme (2026-09-07)

Die zwei Punkte, die diese Runde tragen sollten, sind bestätigt: die Untergrenze
von 960 px hält (Kippkante 1723 → 1724, Umbruch-Reihenfolge Arbeitsfläche vor
Randspalte), und der Typtausch zeigt nirgends fremde Zahlen. Blockiert hat ein
fester Kriterienpunkt aus derselben Nacharbeit.

**M1 — neun deutsche Kommentarzeilen** in einer durchgängig englischen Datei,
dazu vier weitere in `Account.tsx` (0066). Beide Blöcke sind Englisch. Das war
in dieser Runde der **vierte** Rückfall derselben Regel, jedes Mal eingeschleppt
von der Nacharbeit, die einen anderen Mangel behob — deshalb steht die Regel
jetzt als Wächter im Repo (`pnpm check:language`). Er prüft, was die aktuelle
Änderung anfasst, nicht den Bestand: CLAUDE.md verbietet die Masse-Umbenennung,
und im Bestand stehen 407 solcher Zeilen.

**M2 — die Story-Rechnung** sagte „= 6" und kannte `InUse` nicht, während Code
und Registry sieben führen. Sie sagt jetzt sieben, mit `InUse` als „im Einsatz".

**M3 — die Messtabelle las bei 1280 die falschen Spuren.** „Buchungstext 190 px,
Gegenkonto 104 px, beide vollständig" war um eine Spalte verschoben: 190 ist
das Gegenkonto, 104 war Soll. Und das Gegenkonto ist dort **nicht** vollständig
(189,9 px Kasten gegen 197,4 px Bedarf, 26 von 27 Zeichen). Die Zeile steht
berichtigt; 1440 und 1920 stimmten.

**M4, M5 und M6 bleiben offen und sind vermerkt:** „nur in Ludwig" ist zweimal
verschieden definiert (Typ gegen Zeilenvokabular) — das ist eine Owner-Frage,
keine Reparatur. Ab 1724 px kürzt das Gegenkonto knapp (183–191 gegen 197,4
nötig; rechnerisch bräuchte die Untergrenze ~995 statt 960). Und `variant:
"full"` steht weiter in der Slot-Tabelle, ohne dass eine Story dieser Aufgabe
ihn fährt.
