# 0265 · Fortschritt eines Laufs in Schritten (`PhaseProgress`)

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/`, Gruppe Prozess. Die Schritte stehen als Zeilen mit denselben Zeichen wie die Schrittliste im `ProcessDialog` (`.pz-steps`), die Kurzform nutzt die Spur von `ProcessMini` |
| Klassen-Test | ja, sobald es dort einen Ablauf in festen Schritten gibt: Ein Datenimport einer Versicherung mit „Policen lesen · Abgleichen · Übertragen“ braucht dasselbe Bild |
| Quelle | Seitenprofil `docs/seiten/duo-connect.md` (Commit b4a9660, Owner angenommen 2026-11-27): **U5** (Schritte als Zeilen statt waagerechtem Abschnittsbalken), **U6** (ausgeschaltete Schritte erscheinen nicht), **A7** (läuft · ein Mandant), **A8** (läuft · Durchgang), **A9** (wartet auf DATEV-Anmeldung). Anfrage plugin-mananger 2026-11-27: `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Fortschrittsbalken in Abschnitten“. `docs/spec-oberflaeche-und-fehler.md` C2: Menge sobald bekannt, sonst laufende Anzeige; „nie rückwärts“; Ansage nur beim Wechsel. Begriffe und Anwendertexte aus `docs/begriffe.md` |
| Ersetzt | nichts im Set und in `ludwig/app`. Im Plugin die heutige Fortschrittsanzeige der Sync-Seite (Plugin-Code, hier nicht geprüft) |
| Blockiert | Plugin-Paket „Designsystem einbauen“ (Seitenprofil A7, A8, A9) |
| Spec von / am | designsystem, 2026-11-27; überarbeitet am selben Tag nach Annahme des Seitenprofils (U5) |

## Ziel

Die Mitarbeiterin startet den Abgleich für die Musterfirma GmbH und lässt die
Seite neben dem DATEV-Fenster offen, oft auf halber Bildschirmbreite. Sie
sieht die Schritte des Abgleichs als Zeilen untereinander. Jede Zeile hat
links ein Zustandszeichen, in der Mitte den Anwendertext („Neue Belege aus
DATEV holen“) und rechts den Zähler bzw. eine Notiz („Beleg 37 von 120“,
„wartet auf Anmeldung“, „4 Ablageorte“).

Nur die laufende Zeile trägt einen Balken:
- Ist die Menge bekannt, füllt er sich bis zum Anteil.
- Ist sie unbekannt (DATEV öffnen, Export abwarten), gleitet darin ein
  Stück.

Wartet der Abgleich auf die DATEV-Anmeldung, steht das rechts in der Zeile
statt der Zahl. Bricht er ab, bleibt der Balken stehen, wo er war, und rechts
steht der Grund. Im Durchgang über zwölf Mandanten zeigt der Block „Jetzt“
denselben Lauf als eine Zeile, also als Kurzform.

Ein waagerechter Balken mit vier Abschnitten ist verworfen (U5): Die
Anwendertexte passen nicht hinein, und unter 640 px bricht er.

## Einordnung

- **Wiederverwenden, geprüft in dieser Reihenfolge:**
  - **`ProcessDialog` hat die Zeilenform schon:** Seine Schrittliste
    (`Steps`, `.pz-steps`) zeigt je Schritt Zeichen und Text, der laufende
    halbfett, offene gedämpft. Die Zeichen kommen über die Zuordnung
    `STEP_STATE` (`ProcessPhaseStatus` → `StateKind`).
    - Die Liste ist aber privat im Dialog.
    - Sie verlangt `ProcessStep` mit Zeitpunkt und Handelndem und kennt
      weder Menge noch Balken noch Ansage.
    - `PhaseProgress` übernimmt deshalb ihr Vokabular (Klassen,
      Zeichenzuordnung), nicht die Funktion.
  - **`ProcessStepper`** (`@when` „Process state in the detail header —
    phases, owner, loops“) beantwortet, wo ein Stapel steht und wer ihn hält.
    Er verlangt `owner`, und seine Phasen stehen waagerecht, genau das
    verwirft U5.
  - **`ProcessMini`** ist die Spur aus vier Segmenten, ohne Anteil und ohne
    Wort. Sie ist das Vorbild für `compact`.
  - **`Checklist`** (`@when` „Checklist of a gate: check, status, progress,
    jump“) sieht ähnlich aus: Zeile, Zeichen, Zähler, Anteil. Es ist aber die
    Prüfliste eines Gates zum Auswählen und Springen (`onPick`, `activeKey`,
    Aufklappen, `MasterDetail`), ohne laufende Anzeige und ohne Ansage. Die
    Frage ist dort „ist das Gate durch“, hier „wie weit ist der Lauf“.
  - **`StepRail`** ist eine Navigation durch Prüfschritte und springbar.
  - **`Progress` mit `done`/`total`** ist der Balken der laufenden Zeile und
    der **Gesamtbalken des Durchgangs** („Mandant 3 von 12“). Er wird
    verwendet, nicht neu gebaut. `Progress` mit `parts` (Teile eines
    Ganzen) passt nicht, jeder Schritt hat seinen eigenen Zustand.
  - `Timeline` erzählt die Geschichte, `TaskList` sammelt Aufgaben.
    `AgentRunBanner` ist ein Lauf ohne Schritte.
