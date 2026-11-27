# 0265 · Fortschritt eines Laufs in Schritten (`PhaseProgress`)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (Nachprüfung ✓; H1–H3, H6 erledigt) |
| Stufe | `patterns/`, Gruppe Prozess. Die Schritte stehen als Zeilen mit denselben Zeichen wie die Schrittliste im `ProcessDialog` (`.pz-steps`), die Kurzform nutzt die Spur von `ProcessMini` |
| Klassen-Test | ja, sobald es dort einen Ablauf in festen Schritten gibt: Ein Datenimport einer Versicherung mit „Policen lesen · Abgleichen · Übertragen“ braucht dasselbe Bild |
| Quelle | Seitenprofil `docs/seiten/duo-connect.md` (Commit b4a9660, Owner angenommen 2026-11-27): **U5** (Schritte als Zeilen statt waagerechtem Abschnittsbalken), **U6** (ausgeschaltete Schritte erscheinen nicht), **A7** (läuft · ein Mandant), **A8** (läuft · Durchgang), **A9** (wartet auf DATEV-Anmeldung). Abschnitt „Nachtrag 2 2026-11-27 — Simons Feedback zu den Entwürfen“, **A10–A12**: Die Ergebnisliste sind dieselben Schrittzeilen im Endzustand. Anfrage plugin-mananger 2026-11-27: `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Fortschrittsbalken in Abschnitten“. `docs/spec-oberflaeche-und-fehler.md` C2: Menge sobald bekannt, sonst laufende Anzeige; „nie rückwärts“; Ansage nur beim Wechsel. Begriffe und Anwendertexte aus `docs/begriffe.md` |
| Ersetzt | nichts im Set und in `ludwig/app`. Im Plugin die heutige Fortschrittsanzeige der Sync-Seite (Plugin-Code, hier nicht geprüft) |
| Blockiert | Plugin-Paket „Designsystem einbauen“ (Seitenprofil A7, A8, A9) |
| Spec von / am | designsystem, 2026-11-27; überarbeitet am selben Tag nach Annahme des Seitenprofils (U5) und nach Nachtrag 2 (Endzustand als Ergebnisliste) |

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

Ist der Abgleich durch, bleiben dieselben Zeilen als **Ergebnisliste**
stehen (Nachtrag 2, A10–A12): Haken bzw. Warnzeichen, rechts das Ergebnis
(„4 Belege einsortiert“, „12 übertragen, 47 schon in Ludwig“, „2 Konten“).
Das Bild läuft vom Fortschritt ins Ergebnis, ohne zu springen, und es sagt
nichts mehr an.

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
  wechselt, nie bei einer Zahl (C2), und die im Endzustand schweigt. Sie
  kommt an drei Orten vor: A7 groß, A8 als Kurzform im Block „Jetzt“, A10–A12
  als Ergebnisliste im Endzustand (damit auch im Verlauf, U9: dieselbe Form
  wie das Ergebnis). Die Statuszeile des Popups (D3, 0263)
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
    Durchgangsliste (A8) als `StatusBadge axis="duo_sync"`. Die Achse hat
    die App (Owner 2026-11-27, `apps/web/src/ui/status/status-registry.ts`),
    im Spiegel `src/ludwig/` des Sets steht sie seit `93e2791`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `phases` | `readonly PhaseProgressItem[]` | ja | Die Schritte eines Laufs, oben nach unten in Laufreihenfolge. **`phases` enthält nur, was läuft (U6):** Eine ausgeschaltete Belegübergabe gibt der Aufrufer nicht mit, sie erscheint nicht als ewig offener Schritt. `[]` rendert nichts | `Running`, `Edge` |
| `label` | `string` | ja | Der zugängliche Name des Ganzen (`role="group"` mit `aria-label`), z. B. „Fortschritt des Abgleichs Musterfirma GmbH“. Auch der Anfang jeder Ansage, siehe Verhalten | `Live`, `InUse` |
| `density` | `"regular" \| "compact"` | nein (`"regular"`) | `regular`: alle Schritte als Zeilen untereinander (A7). `compact`: einzeilige Kurzform, die Spur von `.pz-mini` und eine Zeile für den aktuellen Schritt (A8, Block „Jetzt“) | `Statuses`, `InUse` |

`PhaseProgressItem`, je Schritt:

| Feld | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `key` | `string` | ja | stabiler Schlüssel, die Kennung des Plugins (`ablage`, `belege`, `upload`, `kontoauszuege`) | `Running` |
| `label` | `string` | ja | der Anwendertext des Schritts aus `begriffe.md`: „Gebuchte Belege in DATEV einsortieren“, „Neue Belege aus DATEV holen“, „Belege aus Ludwig an DATEV übergeben“, „Kontoumsätze aus DATEV holen“ | `Running` |
| `status` | `ProcessPhaseStatus` (`"pending" \| "active" \| "held" \| "done" \| "failed"`) | ja | der Zustand des Schritts im Vokabular des Prozessbilds | `Statuses` |
| `count` | `{ done: number; total: number; unit: string } \| null` | nein | Bekannte Menge. Rechts steht „{unit} {done} von {total}“ mit `formatCount`: „Beleg 37 von 120“, „Konto 2 von 3“, „Ablageort 1 von 4“. Darunter füllt sich der Balken (`Progress`) zu `done/total`. Die Menge wirkt bei `active`, bei `held` und `failed` bleibt der Balken beim Anteil stehen. Bei `pending` und `done` wird sie nicht gezeigt. `total ≤ 0` zählt als keine Menge, `done > total` wird auf `total` begrenzt | `Running`, `Failed`, `Edge` |
| `note` | `string` | nein | Die rechte Spalte, wenn es keine Zahl gibt oder die Zahl nicht gilt. Bei `active` ohne Menge, was gerade passiert („DATEV wird geöffnet …“). Bei `held` der Grund („wartet auf Anmeldung“). Bei `failed` die Ursache („DATEV-Sitzung abgelaufen“). Bei `done` das Ergebnis in wenigen Wörtern (Nachtrag 2: „4 Belege einsortiert“, „12 übertragen, 47 schon in Ludwig“, „2 Konten“, „nichts abzurufen“). Bei `pending` nur im Endzustand nach einem Abbruch: „nicht ausgeführt“ | `Starting`, `WaitingForLogin`, `Failed`, `Finished` |
| `issue` | `string` | nein | Nur bei `done`: Der Schritt ist durch, aber nicht alles ging („9 übertragen, 3 nicht übertragen“). Zeichen Warnung und rechts dieser Satz | `Statuses`, `Finished` |

**Die Zustände aus Anfrage und Seitenprofil, auf die Felder gelegt:**

| Anfrage / Profil | `status` | weitere Felder | Zeichen (`STEP_STATE`) | rechte Spalte | Spur unter der Zeile |
|---|---|---|---|---|---|
| offen | `pending` | — | offener Kreis, Zeile gedämpft | leer | keine |
| läuft ohne Menge | `active` | `note` optional | gefüllter Kreis, Text halbfett | `note`, ohne `note` „läuft“ | gleitendes Stück |
| läuft mit Menge | `active` | `count` | gefüllter Kreis, Text halbfett | „Beleg 37 von 120“ | `Progress` bis zum Anteil, Ton Akzent |
| wartet auf Anmeldung (A9) | `held` | `note`, `count` optional | Warnung | `note` („wartet auf Anmeldung“) statt der Zahl | steht: mit Menge `Progress` beim Anteil im Ton Warnung, ohne Menge leere Spur |
| fertig | `done` | `note` optional | erledigt | `note` („4 Belege einsortiert“), sonst leer | keine |
| Problem | `done` | `issue` | Warnung | `issue` („9 übertragen, 3 nicht übertragen“) | keine |
| abgebrochen, Ursache Stufe Fehler (Ludwig nicht erreichbar, liegt nicht an Ihnen) | `failed` | `note`, `count` optional | Fehler | `note` | steht: mit Menge `Progress` beim Anteil im Ton Fehler, ohne Menge leere Spur |
| abgebrochen, Ursache Stufe Warnung (Seite geschlossen, von Ihnen abgebrochen) | `held` | `note`, `count` optional | Warnung | `note` („Seite geschlossen“, „von Ihnen abgebrochen“) | steht: mit Menge `Progress` beim Anteil im Ton Warnung, ohne Menge leere Spur |
| nicht ausgeführt (nach einem Abbruch) | `pending` | `note` „nicht ausgeführt“ | offener Kreis, Zeile gedämpft | `note` | keine |

Die Stufe des Abbruchs folgt der Stufe der Problemkarte (0264, Nachtrag 1
des Profils): Eine geschlossene Seite ist Warnung, „Ludwig nicht erreichbar“
und „liegt nicht an Ihnen“ sind Fehler. **Endzustand** heißt: Kein Schritt ist
`active`, der Lauf ist vorbei. Die Zeilen bleiben stehen, rechts steht das
Ergebnis, und eine Spur gibt es nur noch unter einem gehaltenen bzw.
gescheiterten Schritt, beim Anteil, wo er stand.

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
- **Sie sagt weder das Ende noch den Halt an.** Wird der Lauf fertig, setzt
  die Seite den Ergebnissatz darüber (0269), und den sagt die Region der Seite
  an (vgl. 0225, H3). Den Halt bei der Anmeldung sagt die hervorgehobene
  Hinweisfläche der Seite an (A9).
- **Keine ausgeschalteten Schritte** (U6). Was nicht läuft, gibt der
  Aufrufer nicht mit. Die Bereit-Zeile (A4) nennt die eingeschalteten
  Schritte.

**Seitenaufgabe (Plugin, keine Komponente), nach A8:**
- oben `Progress` mit `done={3}`, `total={12}`, `label="Mandant 3 von 12"`;
- Block „Jetzt“: Name des laufenden Mandanten und `PhaseProgress
  density="compact"`;
- darunter die Liste aller Mandanten in fester Reihenfolge, je Zeile der
  Zustand und das Kurzergebnis. Der Zustand steht als `StatusBadge
  axis="duo_sync"`: Wartet · Läuft · Fertig · Fertig mit Problemen ·
  Abgebrochen · Übersprungen mit Grund.
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
    Die rechte Spalte steht rechtsbündig (Zahlen rechts) mit `tnum`. Eine
    Zahl bricht nie um; eine Notiz darf umbrechen und nimmt höchstens die
    halbe Zeile ein (Nachtrag 2026-11-27).
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
  - Ihr Text ist der Satz des **laufenden** Schritts (`active`) **ohne Zahl**:
    „{label}: {Anwendertext} läuft“, mit `note` „{label}: {Anwendertext} ·
    {note}“.
  - Läuft kein Schritt, ist sie leer. Das gilt für gehalten (A9),
    abgebrochen und fertig, also im ganzen Endzustand. Eine Instanz, die
    schon im Endzustand erscheint (Ergebnis, Verlauf), hat eine leere Region
    und sagt nichts.
  - Der Text ändert sich nur, wenn der laufende Schritt oder seine `note`
    wechselt, nie bei „Beleg 38 von 120“ (C2). Geht der Lauf weiter (gehalten
    → läuft), sagt sie den Schritt wieder an.
  - Der Wechsel des Mandanten im Durchgang gehört der Region der Seite.
- **Schmal:** Es gibt keine Sonderregel. `regular` ist auf allen Breiten
  einspaltig (U5). Bei 320 px bricht der Anwendertext um, die rechte Spalte
  bleibt ganz, und nichts scrollt waagerecht. `compact` bricht seine Zeile
  um, die Spur bleibt links.
- **Zustände der Komponente:**
  - gefüllt (`Running`)
  - lädt (`Starting`: der erste Schritt läuft ohne Menge)
  - Fehler (`Failed`)
  - Endzustand als Ergebnisliste (`Finished`)
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
| `Statuses` | alle Zeilen der Zuordnungstabelle als Zeilen einer Liste, dazu „alle erledigt“ und „alle erledigt, einer mit Problem“, je in `regular` und `compact` nebeneinander (beweist auch `density`). Nur `compact` ohne Problem steht grün durch |
| `Finished` | Endzustand als Ergebnisliste (Nachtrag 2), in `regular` untereinander. **A10:** alle `done` mit „4 Belege einsortiert“ · „12 übertragen, 47 schon in Ludwig“ · „2 Konten“. **A11:** Belegabruf `done` mit `issue` „9 übertragen, 3 nicht übertragen“. **A12:** Belegabruf `held` bei 37 von 120 mit „Seite geschlossen“ bzw. `failed` mit „Ludwig nicht erreichbar“, danach `pending` mit „nicht ausgeführt“. Die Region ist in allen leer. Ein Schalter in der Story wechselt vom letzten laufenden Stand in den Endzustand: dieselben Zeilen in derselben Reihenfolge, nur die Spur fällt weg, und es entsteht keine Mutation der Region mit Text |
| `Live` | Rundlauf: Ein Takt in der Story führt einen Abgleich durch alle Schritte, die Menge zählt mit. Unter der Komponente steht ein Protokoll jeder Änderung des Region-Texts: Er ändert sich nur beim Wechsel des laufenden Schritts oder seiner `note`, nie bei einer Zahl. Ein Halt bei der Anmeldung leert ihn, das Weiterlaufen sagt den Schritt wieder an, am Ende ist er leer |
| `Narrow` | Umbruch langer Texte bei 320 px: „Belege aus Ludwig an DATEV übergeben“ mit „Beleg 1.234 von 12.480“. Der Text bricht um, die rechte Spalte bleibt ganz, nichts scrollt waagerecht; `compact` ebenso |
| `InUse` | A7 und A8 nebeneinander. A7: `Card` „Musterfirma GmbH wird abgeglichen“, darüber `Callout` „Lassen Sie diese Seite und das DATEV-Fenster geöffnet, bis der Abgleich fertig ist.“, darin `regular`. A8: `Progress` „Mandant 3 von 12“, Block „Jetzt“ mit `compact`, darunter vier Mandantenzeilen mit `StatusBadge axis="duo_sync"`: Fertig · Fertig mit Problemen · Läuft · Wartet. Die laufende Zeile zeigt kein zweites `PhaseProgress` |
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
- [ ] Gehalten und gescheitert: Der Balken steht beim Anteil im Ton Warnung bzw. Fehler, rechts steht `note` statt der Zahl, das Zeichen ist Warnung bzw. Fehler (`WaitingForLogin`, `Failed`, `Finished`). `pending` mit `note` zeigt die Notiz rechts, gedämpft („nicht ausgeführt“, `Finished`)
- [ ] `issue` nur bei `done`: Zeichen Warnung, rechts der Satz, keine Spur (`Statuses`)
- [ ] U6: Mit drei übergebenen Schritten zeigt die Komponente drei Zeilen, keinen Platzhalter für einen ausgeschalteten Schritt (`Running`, `Edge`)
- [ ] V7: Die Zeichen unterscheiden sich in der Form (offen, gefüllt, Haken, Warnung, Fehler), und jedes hat sein Wort als zugänglichen Namen (`Statuses`, Barrierefreiheitsbaum)
- [ ] Ansage: genau ein `role="status"` je Instanz, immer im DOM. Text nur, solange ein Schritt `active` ist. In `Live` ändert er sich nur beim Wechsel des laufenden Schritts oder seiner `note`. Mutationen gezählt: so viele wie Wechsel, 0 bei Zahlschritten. Bei `held` (A9) ist er leer, am Ende ebenfalls. Der Text enthält keine Ziffer der Menge
- [ ] Endzustand (`Finished`): A10–A12 wie in der Story beschrieben. Rechts steht das Ergebnis aus `note` bzw. `issue`, Haken bzw. Warn- oder Fehlerzeichen. Die Spur steht nur unter dem gehaltenen bzw. gescheiterten Schritt beim Anteil (37/120 → 30,8 %). Die Region ist in allen drei leer, auch beim ersten Rendern. Beim Wechsel vom letzten laufenden Stand in den Endzustand bleiben Zeilen, Reihenfolge und DOM-Knoten der Zeilen erhalten (gleiche `key`), und die Region bekommt keinen Text
- [ ] `label` ist der zugängliche Name der Gruppe (`role="group"`) und der Anfang jeder Ansage (`Live`)
- [ ] Bewegung: Laufend ohne Menge hat genau eine Animation `v3runmark`. Mit `prefers-reduced-motion: reduce` gibt es keine Animation, das Stück steht sichtbar in der Spur (`Starting`, Emulation wie in 0225)
- [ ] Kein Sprung: In `Live` bleibt die Höhe der Komponente gleich, solange es einen aktuellen Schritt gibt (± 0,5 px), auch wenn die Spur eine Zeile weiterwandert
- [ ] `compact`: Spur in der Breite von `.pz-mini`, ein Segment je Schritt in den Tönen aus Verhalten. Daneben eine Zeile „{Anwendertext} · {Zahl | note | läuft}“ in `--fs-ui-sm`. Alle Anwendertexte stehen im `title` bzw. zugänglichen Namen. Grün durch nur bei „alle erledigt ohne `issue`“ (`Statuses`)
- [ ] Schmal: keine Media-Regel für `PhaseProgress` in `v3.css`. Bei 320 px bricht der Anwendertext um, die rechte Spalte bleibt einzeilig und ganz, kein waagerechtes Scrollen (`Narrow`)
- [ ] Kontrast gemessen: Text ≥ 4,5:1 (auch gedämpfte offene Zeilen), Zeichen, Balken und gleitendes Stück ≥ 3:1 zur Spur bzw. zum Grund (`Statuses`)
- [ ] `phases=[]` rendert nichts, auch keine leere Region (`Edge`, DOM leer)
- [ ] Nicht klickbar: kein Hover, Tab überspringt die Komponente (`Running`)
- [ ] `@when`/`@instead` an `PhaseProgress` grenzen gegen `ProcessStepper`, `Checklist`, `Progress` und `StepRail` ab. `ProcessStepper`, `ProcessMini` und `Checklist` verweisen in ihrem `@instead` auf `PhaseProgress` („steps of a run in progress, with counts, live“)
- [ ] `InUse` setzt A8 mit `Progress` (`done`/`total`/`label`) und genau einem `PhaseProgress` (Block „Jetzt“) zusammen, ohne neue Komponente. Der Zustand der Mandantenzeilen kommt bis zur Achse `duo_sync` als `Badge`, im Story-Text als Übergang benannt
- [ ] Export in `index.ts` in der Gruppe Prozess


## Nachtrag 2026-11-27 — aus Bau und Abnahme (H1, H2/H3, H6)

- **`count` hat einen eigenen Typnamen:** `PhaseCount` (`{ done, total,
  unit }`), exportiert neben `PhaseProgressItem`. Die Form ist die der
  Schnittstellen-Tabelle.
- **Textgröße der Zeilen:** `regular` nimmt `--fs-ui` (wie der vom Owner
  freigegebene Entwurf, Seitenprofil A7), nicht `--fs-ui-sm` von `.pz-steps`
  im Dialog; die rechte Spalte steht in `--fs-ui-sm`.
- **Rechte Spalte:** Spur `fit-content(50%)`. Eine Zahl bricht nie um
  (`white-space: nowrap`, `tnum`); eine Notiz bricht um und nimmt höchstens
  die halbe Zeile ein — sonst schöbe eine lange Notiz bei 320 px die Seite
  waagerecht. Das ersetzt „bricht nicht um“ im Verhalten (dort berichtigt).
- **Das Wort des gefüllten Kreises** steht an einer Stelle:
  `STEP_ACTIVE_WORD` neben `STEP_STATE` in `Process.tsx`, kein Literal in
  `PhaseProgress`. Es sind zwei Bedeutungen und deshalb zwei Wörter: `run`
  „läuft“ für einen Schritt, an dem ein Lauf gerade arbeitet (`PhaseProgress`),
  `record` „aktuell“ für den Schritt, in dem ein Datensatz steht und
  womöglich wochenlang wartet (`ProcessDialog`).
- **Zustand der Mandantenzeilen:** `StatusBadge axis="duo_sync"` statt des
  Übergangs-`Badge` — die Achse ist seit `93e2791` im Spiegel. Das Kriterium
  zu `InUse` („… als `Badge`, im Story-Text als Übergang benannt“) gilt damit
  als: „… als `StatusBadge axis="duo_sync"`“.

## Abnahme

Gemessene Abnahme 2026-11-27, fremder Prüfer (hat nicht gebaut). Grundlage:
Spec, Code im Arbeitsbaum, Seitenprofil `docs/seiten/duo-connect.md` (U5,
U6, Nachtrag 2). Browser: Playwright gegen Storybook 6107, eigene Seite je
Durchlauf; Bildvergleich: Scratch-Klon `git clone --shared` auf HEAD
`1b9a847` gegen einen zweiten Klon mit dem Arbeitsbaum ohne die fremde
Baustelle `src/showcase/duo-connect/fixtures.ts`/`support.tsx`, beide mit
`storybook build -o` in den Scratchpad, `scripts/png-diff.mjs`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | Snapshot-Klon (eigene Änderungen, ohne fremde `fixtures.ts`): `tsc --noEmit` Exit 0; `storybook build -o …/sb-new` Exit 0, HEAD-Build ebenso. Im Arbeitsbaum ist `typecheck` rot, aber nur durch die fremde, laufende Änderung an `src/showcase/duo-connect/fixtures.ts` (`SYNC_STATE`/`SyncState` fehlen; drafts, History, Popup, Sync) — nicht Gegenstand | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `patterns/PhaseProgress.tsx` + `PhaseProgress.stories.tsx`, Titel `v3/Patterns/Prozess/PhaseProgress` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 („0 German comment lines“), `--test` Exit 0; `pnpm check:when` Exit 0, `--test` Exit 0; `STEP_STATE` trägt eigenes `@when`/`@instead` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status über Registry | `grep` auf Hex/px in `PhaseProgress*.tsx`: 0 Treffer (einzige Inline-Breite ist der Anteil in %); Zeichen über `STEP_STATE` → `StateIcon`/`stateLabel`; die Schrittzustände sind nach Spec keine Registry-Achse; `pnpm check:type` Exit 0, `--test` Exit 0. Das Wort „läuft“ steht als Literal im Code (H3) | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | Storybook-Index: `running`, `starting`, `waiting-for-login`, `failed`, `statuses`, `finished`, `live`, `narrow`, `in-use`, `edge` = 10 von 10; leer (`[]` rendert nichts) und leer nach Filter in der Spec begründet | ✓ |
| Prüfliste §9 | Zeilenpolster `--space-3` = `.v2tbl__row` (12 px, `--fs-ui`); Text links, Zahlen rechts mit `tnum`; Rot nur bei `failed`; jedes Zeichen mit Wort (V7); Kontrast und Bewegung siehe unten; Lucide 1,5 über `StateIcon`; Schrift 13,5 px (`--fs-ui`) Zeile, 12,5 px (`--fs-ui-sm`) rechte Spalte und Kurzform, gemessen; `.v3phase` hat `min-width: 0` und `position: relative` (Region `.v2vh` bleibt drin); nichts klickbar | ✓ |
| Im Browser angesehen | alle 10 Stories geladen, Inhalt sichtbar, 0 Konsolenfehler/-warnungen; Screenshots `finished`, `in-use`, `narrow` (360 px) angesehen | ✓ |
| Props und `PhaseProgressItem` wie in den Tabellen; `ProcessPhaseStatus` importiert | `PhaseProgress({ phases: readonly PhaseProgressItem[], label: string, density?: "regular" \| "compact" = "regular" })`; Item `key`, `label`, `status: ProcessPhaseStatus`, `count?: PhaseCount \| null` (`PhaseCount` = `{ done; total; unit }`, strukturgleich mit der Tabelle, benannter Typ als Abweichung des Bauers), `note?`, `issue?`. Eine Definition `export type ProcessPhaseStatus` (`Process.tsx:35`); `git grep "type ProcessPhaseStatus"` liefert wörtlich 5 Treffer (Definition, Importe/Re-Exporte, diese Spec) — das Kriterium meint die Definition (H7) | ✓ |
| `STEP_STATE` einmal, `ProcessDialog` unverändert | `git grep STEP_STATE`: eine Definition (`Process.tsx:45`), `ProcessPicture.tsx` importiert sie, Barrel exportiert sie; Bildvergleich `processpicture--dialog-full` und `--dialog-history` HEAD gegen neu 0,000 % | ✓ |
| `regular` = `<ol>`, einspaltig, Zeichen · Text · rechte Spalte rechtsbündig mit `tnum` (`Running`) | 1 `ol`, 3 `li`; bei 320/700/1100/1400/1920 px Fensterbreite: Zeichen x = 16, Text ab x = 48, rechte Spalte endet bündig mit der Zeile (304/684/736 px); `font-variant-numeric: lining-nums tabular-nums`; bei 320 px bricht der Text um (41,8 px), die Zahl bleibt einzeilig (19,4 px) | ✓ |
| Jede Zeile der Zuordnungstabelle (`Statuses`) | gemessen je Zeile: offen → Kreis „offen“, gedämpft, rechts leer, keine Spur · läuft ohne Menge → gefüllter Kreis „läuft“, halbfett, Notiz, gleitendes Stück · läuft mit Menge → „Beleg 37 von 120“, `Progress` 30,83 % Akzent · wartet → Warnung, Notiz statt Zahl, Balken 30,83 % Warnton · fertig → erledigt, Notiz · Problem → Warnung, `issue`, keine Spur · abgebrochen Fehler → Fehler, Notiz, Balken Fehlerton · abgebrochen Warnung → Warnung, „Seite geschlossen“, Balken Warnton · nicht ausgeführt → offen, „nicht ausgeführt“ gedämpft | ✓ |
| Spur: genau eine, `Progress` ± 1 px, Zahl rechts; `total` 0; `done` > `total` | `Running`: 1 Spur unter dem laufenden Schritt, x 48–736 (Text + rechte Spalte), Füllung 212,13 von 688 px = 30,83 %, `aria-hidden`, kein eigenes Label, rechts „Beleg 37 von 120“. `Edge`: `total` 0 → gleitendes Stück, rechts „läuft“; 130/120 → 100 %, „Beleg 120 von 120“; „Beleg 1.234 von 12.480“ → 9,89 % | ✓ |
| Gehalten und gescheitert; `pending` mit `note` | `WaitingForLogin`: Warnung, „wartet auf Anmeldung“, Füllung 30,83 % `#8C601E`; `Failed`: Fehler, „DATEV-Sitzung abgelaufen“, 30,83 % `#A8403C`; `Finished` A12: dasselbe für „Seite geschlossen“/„Ludwig nicht erreichbar“; „nicht ausgeführt“ in `--color-text-muted` | ✓ |
| `issue` nur bei `done`: Warnung, Satz, keine Spur | `Statuses` „Problem“ und `Finished` A11: Zeichen `triangle-alert` „Warnung“, rechts „9 übertragen, 3 nicht übertragen“, 0 Spuren | ✓ |
| U6: drei Schritte → drei Zeilen | `Running` 3 `li`, kein Platzhalter; `Edge` „vier Schritte“ 4 `li` | ✓ |
| V7: Form und Name je Zeichen | `circle` (offen), `circle` gefüllt (läuft), `circle-check` (erledigt), `triangle-alert` (Warnung), `circle-x` (Fehler); jedes `role="img"` mit `aria-label` | ✓ |
| Ansage (`Live`) | 1 `role="status"` je Instanz, immer im DOM (auch leer), über den ganzen Lauf **derselbe Knoten**. 18 Takte, 7 Mutationen = 7 Wechsel (Notiz fällt weg · Schrittwechsel · Notiz · Halt → leer · Weiterlaufen · Schrittwechsel · Ende → leer), 0 Mutationen bei den 9 reinen Zahlschritten; kein Text enthält eine Ziffer der Menge; bei `held` leer, am Ende leer | ✓ |
| Endzustand (`Finished`) | A10/A11/A12 wie beschrieben, Region in allen vier Endzustands-Instanzen schon beim ersten Rendern leer; Spur nur unter `held`/`failed` bei 30,83 %. Umschalter „Abgleich beenden“: Gruppe, Region und alle drei `li` bleiben dieselben DOM-Knoten, Reihenfolge gleich, rechts danach das Ergebnis; Region: 1 Mutation (`childList`) auf leer, kein Text; Höhe 148,77 → 136,77 px (nur die Spur fällt weg) | ✓ |
| `label` = Name der Gruppe und Anfang jeder Ansage | `role="group"` `aria-label="Fortschritt des Abgleichs Musterfirma GmbH"`; jede Ansage in `Live` beginnt damit | ✓ |
| Bewegung (`Starting`) | ohne Einstellung genau eine Animation `v3runmark` (1800 ms, `alternate`) auf `::after`, das Stück bewegt sich; mit `reducedMotion: 'reduce'`: 0 Animationen, Stück steht bei `translateX(206,4 px)` von 688 px = Mitte, sichtbar (`#2B6F9C` auf `#E3F0F8`) | ✓ |
| Kein Sprung (`Live`) | Höhe in allen 17 Takten mit aktuellem Schritt 148,77 px (Abweichung 0), auch beim Weiterwandern der Spur und bei Notiz statt Zahl; erst im Endzustand 136,77 px | ✓ |
| `compact` (`Statuses`) | Spur 64 px = `.pz-mini`, ein Segment je Schritt: erledigt `#1A3A5C`, laufend Füllung 30,83 % Akzent bzw. gleitendes Stück, gehalten/Problem `#8C601E`, gescheitert `#A8403C`, offen `#DDE2E8`; grün durch (`is-complete`, `#3F7A5A`) nur bei „fertig“ und „alle erledigt“, nicht bei „einer mit Problem“; Zeile „{Text} · {Zahl \| note \| läuft}“ in 12,5 px, bei gehalten/gescheitert mit Zeichen; ohne aktuellen Schritt kein Text; alle Anwendertexte im `title` (` → `, wie `ProcessMini`) und im Namen (`role="img"`) | ✓ |
| Schmal (`Narrow`) | keine `@media`-Regel mit `v3phase` in `src/styles/*.css` (Klammerscan); im 320-px-Kasten nichts über den Rand, Text bricht um, „Beleg 1.234 von 12.480“ einzeilig ganz; `compact` bricht um, Spur links. `Running` bei 320 px Fenster: `scrollWidth` 320 = `clientWidth`. Die Story selbst setzt 320 px plus 16 px Rand und scrollt bei 320 px Fenster um 16 px — Fixture, nicht Komponente (H5) | ✓ |
| Kontrast (`Statuses`) | Text `#2D2D2D` 13,77/12,96:1, gedämpft `#5C5C5C` 6,69/6,29:1 (weiß/Seite `#F7F8FA`); Zeichen: offen `#717171` 4,88/4,59, erledigt 5,07/4,77, Warnung 5,52/5,19, Fehler 6,06/5,71; Balken zur Spur `#ECEFF3`: Akzent 3,08, Warnung 4,78, Fehler 5,26; gleitendes Stück 4,69:1 auf `#E3F0F8`. Kurzform: Teilfüllung Akzent auf Segmentgrund `#DDE2E8` nur 2,73:1, zum Grund 3,34–3,55:1 (H4) | ✓ |
| `phases=[]` rendert nichts | `Edge` `[data-testid=empty]` `innerHTML` = `""` — keine Region | ✓ |
| Nicht klickbar | `Running`: Tab von einem Knopf davor springt direkt zum Knopf danach; 0 fokussierbare Elemente in allen Instanzen; Hover ändert weder Grund noch Cursor (`auto`) | ✓ |
| `@when`/`@instead` | `PhaseProgress` grenzt gegen `ProcessStepper`, `Checklist`, `Progress`, `StepRail` ab; `ProcessStepper`, `ProcessMini` (`Process.tsx`) und `Checklist` (`Review.tsx`) verweisen „Steps of a run in progress, with counts, live → PhaseProgress“ | ✓ |
| `InUse` | A7: `Callout` über `Card` „Musterfirma GmbH wird abgeglichen“ mit `regular`; A8: `Progress` „Mandant 3 von 12“, Block „Jetzt“ mit genau einem `compact`, vier Mandantenzeilen; seitenweit 2 Regionen (eine je Instanz). Der Zustand kommt als `StatusBadge axis="duo_sync"` (Fertig · Fertig mit Problemen · Läuft · Wartet) statt als Übergangs-`Badge` — die Achse ist seit `93e2791` im Spiegel, das ist die Zielform; der Spec-Satz zum Übergang ist überholt (H6) | ✓ |
| Export in `index.ts`, Gruppe Prozess | `index.ts` unter `/* Prozess */`: `PhaseProgress`, `PhaseProgressItem`, `PhaseProgressProps`, `PhaseProgressDensity`, `PhaseCount`; `STEP_STATE` im Block von `Process` | ✓ |
| Verträglichkeit (zusätzlich geprüft) | Bildvergleich HEAD gegen neu, 1400 px, `reducedMotion`: alle 7 `Process`- und 8 `ProcessPicture`-Stories 0,000 %; Set ändert nur Exporte und hebt `STEP_STATE` (nicht kopiert); App: nur neue Exporte, kein bestehender Aufrufer betroffen | ✓ |

