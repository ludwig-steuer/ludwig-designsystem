# 0015 · JournalEntryEditor — drei Nachträge aus F109

| | |
|---|---|
| Status | fertig |
| Freigabe | zurück 2026-09-06, Owner-Fragen beantwortet 2026-09-07 — Neufassung unten |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | nein — Buchungssatz, Belegfeld, Gegenkonto sind Fachbegriffe |
| Quelle | Anfrage Owner 2026-09-03 · Design `reference/f109-buchungsreview/BuchungssatzEditor.dc.html` und `Buchungsreview.dc.html` Z. 891 / 3092 |
| Ersetzt | — (erweitert den bestehenden Editor) |
| Blockiert | — |
| Wartet auf | — (0013 und 0014 sind fertig; der Rest von 0013 ist mit dieser Aufgabe eingebaut) |
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
  (`rows`, `contraAccount`) und treten nie getrennt auf; trennen erzeugte nur
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

> **Überholt wie §1** — die geltende Fassung steht unter „Neufassung
> 2026-09-07". Was hier steht, ist richtig geblieben und um zwei Props
> ergänzt worden (`onOpenDocumentNumberRegister`, `dominantDocumentNumber`);
> der Satz „Neue Prop: keine" stimmt nicht mehr.

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

> **Überholt wie §1.** Die Props heißen englisch — `onContraAccountChange`
> und `contraAccountCandidates`, nicht `onGegenkontoChange` /
> `gegenkontoCandidates`. Dazu kam ein vierter Punkt (der Rest von 0013).
> Geltende Fassung: „Neufassung 2026-09-07".

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
  Gegenseite des Belegs und fällt aus `documentSide` — ein Umschalter dort
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

> **Überholt.** Die Namen dieser Tabelle (`JournalZweispaltig`,
> `BelegfeldAbweichend`, `GegenkontoBearbeitbar`) und der Kriterienblock
> darunter beziehen sich auf die erste Fassung. Es gilt die Story-Tabelle der
> Neufassung; die drei neuen heißen `JournalWithPostingText`,
> `DocumentNumberAcrossRows`, `ContraAccountEditable`.

Nach §6. Bestehende Stories bleiben; die Journal-Änderung wird von jeder
belegt, die das Journal zeigt.

| Story | Beweist |
|---|---|
| `JournalZweispaltig` | Soll/Haben in zwei Spalten, Steuerzeile gesplittet, Summenzeile mit `=`; daneben ein unausgeglichener Satz mit `≠` |
| `BelegfeldAbweichend` | drei Zeilen mit verschiedenen Belegfeldern → Knopf erscheint; nach Klick sind alle gleich und der Knopf ist weg |
| `GegenkontoBearbeitbar` | Rundlauf über `onGegenkontoChange`; ohne die Prop bleibt es Anzeige |

Zusammen mit dem Bestand bleibt der Editor unter der Obergrenze von 10.

Nicht anwendbar: `Leer` — ein Buchungssatz ohne Zeile ist kein Zustand des
Editors, sondern ein Fehler des Aufrufers. **Die Story `Empty` gibt es
trotzdem**, und aus demselben Grund: der Fehler des Aufrufers soll sichtbar
abgefangen sein statt in einer leeren Fläche zu enden. Sie zeigt „Keine
Buchungszeilen.", den Hinweis `E-LEER` und ein gesperrtes Speichern — das ist
kein sechster Zustand, sondern die Bremse.

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

**Dritte Abnahme 2026-09-07 (dritter Durchgang), gegen die Nacharbeit
`ca0f07c`. Urteil: freigegeben.**

Geprüft ist nur, was die zweite Abnahme offengelassen hat: M1b, und ob die
Übersetzung etwas kaputtgemacht hat. Gemessen im laufenden Storybook
(Dev-Server `http://localhost:6107`, er serviert die Quelle); Klicken und
Lesen je in einem eigenen `Runtime.evaluate`, sonst zeigt die Klappe den
Stand vor dem Re-Render.

### M1b — erledigt

- **Alle in dieser und der vorigen Runde hinzugefügten Kommentar- und
  JSDoc-Zeilen sind englisch.** `git diff f37c1c3..HEAD --
  …/JournalEntryEditor.tsx`, alle hinzugefügten Kommentarzeilen einzeln
  durchgesehen: kein deutscher Satz mehr. Die sechs benannten Blöcke stehen
  übersetzt (Steuerzeile, Belegfeld-1-Baustein, Übernahme-Knopf,
  Buchungstext im Journal, Text der Steuerzeile, Text des Gegenkontos), dazu
  der JSDoc von `Meldungsblock` und ein neuer englischer Block am
  `hints`-Zweig, der den Grund für M14 festhält.
- **Die deutschen Anführungszeichen der Prop-Zeile sind gerade Zeichen:**
  `/** Set → the "apply to all rows" button stands under this row's field. */`
  (Z. 637). Ein `grep` auf typografisch deutsche Anführungszeichen findet in
  der Datei noch vier Treffer (Z. 54, 67, 70, 856) — `git blame` weist jeden
  einem Commit **vor** dieser Aufgabe zu (Erstbestückung, 0043-Nachlese,
  Umbenennungen aus 0001). Sie fallen unter M16 und nicht unter diese Runde.
- **Deutsch steht nur noch, wo es hingehört:** die Knopfbeschriftung
  „Belegfeld 1 in alle Zeilen übernehmen" und die Story-Daten
  („Bürobedarf August", „Kreditor des Belegs") sind Nutzertext; die
  Story-JSDocs sind die Storybook-Beschreibung und damit ebenfalls Nutzertext
  (Hauspraxis, so von der 0062-Abnahme angenommen).

### Die Übersetzung hat nichts kaputtgemacht

Die beim Ersetzen kurzzeitig verlorene Zeile `name:` ist zurück — nachgemessen,
nicht am Code abgelesen:

| Messung | Ergebnis |
|---|---|
| `--s-2-split-full`, Journalklappe geklickt, danach gelesen | fünf Zeilen, jede mit Konto **und** Kontoname: `6815 · Bürobedarf`, `1406 · Abziehbare Vorsteuer 19 %`, `6845 · EDV-Zubehör`, `1406 · Abziehbare Vorsteuer 19 %`, `70044 · Bürobedarf Meier GmbH`; Kopfzeile `Konto · Kontoname · Buchungstext · Soll Umsatz · Haben Umsatz` |
| dieselbe Story, Summen | 840,34 + 159,66 + 399,66 + 75,94 im Soll, 1.475,60 im Haben, Summenzeile `Σ S 1.475,60 € = Σ H 1.475,60 €` — Steuersplit und eingerechnetes Gegenkonto rechnen wie vorher |
| `--journal-with-posting-text` als Gegenprobe | dieselben fünf Zeilen mit Name und Buchungstext, `Σ S 1.565,50 € = Σ H 1.565,50 €` — Zahl für Zahl die Messung der zweiten Abnahme |
| Sweep über alle 17 Story-Ids | jede gerendert (`.bse` vorhanden), keine einzige Konsolenmeldung |
| `pnpm typecheck` | `tsc --noEmit`, EXIT=0 |
| `pnpm build` | Storybook build completed successfully, EXIT=0 |

**Der Diff von `ca0f07c` enthält nichts als Text.** In beiden `.tsx`-Dateien
sind sämtliche geänderten Zeilen Kommentar-, JSDoc- oder JSX-Kommentarzeilen;
keine Anweisung, keine Prop, kein Markup hat sich bewegt. Die in der zweiten
Runde bestandenen Kriterien können dadurch nicht beschädigt sein — die
Live-Messungen und der Sweep bestätigen es.