- **Neu, weil:** §3 Regel 4. Die Komposition hat einen eigenen Ansageweg:
  eine Live-Region, die nur spricht, wenn der Schritt oder sein Zustand
  wechselt, nie bei einer Zahl (C2). Sie kommt an zwei Orten vor: A7 groß,
  A8 als Kurzform im Block „Jetzt“. Die Statuszeile des Popups (D3, 0263)
  kann die Kurzform ebenfalls nehmen.
- **Hausregel Familie** („jede mehrstufige Kette zeigt dasselbe
  Prozessbild“): Der Zustandstyp ist `ProcessPhaseStatus` aus `Process.tsx`.
  - Die Zeichen kommen über **dieselbe** Zuordnung wie im `ProcessDialog`:
    `STEP_STATE` wird aus `ProcessPicture.tsx` an einen gemeinsamen Ort
    gehoben und exportiert, nicht kopiert.
  - Die Zeilen nehmen die Optik von `.pz-steps`, die Kurzform die Spur von
    `.pz-mini`.
  - Arbeit ohne Menge zeigt dieselbe Bewegung wie `RunMark` (`v3runmark`).
- **Zuschnitt:** eigene Datei `patterns/PhaseProgress.tsx`, ein Export,
  eigene Stories. Nicht in `Process.tsx`, aus zwei Gründen nach §4:
  - Sie wird allein gebraucht.
  - `Process.stories.tsx` hätte sonst mehr als zehn Stories.

  `ProcessStepper`, `ProcessMini` und `Checklist` verweisen in ihrem
  `@instead` auf sie.
- **Setzt auf:**
  - `ProcessPhaseStatus` und `STEP_STATE`
  - `StateIcon`, `stateLabel`
  - `Progress` (`done`/`total`, `label={null}`, `size="sm"`, `tone`)
  - `formatCount`
  - das Schlüsselbild `v3runmark`
  - die Klassen `.pz-steps` und `.pz-mini` in `v3.css`
- **Abweichung vom Auftrag:** Laufend ohne Menge zeigt **nicht** den
  `Spinner` (0268), sondern das gleitende Stück in der Spur der laufenden
  Zeile. Zwei Gründe:
  - 0225 und 0268 halten fest: Der Kreis heißt „kurz“, das gleitende Stück
    heißt „dauert“, und DATEV öffnen oder einen Export abwarten kann eine
    Minute dauern.
  - Die Zeile hat ohnehin eine Spur für den Balken. Ein Kreis daneben wäre
    ein zweites Zeichen für dieselbe Sache.
- **Zustand und Registry:** Die Zustände der Schritte werden **keine
  Registry-Achse**.
  - Sie sind Darstellung eines Laufs: Das Plugin leitet sie aus seinem
    Lauf-Objekt ab. Sie werden nicht gespeichert und erscheinen in keiner
    Liste als Badge.
  - Ihr Vokabular ist das des Prozessbilds.
  - Der Zustand des **Abgleichs** dagegen (Wartet, Läuft, Fertig, Fertig mit
    Problemen, Abgebrochen, Übersprungen) steht im Verlauf und in der
    Durchgangsliste (A8) als Badge. Er gehört als Achse `duo_sync` in die
    Registry der App, das ist bei Simon offen. Bis dahin steht dort `Badge`,
    als benannter Übergang.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `phases` | `readonly PhaseProgressItem[]` | ja | Die Schritte eines Laufs, oben nach unten in Laufreihenfolge. **`phases` enthält nur, was läuft (U6):** Eine ausgeschaltete Belegübergabe gibt der Aufrufer nicht mit, sie erscheint nicht als ewig offener Schritt. `[]` rendert nichts | `Running`, `Edge` |
