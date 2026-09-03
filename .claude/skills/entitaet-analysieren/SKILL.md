---
name: entitaet-analysieren
description: Eine Entität des Ludwig-Datenmodells für das Design-System analysieren — Tabelle, Relationen, echte Daten (nur Aggregate), heutige Darstellung — und daraus ein Entitätsprofil unter docs/entitaeten/<slug>.md schreiben, mit bewerteten Datenpunkten (Rang, ab welcher Größe XS–XL) und einer Empfehlung, welche Formen (Cell, Row, Card, View, Editor …) überhaupt gebaut werden sollen. Endet mit einem Prüfprompt und einem Startprompt für spec-schreiben und v3-komponente. Use when asked "analysiere die Entität X", "Entitätenanalyse", "was gehört bei Sachverhalt in die Zeile / Karte / Detail", "welche Formen braucht Klärung", or before specs for an entity family are written. Schreibt keine Spec und keinen Code.
---

# Entität analysieren

Ein **Entitätsprofil** ist die Grundlage der Darstellungsfamilie einer
Entität (`entities/<slug>/`: Cell, Row, Card, View, Editor …). Es beantwortet
drei Fragen, die eine Spec sonst rät: **Was gehört dazu** (Spalten, Relationen,
Historie), **woran erkennt man sie** (Rang der Datenpunkte) und **in welcher
Größe zeigt man was** (XS–XL). Fertig ist es, wenn `spec-schreiben` je
empfohlener Form eine Spec ohne Rückfrage ableiten kann und ein zweiter Agent
die Bewertung prüfen kann, ohne den Chat zu lesen.

Vorlage: `docs/entitaeten/TEMPLATE.md`. Eine Datei je Entität, Slug = englischer
GLOSSARY-Name in kebab-case, identisch mit dem Ordner unter `entities/`
(`accounting-case`, `clarification`, `journal-entry`).

## 0. Quellen

Die App wird **nur gelesen**. `APP="${LUDWIG_APP:-../app}"` — dasselbe Repo,
aus dem `scripts/sync-ludwig.sh` spiegelt.