Hinweise (keiner hält die Freigabe auf):

- **H1** Abweichungen des Bauers ohne Nachtrag in der Spec: Typname
  `PhaseCount`; Zeilen in `--fs-ui` statt der 12,5 px von `.pz-steps`
  (Rolle Zeilentitel, §2a — vertretbar); eine lange Notiz bricht rechts um,
  höchstens bis zur halben Zeile (`fit-content(50%)`), obwohl „Verhalten“
  sagt „die rechte Spalte … bricht nicht um“ (`Edge` „lange Notiz“: 360 px
  breit, zwei Zeilen). Alle drei gehören als datierter Nachtrag in die Spec.
- **H2** Ein Zeichen, zwei Wörter: der gefüllte Kreis (`STEP_STATE.active`)
  heißt im `ProcessDialog` „aktuell“ (`ProcessPicture.tsx:272`), in
  `PhaseProgress` „läuft“ (`PhaseProgress.tsx`, `signWord`). Ein Wort wählen
  und an `STEP_STATE` hängen.
- **H3** „läuft“ steht dreimal als Literal in `PhaseProgress.tsx` (Name des
  Zeichens, rechte Spalte, Ansage) — mit H2 an einer Stelle führen.
- **H4** Kurzform: die Teilfüllung (`--color-accent` auf `--color-border`)
  hat 2,73:1 zur Spur; der Balken der Zeile hat 3,08:1. Das Kriterium hält
  über „bzw. zum Grund“ (3,34:1), die Füllkante liest sich aber schwach.