| `label` | `string` | ja | Der zugängliche Name des Ganzen (`role="group"` mit `aria-label`), z. B. „Fortschritt des Abgleichs Musterfirma GmbH“. Auch der Anfang jeder Ansage, siehe Verhalten | `Live`, `InUse` |
| `density` | `"regular" \| "compact"` | nein (`"regular"`) | `regular`: alle Schritte als Zeilen untereinander (A7). `compact`: einzeilige Kurzform, die Spur von `.pz-mini` und eine Zeile für den aktuellen Schritt (A8, Block „Jetzt“) | `Densities`, `InUse` |

`PhaseProgressItem`, je Schritt:

| Feld | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `key` | `string` | ja | stabiler Schlüssel, die Kennung des Plugins (`ablage`, `belege`, `upload`, `kontoauszuege`) | `Running` |
| `label` | `string` | ja | der Anwendertext des Schritts aus `begriffe.md`: „Gebuchte Belege in DATEV einsortieren“, „Neue Belege aus DATEV holen“, „Belege aus Ludwig an DATEV übergeben“, „Kontoumsätze aus DATEV holen“ | `Running` |
| `status` | `ProcessPhaseStatus` (`"pending" \| "active" \| "held" \| "done" \| "failed"`) | ja | der Zustand des Schritts im Vokabular des Prozessbilds | `Statuses` |
| `count` | `{ done: number; total: number; unit: string } \| null` | nein | Bekannte Menge. Rechts steht „{unit} {done} von {total}“ mit `formatCount`: „Beleg 37 von 120“, „Konto 2 von 3“, „Ablageort 1 von 4“. Darunter füllt sich der Balken (`Progress`) zu `done/total`. Die Menge wirkt bei `active`, bei `held` und `failed` bleibt der Balken beim Anteil stehen. Bei `pending` und `done` wird sie nicht gezeigt. `total ≤ 0` zählt als keine Menge, `done > total` wird auf `total` begrenzt | `Running`, `Failed`, `Edge` |
| `note` | `string` | nein | Die rechte Spalte, wenn es keine Zahl gibt oder die Zahl nicht gilt. Bei `active` ohne Menge, was gerade passiert („DATEV wird geöffnet …“). Bei `held` der Grund („wartet auf Anmeldung“). Bei `failed` die Ursache („DATEV-Sitzung abgelaufen“). Bei `done` das Ergebnis in wenigen Wörtern („4 Ablageorte“, „12 übertragen“, „nichts abzurufen“) | `Starting`, `WaitingForLogin`, `Failed`, `Statuses` |
| `issue` | `string` | nein | Nur bei `done`: Der Schritt ist durch, aber nicht alles ging („3 Belege nicht übertragen“). Zeichen Warnung und rechts dieser Satz | `Statuses` |

**Die Zustände aus Anfrage und Seitenprofil, auf die Felder gelegt:**

| Anfrage / Profil | `status` | weitere Felder | Zeichen (`STEP_STATE`) | rechte Spalte | Spur unter der Zeile |
|---|---|---|---|---|---|
| offen | `pending` | — | offener Kreis, Zeile gedämpft | leer | keine |
| läuft ohne Menge | `active` | `note` optional | gefüllter Kreis, Text halbfett | `note`, ohne `note` „läuft“ | gleitendes Stück |
| läuft mit Menge | `active` | `count` | gefüllter Kreis, Text halbfett | „Beleg 37 von 120“ | `Progress` bis zum Anteil, Ton Akzent |
| wartet auf Anmeldung (A9) | `held` | `note`, `count` optional | Warnung | `note` („wartet auf Anmeldung“) statt der Zahl | steht: mit Menge `Progress` beim Anteil im Ton Warnung, ohne Menge leere Spur |
| fertig | `done` | `note` optional | erledigt | `note` („4 Ablageorte“), sonst leer | keine |
| Problem | `done` | `issue` | Warnung | `issue` | keine |
| abgebrochen | `failed` | `note`, `count` optional | Fehler | `note` | steht: mit Menge `Progress` beim Anteil im Ton Fehler, ohne Menge leere Spur |