Der mitgegangene Nachtrag an der Story `Empty` stimmt jetzt mit der Messung
überein: `--empty` zeigt den Hinweis „Noch keine Zeile — mit + Zeile (Split)
beginnen.", `.v2msg--hint .v2pp__code` → 0, „Keine Buchungszeilen." steht,
Speichern `disabled: true`. Damit ist M14 als Absicht festgehalten statt als
Widerspruch zwischen JSDoc und Anzeige.

### Offen, aber nicht blockierend

Unverändert und an ihre Adressen verwiesen: M4, M5, M6, M7 und M11 in dieser
Datei; M12, M13 und M16 an 0113 beziehungsweise 0013. M15 (falscher Dateiname
in 0113) ist mit `ca0f07c` erledigt.

Abgenommen von / am: designsystem-abnahme, 2026-09-07 (dritter Durchgang) ·
Urteil: **freigegeben**, keine offenen blockierenden Punkte.

**Wiederabnahme 2026-09-07 (zweiter Durchgang), gegen die Neufassung
2026-09-07. Urteil: zurück** — ein blockierender Mangel (M1b), alles andere
steht.

Gemessen im laufenden Storybook (Dev-Server `http://localhost:6107`, er
serviert die Quelle), je Schritt ein eigener `Runtime.evaluate`; Skripte im
Scratchpad (`a0015.mjs`, `sweep.mjs`). Story-Id-Stamm:
`v3-entitäten-buchungssatz-journalentryeditor--`.

### Story-Deckung

17 Stories, alle 17 gerendert (`.bse` vorhanden), keine einzige
Konsolenmeldung beim Laden. Die drei neuen der Neufassung sind da und heißen
englisch: `JournalWithPostingText`, `DocumentNumberAcrossRows`,
`ContraAccountEditable`. Die Ausnahme von der Grenze 10 ist begründet und hat
mit **0113** eine Adresse (Datei vorhanden).

Jede Prop der Schnittstelle hat ihre Story — mit **zwei Ausnahmen ohne
Begründung**: `onOpenTaxKey` und `quickActions` (0 Treffer in der
Story-Datei). Beide sind älter als diese Aufgabe; sie stehen unten als M11.

### Kriterien

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `tsc --noEmit`, EXIT=0 | ✓ |
| `pnpm build` grün | Storybook build completed successfully, EXIT=0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/journal-entry/JournalEntryEditor.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Buchungssatz/JournalEntryEditor` wie bei den Nachbarn (`v3/Entitäten/Konto/…`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Props, Typen, Bezeichner und Story-Exportnamen der neuen Teile englisch; `@when`/`@instead` an `JournalEntryEditor`. **Aber:** sechs in dieser Runde neu geschriebene Kommentarblöcke sind deutsch (Z. 711, 797, 831, 849, 867, 915–920) | ✗ (M1b) |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | kein Hex (grep leer); Status über `StatusBadge axis="buchung"` ✓. **Aber:** `STATUS_TEXT` (Z. 168–173) und px-Spurenliste (Z. 296–297) stehen weiter — beide seit `1ff963d`, als M6/M7 registriert | ✗ (M6, M7 — nicht blockierend) |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 17 Stories; `Empty` erklärt, warum es sie trotz „nicht anwendbar" gibt | ✓ (Lücke bei zwei Alt-Props → M11) |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Zahlen rechts (`text-align: right`) mit `lining-nums tabular-nums`; nichts zentriert außer Buttons/`kbd` (UA-Default, 25 Treffer, alle `BUTTON`/`KBD`/`svg`); Fokusring am Gegenkonto-Feld sichtbar (`box-shadow 0 0 0 3px rgba(59,143,196,.14)`, Rand dunkelt nach). **Aber:** `▤` als Icon-Knopf (Z. 765) → M12 | ✓ mit Befund |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle 17 Stories im Headless-Chrome geladen und bedient | ✓ |
| Journal zeigt Konto · Kontoname · Buchungstext · Soll · Haben; **kein** BU | `--journal-with-posting-text`, Journalklappe geöffnet: Kopfzeile `["Konto","Kontoname","Buchungstext","Soll Umsatz","Haben Umsatz"]`; `/\bBU\b/` im Journal → `false` | ✓ |
| Steuerzeile trägt den Text ihrer Zeile, Gegenkonto den der ersten | dieselbe Story: `6815 Bürobedarf · Bürobedarf August · 1.240,00` / `1406 Vorsteuer 19 % · Bürobedarf August · 235,60` / `6820 Porto · Porto August · 75,55` / `1406 · Porto August · 14,35` / `70044 Bürobedarf Meier GmbH · Bürobedarf August · Haben 1.565,50` — Zahlen und Texte deckungsgleich mit der Messung in §1 | ✓ |
| Warnung blockiert das Speichern nicht und hat kein Kästchen | `--s-1-edit-with-warning`: `input[type=checkbox]` → 0; Speichern-Knopf `disabled: false`; kein „offene Warnungen" im Text; der Weg „6820 einsetzen" steht an der Warnung | ✓ |
| Belegfeld 1 ist `DocumentNumberField`, sobald die Quellen-Wörter da sind; ohne sie das nackte Feld | mit `documentNumberSourceLabel` (`--document-number-across-rows`): 2× `.v2dnf`, `maxLength 36`, Lupe „Belegnummern-Register öffnen", Hinweis „Für diesen Vorgang gilt RE-2026-0140 (Offener Posten aus DATEV) …". Ohne (`--s-2-split-full`): `.v2dnf` → 0, Klasse `v2in` | ✓ (gemessen, nicht nur `grep`) |
| Übernahme-Knopf nur bei verschiedenen Werten, übernimmt den **seiner** Zeile | `--document-number-across-rows` (`RE-4471` / leer): 2 Knöpfe. Klick auf den **zweiten** → Felder `["",""]`, Knöpfe 0. Neu geladen, Klick auf den **ersten** → `["RE-4471","RE-4471"]`, Knöpfe 0. Gleiche Werte (`--s-2-split-full`, 2×`RE-4471`) → 0 Knöpfe; eine Zeile (`--s-1-edit-with-warning`) → 0 Knöpfe | ✓ |
| Gegenkonto nur mit `onContraAccountChange` bearbeitbar; S/H bleibt fest | mit Prop (`--contra-account-editable`): `.bse__gegen .v2kf` vorhanden, `input[aria-label="Gegenkonto"]` `role=combobox`; Rundlauf gemessen — „1200" getippt, Kandidat *1200 Bank* gewählt → Feld im Ruhezustand `1200 / Bank`, Journalzeile `1200 | Bank | Bürobedarf August | | 1.475,60 €`. Ohne Prop, aber `editable` (`--s-1-edit-with-warning`): 0 Eingabeelemente in `.bse__gegen`, reiner Text. S/H: `.bse__gegen` zeigt nur „an H", 0 Umschalter; der Zeilen-Umschalter (`S`) bleibt | ✓ |
| `onOpenLedger` erreicht auch die Zeilen-Felder | `--contra-account-editable`: `.v2kf__in--ledger` 2× — 1× in `.bse__row`, 1× im Gegenkonto; Knopf-Labels `["Kontenblatt zu 6815","Kontenblatt zu 70044"]` (gemessen, nicht nur `grep`) | ✓ |
| 17 Stories, keine Konsolenmeldung | Sweep über alle 17 Story-Ids: jede `gerendert: true`, jede „keine Meldung". (Beim **Tippen** im Gegenkonto-Feld erscheint eine React-Key-Warnung — sie stammt aus `AccountField`, siehe M13) | ✓ |
| offen (Set): der Schnitt in Lese- und Bearbeiten-Raster als 0113 | `docs/backlog/0113-journal-entry-grid.md` vorhanden, Status offen | ✓ |

Nebenbei mitgemessen (aus „Verhalten", nicht aus den Kriterien): die
Tabreihenfolge stimmt — `… Konto · Kontenblatt · Belegfeld 1 · Buchungstext ·
**Gegenkonto** · Kontenblatt · + Zeile · Journal · Grund der Änderung ·
Abbrechen · Speichern`. Und `Empty` hält, was ihr JSDoc sagt: „Keine
Buchungszeilen." aus `JournalEntryCard`, der Hinweis steht, Speichern
`disabled: true`.

### Mängel

**M1b — blockierend. Sechs in dieser Runde neu geschriebene Kommentarblöcke
sind deutsch.** Kriterium: „Code englisch" (fest). Gemessen mit
`git diff f37c1c3..HEAD -- …/JournalEntryEditor.tsx` auf die hinzugefügten
Zeilen: `Z. 711` („Belegfeld 1 ist ein eigener Baustein …", §2), `Z. 797`
(„Gleiche Machart und gleiche Stelle wie ‚Rest einsetzen'…", §2), `Z. 831`
(„Der Buchungstext geht mit …", §1), `Z. 849` („Die Steuerzeile trägt den Text
…", §1), `Z. 867` („Das Gegenkonto hat keinen eigenen Text …", §1) und der
**neu geschriebene JSDoc** von `Meldungsblock`, `Z. 914–921` („Fehler
blockieren das Speichern … Die Quittungspflicht … 2026-09-07", §1b). Daneben
steht englischer Text derselben Runde (`saveBlocked`, `documentNumbersDiffer`,
die drei neuen Prop-JSDocs) — die Datei ist innerhalb **eines** Merkmals
zweisprachig. Das ist derselbe Mangel, der die erste Abnahme blockiert hat;
er ist nur kleiner geworden. *Vorschlag:* die sechs Blöcke übersetzen; dabei
in `Z. 637` die deutschen Anführungszeichen im sonst englischen JSDoc
(`the „apply to all rows" button`) mitnehmen. Danach ist der Punkt erledigt —
nichts anderes ist zu tun.

