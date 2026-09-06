# 0063 · `AccountView` — die Vollansicht eines Kontos

| | |
|---|---|
| Status | spec |
| Freigabe | zurück 2026-09-07 — Zuschnitt neu nach Abschnitt „Freigabe" (Rahmen, DATEV führt), nach 0071, danach ohne zweite Runde freigegeben |
| Stufe | `entities/account/` |
| Quelle | Entitätsprofil `docs/entitaeten/account.md`, Abschnitt „Formen" (Zeile `AccountView`) |
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