Typen aus `src/ludwig/`: keine. Der Lauf ist ein Begriff des Plugins
(`begriffe.md`: Abgleich, Kennung `lauf`), nicht der App.
`ProcessPhaseStatus` und `STEP_STATE` kommen aus dem Set und werden nicht
dupliziert.

Was die Komponente **nicht** kann (bewusst):
- **Sie wacht nicht über die Richtung.** „Der Balken läuft nie rückwärts“
  (C2) ist eine Regel an die Daten des Aufrufers.
- **Keine Restzeit, kein Gesamtprozent** (C2).
- **Kein Ziel.** Eine Zeile ist nicht klickbar. Wer springen will, nimmt
  `StepRail`.
- **Keine Staffel, keine Schleifen.** Das ist `ProcessStepper`.
- **Sie sagt das Ende nicht an.** Wird der Lauf fertig, tauscht die Seite auf
  das Ergebnis (A10–A12), und das sagt die Region der Seite an (vgl. 0225,
  H3).
- **Keine ausgeschalteten Schritte** (U6). Was nicht läuft, gibt der
  Aufrufer nicht mit. Die Bereit-Zeile (A4) nennt die eingeschalteten
  Schritte.

**Seitenaufgabe (Plugin, keine Komponente), nach A8:**
- oben `Progress` mit `done={3}`, `total={12}`, `label="Mandant 3 von 12"`;
- Block „Jetzt“: Name des laufenden Mandanten und `PhaseProgress
  density="compact"`;
- darunter die Liste aller Mandanten in fester Reihenfolge, je Zeile der
  Zustand und das Kurzergebnis. Der Zustand steht bis zur Achse `duo_sync` als
  `Badge`: Wartet · Läuft · Fertig · Fertig mit Problemen · Abgebrochen ·
  Übersprungen mit Grund.
- fertige Zeilen klappen über `ExpandableRow` auf.

Die Liste zeigt den laufenden Mandanten **nicht** ein zweites Mal als
`PhaseProgress`, damit nur eine Region spricht. Die Story `InUse` zeigt das.

## Verhalten

- **Aktueller Schritt:** der erste mit `active`, `held` oder `failed`. Ohne
  ihn (alles offen oder alles erledigt) gibt es keinen aktuellen Schritt.
  Nach einem `failed` laufen keine weiteren Schritte; was danach kommt, ist
  `pending`, und das liegt am Aufrufer.
- **`regular`:** eine geordnete Liste (`<ol>`), eine Zeile je Schritt, in der
  Optik von `.pz-steps`.
  - Die Zeile hat drei Spalten: links das Zeichen, in der Mitte der
    Anwendertext (er bricht um, `min-width: 0`), rechts Zähler oder Notiz.
    Die rechte Spalte steht rechtsbündig (Zahlen rechts), mit `tnum`, und
    bricht nicht um.
  - Unter der **aktuellen** Zeile, über die Breite von Text und rechter
    Spalte, steht eine Spur in der Höhe von `Progress size="sm"`:
    - mit Menge: `Progress` mit `label={null}`, denn die Zahl steht
      rechts daneben;
    - laufend ohne Menge: das gleitende Stück;
    - gehalten oder gescheitert: steht, siehe Zuordnungstabelle.
  - Andere Zeilen haben keine Spur. Es gibt also höchstens eine Spur, und
    beim Wechsel des Schritts wandert sie eine Zeile weiter.
- **Zeichen und Wort:** Jedes Zeichen ist ein `StateIcon` mit seinem Wort als
  zugänglichem Namen. Es unterscheidet sich in der Form, nicht nur in der
  Farbe (V7). Der laufende Schritt ist halbfett, offene sind gedämpft, wie
  in `.pz-steps`.
- **`compact`:** eine Zeile.
  - Links die Spur in der Breite von `.pz-mini`, ein Segment je Schritt:
    erledigt `--color-primary`, laufend gefüllt bis zum Anteil bzw. mit
    gleitendem Stück, gehalten und Problem `--color-warning`, gescheitert
    `--color-danger`, offen `--color-border`. Sind alle erledigt ohne
    `issue`, steht die Spur grün durch (`.pz-mini.is-complete`).
  - Rechts davon: „{Anwendertext des aktuellen Schritts} · {Zahl | note |
    läuft}“ in `--fs-ui-sm`, bei gehalten und gescheitert mit Zeichen. Ohne
    aktuellen Schritt steht kein Text da.
  - Die Anwendertexte aller Schritte trägt das `title` der Segmente und der
    zugängliche Name. Damit fällt nichts weg (L1).
