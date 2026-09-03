# F109 — Design-Brief: Schritt 10 — Nachlese (was DATEV anders gemacht hat)

**Stand:** 2026-08-28 · **Owner:** Simon Fakir · **Adressat:** claude design ·
**Status:** entschieden. Dieser Brief ist in sich vollständig. Er beschreibt
den letzten Schritt der Stapelabnahme: die **read-only** Seite, auf der die
Buchhalterin sieht, was DATEV aus dem übergebenen Stapel gemacht hat, wie der
Agent jede Abweichung gedeutet hat und was daraus für die nächsten Stapel
folgt. Grundlage: `docs/topics/buchung-offen.md` P5 (Nachlese,
Owner-Entscheid 2026-08-28), `docs/backlog/F115-nachlese-durchgang.md`,
`docs/topics/datev-offen.md` P15 Regel 10.

## Kontext — was der Gestalter wissen muss, ohne die anderen Briefe zu lesen

**Die Stapelabnahme** (Buchungsreview) ist die Oberfläche, mit der die
Buchhalterin einer Steuerkanzlei **einen Stapel** prüft. Ein **Stapel**
(`client_datev_export_batches`) ist die Bearbeitung eines Zeitraums für
einen Mandanten, bis daraus genau **ein** DATEV-Buchungsstapel wird — und
noch ein Stück weiter: bis Ludwig gesehen hat, was DATEV daraus gemacht hat.
Der KI-Agent arbeitet in **Durchgängen** (`client_agent_runs`) am Stapel.
Nach der Freigabe (Schritt 8/9) geht der Stapel nach DATEV; die Kanzlei
korrigiert dort gelegentlich Sätze (anderes Konto, anderer BU-Schlüssel,
Split), ergänzt eigene oder löscht welche. Ludwig importiert regelmäßig den
DATEV-Bestand (**Spiegel**, `client_datev_mirror_entries`,
`client_datev_sequences`). Sobald der DATEV-Stapel im Spiegel auftaucht,
wird er **per ID** (`accounting_sequence_id = datev_operation_id`) mit dem
Ludwig-Stapel verknüpft (`datev_sequence_id`), und der **Diff** ist
berechenbar — als View, nie gespeichert.

```
… confirmed ─(Spiegel-Import findet den Stapel, Kante gesetzt)─▶ mirrored ─(Nachlese-Durchgang)─▶ closed
                                                                   └─ Diff leer: Server schließt sofort ─▶ closed
```

| State | Label | Bedeutung für diesen Schritt |
|---|---|---|
| `confirmed` | In DATEV angekommen | Schritt 10 **gedimmt**: „Warten auf den nächsten DATEV-Abgleich" |
| `mirrored` | Im Spiegel, Nachlese offen | Diff sichtbar; der Nachlese-Durchgang läuft oder steht in der Agent-Queue |
| `closed` | Abgeschlossen | Diff + Deutungen + Bericht vollständig; oder „1:1 übernommen" |

**Der Nachlese-Durchgang** (F115) ist ein Agent-Durchgang mit
`playbook = 'nachlese'`, der jede Abweichung genau einmal liest und deutet:

| Deutung | Bedeutung | Was der Agent schreibt |
|---|---|---|
| **Konvention** | eine wiederholbare Regel ist erkennbar („Telekom-Printprodukte 7 %") | Konventions-Vorschlag (F106, unbestätigt, Herkunft „beobachtet") + Kommentar am Sachverhalt |
| **Produktbefund** | Ludwig hatte die Information und hat sie falsch genutzt, oder das Muster ist mandantenübergreifend | `platform_product_feedback` + Kommentar |
| **Einzelfall** | Ermessen der Kanzlei, kein Muster, oder Kanzlei-eigener Fehler | Kommentar am Sachverhalt (Pflicht) |
| **Unverständlich** | Korrektur widerspricht einer bestätigten Konvention oder sieht nach DATEV-Fehler aus | Klärungsfrage an die Kanzlei (`raise_clarification`, audience accounting) + Kommentar |

Der Agent ändert **keinen** Ludwig-Satz, bestätigt keine Konvention, fasst
DATEV nicht an, lernt nichts still. Er hinterlässt Spuren, die die Kanzlei
**im nächsten Stapel** sieht (Schritt 7: Konventions-Vorschlag bestätigen;
Schritt 2: Klärungsfrage beantworten). Dann schließt er den Stapel.

**Die elf Schritte** (0–8 Prüfung, 9 Übergabe, 10 Nachlese):

