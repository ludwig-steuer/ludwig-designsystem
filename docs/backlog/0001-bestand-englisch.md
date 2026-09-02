# 0001 · Bestand auf Englisch umschreiben

| | |
|---|---|
| Status | offen |
| Stufe | alle drei (`primitives/`, `patterns/`, `entities/`) |
| Klassen-Test | entfällt — Umbenennung, keine neue Komponente |
| Quelle | Regel „Code nur Englisch" (`CLAUDE.md`, Owner 2026-09-03) |
| Ersetzt | nichts; ändert die öffentliche Schnittstelle von `src/ui/v3/index.ts` |
| Blockiert | Übernahme von v3 in `ludwig/app` — dort sollen gleich die englischen Namen ankommen |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Seit dem 2026-09-03 gilt: Bezeichner, Props, Typen, Kommentare, JSDoc und
Story-Exportnamen sind englisch; Deutsch steht nur in Strings, die Nutzer
sehen, und in Storybook-Titeln. Der Bestand aus der Erstbestückung ist
durchgängig deutsch benannt. Solange er so bleibt, kopiert jede neue
Komponente den falschen Stil, und die App bekommt beim Umstieg auf v3 eine
Schnittstelle, die sie danach noch einmal umbenennen muss.

## Umfang (gezählt am 2026-09-03)

**10 Dateien** mit deutschem Namen: `Rahmen.tsx`, `Pruefen.tsx`,
`Prozessbild.tsx`, `Hotkeys.tsx`, `TodoListe.tsx`, `VergleichsTabelle.tsx`,
`GrundDialog.tsx`, `KontoFeld.tsx`, `BuchungssatzEditor.tsx`,
`KIBuchungshinweise.tsx` (plus die zugehörigen `*.stories.tsx`).

**39 Exporte** im Barrel — 21 Komponenten und Funktionen, 18 Typen:

- Komponenten/Funktionen: AbweichungsZelle, BuchungssatzEditor, Checkliste,
  FortschrittLeiste, GrundDialog, HotkeyLegende, istOffen, KIBuchungshinweise,
  KontoFeld, KONTO_GRUPPEN_LABEL, Meldungen, naechsterOffener, ProzessMini,
  ProzessStepper, Pruefpunkte, SchrittKopf, SchrittRail, StaffelLeiste,
  Staffelstab, TodoListe, VergleichsTabelle
- Typen: BuchungssatzEditorProps, EditorMeldung, KIQuelle, KonfidenzStufe,
  KontoGruppe, KontoKandidat, Meldung, ProzessLoops, ProzessPhase,
  ProzessPhaseStatus, Pruefpunkt, QuellenArt, Seite, StaffelAbschnitt,
  StaffelstabKey, StaffelstabMeta, VergleichsZeile, ZustandsIcon

**Rund 80 Story-Exportnamen** (`Gefuellt`, `Laedt`, `MitAuswahl`, …):
`grep -rhoE '^export const [A-Za-z]+' src/ui/v3 --include='*.stories.tsx'`.

**Props und interne Namen** (`gruppen`, `tasten`, `monatsLabels`, `detailBreit`,
`zelle()`, `inEingabe()` …) sowie **Kommentare und JSDoc** in allen Dateien:
nicht gezählt, werden je Datei beim Anfassen mitgenommen.