- **Farben:** Der Fortschritt ist Akzent, nicht Kritikalität (Läuft ist im
  Set `info`).
  - Balken `Progress` im Ton `accent`; gehalten `warning`, gescheitert
    `danger`.
  - gleitendes Stück wie `.v3runmark`: `--color-accent-700` auf
    `--color-accent-100`.
  - Zeichen in den Tönen von `StateIcon`.
- **Bewegung:** Das gleitende Stück nimmt das Schlüsselbild `v3runmark`
  (1,8 s, hin und her). Bei `prefers-reduced-motion: reduce` steht es still
  in der Mitte, wie `RunMark`. Füllungen ändern ihre Breite ohne Übergang
  (0093 b).
  - **Nichts springt:** Solange es einen aktuellen Schritt gibt, ist die
    Komponente gleich hoch, weil genau eine Spur da ist.
  - Langer Text, der im laufenden Schritt umbricht, darf die Zeile
    verlängern. Die rechte Spalte ändert dabei ihre Breite nicht von Zahl
    zu Zahl, dank `tnum`.
- **Ansage:**
  - **Eine** Region je Instanz: ein visuell verborgenes Element mit
    `role="status"`, immer gerendert, auch leer.
  - Ihr Text ist der Satz des aktuellen Schritts **ohne Zahl**: „{label}:
    {Anwendertext} läuft“ bzw. „{label}: {Anwendertext} · {note}“ bei laufend
    mit `note`, gehalten und gescheitert. Bei gehalten und gescheitert steht
    davor das Wort des Zeichens („Warnung“, „Fehler“).
  - Ohne aktuellen Schritt ist sie leer.
  - Der Text ändert sich nur, wenn der Schritt, sein Zustand oder seine
    `note` wechselt, nie bei „Beleg 38 von 120“ (C2).
  - Der Wechsel des Mandanten im Durchgang gehört der Region der Seite.
- **Schmal:** Es gibt keine Sonderregel. `regular` ist auf allen Breiten
  einspaltig (U5). Bei 320 px bricht der Anwendertext um, die rechte Spalte
  bleibt ganz, und nichts scrollt waagerecht. `compact` bricht seine Zeile
  um, die Spur bleibt links.
- **Zustände der Komponente:**
  - gefüllt (`Running`)
  - lädt (`Starting`: der erste Schritt läuft ohne Menge)
  - Fehler (`Failed`)
  - leer: `phases=[]` rendert nichts. Einen Lauf ohne Schritte gibt es
    nicht, und eine leere Liste würde „nichts zu tun“ behaupten.
  - leer nach Filter: entfällt, es gibt keinen Filter.
- **Server-Component:** keine Hooks. Der Text der Region folgt aus den Props.
  Das Plugin rendert neu, wenn sich sein Lauf-Objekt ändert.

## Stories

Titel `v3/Patterns/Prozess/PhaseProgress`. Untergrenze für ein Pattern: 4,
Obergrenze 10; diese Spec braucht zehn. Die Daten folgen dem Seitenprofil:
Musterfirma GmbH, Bäckerei Schneider e.K., 120 Belege, 3 Konten, 4
Ablageorte, Anwendertexte aus `begriffe.md`.

