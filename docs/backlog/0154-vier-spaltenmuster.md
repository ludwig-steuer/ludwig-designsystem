# 0154 · Die vier Spaltenmuster — ein Pattern statt vier Layouts

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
| Stufe | `patterns/Columns.tsx` — **neben** `MasterDetail` (0116), nicht als dessen Nachfolger; die beiden haben verschiedene `@when` |
| Quelle | **Owner-Entscheid 2026-09-10**, überbracht von `ludwig-cto`; Brief F196 §2, §5, §5a, §8 (`ludwig/app` staging `672665f8`) |
| Blockiert | 0152 (Sachverhalts-Szenarien) — deren Übersicht ist `list \| detail \| sidebar` |
| Berührt | `docs/detailseiten-standard.md` §1.2 („drei Layouts") · `docs/seiten/sachverhalt-detail.md` (D-L1-Entscheid vom 2026-09-08) · `patterns/DetailView.tsx` (0127) |
| Angelegt / gebaut | Claude, 2026-09-10 |

## Auftrag, wörtlich aus dem Entscheid

> Der Content jedes Reiters ist **immer** eines von vier Spaltenmustern;
> Breiten dürfen nach Gewicht des Inhalts variieren, das Muster nicht:
>
> - `list | detail | sidebar`
> - `list | detail`
> - `50 | 50` (Infoboxen, Diagramme, Vergleiche)
> - `master | sidebar` (master = Content-Fläche)

Der Detailrahmen nimmt es als Content-Slot; Beleg, Konto, Partner und
Sachverhalt bauen aus denselben vier.

## Was das für den Bestand heißt

**Der Standard führt heute drei Layouts** (D-L1 Zonen untereinander, D-L2
Gegenüberstellung, D-L3 Randspalte) und beschreibt sie als Eigenschaft der
**Seite**. Der Entscheid dreht das um: das Muster ist eine Eigenschaft des
**Reiterinhalts**, und eine Seite kann je Reiter ein anderes tragen. §1.2 des
Standards muss das nachziehen — mit der Zuordnung:

| heute | wird | Anmerkung |
|---|---|---|
| D-L1 Zonen untereinander | eine Fläche ohne Spalten | bleibt der Normalfall; im neuen Vokabular kein Muster, sondern die Abwesenheit eines |
| D-L2 Gegenüberstellung | `50 \| 50` | der Beleg (Original gegen Extraktion) ist der Referenzfall |
| D-L3 Randspalte | `master \| sidebar` bzw. `list \| detail` | die zwei gemessenen Breiten (460, 960) sind Beispiele für „Breiten dürfen variieren" |
| — | `list \| detail \| sidebar` | **neu**, und der Grund für diese Aufgabe: die Sachverhalts-Übersicht |

## Was der Schnitt entscheiden muss

1. **Verhältnis zu `MasterDetail` (0116).** Es trägt heute `list`/`detail`,
   `detailWide` und `minDetail`. Wird es das neue Pattern (dritte Spalte als
   optionaler Slot), oder tritt ein neues daneben und `MasterDetail` wird sein
   Aufrufer? Für ein Weiterbauen spricht, dass die erkämpften Breiten dort
   schon leben; dagegen, dass „Master" und „Liste" im neuen Vokabular zwei
   verschiedene Dinge sind.
2. **Wo die Breiten wohnen.** 460 px und 960 px sind in Abnahmen gegen
   gemessene Seiten entstanden. „Breiten dürfen nach Gewicht variieren" heißt
   nicht „jede Seite erfindet ihre eigene" — das Pattern braucht benannte
   Stufen oder die Pflicht, die Zahl im Seitenprofil zu begründen.
3. **`DetailView` (0127) trägt heute `aside` + `minDetail`.** Das ist
   `master | sidebar`, vorweggenommen. Wandert es ins neue Pattern, wird
   `DetailView` schmaler: er reicht nur noch einen Content-Slot durch, und das
   Muster steckt darin. Das ist die Änderung, die 0152 braucht.
4. **Was mit dem Umbruch passiert.** Drei Spalten auf 1280 px sind eng; das
   Muster muss sagen, welche Spalte zuerst weicht — und die Antwort ist nicht
   „die dritte", wenn dort die Rückfragen stehen.

## Beantwortet von `ludwig-cto` (2026-09-10)

| Frage | Antwort |
|---|---|
| Freie Zahlen oder benannte Stufen? | **Benannte Stufen.** „Nach Gewicht variieren" heißt: die Seite wählt eine Stufe, sie erfindet keine Zahl. Die gemessenen 460 und 960 sind die ersten beiden; eine dritte für die schmale Notizspalte wird an der Sachverhalts-Übersicht **gemessen**, nicht geschätzt |
| Was weicht beim Umbruch? | **Die dritte Spalte fällt unter die zweite, die erste nie.** Tragend ist der Strang, nicht die Notiz (Brief §5; Vorschlag an den Owner, noch nicht bestätigt — Alternative: Strang einklappbar) |
| DATEV-Eintrag in der Timeline | Gleichrangig in der **Reihenfolge**, sichtbar verschieden in der **Zeile**: der Eintrag trägt das Wort „DATEV" als Quelle, Ludwig-Einträge ihren Buchungszustand aus der Achse `buchung`. Kein Icon allein (V7). In Spalte 2 hat der DATEV-Eintrag keine Handlungen |

## Gebaut: `patterns/Columns.tsx`

Vier Muster, zwei benannte Stufen, ein Umbruch — und `MasterDetail` bleibt,
wo es ist. **Es wird nicht abgelöst:** es trägt „Liste mit Detail daneben"
außerhalb eines Reiterrumpfs (Auswahl in einem Dialog, ein Log-Browser), und
das ist eine andere Frage als „wie ist dieser Reiter geschnitten". Zwei
Bausteine mit verschiedenen `@when`, kein Nachfolger.

**Alle Spalten wachsen** (`flex-grow ≥ 1`), auch die schmalen — sonst bleibt
eine umgebrochene Spalte schmal oben stehen, statt die Zeile zu nehmen.
Gemessen 2026-09-10 bei 1100 px: mit `grow: 0` stand die Begleitspalte unter
der Arbeitsfläche und war 360 statt 1068 px breit. Das Verhältnis machen die
**Gewichte** (1 zu 2), nicht das Wachstumsverbot.

### Messung (Spaltenbreiten in px)

| Muster | 1440 | 1100 | 820 |
|---|---|---|---|
| `list-detail-aside` | 462 · 544 · 362, eine Zeile | 476 · 572, Notizen darunter über die **volle** Breite (1068) | drei Zeilen à 788 |
| `split` | 694 · 694 | 524 · 524 | 384 · 384 |
| `main-aside` (`table`) | 1005 · 383 | 1068, Begleiter **darüber** (1068; seit 2026-09-11, Nachtrag unten) | 788 · 788 |

Die dritte Spalte weicht also nach unten und **verschwindet nicht**, und die
erste bleibt in jeder Breite stehen — wie im Brief verlangt.

## Was 0152 noch braucht

- ~~**Die dritte Stufe** für die schmale Notizspalte~~ — **erledigt 2026-09-15
  mit 0184**: an der Sachverhalts-Übersicht gemessen (1600 · 1440 · 1280 →
  410 · 370 · 330 px, Umbruch zwischen 1280 und 1180) und als Stufe `notes`
  320 px benannt; `facts` 360 px daneben für Feldzeilen.
- ~~**`DetailView` schmaler machen**~~ — **erledigt 2026-09-15 mit 0184**:
  `aside` und `minDetail` sind weg; kein Aufrufer hatte sie je übergeben.
- ~~**Standard §1.2 nachziehen**~~ — **erledigt 2026-09-15**: §1.2 nennt
  `Columns` und alle vier Stufen. `docs/seiten/sachverhalt-detail.md` braucht
  nichts: der Owner hat die Seite am 2026-09-08 auf D-L1 gestellt, sie hat
  keine Randspalte.
- **Offen:** `CaseDetailView` (0050) und `LedgerAccountView` (0063) bauen ihre
  Randspalte noch selbst mit `MasterDetail`. Der Umzug auf `Columns` ist ein
  eigener Schritt mit eigener Messung (0184, offene Frage 1).

## Nachtrag 2026-09-11 — `main-aside` bricht die Randspalte nach oben

Owner-Entscheid zur Kontoseite (0157): beim Umbruch steht die Randspalte
**über** der Arbeitsfläche, nicht darunter — dort sind es die Stammdaten,
gegen die die Bewegungen gelesen werden, und unter 25 Zeilen findet sie
niemand. Umgesetzt als `flex-wrap: wrap-reverse` an `.v3cols--main-aside`;
die Reihenfolge im DOM bleibt Fläche, dann Randspalte. Die übrigen drei
Muster brechen wie bisher (die dritte Spalte fällt nach unten). Aufrufer von
`main-aside` sind heute nur die Kontoseite und die Stories dieses Musters;
breaking: nein.

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Vier Muster, zwei Stufen, `MasterDetail` bleibt | `columns--list-detail`, `--list-detail-aside`, `--split`, `--main-aside` rendern; `MasterDetail` unverändert vorhanden | ok |
| Breiten @1440 wie Messtabelle | `list-detail-aside` 462·544·362 ✓; `split` 694·694 ✓; `main-aside` 1005·383 ✓ | ok |
| @1100: dritte Spalte fällt nach unten, volle Breite; erste bleibt | `list-detail-aside`: 476·572, aside 1068 breit, top 364 (darunter); `split` 524·524 | ok |
| @820: drei Zeilen à 788 | `list-detail-aside` 788/788/788 (tops 16/364/619) | ok |
| Nachtrag: `main-aside` bricht **nach oben** (`wrap-reverse`) | `flex-wrap: wrap-reverse` gemessen; @1100 aside top 16, main top 240; @820 dito; @1440 nebeneinander | ok |
| Kein Querlauf | scrollW = vw bei 1440/1100/820 | ok |
| Spec beschreibt das Gebaute | Messtabelle: `main-aside` @1100 „1068, Begleiter **darunter**" und Satz „Die dritte Spalte weicht also nach unten" — seit bca4b7d für `main-aside` **darüber**; der Nachtrag sagt es, die Tabelle darüber nicht | Hinweis (Tabellenzeile veraltet) |

**Urteil: fertig** — Tabellenzeile `main-aside`@1100 in der Spec nachziehen.