```
0 Ergebnis des Stapels · 1 Ist alles da? · 2 Was will der Agent von mir? · 3 Stimmen die Vorschläge?
4 Geht die Bank auf? · 5 Wer schuldet wem? · 6 Sieht der Monat aus wie sonst? · 7 Was hat der Agent gelernt?
8 Prüfprotokoll & Entscheidung · 9 Übergabe an DATEV · 10 Nachlese  ← dieser Brief
```

**Die Nutzerin:** Buchhalterin, DATEV-geprägt, Tastatur, 24-Zoll. Sie kommt
hierher **aus Neugier oder Kontrolle**, nicht weil ein Todo wartet: „Was hat
die Kollegin am Juli noch geändert?", „Hat Ludwig verstanden, warum?", „Was
schlägt es jetzt vor?". Oder aus Schritt 0 des Folgestapels, wo die Karte
„Nachlese Vormonat" hierher zeigt.

**Gemeinsames Layout aller Schritte** — Zielgerät 24-Zoll-Arbeitsplatz
(≥ 1920 px; ≥ 1280 px muss funktionieren): links sticky der **Schritt-Rail**
(0–10, Zähler und Ampel), darüber der **Stapel-Kopf** (Stapelnummer ·
Bezeichnung · Zeitraum · Zustand · „dran ist"), in der Mitte die Liste,
rechts das Detail (Master-Detail, kein Modal). Bestehende Ansichten
(Sachverhalt, Kontenblatt, DATEV-Satz, Konvention) öffnen als **Drawer**
mit URL (`UrlDrawer`), einer zur Zeit, `Esc` schließt.

**Konventionen der App:** Zeiten Europe/Berlin · Status über `StatusBadge` +
Registry · Zustands-Spalten nie bloß „Status" · Karten auf `Section` ·
Tabs über `TabBar`. Der Nebeneinander-Vergleich Ludwig ↔ DATEV existiert
bereits (`StapelVergleich`, Modus `export`) und wird hier eingebunden, nicht
neu erfunden.

**Gestaltungshaltung:** Business-Webanwendung. **Ruhiger Kontext, laute
Probleme** — aber hier gibt es **kein Todo** für die Nutzerin: der ganze
Schritt ist ein **Rückblick**. Er ist deshalb bewusst **gedämpft**
gestaltet (ausgegraut im Rail bis er erreichbar ist, neutrale Flächen,
keine Ampeln außer den Abweichungs-Badges). Was Aufmerksamkeit will, lebt
nicht hier, sondern im nächsten Stapel — und der Screen sagt, wo.

---

## 1. Die Frage dieses Schritts

**Was hat DATEV anders gemacht als wir — und was lernen wir daraus?**

Der Schritt beantwortet drei Dinge, in dieser Reihenfolge: (1) *Ist der
Stapel wirklich im DATEV-Bestand, und stimmt er?* (2) *Wo weicht DATEV ab,
und wie deutet der Agent das?* (3) *Was folgt daraus — welche Vorschläge,
Befunde und Fragen liegen jetzt im nächsten Stapel?*

## 2. Inhalt, in dieser Reihenfolge

### 2.1 Kopfzeile des Schritts — die Kante

Eine Zeile: **Ludwig-Stapel** `2026-0008 · 07-2026-Ludwig · 131 Sätze` ⟷
**DATEV-Stapel** `07-2026-Ludwig · Vorgang b7c1… · festgeschrieben ·
133 Buchungen · zuletzt gesehen 12.08. 06:10`. Darunter klein: „Verknüpft
über die DATEV-Vorgangs-ID, nicht über den Namen." Links auf den
DATEV-Stapel in der DATEV-Wahrheit und auf die Stapel-Seite.

### 2.2 Kennzahlen des Abgleichs (`StatGrid`)

| Kennzahl | Badge (bestehende `KIND_META`) | Bedeutung |
|---|---|---|
| unverändert | grün | 1:1 übernommen |
| geändert | gelb | von der Kanzlei korrigiert (Konto, BU, Betrag, Belegfeld, Text) |
| aufgeteilt | blau | eine Ludwig-Buchung wurde in mehrere DATEV-Buchungen zerlegt |
| nicht in DATEV | rot | exportiert, im DATEV-Stapel nicht (mehr) vorhanden |
| unklar | gelb | DATEV-Satz mit Ludwig-Bezug, keiner Buchung eindeutig zuordenbar |
| von Kanzlei ergänzt | blau | DATEV-Satz ohne Ludwig-Bezug im selben Stapel |

Daneben die **Quote**: „124 von 131 unverändert (94,7 %)" — eine Menge,
keine Note. Und der Stand der Nachlese: „Nachlese abgeschlossen 13.08.
02:19 · Durchgang 3" oder „Nachlese läuft" oder „Nachlese steht aus (Agent-
Queue)".

### 2.3 Die Abweichungsliste (Mitte) und das Detail (rechts)

**Liste** — ein Punkt je Sachverhalt mit mindestens einer Abweichung,
gruppiert nach **Deutung** des Agenten (die Gruppen sind das, was die
Buchhalterin wissen will):

| Gruppe | Reihenfolge | Zähler |
|---|---|---|
| **Unverständlich → Frage an dich** | 1 (das Einzige, was jemanden braucht — aber die Frage liegt in Schritt 2 des nächsten Stapels; hier nur der Verweis) | n |
| **Konvention erkannt** | 2 | n |
| **Produktbefund** | 3 | n |
| **Einzelfall** | 4 | n |
| **Von der Kanzlei ergänzt** (`fremd`, ohne Sachverhalt) | 5 | n |
| **Noch nicht gelesen** (nur in `mirrored` vor/während der Nachlese) | 0, oben | n |

Zeile: Deutungs-Icon · Sachverhaltsnummer + Titel · Art der Abweichung
(Badge) · das geänderte Feld in Kurzform (`8401 → 8400 + 1776` oder `BU 9
→ BU 3` oder `Betrag 89,25 → 89,20`) · Gegenpartei · Betrag.

**Detail** (rechts, beim Wählen einer Zeile):

1. **Ludwig ↔ DATEV nebeneinander** — die bestehende Vergleichskarte: beide
   vollen Buchungssätze (Soll/Haben je Konto, Betrag, BU), abweichende
   Zellen markiert; Buchungstext/Belegfeld darunter. Bei `aufgeteilt` die
   n DATEV-Sätze untereinander.
2. **Was Ludwig damals wusste** — `proposal_rationale` des Satzes,
   Judge-Verdikt, Review-Befund (unverändert freigegeben / im Review
   korrigiert von …), Beleg-Miniatur mit Drawer.
3. **Die Deutung des Agenten** — Deutungs-Badge + der Kommentar am
   Sachverhalt (Pflicht-Kommentar aus der Nachlese, Markdown, mit
   Zeitstempel und „Nachlese-Durchgang 3"). Darunter, je nach Deutung:
   der **Konventions-Vorschlag** (Text, Ebene Mandant/Kanzlei, Status
   unbestätigt, Link „in Schritt 7 des nächsten Stapels bestätigen"), der
   **Produktbefund** (Titel, Kategorie, Link ins Admin), die
   **Klärungsfrage** (Text, Antwortoptionen, Status; Link „in Schritt 2 des
   nächsten Stapels beantworten" — oder, wenn schon beantwortet, die
   Antwort).
4. **Sprünge:** Sachverhalt (Drawer), Kontenblatt beider Konten, DATEV-Satz
   (Drawer, Rohdaten), Beleg.

Bei `fremd`-Zeilen (Kanzlei hat im selben Stapel eigene Sätze gebucht) gibt
es keinen Sachverhalt: Detail zeigt nur den DATEV-Satz und den Eintrag des
Agenten dazu aus dem Bericht („vermutlich Umbuchung Kasse — kein Beleg bei
Ludwig").

### 2.4 Was daraus wurde — die Ausbeute

Drei kompakte Karten nebeneinander unter der Liste:

| Karte | Inhalt | Wohin es geht |
|---|---|---|
| **Konventions-Vorschläge** | je Vorschlag: Text, Ebene, Herkunft „beobachtet (Nachlese 2026-0008)", Status | Schritt 7 des nächsten Stapels; Konventions-Speicher |
| **Produktbefunde** | je Befund: Titel, Kurztext, Kategorie | Admin (nur Owner/Entwicklung; für die Kanzlei nur Lesen) |
| **Fragen an die Kanzlei** | je Frage: Sachverhalt, Text, Status | Schritt 2 des nächsten Stapels |

Alles mit `export_batch_id` = **dieser** Stapel (die Artefakte der Nachlese
hängen am alten Stapel, obwohl sie später wirken).

### 2.5 Der Nachlese-Bericht

`client_agent_runs.report` des Nachlese-Durchgangs (Markdown), eingeklappt
ab 12 Zeilen; Kennzahlen aus `stats` (Abweichungen je Art, Kommentare,
Vorschläge, Befunde, Fragen). Bei Override am Gate 6c (Kommentar-Pflicht
umgangen): der Override-Grund sichtbar, orange.

### 2.6 Leerzustand — der gute Fall

Diff leer (Server hat bei `mirrored` sofort geschlossen): ein grüner Haken,
**ein** Satz: „Alle 109 Sätze sind 1:1 in DATEV übernommen — geprüft am
12.07. 06:10 gegen den DATEV-Bestand. Es gab nichts nachzulesen." Keine
Liste, keine Karten, kein Bericht.

## 3. Aktionen

Der Schritt ist **read-only**. Es gibt keine Quittung, keine Freigabe,
keinen Rücklauf. Was sie tun kann:

| Aktion | Taste | Ziel |
|---|---|---|
| Zeile wählen, Detail lesen | `J`/`K`, `Enter` | — |
| Sachverhalt öffnen | `S` | `UrlDrawer` |
| Kontenblatt öffnen | `1`–`9` (Kontonummer in der Karte) | `AccountLedgerDrawer` |
| DATEV-Satz öffnen | `D` | Drawer (Rohdaten) |
| Konventions-Vorschlag ansehen | `Enter` auf Karte | Drawer; bestätigen **nur** in Schritt 7 des nächsten Stapels |
| Zum nächsten Stapel (Schritt 0) | Link | Abnahme des Folgestapels |
| Zur Stapel-Seite | Link | Datensicht |
| Bericht kopieren | Button | Zwischenablage (bestehender `CopyTextButton`) |

**Nicht** hier: Konvention bestätigen (Schritt 7 des Folgestapels, R3),
Klärung beantworten (Schritt 2), Ludwig-Satz ändern (exportiert), Diff
speichern oder „abgleichen" (gibt es nicht), Nachlese erneut anstoßen
(einmalig, bewusst).

## 4. Zustände

| Zustand | Rail | Darstellung |
|---|---|---|
| `review`…`failed` | Schritt 10 **gedimmt**, nicht klickbar | Tooltip „Nachlese folgt, sobald DATEV den Stapel im Bestand hat" |
| `confirmed` | gedimmt, klickbar | Seite mit Kopfzeile ohne DATEV-Seite: „Warten auf den nächsten DATEV-Abgleich (zuletzt 27.08. 06:10, nächster planmäßig morgen früh)". Kein Diff. |
| `confirmed`, EXTF-Weg (keine Operation-ID) | gedimmt, klickbar | „Nachlese nicht möglich — Datei-Export ohne DATEV-Vorgangs-ID. Der DATEV-Stapel lässt sich in der DATEV-Wahrheit von Hand ansehen." Link. Bleibt dauerhaft so. |
| `mirrored`, Nachlese steht aus | aktiv, neutral | Kennzahlen + Liste (Gruppe „noch nicht gelesen"), Detail ohne Deutung; Hinweis „Der Agent liest die Abweichungen beim nächsten Durchgang (Queue-Position 1)" |
| `mirrored`, Nachlese läuft | aktiv, dezenter Puls | wie oben, Gruppen füllen sich beim Refresh (30 s) |
| `closed`, Diff vorhanden | aktiv | vollständig: Gruppen, Deutungen, Ausbeute, Bericht |
| `closed`, Diff leer | aktiv, grün-Haken | Leerzustand 2.6 |
| Spiegel-Stapel später verändert (nach `closed`) | — | **wird nicht gezeigt** (bewusst: die Nachlese ist einmalig). Der aktuelle Diff steht weiterhin in der DATEV-Wahrheit. Kleiner Hinweis „Stand der Nachlese: 13.08. — spätere DATEV-Änderungen siehe DATEV-Wahrheit" |

## 5. Kanzlei-Ablauf, den dieser Schritt abdeckt

| Kanzlei-Ablauf | Hier |
|---|---|
| „Hat die Kollegin an meinem Stapel etwas geändert?" (früher: DATEV-Protokoll, Nachfragen) | Abweichungsliste mit Feld-Diff |
| Vier-Augen-Nachweis / interne Qualität | Quote + Bericht, kopierbar |
| „Warum bucht Ludwig das nächstes Mal anders?" | Konventions-Vorschlag mit Herkunft |
| Verbesserungswunsch an Ludwig | Produktbefund (lesen); melden geht über das bestehende Feedback |

## 6. Datenkontrakt

**Reads** (alle bestehend oder in F114/F115 beschlossen):

| Was | Quelle |
|---|---|
| Kante + DATEV-Stapel | `client_datev_export_batches.datev_sequence_id` → `client_datev_sequences` (`accounting_sequence_id`, `description`, `is_committed`, `inspection_status`, `datev_synced_at`) |
| Diff | `classifyBatchAbgleich` über `batch-abgleich-queries` (nach F114 über die Kante) — Zeilenarten `unveraendert · geaendert · aufgeteilt · fehlt · unklar · fremd`, je Zeile `FieldDiff`; angereichert wie `get_batch_abgleich` (F115 Stufe 1): Sachverhalt, `proposal_rationale`, Judge, Review-Befund, Beleg |
| Deutung + Kommentar | Kommentare am Sachverhalt mit `agent_run_id` = Nachlese-Durchgang; **Deutungs-Art** als strukturiertes Feld (Abschnitt 8) |
| Konventions-Vorschläge | F106-Speicher mit `export_batch_id` = Stapel, Herkunft „beobachtet", unbestätigt |
| Produktbefunde | `platform_product_feedback` mit `export_batch_id` = Stapel |
| Fragen | `client_accounting_case_clarification` mit `export_batch_id` = Stapel, `audience = 'accounting'`, aus dem Nachlese-Durchgang |
| Bericht + Kennzahlen | `client_agent_runs` (`playbook = 'nachlese'`, `report`, `stats`), Step-Log 6a–6c inkl. Override |
| Letzter/nächster Abgleich | Snapshot-Läufe der DATEV-Wahrheit (`listSnapshotRuns`) |

**Writes:** keine.

## 7. Nicht-Ziele

- Kein Todo, keine Quittung, kein Rücklauf — Schritt 10 ist Rückblick.
- Kein Persistieren des Diffs, kein Angleichen, kein „als geprüft markieren".
- Keine zweite Nachlese, kein manuelles Anstoßen.
- Keine Bewertung des Agenten („Trefferquote") — die Quote ist eine Menge.
- Keine Aggregation über Mandanten (Produktbefunde einzeln, Auswertung ist
  menschlich, Admin).

## 8. Offen (Owner / Bau)

1. **Deutungs-Art strukturiert:** F115 sieht die Deutung im Kommentar-Text
   vor. Für die Gruppierung in 2.3 braucht der Screen ein Feld
   (`kind in ('convention','product','single_case','unclear')` am
   Nachlese-Kommentar oder als Zeile im Bericht-JSON). Empfehlung: Feld am
   Kommentar, in F115 Stufe 2 ergänzen.
2. **Sichtbarkeit der Produktbefunde** für Kanzlei-User: lesen ja (Titel +
   Kurztext), Inhalt nur Admin? Der Brief zeigt sie lesbar.
3. **Schritt 0 des Folgestapels** trägt die Karte „Nachlese Vormonat" mit
   Quote und Zähler — Änderungsbrief.

---

## 9. Jobs to be done — was die Nutzerin auf dieser Seite tut

| # | Job | Was sie dafür sehen muss | Aktion · Taste | Fertig, wenn |
|---|---|---|---|---|
| J1 | **Sehen, ob der Stapel wirklich im DATEV-Bestand ist und wie viel 1:1 blieb** | Kante, Quote, Kennzahlen | lesen | — |
| J2 | **Jede Abweichung verstehen** — was war bei uns, was ist in DATEV, welches Feld | Nebeneinander-Karte mit markierten Zellen | `J`/`K`, `Enter` | — |
| J3 | **Lesen, wie der Agent es deutet** — und ob das plausibel ist | Deutungs-Badge, Kommentar, Rationale von damals, Review-Befund | lesen | — |
| J4 | **Wissen, was daraus im nächsten Stapel auf sie zukommt** | Ausbeute-Karten mit Links auf Schritt 7 / Schritt 2 des Folgestapels | Link | — |
| J5 | **Den Nachlese-Bericht lesen oder weitergeben** | Bericht, Kopieren | Button | — |
| J6 | **Sehen, was die Kanzlei selbst im Stapel ergänzt hat** | Gruppe „von der Kanzlei ergänzt" mit DATEV-Sätzen | lesen · Drawer | — |
| J7 | **Nachvollziehen, warum die Nachlese fehlt** (EXTF, wartet, läuft) | Zustandshinweis 4 | lesen | — |
| J8 | **Zum Sachverhalt / Konto / DATEV-Satz springen** | Drawer | `S` · `1`–`9` · `D` | — |

## 10. Informations-Check — hat jeder Job, was er braucht?

| Job | Benötigt | Vorhanden in | Lücke / Bewertung |
|---|---|---|---|
| J1 | Kante, Kennzahlen | `datev_sequence_id` (F114), `AbgleichSummary` | ✓ nach F114 |
| J2 | Feld-Diff je Satz, beide Seiten voll | `classifyBatchAbgleich`, `sequence_body`, Spiegel-Legs; `StapelVergleich` | ✓ bestehend |
| J3 | Deutung strukturiert, Kommentar, Rationale, Judge, Review-Befund | Kommentar mit `agent_run_id`; `proposal_rationale`, `judge_*`, `acceptance_quality`/`reviewed_by` | ⚠ Deutungs-Feld (Abschnitt 8.1) |
| J4 | Konventionen/Befunde/Fragen je Stapel | `export_batch_id` auf allen dreien (F114 Stufe 1) | ✓ nach F114; Links auf Folgestapel-Schritte über `openBatchIdSql` |
| J5 | Bericht | `client_agent_runs.report` (Nachlese-Durchgang) | ✓ |
| J6 | `fremd`-Zeilen mit DATEV-Satz | `classifyBatchAbgleich` | ✓; Deutung dazu nur im Bericht (F115: Pflicht-Eintrag) |
| J7 | Grund für fehlende Nachlese | `datev_operation_id is null` → EXTF; `state`; Snapshot-Läufe | ✓ |
| J8 | Drawer | bestehend | ✓ |

**Fazit:** bedienbar nach F114 + F115; eine Bau-Ergänzung (strukturierte
Deutung), sonst reine Projektion.

## 11. Datenmodell dieses Screens mit Beispieldatensatz

```yaml
batch:
  id: b-0008
  stapelnummer: "2026-0008"
  description: "07-2026-Ludwig"
  state: closed
  period: "01.–31.07.2026"
  entry_count: 131
  exported_at: "2026-08-03T21:13:40+02:00"
  datev_operation_id: "b7c1e2a4-…"
  datev_sequence_id: seq-77

datev_sequence:                          # client_datev_sequences
  accounting_sequence_id: "b7c1e2a4-…"
  description: "07-2026-Ludwig"
  is_committed: true
  inspection_status: "not_specified"
  datev_synced_at: "2026-08-12T06:10:00+02:00"
  entries: 133

abgleich_summary:                        # classifyBatchAbgleich (View)
  unveraendert: 124
  geaendert: 4
  aufgeteilt: 1
  fehlt: 0
  unklar: 0
  fremd: 2
  quote: "124 von 131 (94,7 %)"

nachlese_run:                            # client_agent_runs, playbook nachlese
  id: run-13
  export_batch_id: b-0008
  playbook: nachlese
  started_at: "2026-08-13T02:05:00+02:00"
  finished_at: "2026-08-13T02:19:12+02:00"
  outcome: completed
  steps: [{step_code: "6a", gate_result: passed}, {step_code: "6b", gate_result: passed}, {step_code: "6c", gate_result: passed}]
  stats: {rows_read: 7, comments: 5, conventions_proposed: 1, product_feedback: 1, clarifications_raised: 1, fremd_reported: 2}
  report: |
    ## Nachlese 07-2026-Ludwig
    Von 131 Sätzen wurden 124 unverändert übernommen. Fünf Sachverhalte tragen Abweichungen:
    - SV-2026-0102 Telekom: 8401 → 8400 + 1776 — Konvention: Printprodukte 7 % (Vorschlag K-11).
    - SV-2026-0118 Leasing Transporter: Split in Tilgung/Zins — Einzelfall (Vertragsdetail nur in DATEV).
    - …
    Zwei Sätze ohne Ludwig-Bezug: Umbuchung Kasse 1000 → 1360 (240,00) und Privatentnahme (1.200,00).

rows:                                    # eine Zeile je Sachverhalt mit Abweichung
  - case: {id: c-102, number: "SV-2026-0102", title: "Telekom Mobilfunk Juli 2026", counterparty: "Telekom Deutschland GmbH"}
    kind: geaendert
    ludwig: {lines: [{account: "4920", side: S, amount: 75.00, taxKey: "9"}, {account: "70012", side: H, amount: 89.25}], belegfeld1: "RE-2026-071234", text: "Telekom Mobilfunk 07/2026"}
    datev:  {lines: [{account: "4920", side: S, amount: 62.10, taxKey: "9"}, {account: "4930", side: S, amount: 12.90, taxKey: "8"}, {account: "70012", side: H, amount: 89.25}], belegfeld1: "RE-2026-071234"}
    field_diff: ["Konto 4920 Betrag", "+ Konto 4930 BU 8"]
    then: {proposal_rationale: "Wie in den drei Vormonaten auf 4920 mit BU 9.", judge: confirm, review: "unverändert freigegeben (S. Fakir, 01.08.)"}
    deutung: {kind: convention, comment_id: n-901, at: "2026-08-13T02:11:40+02:00", text: "DATEV trennt den Printprodukte-Anteil (7 %) auf 4930 BU 8. Muster in 3 Vormonaten der Kanzlei-Historie erkennbar → Konventions-Vorschlag K-11."}
    convention: {id: "K-11", scope: client, origin: observed, confirmed: false, text: "Telekom-Rechnungen: Printprodukte-Position auf 4930 mit BU 8 (7 %), Rest 4920 BU 9."}
  - case: {number: "SV-2026-0118", title: "Leasing Transporter Juli"}
    kind: aufgeteilt
    field_diff: ["1 Satz → 2 Sätze (Tilgung 3.050,00 / Zins 162,80)"]
    deutung: {kind: single_case, text: "Zins-/Tilgungsaufteilung kommt aus dem Leasingvertrag, der nur in DATEV hinterlegt ist. Kein Muster für Ludwig."}
  - case: {number: "SV-2026-0131", title: "Amazon Büromaterial"}
    kind: geaendert
    field_diff: ["BU 9 → BU 0"]
    deutung: {kind: unclear, text: "Vorsteuerabzug entfernt, obwohl USt-IdNr. auf dem Beleg steht — widerspricht Konvention K-03. Frage an die Kanzlei gestellt."}
    clarification: {id: cl-77, audience: accounting, severity: optional, text: "SV-2026-0131: Warum ohne Vorsteuer? Beleg trägt DE-USt-IdNr.", options: ["Beleg unvollständig — Vorsteuer zu Recht gestrichen", "Versehen in DATEV — bitte korrigieren", "Andere Antwort"], status: open}
  - case: {number: "SV-2026-0140", title: "Tankstelle Aral 14.07."}
    kind: geaendert
    field_diff: ["Belegfeld 1 „ARAL-0714" → „0714"]
    deutung: {kind: product, text: "Ludwig baut Belegfeld 1 aus Kreditor-Kürzel + Datum; die Kanzlei nutzt für Kassenbelege nur das Datum. Das steht als Regel im Onboarding-Fragebogen, wurde aber nicht angewandt."}
    product_feedback: {id: pf-31, title: "Belegfeld-Strategie für Kassenbelege aus Onboarding nicht übernommen", category: booking}
  - case: {number: "SV-2026-0097", title: "Werbeagentur Mai-Rechnung"}
    kind: geaendert
    field_diff: ["Buchungsdatum 03.07. → 30.06."]
    deutung: {kind: single_case, text: "Kanzlei hat die Rechnung in den Juni gezogen (Leistungszeitraum). Ermessen."}
  - kind: fremd
    datev: {lines: [{account: "1360", side: S, amount: 240.00}, {account: "1000", side: H, amount: 240.00}], text: "Umbuchung Kasse", belegfeld1: "UMB-0731"}
    deutung: null                         # nur im Bericht
  - kind: fremd
    datev: {lines: [{account: "1800", side: S, amount: 1200.00}, {account: "1200", side: H, amount: 1200.00}], text: "Privatentnahme Juli"}

ausbeute:
  conventions: [{id: "K-11", scope: client, confirmed: false, next: "Schritt 7 in 2026-0009"}]
  product_feedback: [{id: pf-31, title: "Belegfeld-Strategie für Kassenbelege …"}]
  clarifications: [{id: cl-77, case: "SV-2026-0131", status: open, next: "Schritt 2 in 2026-0009"}]

empty_variant:                           # b-0007, Diff leer
  state: closed
  abgleich_summary: {unveraendert: 109, geaendert: 0, aufgeteilt: 0, fehlt: 0, unklar: 0, fremd: 0}
  closed_by: server
  closed_at: "2026-07-12T06:10:22+02:00"
  nachlese_run: null

waiting_variant:                         # b-0009 nach confirmed
  state: confirmed
  last_snapshot: "2026-08-27T06:10:00+02:00"
  next_snapshot_hint: "planmäßig 28.08. 06:00"

extf_variant:                            # b-0003
  state: confirmed
  datev_operation_id: null
  hint: "Nachlese nicht möglich — Datei-Export ohne DATEV-Vorgangs-ID."
```

## 12. DATEV-Hinweise

- **Korrekturen in DATEV** sehen so aus: Konto geändert, BU-Schlüssel
  geändert, Betrag geändert (selten), Split in mehrere Sätze, Buchungsdatum
  verschoben, Belegfeld angepasst, Satz gelöscht (`fehlt`), eigener Satz
  ergänzt (`fremd`). Der Feld-Diff muss genau diese Fälle benennen.
- **Steuerzeilen** ergänzt DATEV aus dem BU-Schlüssel selbst
  (`8400 + 1776` aus `8401 BU 9`): das ist **keine** Abweichung. Der
  Vergleichskern kollabiert das schon; der Screen darf es nie als „geändert"
  zeigen.
- **Festgeschriebene Stapel** ändern sich in DATEV nicht mehr — bei
  `is_committed = true` ist der Diff endgültig; bei `false` kann er sich bis
  zur Festschreibung noch bewegen. Der Screen zeigt den Festschreib-Status
  in der Kopfzeile, genau deshalb.
- **Herkunfts-Kennzeichen** `SV` (Stapelverarbeitung) trägt auch unser
  Export-Stapel; `fremd`-Sätze im selben Stapel sind von der Kanzlei in
  diesem Stapel nachgetragen.

## 13. Design-Prinzipien (vom Owner vorgegeben, gelten für jeden Screen)

1. **Business-Webanwendung, nicht Marketing.** Kompakt, übersichtlich.
2. **Schlichte Screens.** Hier besonders: gedämpft, Rückblick-Charakter.
3. **Farbe nur für Probleme.** Hier: die Abweichungs-Badges (bestehende
   Farben) und der Override-Hinweis; sonst grau.
4. **Hotkey-freundlich.** `J`/`K`, `Enter`, `S`, `D`, `1`–`9`, `?`.
5. **Todo-Liste als Grundmuster** — hier eine **Leseliste**: gleiche
   Anatomie (Icon · Titel · Sekundärzeile · Badges), aber ohne Zustand
   offen/erledigt.
6. **Eine Information, ein Ort — und Drawer für den Rest.**
7. **DATEV-Optik bei Zahlen und Buchungen** — die Vergleichskarte ist das
   Vorbild (Konto · Name · Betrag · BU je Seite).
8. **Der Mensch entscheidet, der Server rechnet.** Der Diff ist
   deterministisch; die Deutung ist vom Agenten und **als solche markiert**.
9. **Nichts zweimal.** Was die Nachlese fragt oder vorschlägt, erscheint im
   nächsten Stapel genau einmal (Schritt 2/7), nicht hier als zweites Todo.
10. **Großer Bildschirm.** Liste und Vergleichskarte nebeneinander,
    Ausbeute-Karten in einer Reihe.

## 14. Szenarien für die Vorschau

**Bitte einen Szenario-Umschalter in die Vorschau einbauen.**

| # | Szenario | Was es zeigt |
|---|---|---|
| S1 | **`closed` mit Abweichungen** | Kante, Kennzahlen, Gruppen (1 Frage, 1 Konvention, 1 Produktbefund, 2 Einzelfälle, 2 ergänzt), Detail SV-0102 mit Konventions-Vorschlag, Ausbeute, Bericht |
| S2 | **Detail „Unverständlich"** | SV-0131: Diff BU 9 → 0, Deutung, Klärungsfrage mit Antwortoptionen, Verweis Schritt 2 |
| S3 | **Detail „aufgeteilt"** | SV-0118: ein Ludwig-Satz, zwei DATEV-Sätze untereinander |
| S4 | **Detail „von Kanzlei ergänzt"** | nur DATEV-Satz, Bericht-Auszug |
| S5 | **`closed`, Diff leer** | grüner Haken, ein Satz, sonst nichts |
| S6 | **`confirmed`, wartet** | gedimmt, „Warten auf den nächsten DATEV-Abgleich", Zeitpunkte |
| S7 | **`mirrored`, Nachlese steht aus** | Diff sichtbar, Gruppe „noch nicht gelesen", Detail ohne Deutung |
| S8 | **EXTF ohne Vorgangs-ID** | Hinweis „Nachlese nicht möglich", Link DATEV-Wahrheit |
| S9 | **Rail-Zustand** | Schritt 10 gedimmt in `review`, aktiv in `closed`; Stapel-Kopf |
