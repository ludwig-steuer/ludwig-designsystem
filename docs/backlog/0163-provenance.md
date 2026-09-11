# 0163 · Warum steht das so da? (`Provenance`)

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, gegen 867fb3a) |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: woher ein Wert kommt — Maschine, Regel, Mensch, Import —, wer ihn gesetzt hat und warum, fragt jede Anwendung mit Vorschlägen und Importen |
| Quelle | UI-Kit-Roadmap `docs/backlog/uikit-entity-roadmap-2026-09.md` (ludwig/app 9be34746), Abschnitt B, **B5** „Provenance / Rationale"; Reihenfolge laut Übergabe: B5 vor Entität #1 (Buchungssatz). Auftrag über `ludwig-manager`, 2026-09-11 |
| Ersetzt | nichts unmittelbar — die allgemeine Form fehlt. Heute steht die Antwort entitätsgebunden oder gar nicht: `AiBookingNotes` (Buchungssatz), der Block „Herkunft und Ablage" in `SourceDocumentFacts` (0120), die Spalte „Herkunft" an `OpenItemLinkRow` (`matched_by`, `rationale` 100 % gefüllt, nirgends lesbar), Belegnummer (`decided_by_kind`, `rationale`), Konvention (`origin`, `rationale`); **Ablösekandidat** `ProvMark` in `apps/web/src/modules/contracts/ui/ContractDetail.tsx:97` — eine eigene Herkunftsmarke je Vertragsfeld (KI sicher mit Prozent, KI unsicher „bitte prüfen", vom Menschen geprüft; Klassen `pmark*`), genau die Frage von `ProvenanceMark` (Hinweis ludwig-worker, 2026-09-11) |
| Blockiert | Entität #1 `journal-entry` (Herleitung in `JournalEntryFacts`, `proposal_rationale` 52 %, `step_code`), die Ausgleichs-Zuordnung (#11), Konvention (#8), Belegnummer |
| Spec von / am | Claude, 2026-09-11 |

## Ziel

Die Sachbearbeiterin sieht einen Wert — ein Konto im Vorschlag, eine
Belegnummer, eine Zuordnung von Rechnung und Zahlung — und fragt: **warum
steht das so da, und wer sagt das?** Die Daten haben die Antwort (Herkunft,
Regel-Code, Konfidenz, Begründung), aber jede Stelle der App zeigt davon einen
anderen Ausschnitt, und an den meisten gar keinen. Der Weg vom Wert zu seiner
Herleitung soll überall gleich aussehen und gleich weit sein: ein Zeichen neben
dem Wert, ein Klick bis zur Begründung.

## Einordnung

- **Wiederverwenden:** `AiBookingNotes` beantwortet die Frage für **einen**
  Fall — den Vorschlag des Agenten mit dem Urteil des Judge; Agent und Judge
  gibt es nur am Buchungssatz, die Form bleibt dort. `Confidence` ist die
  Konfidenz als Pattern und wird hier komponiert. `Disclosure` trägt das
  Aufklappen.
- **Neu, weil:** `spec-schreiben` §3 Regel 4 — dieselbe Komposition auf
  mindestens vier Screens (Buchungssatz, Ausgleich, Belegnummer, Konvention),
  mit eigenem Zustand (auf- und zuklappen). Der Klassen-Test sagt Pattern: die
  Frage kennt keine Entität.
- **Zuschnitt:** eine Familie in `patterns/Provenance.tsx` — `ProvenanceMark`
  (XS, neben dem Wert) und `ProvenanceNote` (M, die Herleitung). Beide lesen
  denselben Datensatz `Provenance`; zwei Größen einer Antwort, nie getrennt
  gebraucht ohne dieselben Daten.
- **Setzt auf:** `Disclosure`, `Confidence`, `FieldList`, `LongText`, `Time`,
  `MonoCell`.

## Aufbau

**`ProvenanceMark`** — neben dem Wert, in einer Zeile oder Zelle:
Herkunft (das Wort der Achse des Aufrufers) · Konfidenz kompakt, wenn es eine
gibt · der Grund als **ein Satz** im Hover und für die Vorlesehilfe. Mit `href`
ist die Marke der Weg zur Herleitung.

**`ProvenanceNote`** — die Herleitung, zugeklappt; die Zusammenfassung ist
dieselbe Zeile wie die Marke plus wer und wann. Aufgeklappt, in fester
Reihenfolge, jede Zeile nur mit Wert:

| Zeile | Inhalt |
|---|---|
| Herkunft | das Wort der Achse · wer (Agent und Lauf, Mensch, Import) · wann |
| Regel | Code (`MonoCell`) und der Satz dazu |
| Konfidenz | `Confidence` mit Wort und Prozent |
| Begründung | Freitext, `LongText` |
| Quellen | je Quelle Zeichen und Wort der Art, Bezeichnung, Zitat in Anführungszeichen, der Weg, wo es einen gibt |
| Von Hand korrigiert | wer, wann — nur wenn gesetzt |

Eine Herleitung ohne Begründung ist keine leere Zeile „Begründung: —", sondern
fehlt; eine Marke ohne Grund trägt als Satz die Herkunft selbst.

## Schnittstelle

```ts
interface ProvenanceSource {
  key: string;
  kind: ReactNode;             // Zeichen und Wort der Quellenart — vom Aufrufer
  label?: string | null;
  quote?: string | null;
  href?: string | null;
}

interface Provenance {
  origin: ReactNode;                                   // StatusBadge der Achse des Aufrufers (buchung_origin …)
  actor?: ReactNode;                                   // „Agent · Lauf 4b19c2", „Anna Muster", „DATEV-Import"
  at?: string | null;                                  // ISO
  rule?: { code?: string | null; sentence: string } | null;
  confidence?: { level: ConfidenceLevel | null; value?: number } | null;
  rationale?: string | null;
  sources?: readonly ProvenanceSource[];
  corrected?: { by: ReactNode; at: string } | null;
}
```

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `ProvenanceMark.provenance` | `Provenance` | ja | woher der Wert kommt | `Origins` |
| `ProvenanceMark.reason` | `string` | nein | der eine Satz im Hover; ohne ihn die Begründung, gekürzt, sonst die Herkunft | `Mark` |
| `ProvenanceMark.href` | `string` | nein | Weg zur Herleitung | `Mark` |
| `ProvenanceNote.provenance` | `Provenance` | ja | die Herleitung | `Note` |
| `ProvenanceNote.defaultOpen` | `boolean` | nein (Default `false`) | aufgeklappt beginnen — etwa wenn von Hand korrigiert | `Corrected` |

Das Wort der Herkunft und der Quellenart kommt vom Aufrufer (Registry-Achse,
Wortliste seiner Entität); das Pattern hat keine eigene. Bewusst **nicht**:
Vorher/Nachher feldweise (B3 `DiffView` — `corrected` nennt nur wer und wann),
das Urteil eines Prüfers (bleibt `AiBookingNotes`), Bearbeiten.

## Verhalten

Client-Komponente (Aufklappen über `Disclosure`). Die Marke ist ohne `href`
Text mit `title`, mit `href` ein Link. Keine Zustände „lädt"/„Fehler": die
Herleitung kommt mit dem Wert, den sie erklärt; fehlt der Wert, fehlt sie auch.

## Stories

Titel `v3/Patterns/Prüfen/Provenance`.

| Story | Beweist |
|---|---|
| `Note` | ein KI-Vorschlag: Herkunft, Regel-Code, Konfidenz, Begründung, drei Quellen — zugeklappt und aufgeklappt |
| `Origins` | fünf Herkünfte als Marken nebeneinander (KI-Vorschlag, Regelwerk, Manuell, Mandantenstapel, Storno — Achse `buchung_origin`) |
| `Mark` | die Marke in einer Feldliste und in einer Tabellenzelle, mit Grund im Hover und Weg |
| `Corrected` | von Hand korrigiert: wer, wann, aufgeklappt beginnend |
| `Sparse` | nur die Herkunft — keine leeren Zeilen |
| `InUse` | die Ausgleichs-Zuordnung: `matched_by` und `rationale` neben dem Paar — heute gefüllt und nirgends lesbar |
| `Edges` | Begründung mit 700 Zeichen, zwölf Quellen, ein langer Regel-Code, in 360 px Breite |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| `AiBookingNotes` baut Begründung und Quellen aus `ProvenanceNote`, behält Urteil und Judge | keine neue — Umbau im Entitäts-Baustein | 0163 ist abgenommen |
| Herkunft je Feld am Beleg (F167 `field_provenance`) | `ProvenanceMark` je Zeile in `SourceDocumentFacts` | die Felder stehen im Spiegel |
| Vom korrigierten Wert zum Vorher/Nachher | `corrected.href` in B3 `DiffView` | B3 ist gebaut |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Die Herleitung zeigt ihre Zeilen in der Reihenfolge der Tabelle oben; eine Zeile ohne Wert fehlt (`Note`, `Sparse`)
- [ ] Zugeklappt nennt die Zusammenfassung Herkunft, Konfidenz, wer und wann (`Note`)
- [ ] Die Marke trägt einen Satz in `title` und für die Vorlesehilfe; ohne `href` ist sie Text, mit `href` ein Link (`Mark`)
- [ ] Jede Quelle hat Zeichen und Wort ihrer Art; ein Zitat steht in Anführungszeichen; ein Weg nur mit `href` (`Note`, `Edges`)
- [ ] Das Wort der Herkunft kommt vom Aufrufer — das Pattern enthält keine Wortliste und keine Achse
- [ ] „Von Hand korrigiert" steht nur, wenn gesetzt, mit wer und wann (`Corrected`)
- [ ] In 360 px Breite kein Querlauf, kein Text in 16 px (`Edges`)

## Gebaut 2026-09-11

- `patterns/Provenance.tsx` mit `ProvenanceMark`, `ProvenanceNote` und den
  Typen `Provenance`, `ProvenanceSource`; Export im Barrel unter „Prüfen".
- **Abweichung von „Verhalten":** Server-Komponente, nicht Client —
  `Disclosure` ist ein natives `<details>`, das Aufklappen braucht kein JS.
- Die Zusammenfassung der Herleitung trägt Herkunft und Konfidenz, aber nicht
  den Satz der Marke: die Begründung steht aufgeklappt direkt darunter, die
  Vorlesehilfe hörte sie sonst zweimal.
- Die Herleitung ist Prosa, keine Stammdaten: `FieldList` setzt Werte rechts,
  hier stehen sie links in einer gemeinsamen Label-Spalte (Subgrid). Das ist
  derselbe Umweg wie `.v2btxf__note`. Mit zwei Aufrufern ist die Prosa-Zeile
  fällig: Nachtrag in 0006 (`FieldList`). Der Verweis „gehört 0058" in 0102
  war falsch — 0058 ist der verworfene `ClarificationDrawer`.
- **Namensgleichheit in der App:** `apps/web/src/modules/contracts/domain/contract.ts:7`
  hat `type ProvenanceSource = "ai" | "manual"`. Heute keine Kollision (kein
  `export *`); wer die Vertragsseite auf `ProvenanceMark` umstellt, importiert
  einen der beiden mit Alias (Hinweis ludwig-worker, 2026-09-11).
- Ein langer Regel-Code bricht um (`overflow-wrap: anywhere`), statt quer zu
  laufen.
- Die Story `Mark` zeigt die Marke in einer Feldliste **und** in einer
  Tabellenzelle; Quellenart in allen Stories über `EntityIcon`.
- CSS `.v3prov*` am Ende von `v3.css`.

## Messung (6107)

| Kriterium | Ergebnis |
|---|---|
| `pnpm typecheck`, alle Wächter | grün |
| Reihenfolge, fehlende Zeilen | `Note` Herkunft · Regel · Konfidenz · Begründung · Quellen; `Sparse` nur Herkunft; `Corrected` Herkunft · Begründung · Von Hand korrigiert |
| Zusammenfassung zugeklappt | „KI-Vorschlag · (Konfidenz: Sicher · 92 %) · Agent · Lauf 4b19c2 · 31.07.2026" — die Konfidenz kompakt mit `aria-label` und `title` |
| Satz der Marke | alle vier Marken in `Mark` mit `title` und gleichem Satz in `.v2vh`; mit `href` `A`, ohne `SPAN`; Begründung über 160 Zeichen gekürzt mit „…" |
| Quellen | jede mit Zeichen (`svg`) und Wort; Zitat in „…"; Link nur bei `href` (2 von 3 in `Note`) |
| Wort der Herkunft | fünf Marken in `Origins` aus `buchung_origin`; das Pattern enthält kein Wort einer Achse |
| 360 px (`Edges`) | `scrollWidth` 360, kein Element über den Rand, kein Text in 16 px, 12 Quellen |

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Fremde Abnahme am 2026-09-11 durch die Prüfer-Session (Auftrag `ludwig-manager`), gegen 867fb3a: **fertig.** Zeilen in fester Reihenfolge, leere fehlen; Zusammenfassung mit Herkunft, Konfidenz (`aria-label`), wer und wann; Marke `A[href]`/`SPAN` mit `title` und `v2vh`; Quellen mit `EntityIcon` und Wort, Links nur mit `href`; kein Achsen-Zugriff im Pattern; 7 × 3 Messungen ohne Querlauf, kein Text in 16 px. Hinweis ohne Mangel: in `Mark` ragte die Marke der Feldliste bei 360 px 13 px über den Rand — die Story-Zeile bricht jetzt um.