**M6 — nicht blockierend, bleibt offen. `STATUS_TEXT` ist eine lokale
Label-Map** (Z. 168–173), Kriterium „keine lokale Label-Map" (fest).
Gemessen: sie liefert den `title` des **Sichtwechsel**-Knopfes — in
`--s-19-judge-with-note` steht auf „Voll ▸ · Alt+V" der Tooltip
„**Vorschlag**". Das ist nicht nur eine zweite Quelle, sondern ein falscher
Tooltip: der Knopf schaltet die Sicht um, nicht den Status. Älter als diese
Aufgabe (`1ff963d`), in dieser Spec schon als M6 geführt.

**M7 — nicht blockierend, bleibt offen. Spaltenmaße als px in der
Komponente** (Z. 296–297), Kriterium „kein px" (fest). Unverändert; ebenfalls
seit `1ff963d`.

**M5 — nicht blockierend, bleibt offen. `Alt+V` im Lese-Raster ist tot.**
Gemessen in `--s-19-judge-with-note`: Knopfbeschriftung „Voll ▸ · Alt+V";
`window.dispatchEvent(new KeyboardEvent('keydown',{key:'v',altKey:true}))` →
Spaltenkopf unverändert (`Datum · Umsatz · S/H · BU · Konto · Beleg 1 · Text`).
Derselbe Knopf **geklickt** → 11 Spalten (`… Whg. … Beleg 2 … KOST`). Also
sichtbare Taste ohne Wirkung (V14).

**M4 — nicht blockierend, bleibt offen. Die Ausnahme in
`scripts/check-icons.mjs` ist abgelaufen.** Der Grund lautet weiter
„uncommitted changes from another session — migrate once they are committed";
die Änderungen **sind** committet (`3cc0333`), der Arbeitsbaum ist sauber.
`node scripts/check-icons.mjs` meldet trotzdem „in Ordnung … 2 Datei(en) noch
offen".

**M11 — nicht blockierend, neu. Zwei Props der Schnittstelle haben keine
Story und keine Begründung:** `onOpenTaxKey` und `quickActions` (je 0 Treffer
in `JournalEntryEditor.stories.tsx`). Kriterium: „Alle Stories oben vorhanden;
ausgeschlossene Zustände begründet" (fest). Praktische Folge: die Zeile
„Tastatur unverändert (Alt+V, **Alt+K/W/P**, Ctrl+Enter, Esc)" unter
„Verhalten" ist in Storybook nicht messbar — kein Aufruf setzt
`quickActions`. Beide Props sind älter als diese Aufgabe. *Vorschlag:* keine
zwei weiteren Stories in eine Datei, die bei 17 steht — sondern beide in der
Story-Tabelle ausdrücklich als nicht gezeigt führen, mit Grund, und die
Deckung in **0113** nachholen, wo die Datei ohnehin geschnitten wird.

### Befunde am Set (kein Kriterium dieser Spec)

- **M12 — `▤` als Icon-Knopf.** Im Lese-Raster steht der Weg zum Kontenblatt
  als Unicode-Zeichen `▤` (`JournalEntryEditor.tsx:765`), im Bearbeiten-Raster
  daneben als `ActionIcon action="ledger"` aus der Registry. §9 verlangt
  „Icons Lucide 1.5 px …, keine Emoji/Unicode-Icons"; V14/T8 verlangen ein Wort
  dazu. Dieselbe Handlung, zwei Zeichen — und das falsche ist das, das man
  zuerst sieht. (Auch `◂`/`▸` am Sichtwechsel-Knopf, dort aber als Pfeil neben
  einem Wort.) Seit `1ff963d`, gehört zu **0113**.
- **M13 — `AccountField` doppelt den React-Key `alle`.** Gemessen: in
  `--contra-account-editable` „1200" tippen → zweimal
  `error: Encountered two children with the same key`. Ursache:
  `AccountField.tsx:143–156` hängt die Treffer aus `onSearch` als weitere
  Gruppe mit `key: "alle"` an, obwohl der Aufrufer schon eine Gruppe `alle`
  übergibt. Trifft jeden, der Kandidaten **und** Suche mitgibt; keine Story von
  0013 tut das, die neue Story dieser Aufgabe schon. Gehört zu 0013 /
  `AccountField`, nicht zu diesem Editor.
- **M14 — Hinweise drucken ihren Code nicht.** `Meldungsblock` zeigt bei
  `errors` und `warnings` `<span class="v2pp__code">`, bei `hints` nur den
  Text. Gemessen in `--empty`: `.v2msg--hint .v2pp__code` → 0, obwohl der
  JSDoc der Story „Gemessen: … Hinweis `E-LEER`" sagt. Entweder der Code
  gehört auch an den Hinweis, oder der Satz in der Story stimmt nicht.
- **M15 — 0113 zeigt auf eine Datei, die es nicht gibt.** Die Zeile „Quelle"
  in `docs/backlog/0113-journal-entry-grid.md` nennt
  `docs/backlog/0015-journal-entry-f109.md`; die Datei heißt
  `0015-journal-entry-editor-f109.md`.