| Frage | Wo |
|---|---|
| Wie heißt sie, welche Tabelle, welche Regeln? | `docs/ludwig/GLOSSARY.md` — der Eintrag trägt Tabelle, Definition und in den Notes die **Anzeige-Regeln** („NULL heißt bewusst keins, nicht unbekannt") |
| Spalten, Kommentare, CHECKs, FK-Kanten | `$APP/docs/reference/datenmodell/datenmodell.json` — **vollständig**; die `.md` daneben kürzt Kommentare auf 200 Zeichen |
| Welche Entitäten überhaupt, wie wichtig | `$APP/docs/reference/datenmodell/datenmodell-review-2026-08-27.md` §7 (hoch · mittel · niedrig) |
| TS-Typen, Enums, Label-Maps, Ableitungen | `src/ludwig/modules/<modul>/domain/` — z. B. `CASE_KIND_LABEL`, `expectationMaturity` |
| Status-Achsen | `src/ui/v3/patterns/status-registry.ts` → `STATUS_REGISTRY` (`sachverhalt`, `disposition`, `klaerung` …) |
| Heutige Darstellung | `docs/ui-repraesentationen.md` §1 (Entität × Komponente × Form) und die App-Komponenten selbst |
| Formen und Größen | Skill `v3-komponente` (Tabelle XS–XL), `ui-repraesentationen.md` §4.4 (Cell, Row, Card, View, Drawer, Picker) |
| Echte Daten | lokale DB → Staging (nur lesen) → Seeds/Stories → Nutzer, siehe §3 |

## 1. Entität festnageln

1. GLOSSARY-Eintrag lesen. Er gibt den englischen Namen (→ Slug, Typnamen),
   die Tabelle und die Notes — die Notes sind fachliche **Anzeige-Regeln**
   und wandern wörtlich ins Profil („Ein Sachverhalt, ein Personenkonto";
   „Belegfeld 1 ist die Projektion, nicht die Quelle").
2. **Subtyp?** Rechnung und Vertrag sind Subtypen von Beleg (1:1-Tabellen
   `client_source_docs_*`). Dann ein Profil für die Basis mit einem Abschnitt
   je Subtyp — nicht zwei Profile.
3. Kein GLOSSARY-Eintrag → **Befund** für `ludwig/app`; weiter mit dem
   Tabellennamen ohne Bucket-Präfix als Slug.

## 2. Datenmodell lesen

```bash
APP="${LUDWIG_APP:-../app}"; J="$APP/docs/reference/datenmodell/datenmodell.json"
T=client_accounting_case
jq -r ".tables.$T.comment" "$J"
jq -r ".tables.$T.columns[] | [.name,.type,(.nullable|tostring),(.default//\"\"),(.comment//\"\")] | @tsv" "$J"
jq -r ".tables.$T | .checks[]?, .unique[]?" "$J"          # Wertebereiche ohne TS-Enum, Eindeutigkeit
# Eltern: wohin sie zeigt (Kontext)
jq -r ".tables.$T.foreign_keys[] | select(.composite|not) | \"\(.columns|join(\",\")) → \(.references)\"" "$J"
# Kinder: wer auf sie zeigt (Unterlisten)
jq -r --arg t "$T" '.tables | to_entries[] | .key as $k | .value.foreign_keys[] | select(.references==$t and (.composite|not)) | "\($k).\(.columns|join(","))"' "$J"
```

**Dritte Art von Beziehung — ohne FK.** Sie steht in keiner Kantenliste und
wird deshalb am häufigsten vergessen:

- Polymorphe Verweise `*_kind` + `*_id`: `platform_audit_events.resource_kind/resource_id`
  ist die **Historie** jeder Entität. `grep -rn "resource_kind\|resourceKind" "$APP/apps/web/src"`
  zeigt das Vokabular.
- Text-Spalten, die einen Schlüssel tragen (`batch_opos_reference`,
  Belegfeld-Klammern).
- `<x>_id`-Spalten ohne Kante:
  ```bash
  jq -r '.tables | to_entries[] | .key as $k | (.value.foreign_keys|map(.columns[])) as $fk | .value.columns[] | select((.name|test("_id$")) and .name!="id" and ([.name]|inside($fk)|not)) | "\($k).\(.name)"' "$J"
  ```

Dann `src/ludwig/modules/<modul>/domain/`: Enums und Label-Maps sind die
Wertebereiche mit deutschem Text; **Funktionen** dort (`expectationMaturity`,
`caseKindLabel`) sind abgeleitete Datenpunkte. Eine Ableitung, die das UI
braucht und die dort fehlt, ist ein Befund — die Komponente rechnet nichts
selbst (Vorbild: `docs/backlog/0029-open-item-row.md`).

Zuletzt die Registry: welche Achsen gehören zur Entität. Ein Zustand ohne
Achse darf im Profil nicht als „Status" auftauchen; er ist eine Art
(`CASE_KIND_LABEL`) oder ein Befund.

Ergebnis von §2 ist das **Schaubild** (mermaid `erDiagram`): Entität in der
Mitte, Eltern oben, Kinder unten, FK-lose Verweise als nicht-identifizierende
Beziehung (`..`). Kardinalitäten kommen aus §3, nicht aus dem Schema.

## 3. Echte Daten — Zahlen, keine Zeilen

Der Füllgrad entscheidet den Rang: ein Feld mit 4 % Füllung ist kein
Kopf-Datenpunkt, ein Kind mit Median 0 und Maximum 40 ist ein Zähler, keine
Liste, und die Textlänge p90 sagt, ab wann gekürzt wird.

**Regeln aus `ludwig/app` (AGENTS.md):** nur `SELECT`, auch lokal. **Keine
Kundendaten** ins Profil, in Scripts oder Commits — Aggregate, Verteilungen
und IDs ja; Namen, Beträge, Texte nein. Beispielwerte im Profil sind erfunden
(Musterfirma GmbH, 1.800,00 €).

```bash
APP="${LUDWIG_APP:-../app}"; T=client_accounting_case
url() { grep -m1 '^LUDWIG_DATABASE_URL=' "$APP/apps/web/$1" | cut -d= -f2- | tr -d '"'; }
DB="$(url .env.local)"                                   # lokal, meist leer
psql "$DB" -Atc "select count(*) from ludwig.$T"
DB="$(url .env.staging.local | sed 's/:5432/:6543/')"    # 0 → Staging über den Pooler, nur lesen
```

Vier Abfragen reichen:

```sql
-- 1 Füllgrad je Spalte
select key, round(100.0*count(value)/count(*)) pct
from ludwig.client_accounting_case t, jsonb_each_text(to_jsonb(t)) group by key order by pct desc, key;
-- 2 Verteilung je Enum-/Status-Spalte
select lifecycle_status, count(*) from ludwig.client_accounting_case group by 1 order by 2 desc;
-- 3 Kardinalität je Kind-Relation, Eltern ohne Kind eingeschlossen
select round(100.0*count(*) filter (where n=0)/count(*)) pct_ohne,
       percentile_cont(0.5) within group (order by n) p50,
       percentile_cont(0.9) within group (order by n) p90, max(n)
from (select p.id, count(c.id) n from ludwig.client_accounting_case p
      left join ludwig.client_accounting_case_clarification c on c.case_id=p.id group by p.id) t;
-- 4 Textlängen der Freitexte
select percentile_cont(0.5) within group (order by length(summary)) p50,
       percentile_cont(0.9) within group (order by length(summary)) p90, max(length(summary))
from ludwig.client_accounting_case;
```

Keine DB erreichbar oder leer: `$APP/supabase/seed*.sql`, die Story-Fixtures
der App (`$APP/apps/web/src/**/<Entity>*.stories.tsx` — von Menschen geformte
Beispiele) und `$APP/testdata/`. Reicht das nicht, den Nutzer **konkret**
fragen („Wie viele Klärungen hat ein typischer Sachverhalt, wie viele
höchstens?") und die Antwort als Beleg `Nutzer` eintragen. Das Profil nennt
im Kopf, woher die Zahlen stammen und wie viele Zeilen dahinterstehen.

## 4. Heutige Darstellung

`ui-repraesentationen.md` §1 listet je Entität die Komponenten mit Form. Das
ist der **nachgewiesene Bedarf**: was heute als Zeile existiert, braucht eine
Zeile. Je Komponente die gezeigten Felder lesen —

```bash
grep -ohE "\b(case|item|row|clarification)\.[a-zA-Z_]+" "$APP/apps/web/src/modules/accounting-cases/ui/CaseRow.tsx" | sort | uniq -c | sort -rn
```

— denn die Felder, die ein Mensch für die Zeile schon ausgewählt hat, sind
der stärkste Beleg für den Rang. Das Profil hält je Form fest: Komponente,
gezeigte Felder, was fehlt, was zu viel ist.

## 5. Datenpunkte bewerten

Eine Tabelle, eine Zeile je Datenpunkt — Spalten der Tabelle, abgeleitete
Werte und Relationen (§6) getrennt. Spalten:

| Spalte | Inhalt |
|---|---|
| Datenpunkt | deutsches Label (GLOSSARY), englischer Feldname in Klammern |
| Quelle | Spalte · `abgeleitet: <funktion>` · `abgeleitet: fehlt → Befund` |
| Rolle | genau eine aus der Liste unten |
| Füllgrad | % aus §3 |
| heute in | Komponenten aus §4, die es zeigen |
| änderbar | Nutzer · Agent · Server · nie — aus Spaltenkommentar („User-editierbar", „Server-Stempel") und Server Actions |
| Rang | 1…n, siehe unten |
| ab Form | kleinste Größe, in der der Punkt erscheint: XS · S · M · L · XL — kumulativ, was S zeigt, zeigt M auch |
| Beleg | Füllgrad · `heute in …` · GLOSSARY-Satz · Nutzer · **Annahme** |

**Rollen** (festes Vokabular):

- **Identität** — woran der Mensch sie erkennt: Nummer, Gegenpart, Titel.
- **Zustand** — eine Registry-Achse; sonst keine.
- **Maß** — Betrag, Anzahl, Dauer.
- **Zeit** — das Datum, das sie einordnet: geöffnet, fällig, geschlossen.
- **Verantwortung** — wer am Zug ist, wer angelegt hat.
- **Erklärung** — Freitext, Begründung.
- **Kontext** — Eltern, die die Seite meist schon setzt (Mandant,
  Wirtschaftsjahr). Im Profil vermerkt; in der Form nur, wenn die Form
  außerhalb ihres Kontexts steht (Cell in fremder Liste).
- **Technik** — `id`, `tenant_id`, Embeddings, `updated_at`: nie zeigen.
  Nicht in die Tabelle, ein Satz „ausgelassen: …" darunter.

**Rang** ist die Reihenfolge, in der eine Sachbearbeiterin die Entität
zwischen ihren Geschwistern in einer Liste **wiedererkennt**. Der Test: alle
Punkte ab Rang k abdecken — erkennt sie den Vorgang noch? Das kleinste k, das
reicht, ist der Inhalt der Zeile. Regeln:

- Rang 1 ist menschenlesbar, nicht technisch eindeutig. `case_number` ist
  eindeutig, aber der Mensch denkt „Telekom, 89 €, März" — die Nummer ist
  Rang 3 (Rückfrage, Suche).
- Zustand ab XS, immer über `StatusBadge` + Registry, mit Wort (V7).
- Füllgrad unter 20 % → nicht vor M; der Punkt wäre meistens leer. Was
  bei Fehlen etwas bedeutet („kein Beleg zu erwarten"), wird zum abgeleiteten
  Punkt mit eigener Zeile.
- Freitext ab M, gekürzt nach der p90-Länge aus §3; die Grenze steht in der
  Zeile.
- Jede Zeile hat einen Beleg. `Annahme` ist erlaubt, muss aber dastehen —
  der Prüfagent (§8) nimmt sich zuerst die Annahmen vor.

## 6. Relationen bewerten

Zweite Tabelle, eine Zeile je Beziehung aus §2:

| Relation | Richtung | Kardinalität | Rolle | ab Form | Darstellung | Beleg |
|---|---|---|---|---|---|---|
| Klärungen | Kind | 62 % ohne · p50 0 · p90 2 · max 14 | Zustand | S | Zähler (S) · Liste (L) | Staging |

Darstellung ist eine aus: **Zähler** (nur die Zahl, meist mit Zustand) ·
**jüngstes** (der letzte Eintrag, für Historie und Kommentare) · **Liste**
(mehrere Zeilen der Kind-Entität) · **eigene Form** (die Kind-Entität wird in
ihrer eigenen Row oder Card eingebettet). Regeln:

- p50 = 0 und kleines Maximum → Zähler in S, Liste erst in L.
- Historie (`platform_audit_events`) und Ereignisse sind immer viele → nur L,
  als Liste; sie brauchen die Row **ihrer** Entität — das Profil verweist auf
  deren Profil, statt sie hier zu entwerfen.
- Eltern erscheinen als **Inline** der Eltern-Entität (Name, ein Klick), nie
  als deren Karte.
- Eine Kind-Entität aus der §7-Liste (hoch/mittel) bekommt ihr eigenes
  Profil; hier steht nur, **welche ihrer Formen** in welcher eigenen Form
  eingebettet wird.

## 7. Formen empfehlen

Die Größenleiter aus `v3-komponente` und die Namen aus
`ui-repraesentationen.md` §4.4:

| Größe | Formen | Budget |
|---|---|---|
| XS | Inline, Badge (`<Entity>Cell`) | 1–2 Punkte: Identität, Zustand |
| S | Zeile, Auswahl, Kopf (`<Entity>Row`, `<Entity>Picker`) | Rang 1–6, Zustand, Maß; Kinder als Zähler |
| M | Karte, Vorschau (`<Entity>Card`) | S + Erklärung + jüngstes Kind |
| L | Detail, Drawer, Liste (`<Entity>View`, `<Entity>Drawer`) | alles ab 20 % Füllgrad, Kinder als Listen |
| XL | Editor (`<Entity>Editor`) | L + alle Punkte mit änderbar = Nutzer |

Eine Form wird **empfohlen**, wenn mindestens eins gilt — und das Profil
nennt, welches:

1. Sie existiert heute in der App (§4), auch unrein. Das Profil nennt die
   Komponenten, die sie ersetzt.
2. Die Entität ist Kind einer anderen mit View oder Card → sie braucht Row
   oder Card, um dort eingebettet zu werden. Dieselbe Row muss in der eigenen
   Liste **und** im Detail des Elternteils funktionieren — das ist die
   Wiederverwendung, die die Spec später mit zwei `ImEinsatz`-Stories beweist.
3. Die Entität ist Elternteil anderer (FK-Ziel) → Inline/Cell, damit sie in
   fremden Zeilen genannt werden kann; wählt der Nutzer sie aus → Picker.
4. Es gibt Punkte mit änderbar = Nutzer → Editor. Gibt es keine, steht
   „kein Editor" mit diesem Grund.
5. Die Entität wird **mitten in der Arbeit an einer anderen** nachgeschlagen —
   sie ist FK-Ziel (Regel 3) **und** eine fremde Ansicht verweist auf sie, ohne
   sie zeigen zu können → Drawer. Das Profil nennt die verweisende Stelle.
   Kein Verweis, keine Frage, kein Drawer: Eine Entität, die man nur über ihre
   eigene Liste erreicht, braucht nur den View. Der Unterschied in einem Satz:
   der View beantwortet alle Fragen zur Entität, der Drawer beantwortet die
   eine, die woanders aufkam — und bietet für alles Weitere den Weg in den
   View an (0052).

Eine Form ohne Screen wird nicht empfohlen; „wäre praktisch" gilt hier so
wenig wie in `spec-schreiben` §3. Je empfohlener Form ein Block: **zeigt**
(Datenpunkte nach Rang) · **Relationen** (aus §6) · **setzt auf** (Treffer
aus `grep -rn "@when" src/ui/v3`) · **ersetzt** (App-Komponenten).

**Bau-Reihenfolge klein → groß**: Cell, Row, Card, View, Editor. Der Drawer
folgt dem View — er zeigt dessen Kern-Fakten aus **derselben** Komponente,
also kann er nicht vor ihm entstehen (0052, Zone 3). Die größere
Form komponiert die kleinere; die Zeile ist der Kopf der Karte, die Karte der
Kopf des Details. Deshalb muss die Reihenfolge der Punkte über alle Formen
dieselbe sein (kumulativ, §5).

## 8. Dokument schreiben, Prüfung und Start vorbereiten

1. `docs/entitaeten/<slug>.md` aus der Vorlage, jede Sektion gefüllt oder
   mit einem Satz gestrichen. Status `analysiert`.
2. **Befunde für `ludwig/app`** gesammelt: fehlender GLOSSARY-Eintrag, Typ,
   Ableitung, Registry-Achse. Sie gehen an die App, nicht in den Code hier.
3. **Offene Fragen** höchstens drei, jede mit Default („ohne Antwort: …").
4. Abschnitt **Prüfung** bleibt leer — er gehört dem zweiten Agenten.
5. Abschnitt **Weiter** trägt zwei Prompts wörtlich, damit sie nicht im Chat
   verloren gehen. Die Vorlage hat den Wortlaut; einsetzen: Entität, Slug,
   empfohlene Formen in Bau-Reihenfolge.
   - **Prüfprompt** — ein anderer Agent prüft Ränge und Annahmen gegen §3
     und §4 und setzt den Status auf `geprüft`.
   - **Startprompt** — setzt `geprüft` voraus und lässt `spec-schreiben` je
     Form eine Spec schreiben, danach `v3-komponente` bauen, dann fremde
     Abnahme. Jede Spec verlinkt das Profil als Quelle und nimmt Datenpunkte,
     Ränge und Relationen von dort, nicht aus dem Chat.

## Was dieser Skill nicht tut

Er schreibt keine Spec, baut nichts, ändert weder `ludwig/app` noch
`src/ludwig/`, schreibt nichts in eine Datenbank und erfindet keine
Begriffe. Kundendaten bleiben in der Datenbank.

## Ergebnis an den Auftraggeber

Fünf Zeilen, dann der Pfad und beide Prompts: Entität und Tabelle ·
Datenstand (Quelle, Zeilen) · Zahl der Datenpunkte und Relationen, davon
Annahmen · empfohlene Formen in Bau-Reihenfolge, abgelehnte mit Grund ·
Befunde und offene Fragen mit Default.
