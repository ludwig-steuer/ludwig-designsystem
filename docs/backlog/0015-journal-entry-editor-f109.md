# 0015 · JournalEntryEditor — drei Nachträge aus F109

| | |
|---|---|
| Status | spec — zurück 2026-09-06, zwei Owner-Fragen im Abschnitt „Freigabe" |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | nein — Buchungssatz, Belegfeld, Gegenkonto sind Fachbegriffe |
| Quelle | Anfrage Owner 2026-09-03 · Design `reference/f109-buchungsreview/BuchungssatzEditor.dc.html` und `Buchungsreview.dc.html` Z. 891 / 3092 |
| Ersetzt | — (erweitert den bestehenden Editor) |
| Blockiert | — |
| Wartet auf | 0013 (Kontenblatt-Icon), 0014 (Belegfeld-Feld) |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Editor steht (841 Zeilen, aus dem F123-Artboard). Der Abgleich gegen den
zweiten Entwurf aus F109 am 2026-09-03 ergab **drei** Rückstände — sonst ist
der gebaute Stand weiter als die Vorlage (er splittet die Steuerzeile ins
Journal, rechnet das Gegenkonto in die Summe, verlangt Quittungen für
Warnungen; nichts davon kann der Prototyp).

1. **Das Journal liest sich nicht wie DATEV.** Heute steht je Zeile ein Betrag
   und daneben ein `S` oder `H`. Die Zielgruppe liest seit Jahren zwei
   Spalten. Wer prüft, ob ein Satz aufgeht, wandert sonst durch die Zeilen und
   sortiert im Kopf.
2. **Belegfeld 1 wird je Zeile abgetippt.** Weicht eine Zeile ab, fällt es erst
   im Export auf.
3. **Das Gegenkonto ist nur Anzeige.** Wer es korrigieren will, verlässt den
   Editor.

## Einordnung

- **Wiederverwenden:** `JournalEntryEditor`
  (`@when Viewing or editing a booking entry — one grid for both.`) ist die
  richtige Komponente; es geht um drei Nachträge in ihr, nicht um eine neue.
- **Erweitert, weil:** §3.2. Alle drei sind Designentscheidungen mit Vorlage.
  Punkt 1 ist keine Prop, sondern eine Darstellungskorrektur an der internen
  `Journal`-Funktion.
- **Zuschnitt:** zusammenlassen. Die drei teilen den Zustand des Editors
  (`rows`, `gegenkonto`) und treten nie getrennt auf; trennen erzeugte nur
  Durchreich-Props (§4). Ein Bau-Auftrag, eine Abnahme.
- **Setzt auf:** `AccountField` (0013) fürs Gegenkonto,
  `DocumentNumberField` (0014) für Belegfeld 1.

## 1. Journal zweispaltig

Vorlage: `Buchungsreview.dc.html` Z. 891 und 3092 — `Konto | Soll | Haben | BU`,
Beträge rechtsbündig, `tabular-nums`. Dasselbe Raster wie das Kontenblatt
(Z. 3381) und wie `design-guidelines`-Prinzip 10 des Briefs.

Aus

```
1200  Bank              S   1.475,60
```

wird

```
Konto                        Soll      Haben   BU
1200  Bank              1.475,60                9
```

- Betrag steht in **einer** der beiden Spalten, die andere bleibt leer — kein
  `0,00`, kein `—`.
- Die Summenzeile bleibt, wird aber zweispaltig: Σ unter Soll, Σ unter Haben,
  das `=` / `≠` dahinter. Die Rechnung selbst ändert sich nicht (Steuerzeile
  gesplittet, Gegenkonto eingerechnet — beides bleibt).
- Die `side`-Angabe je Zeile entfällt in der Anzeige; sie steckt jetzt in der
  Spaltenwahl. Im **Eingaberaster** bleibt der S/H-Umschalter, wo er ist.
- Keine neue Prop.

## 2. Belegfeld 1 in alle Zeilen übernehmen

- Belegfeld 1 wird `DocumentNumberField` (0014), samt Lupe ins Register.
- Tragen die nicht gelöschten Zeilen **verschiedene** nicht-leere Werte,
  erscheint unter dem Feld ein Knopf: **„Belegfeld 1 in alle Zeilen
  übernehmen"** — gleiche Machart und gleiche Stelle wie „Rest … einsetzen"
  (`JournalEntryEditor.tsx:680`). Er übernimmt den Wert **der Zeile, an der er
  steht**, in alle nicht gelöschten Zeilen.
- Sind alle Werte gleich oder gibt es nur eine Zeile, erscheint er nicht.
- Er erscheint auch, wenn Zeilen leer sind und eine gefüllt ist — der leere
  Wert ist die häufigste Abweichung.

**Warum genau hier:** der Server erhebt denselben Befund ohnehin
(`stapelabnahme/domain/pruefpunkte.ts:243–250`, Prüfpunkt `P-BELEG`
vergleicht die `externalDocumentNumber` aller Zeilen). Der Knopf setzt die
Korrektur an die Stelle, an der die Prüfung sie später meldet.

Neue Prop: keine. Der Editor hat `rows` und `setRow` bereits.

## 3. Gegenkonto bearbeitbar