**Nicht im Umfang:** Storybook-Titel-Gruppen (Aktion, Fläche, Prüfen … sind
UI-Text), Nutzer-Strings, `src/ui/legacy/` (wird ohnehin aufgelöst,
`docs/v3-backlog.md` „Aufräumen"), `docs/*.md`.

## Vorgehen

**Je Datei ein Commit**, alles auf einmal: Dateiname, Exporte, Props, interne
Namen, Kommentare, Story-Exportnamen, Barrel, `.design-sync/config.json`
(Overrides sind nach Komponentenname, Skips nach Story-ID). So bleibt jeder
Commit für sich grün und der Design-Sync findet die Karten wieder.

Reihenfolge nach Abhängigkeit, Blätter zuerst:

1. `Hotkeys.tsx`, `GrundDialog.tsx`, `Cells.tsx` (nur `AbweichungsZelle`)
2. `Pruefen.tsx` (StateIcon bleibt), dann `VergleichsTabelle.tsx` (importiert StateIcon)
3. `Rahmen.tsx`, `Prozessbild.tsx`, `TodoListe.tsx`
4. `KontoFeld.tsx`, `BuchungssatzEditor.tsx`, `KIBuchungshinweise.tsx`
5. Story-Exportnamen in den Dateien, die oben nicht angefasst wurden
   (Button, Table, Nav, Form, Dialog, MasterDetail …)

**Zielnamen** — Vorschlag, vor dem Umsetzen gegen `docs/ludwig/GLOSSARY.md`
prüfen (dort steht je Begriff der englische Name; fehlt einer, ist das ein
Befund, kein Anlass zum Erfinden):

| Deutsch | Englisch (Vorschlag) |
|---|---|
| Rahmen.tsx · SchrittRail · SchrittKopf · FortschrittLeiste | StepRail.tsx · StepRail · StepHeader · ProgressBar |
| Pruefen.tsx · Checkliste · Pruefpunkte · Meldungen · Pruefpunkt · Meldung · ZustandsIcon | Review.tsx · Checklist · CheckItems · Messages · CheckItem · Message · StateKind |
| Prozessbild.tsx · ProzessMini/Stepper · Staffelstab · StaffelLeiste · StaffelAbschnitt · StaffelstabKey/Meta | Process.tsx · ProcessMini/Stepper · Baton · BatonBar · BatonSegment · BatonKey/Meta |
| HotkeyLegende | HotkeyLegend |
| TodoListe · istOffen · naechsterOffener | TodoList · isOpen · nextOpen |
| VergleichsTabelle · VergleichsZeile · AbweichungsZelle | ComparisonTable · ComparisonRow · DeviationCell |
| GrundDialog | ReasonDialog |
| KontoFeld · KontoGruppe · KontoKandidat · KONTO_GRUPPEN_LABEL | AccountField · AccountGroup · AccountCandidate · ACCOUNT_GROUP_LABEL |
| BuchungssatzEditor · EditorMeldung · Seite | JournalEntryEditor · EditorMessage · Side |
| KIBuchungshinweise · KIQuelle · KonfidenzStufe · QuellenArt | AiBookingNotes · AiSource · ConfidenceLevel · SourceKind |

Entitäten-Ordner folgen mit: `entities/konto/` → `entities/account/`,
`entities/buchungssatz/` → `entities/journal-entry/`. Storybook-Titel tragen
den neuen Komponentennamen, die Gruppe bleibt (`v3/Patterns/Rahmen/StepRail`).

Kein Alias, kein `@deprecated`: v3 hat außer den eigenen Stories noch keinen
Konsumenten. Sobald die App v3 importiert, gilt das nicht mehr — dann vorher
umbenennen oder gar nicht.

## Abnahmekriterien

- [ ] `src/ui/v3/index.ts` exportiert keinen Namen mit deutschem Wortbestandteil (Abnehmender liest die Datei durch)
- [ ] `find src/ui/v3 -name '*.tsx'` liefert keinen deutschen Dateinamen
- [ ] Kein deutsches Wort in Story-Exportnamen (`grep`-Befehl oben, Liste durchsehen)
- [ ] JSDoc, Kommentare und interne Namen der angefassten Dateien englisch; Nutzer-Strings unverändert deutsch
- [ ] `pnpm typecheck` und `pnpm build` grün; Zahl der Stories in `storybook-static/index.json` vor und nach der Welle gleich
- [ ] `.design-sync/config.json`: jeder Override- und Skip-Schlüssel zeigt auf einen existierenden Namen bzw. eine existierende Story-ID
- [ ] README, Skills und `docs/v3-backlog.md` verwenden die neuen Namen
- [ ] Je Datei ein Commit, jeder für sich grün

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
