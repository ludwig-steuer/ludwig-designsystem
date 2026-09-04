# 0061 · ClarificationEditor — selbst fragen, selbst kommentieren

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/clarification/` — Gruppe Klärung |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Zielgruppe (Kanzlei · Mandant · Agent) und Schwere sind Ludwig-Achsen |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` (2026-09-04) §Formen · Owner-Rückfrage 2026-09-04 („Klärungsfrage kann auch durch den User erstellt werden, also brauchen wir auch eine Erstellungsansicht, dort aber sehr vereinfacht, nur Textfelder, keine Sources oder sowas") |
| Ersetzt | `RaiseClarificationForm` (`modules/accounting-cases/ui/sachverhalt`) · `CaseCommentForm` (`modules/accounting-cases/ui`) |
| Blockiert | nichts |
| Setzt voraus | 0059 `Clarification` (Typen), 0060 `ClarificationCard` (die Vorschau des Ergebnisses) |
| Spec von / am | Claude, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 · `pnpm typecheck` und `pnpm build` grün, Stories im Browser angesehen |

## Ziel

22 % aller Klärungen im Bestand stammen aus der Kanzlei
(`source_module = 'web'`, 37 von 166), dazu 13 Kommentare. Heute gibt es
dafür zwei Formulare an zwei Orten. Neu: **eines**, bewusst schmal.

Was der Agent mitbringt — Quellen, Fakten, Frageart, Antwortoptionen,
Empfehlung — entsteht hier **nicht**. Eine von Hand gestellte Frage ist Text
an eine Zielgruppe, mehr nicht. Das ist keine Sparmaßnahme, sondern die
Entscheidung des Owners: „sehr vereinfacht, nur Textfelder". Damit blockiert
auch der fehlende `question_type`-Katalog (Befund B1) diese Form nicht — sie
braucht ihn nicht.

## Einordnung

- **Wiederverwenden:** kein Treffer, der das Formular trägt.
  - `Field`, `Input`, `Textarea`, `RadioGroup`, `ActionBar` (`@when The
    actions of a screen or dialog footer, exactly one primary path`) tragen
    die Teile; das Zusammensetzen ist die Komponente.
  - `ChoicePrompt` (0028) ist die Gegenrichtung — sie **beantwortet**.
  - `InlineEdit` (`@when A single value that is read far more often than it
    is changed`) — hier entsteht ein neuer Datensatz, kein Feld wird
    geändert.
  - `ReasonDialog` — ein Grund zu einer schon gewählten Aktion, nicht eine
    eigenständige Frage.
- **Neu, weil:** `spec-schreiben` §3.5 — die Form „Editor" der Entität
  Klärung; sie existiert heute zweimal in der App und deckt keine vorhandene
  Form ab.
- **Zuschnitt:** eigene Datei
  `entities/clarification/ClarificationEditor.tsx`. Getrennt von 0060, weil
  sie aus der anderen Richtung arbeitet (schreibt einen neuen Datensatz statt
  einen bestehenden zu beantworten) und allein gebraucht wird — am
  Sachverhalt gibt es den Knopf „Rückfrage stellen" ohne jede offene Frage.
- **Setzt auf:** `Field`, `Input`, `Textarea`, `RadioGroup`, `ActionBar`,
  `ActionButton`, `Callout`.

## Schnittstelle

### `ClarificationDraft` — was entsteht

| Feld | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `type` | `ClarificationType` | ja | `question` oder `comment`; ein Kommentar hat weder Zielgruppe noch Schwere (DB-CHECK: `type='comment'` erzwingt `answered_at is null`) | `Kommentar` |
| `title` | `string` | ja | Überschrift, max. 140 Zeichen — die Spalte ist dafür gedacht („max ~140 Zeichen", Spaltenkommentar) | `Gefuellt`, `Ungueltig` |
| `text` | `string` | ja | die Frage im Volltext; landet in `professional_text` **und** `client_text` (siehe Verhalten) | `Gefuellt` |
| `audience` | `"accounting" \| "client" \| "agent"` | nur bei `question` | wer antworten soll | `Gefuellt` |
| `severity` | `ClarificationSeverity` | nur bei `question` | `required` blockiert die Buchung — der Editor sagt das im Klartext neben der Auswahl | `Gefuellt` |

### `ClarificationEditor`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `defaultType` | `ClarificationType` | nein | Voreinstellung `"question"`; der Kommentar-Knopf am Fall setzt `"comment"` | `Kommentar` |
| `defaultAudience` | `"accounting" \| "client" \| "agent"` | nein | Voreinstellung `"client"` — die Kanzlei fragt meistens den Mandanten | `Gefuellt` |
| `onSubmit` | `(draft: ClarificationDraft) => Promise<void>` | ja | der Editor schreibt nichts | `Gefuellt` |
| `onCancel` | `() => void` | nein | ohne die Prop kein Abbrechen-Knopf | `Gefuellt` |
| `pending` | `boolean` | nein | läuft gerade | `Laedt` |
| `error` | `string` | nein | Fehler des Absendens, am Knopf | `Fehler` |
| `audienceHint` | `string` | nein | ein Satz unter der Zielgruppe („Der Mandant sieht diesen Text im Portal.") | `Gefuellt` |

**Was der Editor bewusst nicht kann:** keine Quellen, keine Fakten, keine
Antwortoptionen, keine Frageart, keine Empfehlung, keine Wiedervorlage, kein
Dateianhang. Wer das braucht, ist der Agent, und der schreibt über MCP, nicht
über dieses Formular. Er lädt nichts und kennt keinen Sachverhalt — der
Aufrufer weiß, an welchem Fall er hängt.

Typen aus `src/ludwig/`: `ClarificationType`, `CLARIFICATION_TYPES`
(`modules/accounting-cases/domain/case`), `ClarificationSeverity`
(`modules/invoices/domain/invoice`).

## Verhalten

- **Client-Komponente** (`"use client"`): das Formular hält seinen Entwurf.
- **Ein Text, zwei Spalten.** Die Tabelle verlangt `professional_text` und
  `client_text` (beide NOT NULL). Von Hand gestellte Fragen füllen heute
  beide gleich — im Bestand sind **79 %** aller Zeilen identisch (Befund B3).
  Der Editor bietet deshalb **ein** Textfeld und der Aufrufer schreibt beide
  Spalten. Zwei Felder wären eine Behauptung, die niemand einlöst.
- **Kommentar schaltet um:** bei `type="comment"` verschwinden Zielgruppe und
  Schwere, und die Überschrift heißt „Notiz". Der Kommentar erwartet keine
  Antwort und steht nie in der Timeline (Owner 2026-09-04) — dieser Satz
  steht als Hinweis unter dem Feld.
- **`required` sagt, was es tut:** neben der Auswahl steht „blockiert die
  Buchung, bis jemand antwortet", nicht nur das Wort.
- **Tastatur:** ⌘/Ctrl+Enter sendet; die Taste steht auf dem Knopf (V14).
  `Esc` bricht ab, wenn `onCancel` gesetzt ist.
- **Ungültig:** leerer Titel, leerer Text, Titel über 140 Zeichen. Der Grund
  steht am Feld und der Absendeknopf sagt, was fehlt — nicht nur grau.
- **Zustände:** leer (Neuanlage — der Normalfall) · gefüllt · ungültig ·
  lädt · Fehler. **Nicht anwendbar:** „leer nach Filter" — der Editor
  filtert nichts.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationEditor`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Frage an den Mandanten, Rundlauf über `useState`, Entwurf im Storybook sichtbar |
| `Kommentar` | `defaultType="comment"` — ohne Zielgruppe, ohne Schwere |
| `Zielgruppen` | alle drei Werte nebeneinander mit ihren Hinweisen |
| `Ungueltig` | leerer Titel und 180-Zeichen-Titel, Grund am Feld |
| `Laedt` | `pending` am Knopf |
| `Fehler` | `error` am Knopf, Eingabe bleibt erhalten |
| `ImEinsatz` | im `Drawer` am Sachverhalt, wie auf der Seite |

Sieben Stories; Editor-Untergrenze (gefüllt, leer, Fehler, lädt, ungültig)
erfüllt. „Leer" ist der Startzustand von `Gefuellt` und bekommt keine eigene
Story — das Formular startet immer leer.

## Ausbau

Nach A12: keine Prop auf Vorrat, hier steht der Plan.

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Frageart wählen | `questionTypes?: readonly { value: string; label: string }[]` — ohne die Prop bleibt das Formular schmal, genau wie heute | Befund B1 ist gelöst: es gibt einen Katalog in der Domain |
| Antwortoptionen vorgeben | `answerOptions`-Feld im Entwurf | belegt ist, dass die Kanzlei Auswahlfragen stellen will; heute stellt sie 37 Fragen, alle als Text |
| Wiedervorlage beim Stellen setzen | keine — das gehört zur Frage, nicht zu ihrer Entstehung | nie; 0065 setzt sie an der Karte |
| Entwurf zwischenspeichern | `value` / `onChange` statt interner State (kontrollierte Variante) | das Formular überlebt einen Seitenwechsel nicht und jemandem geht Text verloren |

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

- [ ] Genau ein Textfeld für die Frage; die Datei kennt keine Trennung
      professional/client (grep, Story `Gefuellt`)
- [ ] `type="comment"` blendet Zielgruppe und Schwere aus (Story `Kommentar`)
- [ ] `required` trägt den Satz „blockiert die Buchung …" neben sich (Story `Zielgruppen`)
- [ ] Titel über 140 Zeichen wird abgewiesen, mit Grund am Feld (Story `Ungueltig`)
- [ ] ⌘/Ctrl+Enter sendet, und die Taste steht auf dem Knopf (Story `Gefuellt`)
- [ ] Keine Quellen-, Fakten- oder Optionsfelder vorhanden (Blick in die Datei)
- [ ] Ersetzt `RaiseClarificationForm` und `CaseCommentForm` ohne
      Funktionsverlust — offen (App)

## Offene Fragen

1. Darf die Kanzlei eine Frage an den **Agenten** stellen? Der Bestand kennt
   `audience='agent'` (22 %), aber aus Pipeline-Modulen. — ohne Antwort: ja,
   alle drei Werte stehen zur Wahl; der Aufrufer kann über `defaultAudience`
   vorbelegen und die Auswahl an seiner Stelle einschränken.
2. Braucht der Kommentar eine Zielgruppe (nur für die Kanzlei sichtbar vs.
   auch im Portal)? — ohne Antwort: nein, ein Kommentar ist Kontext am Fall
   und folgt den Sichtbarkeitsregeln des Falls.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: … · Offene Punkte: …