Vorlage: `BuchungssatzEditor.dc.html` (`gkEditing`, `gkCandidates`,
`onGkSideKeyDown`).

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `onGegenkontoChange` | `(konto: string, name: string) => void` | nein | Gesetzt → das Gegenkonto ist bearbeitbar; weggelassen → Anzeige wie heute | `GegenkontoBearbeitbar` |
| `gegenkontoCandidates` | `Partial<Record<AccountGroup, AccountCandidate[]>>` | nein | Kandidaten fürs Gegenkonto-Feld | `GegenkontoBearbeitbar` |

- Bearbeitet wird mit `AccountField` — dasselbe Feld wie in den Zeilen, damit
  es sich gleich anfühlt und das Kontenblatt-Icon (0013) mitkommt.
- **S/H des Gegenkontos wird nicht bearbeitbar.** Der Prototyp bietet einen
  Umschalter mit `s`/`h`/`+`/`−`; die Seite des Gegenkontos ist aber die
  Gegenseite des Belegs und fällt aus `belegSide` — ein Umschalter dort
  erzeugte einen Satz, der nicht aufgeht. Das `≠` in der Summenzeile ist die
  ehrlichere Rückmeldung.

## Verhalten

- Tastatur unverändert (Alt+V, Alt+K/W/P, Ctrl+Enter, Esc). Der
  Übernahme-Knopf bekommt **keine** eigene Taste — er steht selten und
  sichtbar.
- Das Gegenkonto-Feld reiht sich in die Tabreihenfolge nach der letzten Zeile
  ein, vor „Grund der Änderung".
- Client-Component (ist sie schon).

## Stories

Nach §6. Bestehende Stories bleiben; die Journal-Änderung wird von jeder
belegt, die das Journal zeigt.

| Story | Beweist |
|---|---|
| `JournalZweispaltig` | Soll/Haben in zwei Spalten, Steuerzeile gesplittet, Summenzeile mit `=`; daneben ein unausgeglichener Satz mit `≠` |
| `BelegfeldAbweichend` | drei Zeilen mit verschiedenen Belegfeldern → Knopf erscheint; nach Klick sind alle gleich und der Knopf ist weg |
| `GegenkontoBearbeitbar` | Rundlauf über `onGegenkontoChange`; ohne die Prop bleibt es Anzeige |

Zusammen mit dem Bestand bleibt der Editor unter der Obergrenze von 10.

Nicht anwendbar: `Leer` — ein Buchungssatz ohne Zeile ist kein Zustand des
Editors, sondern ein Fehler des Aufrufers.

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

- [ ] Journal zeigt Soll und Haben in zwei Spalten, leere Spalte bleibt leer (`JournalZweispaltig`)
- [ ] Summenzeile steht unter den Spalten und behält `=` / `≠` (`JournalZweispaltig`)
- [ ] Steuersplit und eingerechnetes Gegenkonto verhalten sich wie vorher — dieselben Summen wie im Bestand (`JournalZweispaltig`)
- [ ] Belegfeld 1 ist `DocumentNumberField`, Lupe erreichbar (`BelegfeldAbweichend`)
- [ ] Übernahme-Knopf erscheint nur bei Abweichung und nur ab zwei Zeilen; leere Zeile zählt als Abweichung (`BelegfeldAbweichend`)
- [ ] Übernahme trifft alle nicht gelöschten Zeilen, gelöschte bleiben unberührt (`BelegfeldAbweichend`)
- [ ] Ohne `onGegenkontoChange` ist das Gegenkonto reine Anzeige (`Gefuellt` unverändert)
- [ ] Gegenkonto-Bearbeitung nutzt `AccountField`, nicht ein eigenes Feld (`grep`)
- [ ] S/H des Gegenkontos ist nicht bearbeitbar; der Ausschluss steht im JSDoc

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: zurück.** §1 (Journal zweispaltig) ist im Arbeitsbaum bereits uncommittet umgesetzt, aber anders als hier beschrieben: fünf Spalten Konto · Kontoname · Buchungstext · Soll · Haben statt Konto · Soll · Haben · BU, Summenzeile ohne =/≠, und derselbe Umbau streicht die Quittungspflicht für Warnungen, die das Ziel dieser Spec als Vorsprung nennt. Der Umbau liegt seit 2026-09-06 im Stash „verwaister JournalEntryEditor-Umbau" (`git stash list`), damit 0044 die Datei anfassen kann.

**Owner-Fragen, ohne die die Spec nicht neu geschrieben werden kann:** (a) Journal-Spalten: BU (Spec) oder Buchungstext (Umbau)? (b) Warnungen quittieren (Spec-Ziel) oder nicht (Umbau)?

Danach: §1 gegen den entschiedenen Stand neu schreiben; §2 um `onOpenDocumentNumberRegister?: (rowId: string) => void` und die Herkunft von `dominant` ergänzen; §3 Props englisch (`onContraAccountChange`, `contraAccountCandidates`) und der 0013-Rest (der Editor reicht `onOpenLedger` an die Zeilen-Felder durch, `JournalEntryEditor.tsx:603–609`) als vierter Punkt; Stories: heute 14, mit +3 sind es 17 — Ausnahme begründen oder nach §4 trennen, `Empty` erklären, Namen englisch; Kopf „Wartet auf": 0013 ist fertig, nur 0014 bleibt.

Befunde ins Register: **B** — GLOSSARY-Eintrag „Gegenkonto (contra account)" fehlt.
