# 0160 · Die Regel erklärt ihre Einstellungen (`RecurringRuleFacts` `explain`)

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, gegen 802b706) |
| Stufe | `entities/recurring-rule/` — Erweiterung von `RecurringRuleFacts` (0134) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungsweise, Personenkonto und Belegnummern-Strategie gibt es nur an einer Ludwig-Regel |
| Quelle | Owner 2026-09-11: „für wiederkehrende brauchen wir einen Tab mit den Einstellungen zu wiederkehrender Buchung — das braucht sicher eine Subkomponente mit der Konfiguration, wie diese angelegt und erklärt ist". Datengrundlage: `docs/entitaeten/recurring-rule-staging-erhebung-2026-09-11.md` (ludwig-manager, Abschnitte b–d) |
| Ersetzt | in der App die Kriterien-Tabelle des `ZuordnungTab` (lokale Wörter für die Richtung, nur die absolute Toleranz) und seinen statischen Einleitungstext |
| Blockiert | den Reiter „Wiederkehr" der Sachverhaltsseite (0152, Story `Recurrence`) |
| Spec von / am | Claude, 2026-09-11 |

## Ziel

Die Sachbearbeiterin öffnet am Dauersachverhalt den Reiter „Wiederkehr" und
will verstehen, was die Regel tut: woran sie eine Zahlung erkennt, was sie
bucht, wann sie sie erwartet — und was davon sie selbst in der Maske ändern
kann. Heute sagt die App das an drei Stellen verschieden (Regelwerk-Reiter,
Zuordnungs-Reiter mit eigenen Wörtern, der Satz aus `describeRecurringRule`),
und keine sagt, dass Rhythmus und Zahltag **kein** Kriterium sind oder dass von
zwei Toleranzen die großzügigere gilt.

## Einordnung

- **Wiederverwenden:** `RecurringRuleFacts` (0134) zeigt alle Einstellungen in
  vier Gruppen — Auslöser, Wirkung, Erwartung, Herkunft (mit `all`) — mit den
  Wörtern der Domäne. Es fehlt nur die Erklärung.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2 — der Baustein deckt den Fall
  zu vier Fünfteln; das Fehlende ist eine Designentscheidung, die wiederkommt
  (Reiter Wiederkehr, Vorschau im Editor) und sich in einem Halbsatz sagen
  lässt. Keine neue Komponente.
- **Zuschnitt:** eine Prop an der bestehenden Datei.
- **Setzt auf:** `FieldList` (Wert mit Unterzeile), `resolveStatus` (Registry),
  die Wortlisten der Domäne (`RULE_DOCUMENT_NUMBER_STRATEGY_LABEL`,
  `RULE_PROFILE_SOURCE_LABEL`).

## Was die Erklärung sagt

Je Einstellung **ein** Satz unter dem Wert. Wo die Domäne ihn schon hat, kommt
er von dort; die übrigen beschreiben den Abgleich so, wie ihn die Erhebung aus
dem Code liest (Abschnitt d) — sie gehören in die Domäne (Befund **L-293**).

