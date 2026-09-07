# 0015 · JournalEntryEditor — drei Nachträge aus F109

| | |
|---|---|
| Status | Abnahme |
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
- **M16 — die deutschen Bezeichner der Altteile stehen weiter.** `gegenkonto`,
  `belegSide`, `EditorRow.datum/umsatz/konto/beleg1`, `Kopf`, `Zeile`,
  `Journal`, `Meldungsblock`, `summeBelegseite`, `speichern`, `journalOffen`
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

Gemessen (Story `JournalWithPostingText`, zwei Zeilen mit Steuer):

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
  Belegs und fällt aus `belegSide`; ein Umschalter dort erzeugte einen Satz,
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
  - M16 — die deutschen Bezeichner der Altteile (`gegenkonto`, `Kopf`,
    `Zeile`, `summeBelegseite`) → **0113**, wenn die Datei ohnehin geteilt
    wird.