- **H5** Die Story `Narrow` misst die Fixture: 320 px Kasten plus 16 px
  Story-Rand. Die Komponente selbst ist bei 320 px Fenster (288 px breit)
  ohne Querlauf gemessen.
- **H6** `InUse` nutzt die Achse `duo_sync` statt des Übergangs-`Badge`
  (besser); der Satz in Spec und Story-Ableitung ist überholt. „Mandant 3 von
  12“ folgt der Spec, das Seitenprofil (Nachtrag 1) zählt „Mandant 3 von 10 ·
  2 übersprungen“ — Sache der Seite, nicht der Komponente.
- **H7** Das Kriterium „`git grep "type ProcessPhaseStatus"` = 1 Treffer“
  ist wörtlich nicht erfüllbar (Importe und Spec treffen mit); gemeint und
  erfüllt ist eine Definition.
- **H8** `compact` bricht als Ganzes unter die Spur, sobald die Zeile nicht
  passt (`Statuses` „abgebrochen, Stufe Fehler, kurz“ bei 419 px: 19,38 →
  29,38 px). Im Block „Jetzt“ kann die Höhe damit von Schritt zu Schritt
  wechseln; nach Spec erlaubt.

Abgenommen von / am: fremder Prüfer (Agent), 2026-11-27 · Offene Punkte:
keine M; Hinweise H1–H8 an den Bauer.