- **M16 — die deutschen Bezeichner der Altteile stehen weiter.** `contraAccount`,
  `documentSide`, `EditorRow.datum/amount/konto/externalDocumentNumber`, `Kopf`, `Zeile`,
  `Journal`, `Meldungsblock`, `documentSideTotal`, `speichern`, `journalOffen`
  …; `CLAUDE.md` sagt „eine Datei, die ohnehin angefasst wird, bekommt
  englische Namen". Das ist eine Umbenennung durch die ganze Datei und eine
  eigene Runde wert — sinnvollerweise die von **0113**, die die Datei ohnehin
  in zwei schneidet. Als Mangel dieser Aufgabe geführt hätte sie einen Umbau
  erzwungen, den die Spec nicht bestellt.

Abgenommen von / am: designsystem-abnahme, 2026-09-07 (zweiter Durchgang) ·
Offene Punkte: **M1b blockiert** (sechs Kommentarblöcke übersetzen); M4–M7
und M11 bleiben nicht blockierend offen; M12–M16 sind Befunde am Set.

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: zurück.** §1 (Journal zweispaltig) ist im Arbeitsbaum bereits uncommittet umgesetzt, aber anders als hier beschrieben: fünf Spalten Konto · Kontoname · Buchungstext · Soll · Haben statt Konto · Soll · Haben · BU, Summenzeile ohne =/≠, und derselbe Umbau streicht die Quittungspflicht für Warnungen, die das Ziel dieser Spec als Vorsprung nennt. Der Umbau liegt seit 2026-09-06 im Stash „verwaister JournalEntryEditor-Umbau" (`git stash list`), damit 0044 die Datei anfassen kann.

**Owner-Fragen, ohne die die Spec nicht neu geschrieben werden kann:** (a) Journal-Spalten: BU (Spec) oder Buchungstext (Umbau)? (b) Warnungen quittieren (Spec-Ziel) oder nicht (Umbau)?

Danach: §1 gegen den entschiedenen Stand neu schreiben; §2 um `onOpenDocumentNumberRegister?: (rowId: string) => void` und die Herkunft von `dominant` ergänzen; §3 Props englisch (`onContraAccountChange`, `contraAccountCandidates`) und der 0013-Rest (der Editor reicht `onOpenLedger` an die Zeilen-Felder durch, `JournalEntryEditor.tsx:603–609`) als vierter Punkt; Stories: heute 14, mit +3 sind es 17 — Ausnahme begründen oder nach §4 trennen, `Empty` erklären, Namen englisch; Kopf „Wartet auf": 0013 ist fertig, nur 0014 bleibt.

Befunde ins Register: **B** — GLOSSARY-Eintrag „Gegenkonto (contra account)" fehlt.

## Neufassung 2026-09-07 — gegen den Stand, nicht gegen den Stash

Die Freigabe vom 2026-09-06 hatte zwei Fragen an den Owner gestellt; beide
sind am 2026-09-07 beantwortet:

- **(a) Journal-Spalten:** wie im Umbau — Konto · Kontoname · Buchungstext ·
  Soll · Haben, die DATEV-Stapelordnung. Der **BU** bleibt in der Editorzeile,
  nicht im Journal.
- **(b) Quittungspflicht:** **keine.** Warnungen stehen sichtbar da und
  blockieren das Speichern nicht; Fehler blockieren.

Der Stash „verwaister JournalEntryEditor-Umbau" ist als **Vorlage gelesen**,
nicht angewandt worden. Er stammt von einem Stand vor 0044 **und** vor 0106:
sein Journal-Markup war eine eigene Fünf-Spalten-Tabelle aus `<div>`-Zeilen —
nach 0044 zeichnet der Editor das Journal gar nicht mehr selbst, und nach 0106
wäre das Markup ohnehin ungültig. Übernommen sind seine **Entscheidungen**,
verworfen ist sein Code.

### §1 — Journal in der DATEV-Stapelordnung

Der Umbau ist kleiner, als er 2026-09-06 aussah: `JournalEntryCard` (0044)
zeichnet die fünf Spalten **bereits**. Was fehlte, war der **Buchungstext** —
der Editor hat ihn nicht übergeben, also stand die Spalte, die es dafür gibt,
leer. Jetzt geht er mit:

- Die **Steuerzeile** trägt den Text ihrer Zeile — sie ist dieselbe Buchung,
  nur aufgeteilt, und im Stapel stünde dort derselbe Text.
- Das **Gegenkonto** nimmt den Text der ersten Zeile, wie der Stapel es täte.
- Der **BU** steht nicht im Journal. Er ist eine Eingabe der Zeile, keine
  Buchungszeile — im Stapel erzeugt er die Steuerzeile, die daneben schon
  steht.