| Story | Beweist |
|---|---|
| `Running` | gefüllt (A7): „Gebuchte Belege in DATEV einsortieren“ erledigt mit „4 Ablageorte“, „Neue Belege aus DATEV holen“ läuft mit „Beleg 37 von 120“ und Balken, „Kontoumsätze aus DATEV holen“ offen. Die Belegübergabe ist ausgeschaltet und fehlt (U6) |
| `Starting` | lädt: Der erste Schritt läuft ohne Menge, `note` „DATEV wird geöffnet …“, gleitendes Stück unter der Zeile, die übrigen offen |
| `WaitingForLogin` | A9: Belegabruf `held` mit `count` 37/120 und `note` „wartet auf Anmeldung“. Rechts der Satz statt der Zahl, der Balken steht beim Anteil im Ton Warnung |
| `Failed` | Fehler: Belegabruf `failed` bei 37 von 120, `note` „DATEV-Sitzung abgelaufen“, Balken steht im Ton Fehler, danach offen |
| `Statuses` | alle Zeilen der Zuordnungstabelle als Zeilen einer Liste, dazu „alle erledigt“ und „alle erledigt, einer mit Problem“ je in `regular` und `compact`. Nur `compact` ohne Problem steht grün durch |
| `Densities` | `regular` und `compact` mit denselben Daten nebeneinander |
| `Live` | Rundlauf: Ein Takt in der Story führt einen Abgleich durch alle Schritte, die Menge zählt mit. Unter der Komponente steht ein Protokoll jeder Änderung des Region-Texts: Er ändert sich nur beim Wechsel des Schritts, nie bei einer Zahl |
| `Narrow` | Umbruch langer Texte bei 320 px: „Belege aus Ludwig an DATEV übergeben“ mit „Beleg 1.234 von 12.480“. Der Text bricht um, die rechte Spalte bleibt ganz, nichts scrollt waagerecht; `compact` ebenso |
| `InUse` | A7 und A8 nebeneinander. A7: `Card` „Musterfirma GmbH wird abgeglichen“, darüber `Callout` „Lassen Sie diese Seite und das DATEV-Fenster geöffnet, bis der Abgleich fertig ist.“, darin `regular`. A8: `Progress` „Mandant 3 von 12“, Block „Jetzt“ mit `compact`, darunter vier Mandantenzeilen mit `Badge` (Übergang bis `duo_sync`): Fertig · Fertig mit Problemen · Läuft · Wartet. Die laufende Zeile zeigt kein zweites `PhaseProgress` |
| `Edge` | Rand: große Mengen („Beleg 1.234 von 12.480“), `total` 0 (keine Menge, gleitendes Stück), `done` > `total` (Balken voll, Zahl begrenzt), lange `note` in der rechten Spalte, drei Schritte neben vier |

Nicht anwendbare Zustände: leer und leer nach Filter, siehe Verhalten.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ansage abschalten, wenn eine Seite denselben Lauf zweimal zeigt | `announce?: boolean` | Eine Seite zeigt denselben Lauf an zwei Stellen. Heute zeigt A8 ihn nur im Block „Jetzt“ |
| Einen Schritt öffnen (seine Ergebniszeilen, sein Protokoll) | `onOpenPhase?: (key) => void` | Das Plugin will aus dem laufenden Bild in die Zeilen eines Schritts springen |
| Dauer je Schritt („seit 2 Min“) | optionales `since` am `PhaseProgressItem`, wie `phaseSince` am `ProcessStepper` | Der Support fragt, wo ein Abgleich Zeit verliert |
| Phasen eines Agent-Laufs in der App (documents · booking · review) | keine neue Prop, der Aufrufer belegt `phases` | Die Lauf-Seite der App zeigt Phasen. Dann zählt `PhaseProgress` dort als dritte Verwendung |

## Offene Fragen

1. **Was heißt „Problem“ an einem Schritt?** **Ohne Antwort:** Der Schritt
   ist durch, aber nicht alles ging, also `done` mit `issue`. Meint das Plugin
   einen laufenden Schritt, in dem schon einzelne Belege scheiterten, gälte
   `issue` auch bei `active`. Das wäre dieselbe Prop, nur breiter gültig.
2. **Laufend ohne Menge: gleitendes Stück statt Kreis?** Der Auftrag nannte
   den `Spinner` (0268). **Ohne Antwort:** das gleitende Stück in der Spur der
   laufenden Zeile, Begründung siehe Einordnung.
3. **Wie breit ist die Spur in `compact`?** **Ohne Antwort:** so breit wie
   `.pz-mini` (64 px). Wird sie neben dem Anwendertext zu klein, bekommt sie
   96 px, über eine Variable in `v3.css` und nicht über eine Prop.

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