### Nachprüfung 2026-11-27

Derselbe fremde Prüfer, nach der Meldung des Bauers (Nachtrag „aus Bau und
Abnahme (H1, H2/H3, H6)“). Gemessen im Storybook 6107 und an frischen Builds
(Scratch-Klon HEAD `1b9a847` gegen einen Klon mit dem ganzen jetzigen
Arbeitsbaum, beide mit `storybook build -o`, Bilder im selben
Browser-Kontext abwechselnd je Story).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| H1 Abweichungen in der Spec | Nachtrag nennt `PhaseCount`, `--fs-ui` und `fit-content(50%)`; „Verhalten“ ist berichtigt („Eine Zahl bricht nie um; eine Notiz darf umbrechen und nimmt höchstens die halbe Zeile ein“) | ✓ |
| H2/H3 Wort des gefüllten Kreises | `STEP_ACTIVE_WORD = { run: "läuft", record: "aktuell" }` in `Process.tsx` mit `@when`/`@instead`, im Barrel neben `STEP_STATE`; `PhaseProgress.tsx` ohne Literal „läuft“ (grep 0); `ProcessDialog` nimmt `.record` (`ProcessPicture.tsx:273`). Gemessen unverändert: Zeichen „erledigt · läuft · offen“, Region „… Neue Belege aus DATEV holen läuft“, `Edge` ohne Menge rechts „läuft“. Die Entscheidung „zwei Bedeutungen, zwei Wörter“ ist ein Systementscheid. Der Nachtrag hält ihn fest; die Bedeutung des Zeichens („hier steht der Vorgang gerade“) bleibt eine | ✓ |
| H6 `InUse` mit `duo_sync` | Nachtrag ersetzt das Kriterium durch „… als `StatusBadge axis="duo_sync"`“ — entspricht der Story | ✓ |
| Bildvergleich gegen frische HEAD-Bilder | alle 7 `Process`- und 8 `ProcessPicture`-Stories 0,000 % (auch `dialog-full`/`dialog-history`, also „aktuell“ unverändert) | ✓ |
| `typecheck`, `build`, Wächter | ganzer Arbeitsbaum im Snapshot: `tsc --noEmit` Exit 0, `storybook build -o` Exit 0; `check:type`, `check:language`, `check:when`, `check:icons` Exit 0 (je `--test` Exit 0); `check:classes` nur mit den 4 Klassen, die schon auf HEAD gemeldet werden | ✓ |

Unverändert offen als Hinweise: H4 (Teilfüllung der Kurzform 2,73:1 zur
Spur), H5 (Fixture `Narrow`), H7 (Wortlaut des grep-Kriteriums), H8
(`compact` wechselt die Höhe beim Umbruch).

Abgenommen von / am: fremder Prüfer (Agent), 2026-11-27 (Nachprüfung) —
**abgenommen** · Offene Punkte: keine M; Hinweise H4, H5, H7, H8.