| Einstellung | Satz | Quelle | setzt der Import |
|---|---|---|---|
| Buchungsweise (im Kopf) | Beschreibung der Achse `regel_modus` | Registry | — |
| Gegenpartei | „Der Name im Umsatz muss ihn enthalten; Groß- und Kleinschreibung zählen nicht." | Abgleich `name` | — |
| IBAN | „Muss genau übereinstimmen." | Abgleich `iban` | — |
| Richtung | „Umsätze in die andere Richtung prüft die Regel gar nicht." | Vorfilter | — |
| Betrag | „Trifft, wenn der Umsatz höchstens um die Toleranz abweicht; von absoluter und prozentualer Toleranz gilt die großzügigere." | `effectiveAmountTolerance` | — |
| Muster im Verwendungszweck | „Ein regulärer Ausdruck über den Verwendungszweck; Groß- und Kleinschreibung zählen nicht." | Abgleich `purpose` | — |
| Vertragsnummer · Muster im Belegtext · Belegseite | „Dieselbe Regel ordnet auch Belege zu." | `matchSourceDoc` (F94) | — |
| Zuordnungs-Notiz | „Für Menschen und den Agenten — kein Kriterium." | Spaltenkommentar | — |
| Belegnummer der Dauerbuchung | „Belegfeld 1 jeder Sollstellung — daran hängt der Ausgleich des offenen Postens." | Profil Rang 17 | **ja** |
| Gegenkonto · Personenkonto · Buchungstext | „So steht es in jedem Vorschlag dieser Regel." | Vorlage | — |
| Rhythmus · Erwarteter Zahltag | „Kein Kriterium: sagt nur, wann Ludwig die Zahlung erwartet." | kein Datumsfenster im Abgleich | — |
| Laufzeit | „Beendet wird die Regel über „aktiv", nicht über ein Enddatum." | `valid_until` 0 von 30 | **ja** |
| Herkunft des Profils | die Wortliste der Domäne ist schon der Satz | `RULE_PROFILE_SOURCE_LABEL` | **ja** |
| Belegnummern-Strategie | dito | `RULE_DOCUMENT_NUMBER_STRATEGY_LABEL` | **ja** |
| Split-Vorlage | „In der Maske nur lesend." | Erhebung b | **ja** |
| Idempotenz-Anker | „Woran der Import die Regel wiedererkennt." | `import_reference` | **ja** |
| Zahlungskonto | — (der Wert sagt es: „Konto der jeweiligen Zahlung") | — | — |

**„setzt der Import"** ist ein Wort hinter dem Satz, keine Farbe — genau an den
Einstellungen, die `saveRule` nicht schreibt (Erhebung b: Laufzeit,
Belegnummern-Strategie, Herkunft des Profils, Split-Vorlage, Idempotenz-Anker,
Belegnummer der Dauerbuchung). Die Priorität zeigt die Form nicht (0134,
Ausbau).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `explain` | `boolean` | nein (Default `false`) | jede gezeigte Einstellung bekommt ihren Satz; was nur der Import setzt, trägt „setzt der Import" | `Explained` |

Alle anderen Props bleiben unverändert (`rule`, `summary`, `schedule`,
`preview`, `all`, `accountHref`, `hints`, `currency`). `explain` und `all`
sind unabhängig: `all` entscheidet, **welche** Einstellungen stehen, `explain`,
**wie** sie beschrieben werden. Der Reiter Wiederkehr setzt beide.

Was die Form bewusst **nicht** kann: ändern (das ist `RecurringRuleEditor`,
0135); zeigen, wie oft die Regel gegriffen hat (keine Treffer-Historie, L-250).

## Verhalten

Keine Interaktion, keine Zustände dazu — die Prop ändert nur die Beschriftung.
Der Satz steht als Unterzeile unter dem Wert im Arbeitsregister (`--fs-ui-sm`,
gedämpft). Ohne `explain` bleibt die Form Zeichen für Zeichen, wie sie ist.

## Stories

| Story | Beweist |
|---|---|
| `Explained` | `explain` mit `all` an einer Sollstellung: Satz je Zeile, „setzt der Import" an den Import-Einstellungen, Buchungsweise mit der Registry-Beschreibung |
| `Seiten/Sachverhalt/Reiter` · `Recurrence` | im Einsatz: der Reiter Wiederkehr zeigt die Regel mit `explain` und `all` |

Weitere Zustände entfallen: leer, lädt und Fehler gehören dem Aufrufer (0134);
die Prop verändert keinen Zustand, nur Text.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die Sätze aus der Domäne statt aus der Form | keine neue — `explain` liest dann `RULE_SETTING_HELP` aus dem Spiegel | **L-293** ist gelöst |
| Die Priorität erklären, wenn zwei Regeln greifen | ein Feld in „Herkunft" | **L-245** zeigt zwei Regeln an einem Fall |

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

- [ ] `explain` gibt jeder gezeigten Einstellung ihren Satz aus der Tabelle oben (Story `Explained`)
- [ ] „setzt der Import" steht genau an den sechs Import-Einstellungen, an keiner anderen
- [ ] Die Buchungsweise erklärt sich mit der Registry-Beschreibung, nicht mit einem eigenen Satz
- [ ] Rhythmus und Zahltag sagen, dass sie kein Kriterium sind
- [ ] Ohne `explain` sind `Filled`, `WithoutCriterion`, `Modes`, `All`, `InUse`, `Edges` unverändert
- [ ] Der Reiter Wiederkehr (0152, `Recurrence`) zeigt die Regel mit `explain`; kein Querlauf bei 1440, kein Text in 16 px

## Gebaut 2026-09-11

- `RecurringRuleFacts` hat `explain` (Default `false`). Ein Helfer `say()`
  hängt den Satz als Unterzeile an den Wert (`.v2rrfacts__cell`,
  `.v2rrfacts__help`: `--fs-ui-sm`, gedämpft); „setzt der Import" folgt nach
  einem Mittelpunkt.
- Die Buchungsweise steht mit `resolveStatus("regel_modus", …)` — Wort und
  Beschreibung der Registry — unter dem Satz der Regel.
- Story `Explained` (`all` + `explain`); der Reiter Wiederkehr der
  Sachverhaltsseite (0152, `Recurrence`) zeigt die Regel mit `all` und `explain`.

**Zwei Abweichungen von der Tabelle oben**, beide gegen Wiederholung:

1. Gegenkonto, Personenkonto und Buchungstext tragen **einen** Satz über der
   Gruppe „Wirkung" statt dreimal denselben an jeder Zeile.
2. Rhythmus und Zahltag teilen sich einen Satz („Rhythmus und Zahltag sind
   kein Kriterium …"), er steht am Rhythmus.

## Messung (6107, 1440 × 900)

| Kriterium | Ergebnis |
|---|---|
| `pnpm typecheck`, alle Wächter | grün |
| `Explained`: Satz je Einstellung | 9 Sätze; Buchungsweise „Sollstellung: Zur Fälligkeit wird sollgestellt …" aus der Registry |
| „setzt der Import" genau an den Import-Einstellungen | an Belegnummer der Dauerbuchung, Laufzeit, Herkunft des Profils, Belegnummern-Strategie, Idempotenz-Anker — die sechste (Split-Vorlage) zeigt die Beispielregel nicht; an keiner anderen Zeile |
| Ohne `explain` unverändert | `Filled`, `WithoutCriterion`, `Modes`, `All`, `InUse`, `Edges`: 0 Sätze |
| Reiter Wiederkehr | 9 Sätze, 5 Marken, kein Querlauf, kein Text in 16 px |

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Fremde Abnahme am 2026-09-11 durch die Prüfer-Session (Auftrag `ludwig-manager`), gegen 802b706: **fertig.** `Explained` 9 Sätze, 5 Import-Marken, die Buchungsweise mit dem Wort der Achse `regel_modus`; ohne `explain` 0 Sätze in `Filled`, `WithoutCriterion`, `Modes`, `All`, `InUse`, `Edges`; Reiter `Recurrence` im `split` 710 · 710 (bei 1280: 630 · 630), kein Querlauf, Sätze in `--fs-ui-sm`.

## Nachtrag 2026-09-11 — die Sätze kommen aus der Domäne (L-293)

Mit dem Spiegel-Lauf des F210-Fensters (App `c48d8042`, DS `6e92c0d`) liest
`RecurringRuleFacts` die Erklärungen aus `RULE_SETTING_HELP`
(`recurring-rules/domain/rule.ts`): je Einstellung ihr Satz und ob nur der
Import sie setzt. Die festen Sätze im Set sind gestrichen; `say()` nimmt jetzt
den Feldnamen statt des Satzes. Die Ausgabe ist wortgleich — die Sätze waren in
beiden Repos dieselben —, die Stories bleiben unverändert.

