# 0073 · Vertragsfakten bearbeiten und bestätigen

| | |
|---|---|
| Status | offen |
| Stufe | `entities/source-document/` — Erweiterung der Vertrags-Ausprägung von `SourceDocumentFacts` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Vertragstyp und buchungsrelevante Fakten sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Befund B1 und offene Frage 3 |
| Ersetzt | `ContractDetail` (647 Zeilen, Anzeige und Bearbeitung in einem) |
| Blockiert | nichts |
| Setzt voraus | `SourceDocumentFacts` mit Ausprägungs-Registry (lesende Vertrags-Fakten) |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Ziel

Ein Vertrag trägt LLM-extrahierte Felder (Typ, Gegenstand, Laufzeit,
Primärbetrag) und dazu freie **buchungsrelevante Fakten** als
Schlüssel/Wert mit Provenienz (`ai` / `manual` plus Konfidenz). Beides ist
korrigierbar, und am Ende steht „als geprüft bestätigen".

Warum vertagt: `client_source_docs_contracts` hat im Bestand **0 Zeilen**
(Profil-Befund B1). Die lesende Ausprägung lässt sich gegen Schema und
`ContractDetailData` bauen — ob die Bearbeitung stimmt, kann ohne einen
einzigen extrahierten Vertrag niemand prüfen. Die Abnahme hätte keinen
Nachweis.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Fakten ändern und bestätigen | `onSaveFacts` / `onConfirm` an der Vertrags-Ausprägung | sobald die Vertrags-Extraktion Zeilen schreibt (heute 0, 7 Audit-Ereignisse) |

## Gegen das Schema geprüft (2026-09-07, im Auftrag des Coordinators)

Gelesen: `client_source_docs_contracts` in
`$APP/docs/reference/datenmodell/datenmodell.json` (Spalten, CHECKs,
Kommentar) und der gespiegelte Typ
`src/ludwig/modules/contracts/domain/contract.ts`. Nichts gebaut, nichts
geändert.

### Was trägt

Jedes Feld, das der Auftrag nennt, hat eine Spalte **und** einen gespiegelten
Typ. Der Zuschnitt der Spec ist gegen das Datenmodell haltbar:

| Auftrag | Spalte | Spiegel |
|---|---|---|
| Vertragstyp | `contract_type` (CHECK: `loan` · `rent` · `lease` · `recurring_invoice` · `service` · `other`) | `CONTRACT_TYPE_LABELS`, `CONTRACT_TYPE_OPTIONS`, `contractTypeLabel()` |
| Gegenstand | `contract_subject` | `contractSubject` |
| Laufzeit | `start_date` · `duration_months` · `end_date` · `is_open_ended` | dieselben vier |
| Primärbetrag | `primary_amount` · `currency` | `primaryAmount` · `currency` |
| buchungsrelevante Fakten | `booking_facts` (jsonb) | `ContractBookingFact { key, value, source, confidence }` |
| Provenienz | `field_provenance` (jsonb) | `Record<string, ContractFieldProvenance>` |
| Konfidenz | `extraction_confidence` (CHECK 0…1) | `extractionConfidence` |

Der Wertebereich des Vertragstyps ist damit **geschlossen** — sechs Werte, im
CHECK und im Spiegel gleich. Ein `Select` reicht, kein Freitext.

### Was der Auftrag ungenau sagt — und was das für die Spec heißt

**1. Die Provenienz gibt es zweimal, nicht einmal.** Der Auftrag beschreibt
„buchungsrelevante Fakten als Schlüssel/Wert mit Provenienz (`ai`/`manual`
plus Konfidenz)" — das ist `booking_facts`. Daneben steht
`field_provenance`: dieselbe Auskunft **je Feld** (`contractType`,
`startDate`, …), nicht je Faktum. Ein Editor, der den Vertragstyp ändert, muss
also **beides** schreiben: den Wert und `field_provenance.contractType` auf
`{ source: "manual", confidence: null }`. Steht das nicht in der Spec, baut
der Entwicklungsagent einen Editor, der die Herkunft still auf `ai` stehen
lässt — und dann behauptet die Oberfläche, die KI habe geschrieben, was ein
Mensch geschrieben hat.

**2. „Als geprüft bestätigen" hat keine Spalte.** Weder
`client_source_docs_contracts` noch `client_source_docs` führt ein Feld für
Bestätigung, Prüfung oder Freigabe (`confirm|review|verified|checked|approved`
— **null Treffer** in beiden Tabellen). Der Auftrag endet mit genau dieser
Handlung. Damit hat sie heute **kein Ziel**: entweder bekommt sie eine Spalte
(oder ein Ereignis in `platform_audit_events` mit
`resource_kind='contract'` — das Vokabular kennt `contract` bereits), oder der
Satz fällt aus der Spec. Das ist eine Owner-Frage, keine Bauentscheidung, und
sie steht als **Befund L-213** im Register.

**3. Die zwei JSONB-Spalten sind nirgends beschrieben.** `field_provenance`
und `booking_facts` haben keinen Spaltenkommentar; ihre Struktur steht nur im
gespiegelten TypeScript. Für das Set genügt das — der Spiegel ist die Vorgabe
—, aber wer das Schema allein liest, sieht zwei formlose Objekte. Befund
**L-214**.

### Der Blocker bleibt, und er ist der eigentliche Grund

`client_source_docs_contracts` hat im Bestand **0 Zeilen** (Profil-Befund B1).
Die **lesende** Ausprägung ist damit gebaut und abgenommen (0076): sie steht
gegen Schema und Typ. Die **Bearbeitung** kann niemand abnehmen — es gibt
keinen extrahierten Vertrag, an dem sich prüfen ließe, ob ein Feld richtig
zurückgeschrieben wird, ob die Provenienz umspringt und ob die Konfidenz
danach noch etwas bedeutet. Eine Abnahme ohne Nachweis ist keine.

**Urteil: der Auftrag ist gegen das Schema haltbar, bleibt aber `offen`** —
mit zwei Präzisierungen für den Tag, an dem er drankommt (Provenienz doppelt
führen; Bestätigung braucht erst ein Ziel) und einem Auslöser, der nicht in
unserer Hand liegt: die erste Zeile in der Tabelle.