Damit ist die ursprüngliche Fassung dieses Abschnitts („Konto | Soll | Haben |
BU", vier Spalten, `side` entfällt) **überholt**: sie beschreibt ein Journal,
das der Editor seit 0044 nicht mehr selbst zeichnet.

Gemessen (Story `JournalWithPostingText`, zwei Zeilen mit Steuer — die
Story ist mit 0113 in das Lese-Raster gezogen und heißt dort
`WithJournal`; die Zahlen unten sind die von damals):

```
Konto   Kontoname                  Buchungstext        Soll Umsatz  Haben Umsatz
6815    Bürobedarf                 Bürobedarf August    1.240,00 €
1406    Abziehbare Vorsteuer 19 %  Bürobedarf August      235,60 €
6820    Porto                      Porto August            75,55 €
1406    Abziehbare Vorsteuer 19 %  Porto August            14,35 €
70044   Bürobedarf Meier GmbH      Bürobedarf August                 1.565,50 €
```

### §1b — Warnungen quittieren entfällt

Der Zustand `quittiert`, die Kästchen im Meldungsblock und der Zusatz „·
n offene Warnungen" am Speichern-Knopf sind weg. `saveBlocked` prüft nur noch
Fehler und leere Zeilen.

**Warum das die bessere Fassung ist:** eine Warnung, die man abhaken **muss**,
wird abgehakt und nicht gelesen — und sie hält den Satz an einer Stelle an, an
der nichts falsch ist, sondern nur etwas auffällig. Die Warnung behält ihren
Weg („6820 einsetzen"); wer ihn nicht nimmt, hat entschieden, nicht übersehen.
Gemessen in `S1_EditWithWarning`: Warnung sichtbar mit ihrem Knopf, kein
Kästchen, Speichern offen.

### §2 — Belegfeld 1

- Das Feld ist `DocumentNumberField` (0014), sobald der Aufrufer die Wörter
  der Quellen mitgibt (`documentNumberSourceLabel`) — sonst bleibt das nackte
  Feld. Damit kommen die 36-Zeichen-Grenze, der Hinweis auf die **geltende**
  Nummer und der Weg ins Register mit.
- **Neue Props:** `onOpenDocumentNumberRegister?: (rowId: string) => void`
  (die Zeilen-Id geht mit, weil der Aufrufer wissen muss, wohin er die
  gewählte Nummer zurückgibt), `dominantDocumentNumber?: KnownDocumentNumber`
  und `documentNumberSourceLabel?: DocumentNumberSourceLabels`.
- **Die Herkunft von `dominant`:** die geltende Nummer kommt aus der
  Dominanz-Rangfolge der Belegnummern-Quellen (Achse `belegnummer_quelle`,
  berechnet in `modules/datev-truth`). Der Editor rechnet sie **nicht** — er
  zeigt, was ihm gegeben wird; die Rangfolge ist Fachlogik der App.
- **„Belegfeld 1 in alle Zeilen übernehmen"** steht dort, wo „Rest einsetzen"
  steht, und erscheint nur, wenn die aktiven Zeilen verschiedene Werte tragen
  (der leere Wert zählt mit). Er übernimmt den Wert **seiner** Zeile.

### §3 — Gegenkonto bearbeitbar, und der Rest von 0013

- **Props englisch:** `onContraAccountChange(konto, name)` und
  `contraAccountCandidates`. Gesetzt → das Gegenkonto ist ein `AccountField`
  wie die Zeilen; weggelassen → Anzeige wie bisher.
- **S/H bleibt fest.** Die Seite des Gegenkontos ist die Gegenseite des
  Belegs und fällt aus `documentSide`; ein Umschalter dort erzeugte einen Satz,
  der nicht aufgeht. Das `≠` in der Summenzeile ist die ehrlichere Rückmeldung.
- **Vierter Punkt, der Rest von 0013:** der Editor reicht `onOpenLedger`
  jetzt auch an die **Zeilen-Felder** durch. Vorher stand das Kontenblatt-Icon
  nur in der Lese-Ansicht — der Weg zum Kontenblatt fehlte genau dort, wo man
  das Konto gerade wählt. Dabei kommt auch der **Kontoname** aus dem
  gewählten Kandidaten mit; sonst stünde in der Zeile eine Nummer ohne Wort
  und im Journal daneben ein leerer Kontoname.

### Stories

> **Überholt.** Die Namen dieser Tabelle (`JournalZweispaltig`,
> `BelegfeldAbweichend`, `GegenkontoBearbeitbar`) und der Kriterienblock
> darunter beziehen sich auf die erste Fassung. Es gilt die Story-Tabelle der
> Neufassung; die drei neuen heißen `JournalWithPostingText`,
> `DocumentNumberAcrossRows`, `ContraAccountEditable`. — 17, mit begründeter Ausnahme

`spec-schreiben` §6 setzt die Grenze bei 10. Diese Datei steht bei **17**, und
das ist eine Ausnahme mit Ablaufdatum, keine Regel:

- **14 davon sind kein Prop-Raster, sondern ein Zustandskatalog.** Sie stellen
  die 24 Zustände aus `Buchungseditor-Zustände.dc.html` nach — gesperrt,
  storniert, mehrere Fehler, Judge-Befund. Im laufenden Screen sieht man immer
  nur einen; gerade die seltenen sind die, in denen sich Fehler einnisten.
  Die Ableitung aus §6 („Zustände ≤ 5") greift für einen solchen Katalog nicht.
- **Drei sind neu** und gehören zu den drei Punkten dieser Aufgabe.

**Der Schnitt, der die Ausnahme beendet** — als **`docs/backlog/0113-journal-entry-grid.md`** angelegt: der
Editor ist heute zwei Dinge in einer Datei — das **Lese**-Raster (`editable:
false`, sieben der 14 Zustände) und das **Bearbeiten**-Raster. Getrennt ergäbe
das `JournalEntryGrid` (lesend, Server-Komponente) und `JournalEntryEditor`
(bearbeitend, `"use client"`), je unter 10 Stories, und die Lese-Ansicht
verlöre ihren Client-Anteil. Das ist der Zuschnitt nach §4 („ein Teil braucht
`"use client"`, der Rest nicht") — und er ist eine eigene Runde wert, keine
Nebenwirkung dieser.

| Neue Story | Beweist |
|---|---|
| `JournalWithPostingText` | Die fünf Spalten mit Text; Steuerzeile und Gegenkonto tragen ihren |
| `DocumentNumberAcrossRows` | `DocumentNumberField` mit Register-Weg, und der Übernahme-Knopf nur bei verschiedenen Werten |
| `ContraAccountEditable` | Das Gegenkonto als `AccountField`, S/H unverändert |

### Abnahmekriterien — Ergänzungen

- [ ] Das Journal zeigt Konto · Kontoname · Buchungstext · Soll · Haben; der BU steht **nicht** darin (Story `JournalWithPostingText`, gemessen)
- [ ] Die Steuerzeile trägt den Text ihrer Zeile, das Gegenkonto den der ersten (gemessen)
- [ ] Eine Warnung blockiert das Speichern **nicht** und hat kein Kästchen (Story `S1_EditWithWarning`, gemessen)
- [ ] Belegfeld 1 ist `DocumentNumberField`, sobald die Quellen-Wörter da sind; ohne sie das nackte Feld (`grep`)
- [ ] Der Übernahme-Knopf erscheint nur bei verschiedenen Werten und übernimmt den seiner Zeile (Story `DocumentNumberAcrossRows`, gemessen: zwei Knöpfe bei zwei verschiedenen Werten)
- [ ] Das Gegenkonto ist nur mit `onContraAccountChange` bearbeitbar; S/H bleibt fest (Story `ContraAccountEditable`)
- [ ] `onOpenLedger` erreicht auch die Zeilen-Felder (`grep`)
- [ ] 17 Stories, keine Konsolenmeldung (gemessen)
- [ ] offen (Set): der Schnitt in Lese- und Bearbeiten-Raster, der die Story-Ausnahme beendet — als **0113** angelegt, damit die Ausnahme eine Adresse hat und nicht nur ein Versprechen ist

### Befunde am Set, aus der Abnahme vom 2026-09-07

Vier Punkte, die die Abnahme als nicht blockierend geführt hat (M4–M7). Sie
stehen hier, weil sie sonst niemand wiederfindet — keiner von ihnen gehört zu
den drei Aufträgen dieser Spec, jeder von ihnen ist eine echte Abweichung.

- [ ] **M4 — die Ausnahme in `scripts/check-icons.mjs` ist abgelaufen.** Der
  Grund lautet „uncommitted changes from another session"; mit dem Commit
  dieser Runde stimmt er nicht mehr. Entweder die Datei stellt auf die
  Icon-Registry um, oder die Zeile bekommt einen Grund, der trägt. Ein
  Freibrief ohne Ablaufdatum ist genau das, was die Liste verhindern soll
  (ihr eigener Kommentar: „This list only ever shrinks").
- [ ] **M5 — `Alt+V` steht im Lese-Raster am Knopf, wirkt dort aber nicht.**
  Der Tastenhandler beginnt mit `if (!editable) return;`, der Kopf druckt
  „Einfach ◂ / Voll ▸ · Alt+V" in beiden Modi. Das ist der Fall, den V14
  ausdrücklich verbietet: eine sichtbare Taste ohne Wirkung. Zwei Wege — die
  Taste auch lesend binden (der Umschalter ist dort ja bedienbar) oder das
  Kürzel im Lesemodus nicht drucken. Fällt mit **0113** ohnehin an, gehört
  aber nicht erst dorthin vertagt.
- [ ] **M6 — `STATUS_TEXT` ist eine lokale Label-Map** (R1). Sie liefert den
  `title` des Umschalters; die fünf Texte gehören zur Achse `buchung` und
  damit in die Registry, aus der der `StatusBadge` daneben schon liest.
- [ ] **M7 — die Spaltenmaße stehen als px in der Komponente**
  (`"88px 56px 104px …"`, zwei Zeilen). Das Set schreibt Maße als Token oder
  Klasse. Sauber wäre eine Track-Liste neben der Komponente, wie sie
  `bank-transaction-columns.tsx` und `account-columns.tsx` führen — dann sind
  die Breiten auch messbar begründet statt geraten.

### Nacharbeit zur zweiten Abnahme (2026-09-07)

- **M1b erledigt.** Die sechs in der Runde neu geschriebenen Kommentarblöcke
  und der JSDoc von `Meldungsblock` sind Englisch, die deutschen
  Anführungszeichen in der Prop-Zeile ebenfalls. Beim Übersetzen ist mir in
  zwei Blöcken die Zeile `name:` mitgegangen — der Typecheck hat es gefangen,
  und die Wirkung ist nachgemessen: das Journal von `S2_SplitFull` zeigt
  `6815 · Bürobedarf`, `1406 · Abziehbare Vorsteuer 19 %`, `6845 ·
  EDV-Zubehör`, `70044 · Bürobedarf Meier GmbH`. Genau der Punkt, den M2 der
  ersten Abnahme betraf.
- **M14 erledigt** — nicht am Code, sondern an der Behauptung: Hinweise
  drucken ihren Code nicht, und das ist Absicht. Der Code benennt einen
  Prüfpunkt, den jemand nachschlägt (Fehler, Warnung); ein Hinweis ist ein
  Nebensatz. Der JSDoc der Story sagt das jetzt richtig, und im
  `Meldungsblock` steht der Grund, damit es nicht noch einmal auffällt.
- **M15 erledigt** — 0113 nennt den richtigen Dateinamen.
- **M11 — bewusst ohne Story, mit Grund.** `onOpenTaxKey` und `quickActions`
  bekommen in dieser Datei keine: sie hat 17 Stories und damit schon die
  begründete Ausnahme von der Grenze aus `spec-schreiben` §6; zwei weitere
  würden die Ausnahme vergrößern statt sie abzutragen. Beide sind
  Durchreichen an vorhandene Bausteine (`ActionIcon`, die Schnellaktionen des
  Kopfes). Ihre Deckung holt **0113** nach — dort werden die Stories auf zwei
  Dateien verteilt, und beide passen ins Bearbeiten-Raster.
- **M4, M5, M6, M7 bleiben** als Befunde am Set stehen (Abschnitt darüber). Die
  zweite Abnahme hat M6 dabei geschärft: `STATUS_TEXT` liefert nicht nur eine
  zweite Quelle, sondern in `S19` den **falschen** Tooltip („Vorschlag" auf dem
  Sichtwechsel-Knopf). Das gehört mit 0113 abgeräumt.
- **Neu aus der zweiten Abnahme, an andere Aufgaben verwiesen:**
  - M12 — `▤` als Unicode-Icon im Lese-Raster, während dasselbe im
    Bearbeiten-Raster `ActionIcon action="ledger"` nutzt → **0113**.
  - M13 — `AccountField` hängt die Suchtreffer als zweite Gruppe mit
    `key: "alle"` an und erzeugt beim Tippen `Encountered two children with
    the same key`. Trifft **jeden** Aufrufer mit `alle`-Kandidaten und Suche →
    gehört zu **0013**, nicht hierher.
  - M16 — die deutschen Bezeichner der Altteile (`contraAccount`, `Kopf`,
    `Zeile`, `documentSideTotal`) → **0113**, wenn die Datei ohnehin geteilt
    wird.

### Nachtrag P50 (2026-09-23, app-0c): § 13b-Steuerzeilen nicht im Rest

`documentSideTotal` (Editor und `journal-entry.ts`, damit Grid, Facts und
Gegenkonto im Journal) lässt Zeilen auf den § 13b-/igE-Konten weg
(`REVERSE_CHARGE_TAX_ACCOUNTS` = `TAX_ACCOUNT_NUMBERS` ohne
`STANDARD_TAX_ACCOUNT_NUMBERS`: 1577/1787/1574/1774, SKR04 1407/3837/1404/3804).
Der Beleg ist dort netto; das Steuerpaar legt der Kern an. Standard-VSt bleibt
drin — netto + 1576 ist das Brutto des Belegs. Die Zeilen bleiben sichtbar.
Story `ReverseCharge13b`: vier Zeilen, Beleg 8,66 → Rest 0,00 ✓.

## Nachtrag 2026-10-01 — Journal rechnete die § 13b-Steuerzeile ins Gegenkonto (lldev1, Owner-Demo)

Befund lldev1: Das Journal im Editor (`function Journal`,
`JournalEntryEditor.tsx`) war eine veraltete Kopie von `journalLines()` in
`journal-entry.ts`. Beim Gegenkonto summierte es alle Zeilen der Belegseite,
also auch die § 13b-Steuerkonten (`REVERSE_CHARGE_TAX_ACCOUNTS`).
`journalLines()` nimmt `documentSideTotal()`, das sie auslässt (P50). Folge an
einem ausgeglichenen Satz (FTC Gephyra, Beleg OCAKSCTE-0037, SKR04: 6837 S 1,50
BU 94 · 1407 S 0,29 · 3837 H 0,29, Kreditor 70145): Gegenkonto H 1,79 statt
1,50, Kopf „Σ S 1,79 € ≠ Σ H 2,08 €".

Behoben: `Journal` baut seine Zeilen über `journalLines()` und den Kopf über
`journalBalanceText()`; die eigene Schleife und die eigenen Summen sind weg, die
Darstellung über `JournalEntryCard` bleibt. Nachweis: Story `ReverseCharge13b`
zeigt jetzt zusätzlich den FTC-Fall mit Gegenkonto — „Σ S 1,79 € = Σ H 1,79 €",
70145 Haben 1,50 €. Gegenprobe: der erste § 13b-Fall (ohne Gegenkonto) „Σ S
10,31 € = Σ H 10,31 €", `S2_SplitFull` „Σ S 1.475,60 € = Σ H 1.475,60 €",
unverändert. `journalLines()` mit dem Satz nachgerechnet (esbuild + node):
`6837 S 1.50 | 1407 S 0.29 | 3837 H 0.29 | 70145 H 1.50`.

### Fremde Abnahme Nachtrag 2026-10-01

Fremder Abnehmer, Stand 041636e. Gemessen im eigenen Playwright-Kontext
(1440 × 1000, danach geschlossen) gegen Storybook `localhost:6107`; Journalzeilen
aus `.bse__journal__body .v2je__row` gelesen, Soll/Haben je Spalte und im Browser
nachsummiert.

| Punkt | Nachweis | ✓/✗ |
|---|---|---|
| 1 `Journal` nur über `journalLines()` / `journalBalanceText()` | `JournalEntryEditor.tsx` Z. 837 `journalLines(rows, contraAccount, documentSide, accountFramework)`, Z. 845 `{journalBalanceText(lines)}`; keine Schleife, kein `debit`/`credit` mehr in `Journal`. `rows={active}` (Z. 447) ist schon ohne `removed`, also gleiche Menge wie vorher. Nichts verwaist: `deriveTax` (Z. 635), `toNumber`, `euro`, `REVERSE_CHARGE_TAX_ACCOUNTS` (Z. 166) haben weiter Aufrufer; `tsc` mit `noUnusedLocals`/`noUnusedParameters` grün | ✓ |
| 2a `ReverseCharge13b`, erster Kopf | „Σ S 10,31 € = Σ H 10,31 €"; Zeilen 4806 S 8,66 · 1577 S 1,65 · 1787 H 1,65 · 1618 H 8,66, nachsummiert S 10,31 = H 10,31 | ✓ |
| 2b `ReverseCharge13b`, zweiter Kopf (FTC Gephyra) | „Σ S 1,79 € = Σ H 1,79 €"; aufgeklappt 6837 S 1,50 · 1407 S 0,29 · 3837 H 0,29 · **70145 H 1,50 €**, nachsummiert S 1,79 = H 1,79 | ✓ |
| 3a `S1_EditWithWarning` | „Σ S 1.475,60 € = Σ H 1.475,60 €"; 6815 S 1.240,00 · 1406 S 235,60 · 70044 H 1.475,60 — Zeilen stimmen mit „=" | ✓ |
| 3b `S2_SplitFull` | „Σ S 1.475,60 € = Σ H 1.475,60 €"; 6815 S 840,34 · 1406 S 159,66 · 6845 S 399,66 · 1406 S 75,94 · 70044 H 1.475,60; „Rest 0,00 € ✓" | ✓ |
| 3c `S5_RemainderDoesNotBalance` | „Σ S 1.400,00 € = Σ H 1.400,00 €"; 6815 S 1.176,47 · 1406 S 223,53 · 70044 H 1.400,00; Rest weiter gemeldet: „Rest 75,60 €" und Knopf „Rest 75,60 € einsetzen" | ✓ |
| 3d `ContraAccountEditable` | „Σ S 1.475,60 € = Σ H 1.475,60 €"; 6815 S 1.240,00 · 1406 S 235,60 · 70044 H 1.475,60 | ✓ |
| 3e `S3_AutomaticAccount` | „Σ S 1.475,60 € = Σ H 1.475,60 €"; 4400 1.240,00 · 1406 235,60 · 70044 1.475,60 (Seiten nur aus dem ersten Lauf, Summe passt) | ✓ |
| 3f keine Laufzeitfehler | `pageerror` in allen gemessenen Stories leer | ✓ |
| 4 `pnpm typecheck`, `pnpm check:language` | beide Exit 0; „check:language — ok. 0 German comment lines left in 0 files." `pnpm build` nicht gelaufen (parallele Sitzungen), Erbauer meldet grün | ✓ |

**Urteil: abgenommen.** Der Fix hält, was der Nachtrag behauptet: Das Journal
des Editors hat keine eigene Rechnung mehr, das § 13b-Steuerkonto fließt nicht
ins Gegenkonto, und in allen sieben gemessenen Köpfen stimmt das Zeichen mit
den Zeilen überein.

Kein Mangel. Zwei Anmerkungen ohne Abnahmefolge:

- Keine der gemessenen Stories zeigt „≠" — mit Gegenkonto gleicht das Journal
  per Bauart immer aus, ein Ungleichgewicht zeigt der Rest. Der „≠"-Zweig
  ist derselbe Code in `journalBalanceText()` wie vorher; im Browser ist er
  hier nicht geprüft.
- `Journal` destrukturiert noch `contraAccount: contraAccount, documentSide:
  documentSide` (Z. 819 f.), Rest einer Umbenennung, nicht aus diesem Commit —
  gehört zu M16 / **0113**.

## Nachtrag 2026-10-01 — Spurbreiten im Modus `full` (llcto, Owner-Demo Fall-Ansicht)

Befund beim Bau von 0219 (vorbestehend): Der Editor legte die Spalte „Text" mit
`minmax(0,1fr)` an. Unter ~1000 px Breite fiel sie auf **0 px**, ihr Kopf lief in
„KOST" — gemessen in `S2_SplitFull` bei 900 px („Text" 773–773) und in der
Fall-Ansicht der App bei 1280 px (~728 px Platz). Die Lese-Tabelle hatte dasselbe
in 0044 M2 behoben (`journalGridTracks`: Text `minmax(160px, 1fr)`, der Satz
scrollt quer), der Editor nicht. Dazu schnitt das Datumsfeld (Eingabe mit
Kalender) bei 88 px „21.08.2026" auf „21.08.20".

Behoben:

- Spuren im Editor (`JournalEntryEditor.tsx`, `cols`): Datum **112 px**, Text
  **`minmax(160px,1fr)`** in beiden Modi; Reihenfolge der Spalten unverändert.
  Unter der Mindestbreite scrollt der Satz in `.bse__tbl` quer, statt eine Spalte zu
  verlieren — wie die Lese-Tabelle.
- Die letzte Zelle der Editorzeile (Löschen bzw. Kontenblatt) bleibt beim
  Querscrollen am rechten Rand (`.bse__tbl--edit`, `position: sticky`); in der
  Lese-Tabelle ist die letzte Zelle KOST, dort gilt die Regel nicht.

- **Datum im Lesezustand** (Editor ohne Bearbeiten und `JournalEntryGrid`): stand
  roh als „2026-08-21" da (T7 verlangt TT.MM.JJJJ) — jetzt über `Time`
  („21.08.2026"); `datum` bleibt ISO, weil das Datumsfeld es braucht.
- `BookingReview --in-use` setzt jetzt den Editor (lesend) in den Slot, wie die
  Fall-Ansicht — die Breite, in der der Fehler auffiel.

Gemessen (`S2_SplitFull`, 1280 × 900, Rahmen 900 px): Tabelle 1046 px Inhalt in 862 px
→ quer scrollbar (184 px); Text 160 px; Datumsfeld 112 px, „21.08.2026" ganz
(scrollWidth 110 = clientWidth 110); Handlungszelle rechts bei 897 px vor und nach
dem Scrollen; die Seite scrollt nicht (1280 = 1280).

Kriterien für die fremde Abnahme:

- [x] Text-Spalte ≥ 160 px in `full` und `simple` bei 900 px Rahmen; kein überlagerter Kopf (`S2_SplitFull`, `S1_EditWithWarning`)
- [x] Datum ganz lesbar („21.08.2026"), Feld ohne inneren Überlauf
- [ ] Querscroll nur in `.bse__tbl`, nicht auf der Seite; Handlungszelle beim Scrollen sichtbar (Löschen erreichbar ohne Scrollen) — offen: M2 (fremde Abnahme)
- [ ] Lese-Tabelle (`JournalEntryGrid`) unverändert, KOST nicht angeheftet — offen: M1 (fremde Abnahme)
- [x] in `BookingReview --in-use` (728 px, Editor im Slot) Text lesbar, Handlungszelle sichtbar — gemessen: Tabelle 1008 in 694 px, Text 160 px, letzte Zelle bei 727 = rechter Rand
- [ ] Datum im Lesezustand „21.08.2026" in Editor (`--in-use`) und Grid (`BookingReview --list-full`) — offen: M1 (fremde Abnahme)

### Fremde Abnahme Nachtrag Spurbreiten 2026-10-01

Fremder Abnehmer (nichts gebaut), Stand `82bfa0c`. Storybook :6107, eigener
Playwright-Kontext 1280 × 900, Locale de-DE.

| # | Kriterium | Nachweis | |
|---|---|---|---|
| 1 | Text ≥ 160 px in `full` und `simple` bei 900 px, kein überlagerter Kopf | `--s-2-split-full`: Tabelle 862 px, Inhalt 1046 px; „Text" 797–957 = 160 px, keine Spalte unter 4 px, kein Kopf abgeschnitten. Nach „Einfach ◂": 862 in 862, Text 226 px. `--s-1-edit-with-warning` (simple): Text 226 px. Einzige Überdeckung ist die leere angeheftete Kopfzelle (865–897) über dem Rest von „Text" — gewollt, das Wort steht frei | ✓ |
| 2 | Datum ganz lesbar, Feld ohne inneren Überlauf | Datumsfeld 112 px, Bild: „21.08.2026" mit Kalender ganz; scrollWidth 110 = clientWidth 110 in jeder Zeile, beide Modi | ✓ |
| 3 | Querscroll nur in `.bse__tbl`; Handlungszelle sichtbar, Löschen ohne Scrollen | Seite 1280 = 1280 in allen 13 Editor-Stories; `.bse__tbl` overflow-x auto; letzte Zelle `sticky`, 865–897 bei scrollLeft 0 und 184; „Zeile entfernen" 865–878 ohne Scrollen sichtbar. **Aber** der Fokus auf „Buchungstext" landet unter der angehefteten Zelle (M2) | ✗ |
| 4 | Lese-Tabelle unverändert außer dem Datum, KOST nicht angeheftet | KOST `position: static` in `bookingreview--list-full`, `journalentrygrid--full`, `--edges`; Spuren unverändert. **Aber** das Datum ist in jeder `journalentrygrid--*`-Story mit Zeilen „—" und auf der Konto-Seite vertauscht (M1) | ✗ |
| 5 | `bookingreview--in-use` (728 px, Editor lesend im Slot) | Tabelle 33–727, 1008 in 694 px; Text 160 px; letzte Zelle rechts bei 727 vor und nach dem Scrollen; Seite 1280 = 1280 | ✓ |
| 6 | Datum lesend „21.08.2026" in Editor und Grid; kein ISO sichtbar | `--in-use` und `--list-full`: `<time>` „21.08.2026"; lesende Editoren in S24, S25, S20 „21.08.2026"; kein `JJJJ-MM-TT` im Seitentext der 13 Editor-, 10 Grid- und 2 BookingReview-Stories. Die Grid-Stories zeigen statt des Datums „—" (M1) | ✗ |
| G | Gegenprobe | 25 Stories ohne Konsolenfehler; `pnpm typecheck` 0, `check:language` ok, `check:when` in Ordnung; `build` nicht gelaufen (Auftrag) | ✓ |

**M1 — Das Grid liest jedes `datum` als ISO, nicht jeder Aufrufer liefert ISO.**
Fundort `JournalEntryGrid.tsx:259` (`<Time value={row.datum}>`); `JournalRow.datum`
(`journal-entry.ts:29`) hat keinen Vertrag. Gemessen:
- `JournalEntryGrid.stories.tsx:19` setzt `datum: "26.08.2026"` → in allen
  Grid-Stories mit Zeilen steht „—" (vorher „26.08.2026").
- `src/showcase/account/scenario.tsx:636` baut TT.MM.JJJJ aus `postingDate`;
  `new Date("09.07.2026")` liest US-Ordnung. `seiten-konto-konten--long-name`,
  `#entry=k12-2`: das Grid im Drawer zeigt **„07.09.2026"** (title „Montag,
  7. September 2026"), die Liste daneben 09.07.2026. Ab Tag 13 „—". Ein still
  falsches Datum ist schlimmer als ein rohes.

Weg: Vertrag festschreiben (`datum` ist ISO `JJJJ-MM-TT`, JSDoc am Feld) und beide
Erzeuger auf ISO stellen (Fixture `"2026-08-26"`, `scenario.tsx` `datum: d`).

**M2 — Fokus unter der angehefteten Zelle.** `--s-2-split-full`, Tab aus
„Belegfeld 2" auf „Buchungstext": der Browser scrollt 60 px, das Feld steht bei
737–897, die angeheftete Zelle (865–897 plus 6 px Schatten) deckt die rechten
38 px samt Fokusring. Wer am Ende weitertippt (`End`, „ Druckerpapier A4 und
Ordner"), sieht die letzten Zeichen nicht — sie liegen unter dem Papierkorb.
KOST 1 kommt frei (scrollLeft 184). Verstößt gegen „Fokusring sichtbar und nicht
verdeckt" (`CLAUDE.md` §2 Bedienung). Fundort `v3.css`, `.bse__tbl--edit`. Probe
ohne Commit: `.bse__tbl--edit { scroll-padding-inline-end: 44px }` → Feld 693–853,
verdeckt 0 px.

Hinweise, nicht Teil dieses Nachtrags:

- **H1 (vorbestehend seit `7390c50`, schwer):** `.bse__tbl { overflow-x: auto }`
  macht die Tabelle auch senkrecht zum Scroll-Container, die Kontenliste des
  `AccountField` wird darin abgeschnitten. `--s-1-edit-with-warning`, Klick in
  „Konto": Liste 202–407, Tabelle endet bei 268 und scrollt senkrecht (282 in
  143); sichtbar bleibt nur „Vorschlag von Ludwig". Seit diesem Nachtrag hängt
  der Editor bewusst an diesem Container. Eigener Nachtrag empfohlen (Liste
  außerhalb des Containers rendern).
- **H2 (vorbestehend):** „Zeile entfernen" misst 13 × 13 px; die
  Abstandsausnahme hält knapp (KOST endet bei 859, Kreis 859,5–883,5).
- **H3:** In der Fall-Ansicht (`--in-use`, 694 px) beginnt „Text" bei ~795 px und
  liegt beim Öffnen ganz außerhalb; die angeheftete letzte Zelle ist lesend leer
  und deckt trotzdem 38 px. Folgt aus „scrollen statt Spalte verlieren"; Frage an
  den Owner, ob die Fall-Ansicht lesend in `simple` startet oder die Zelle nur mit
  Inhalt angeheftet wird.

Vier Linsen:
- **Sprache:** Datum lesend über `Time` in TT.MM.JJJJ (T7) — aber nur bei
  ISO-Eingabe, sonst „—" oder vertauscht (M1); keine neuen Wörter.
- **Bedienung:** Löschen ohne Scrollen erreichbar, Seite ohne Querscroll; der Fokus
  auf „Buchungstext" ist teils verdeckt (M2), die Kontenliste abgeschnitten (H1).
- **Logik:** Der Editor folgt jetzt derselben Regel wie `journalGridTracks` (160 px,
  scrollen); das Anheften ist sauber auf `.bse__tbl--edit` begrenzt, KOST im Grid
  bleibt static.
- **Darstellung:** Keine Spalte fällt mehr auf 0 px, kein Kopf läuft ineinander;
  Schatten in `--color-surface`, kein Hex, kein neues Token.

**Urteil: nicht abgenommen.** Kriterien 1, 2 und 5 erfüllt; 3 scheitert an M2, 4
und 6 an M1. Nachprüfung danach: Kriterien 3, 4, 6 und die Konto-Seite
`long-name` mit `#entry=k12-2`.

### Nacharbeit Spurbreiten 2026-10-01 (nach der fremden Abnahme)

| Punkt | Änderung | Stand |
|---|---|---|
| M1 `datum` nicht überall ISO | Gelesen wird nur ein ISO-Datum über `Time` formatiert (`ISO_DATE`); ein schon deutsches Datum steht wie geliefert — die Grid-Stories („26.08.2026") und der Konto-Showcase (TT.MM.JJJJ) zeigen wieder das richtige Datum. JSDoc an `JournalRow.datum`: ISO, ein deutsches Datum wird so gezeigt | behoben |
| M2 angeheftete Zelle verdeckt das fokussierte Textfeld | `.bse__tbl--edit { scroll-padding-inline-end: 44px }` — gemessen in `S2_SplitFull`: Textfeld rechts 853, angeheftete Zelle ab 865, verdeckt 0 px | behoben |
| H3 leere angeheftete Zelle im Lesezustand | angeheftet wird nur beim Bearbeiten (`editable` → `.bse__tbl--edit`) | behoben; offen beim Owner: soll die Fall-Ansicht im Modus `simple` starten, damit „Text" ohne Scrollen sichtbar ist? |
| H1 Kontenliste des `AccountField` im Editor abgeschnitten | **vorbestehend seit 0044 (7390c50)**: `.bse__tbl` scrollt quer, damit auch senkrecht, und schneidet die absolut gesetzte Liste ab. Abhilfe ist die Liste in der obersten Ebene (`popover`, wie die Popover-Familie) — eigener Auftrag, an llcto gemeldet | offen, eigener Auftrag |
| H2 „Zeile entfernen" 13 × 13 px | vorbestehend, setweit Backlog 0213 (Trefferflächen) | offen |