- [ ] Props und `PhaseProgressItem` stehen im Typ wie in den beiden Tabellen. `status` ist `ProcessPhaseStatus`, importiert und nicht neu definiert (`git grep "type ProcessPhaseStatus"` = 1 Treffer)
- [ ] Die Zuordnung `ProcessPhaseStatus` → `StateKind` gibt es einmal. `ProcessDialog` und `PhaseProgress` nutzen dieselbe exportierte `STEP_STATE` (`git grep "STEP_STATE"`: eine Definition), und `ProcessDialog` zeigt unverändert dieselben Zeichen (Story `ProcessPicture`-Dialog vorher/nachher)
- [ ] `regular` ist eine `<ol>` mit einer Zeile je Schritt, in jedem Zustand und jeder Breite einspaltig: Zeichen links, Anwendertext Mitte, rechte Spalte rechtsbündig mit `tnum` (`Running`)
- [ ] Jede Zeile der Zuordnungstabelle sieht aus und spricht wie dort beschrieben: Zeichen samt zugänglichem Namen, rechte Spalte, Spur (`Statuses`)
- [ ] Spur: genau eine, nur unter dem aktuellen Schritt. Mit Menge ist es `Progress`, Anteil `done/total` ± 1 px (37/120 → 30,8 %), ohne eigenes Label. Rechts steht „Beleg 37 von 120“ (`Running`). `total` 0 → gleitendes Stück, keine Zahl. `done` > `total` → voller Balken, „Beleg 120 von 120“ (`Edge`)
- [ ] Gehalten und gescheitert: Der Balken steht beim Anteil im Ton Warnung bzw. Fehler, rechts steht `note` statt der Zahl, das Zeichen ist Warnung bzw. Fehler (`WaitingForLogin`, `Failed`)
- [ ] `issue` nur bei `done`: Zeichen Warnung, rechts der Satz, keine Spur (`Statuses`)
- [ ] U6: Mit drei übergebenen Schritten zeigt die Komponente drei Zeilen, keinen Platzhalter für einen ausgeschalteten Schritt (`Running`, `Edge`)
- [ ] V7: Die Zeichen unterscheiden sich in der Form (offen, gefüllt, Haken, Warnung, Fehler), und jedes hat sein Wort als zugänglichen Namen (`Statuses`, Barrierefreiheitsbaum)
- [ ] Ansage: genau ein `role="status"` je Instanz, immer im DOM. In `Live` ändert sich sein Text nur beim Wechsel des Schritts, seines Zustands oder seiner `note`. Mutationen gezählt: so viele wie Wechsel, 0 bei Zahlschritten. Der Text enthält keine Ziffer der Menge
- [ ] `label` ist der zugängliche Name der Gruppe (`role="group"`) und der Anfang jeder Ansage (`Live`)
- [ ] Bewegung: Laufend ohne Menge hat genau eine Animation `v3runmark`. Mit `prefers-reduced-motion: reduce` gibt es keine Animation, das Stück steht sichtbar in der Spur (`Starting`, Emulation wie in 0225)
- [ ] Kein Sprung: In `Live` bleibt die Höhe der Komponente gleich, solange es einen aktuellen Schritt gibt (± 0,5 px), auch wenn die Spur eine Zeile weiterwandert
- [ ] `compact`: Spur in der Breite von `.pz-mini`, ein Segment je Schritt in den Tönen aus Verhalten. Daneben eine Zeile „{Anwendertext} · {Zahl | note | läuft}“ in `--fs-ui-sm`. Alle Anwendertexte stehen im `title` bzw. zugänglichen Namen. Grün durch nur bei „alle erledigt ohne `issue`“ (`Densities`, `Statuses`)
- [ ] Schmal: keine Media-Regel für `PhaseProgress` in `v3.css`. Bei 320 px bricht der Anwendertext um, die rechte Spalte bleibt einzeilig und ganz, kein waagerechtes Scrollen (`Narrow`)
- [ ] Kontrast gemessen: Text ≥ 4,5:1 (auch gedämpfte offene Zeilen), Zeichen, Balken und gleitendes Stück ≥ 3:1 zur Spur bzw. zum Grund (`Statuses`)
- [ ] `phases=[]` rendert nichts, auch keine leere Region (`Edge`, DOM leer)
- [ ] Nicht klickbar: kein Hover, Tab überspringt die Komponente (`Running`)
- [ ] `@when`/`@instead` an `PhaseProgress` grenzen gegen `ProcessStepper`, `Checklist`, `Progress` und `StepRail` ab. `ProcessStepper`, `ProcessMini` und `Checklist` verweisen in ihrem `@instead` auf `PhaseProgress` („steps of a run in progress, with counts, live“)
- [ ] `InUse` setzt A8 mit `Progress` (`done`/`total`/`label`) und genau einem `PhaseProgress` (Block „Jetzt“) zusammen, ohne neue Komponente. Der Zustand der Mandantenzeilen kommt bis zur Achse `duo_sync` als `Badge`, im Story-Text als Übergang benannt
- [ ] Export in `index.ts` in der Gruppe Prozess
