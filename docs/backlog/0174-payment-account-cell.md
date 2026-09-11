# 0174 · PaymentAccountCell — das Zahlungskonto, genannt in fremdem Markup

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/payment-account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: ein Zahlungskonto des Mandanten mit IBAN und Kontoauszug ist Buchhaltung |
| Quelle | Entitätsprofil `docs/entitaeten/payment-account.md` (geprüft), Abschnitte „Datenpunkte" (Rang 1–3), „Formen" (`PaymentAccountCell`), „Zuschnitt" (jetzt, Bau-Reihenfolge 1) |
| Ersetzt | im Set: die Spanne mit `title` in `SourceDocumentFacts.tsx:216` und die rohe Id in `RecurringRuleFacts.tsx:261`; in `ludwig/app` später die Nennungen an Bankzeile und Importlauf |
| Blockiert | `PaymentAccountRow` (die Zeile nennt das Konto mit derselben Zelle), die Kleinigkeit „rohe Id in `RecurringRuleFacts`" |
| Spec von / am | Claude, 2026-09-11 |

## Ziel

Wo ein Beleg, eine Wiederkehr-Regel oder eine Bankzeile sagt, welches
Zahlungskonto sie meint, steht heute ein Etikett ohne Weg — oder, bei der
Regel, eine UUID. Die Sachbearbeiterin soll das Konto am Namen erkennen, die
IBAN beim Zeigen sehen und mit einem Klick beim Kontoauszug sein.

## Einordnung

- **Wiederverwenden:** kein `@when` passt. `PaymentAccountField` (0145) wählt ein
  Konto aus, es nennt keins; `AccountCell` nennt ein **Sach**konto mit Nummer
  (GLOSSARY trennt beide: „Das Sachkonto im Kontenplan ist `ledger-account`").
- **Neu, weil:** Regel 5 aus `spec-schreiben` §3 — das Profil führt die Form
  (Regel 3 aus `entitaet-analysieren` §7: FK-Ziel von Bankzeile, Importlauf und
  Regel), und keine vorhandene Form deckt sie.
- **Zuschnitt:** eine Datei `entities/payment-account/PaymentAccount.tsx` für die
  Familie, die Zeile (`PaymentAccountRow`) kommt später dazu — wie
  `BusinessPartner.tsx`. `PaymentAccountField` bleibt in `account/`; der Umzug
  gehört nicht hierher.
- **Setzt auf:** `EntityIcon` (`bank-account`, Registry 0087), `Link`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `account` | `{ id: string; label: string; iban: string \| null }` — die gemeinsame Form von `PaymentAccountOption` und `SourceDocumentVM.paymentAccount` | ja | das genannte Konto; `label` steht, wie die App es liefert, die IBAN steht im `title` | `Filled` |
| `href` | `string` | nein | der Weg zum Kontoauszug des Kontos (`banks/[accountId]`, vom Aufrufer gebaut); ohne ihn Text | `Linked` |

Typen aus `src/ludwig/modules/bank-transactions/domain/payment-account-options.ts`
(`PaymentAccountOption`, per `Pick`) — keine lokale Neudefinition.

**Profil gegen Datenmodell:** Das Profil will Rang 1–2 — Name und Zeichen der
Art —, die IBAN nur im `title`. Die beiden Formen, in denen die App ein Konto
nennt, tragen aber nur `label` („fertige Beschriftung: Name, bei Bankverbindung
mit IBAN") und `iban`, weder den Namen allein noch die Art. Die Zelle zeigt
deshalb `label` wie geliefert und das eine Zeichen `bank-account` für jede Art;
Name und Art sind Befund **L-334**, und die Zelle nimmt sie, sobald sie kommen
(Ausbau).

**Kann bewusst nicht:** auswählen (→ `PaymentAccountField`), Bewegungen oder
Auszugserwartung zeigen (→ `PaymentAccountRow`), eine Id auflösen — wer nur die
Id hat, schlägt das Konto in seiner Liste nach; die Zelle bekommt es fertig.

## Verhalten

Server-Component, kein Zustand. Der Name bricht nicht: max 40 Zeichen (Profil,
„nie gekürzt"); ein `label` mit IBAN ist bis 64 Zeichen lang und darf in einer
schmalen Spalte umbrechen, abgeschnitten wird er nicht. Mit `href` ist der
**Name** der Link (ein Ziel, I11), das Zeichen steht davor und trägt kein
eigenes Wort (`aria-hidden`), denn das Wort ist der Name (V11).

Keine eigenen Zustände: kein Konto heißt beim Aufrufer „kein Konto" — der Beleg
setzt einen Mangel (L-268), die Regel sagt „Konto der jeweiligen Zahlung"; eine
leere Zelle gibt es nicht. Lädt und Fehler gehören dem Aufrufer.

## Stories

Titel `v3/Entitäten/Zahlungskonto/PaymentAccountCell`. Abgeleitet nach §6: ein
Zustand (gefüllt), keine Enum-Prop, kein Layout-Boolean, kein Callback; `href`
als Weg; im Einsatz; Rand, weil die Zelle umbricht.

| Story | Beweist |
|---|---|
| `Filled` | Bankkonto mit IBAN (Label mit IBAN, `title`) · Kasse ohne IBAN (Label allein, kein `title`) |
| `Linked` | `href`: der Name ist der Link, das Zeichen nicht |
| `Edges` | 40-Zeichen-Name mit IBAN in 200 px: bricht um, kein Überlauf |
| `InUse` | in `SourceDocumentFacts` (Kontoauszug); `RecurringRuleFacts` zeigt die Zelle in ihrer Story `All` |

Nicht anwendbar: leer, lädt, Fehler — die Zelle bekommt ein Konto oder wird
nicht gezeigt (Verhalten). Die Untergrenze 3 der Entitätsform ist mit vier
Stories erfüllt, ohne dass ein Zustand erfunden wird.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| der Name ohne IBAN, die IBAN nur im `title` | `account.displayName` | L-334 gelöst |
| ein Zeichen je Art (Kasse, Kreditkarte, PayPal …) samt Wort im `title` | `account.kind` (`PaymentAccountKind`, gespiegelt in `core/accounting/payment-account-kind.ts`) und je Art ein Registry-Eintrag | L-334 gelöst; offene Frage 1 |

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

- [ ] `account.label` steht wie geliefert, `account.iban` im `title` — und ohne IBAN kein `title` (Story `Filled`)
- [ ] mit `href` ist nur der Name ein Link; das Zeichen ist `aria-hidden` (Story `Linked`, DOM)
- [ ] 200 px: der Text bricht um, `scrollWidth` = `clientWidth` (Story `Edges`, gemessen)
- [ ] `SourceDocumentFacts` nennt das Zahlungskonto über die Zelle, ohne eigene Spanne (Story `InUse`, Grep)
- [ ] `RecurringRuleFacts` zeigt keine UUID mehr: mit der Liste der Konten die Zelle, ohne sie „hinterlegt"; ohne Konto an der Regel weiter „Konto der jeweiligen Zahlung" (Story `All` von `RecurringRuleFacts`; Grep: kein `paymentAccountId ??` mehr)
- [ ] das Zeichen kommt aus `ENTITY_ICON["bank-account"]`, nicht aus einem lokalen Import

## Offene Fragen

1. Ein Zeichen je Art? Die Registry kennt nur `bank-account` („Bankkonto") — an
   einer Kasse steht dann das Bankzeichen. — ohne Antwort: **ein Zeichen für
   alle**, bis die Art an der Nennung ankommt (L-334); dann je Art ein Eintrag
   in der Registry (0087).
2. Woher bekommt `RecurringRuleFacts` den Namen? Die Regel trägt nur
   `paymentAccountId`. — ohne Antwort: eine Prop
   `paymentAccounts?: readonly PaymentAccountOption[]`, dieselbe Liste, die der
   `RecurringRuleEditor` schon bekommt; die Facts schlagen die Id darin nach.

## Gebaut (2026-09-11)

`entities/payment-account/PaymentAccount.tsx` mit `PaymentAccountCell` und dem
Typ `PaymentAccountRef` (`Pick` aus `PaymentAccountOption`), beide im Barrel;
Regeln `.v2pacc*` in `v3.css`. `SourceDocumentFacts` nennt das Konto über die
Zelle. `RecurringRuleFacts` bekommt `paymentAccounts?` (offene Frage 2,
Default) und zeigt die Zelle, ohne Liste „hinterlegt", ohne Konto an der Regel
wie bisher „Konto der jeweiligen Zahlung"; ihre Story `All` trägt jetzt ein
Konto. Das Zeichen sitzt auf der ersten Zeile, nicht in der Mitte eines
umbrochenen Labels.

Gemessen (CDP, Storybook 6107, 1100 px):

| Story | Beobachtung |
|---|---|
| `paymentaccountcell--filled` | Bank: `title` = IBAN; Kasse: kein `title`; Zeichen `aria-hidden` |
| `--linked` | der Name ist das `<a>`, das Zeichen steht davor außerhalb |
| `--edges` | 200 px: das Label bricht auf fünf Zeilen um, kein Überlauf (`scrollWidth` = `clientWidth`) |
| `--in-use` | Zeile „Zahlungskonto" in `SourceDocumentFacts`: Zeichen, „Stadtbank · Geschäftskonto", `title` IBAN |
| `recurringrulefacts--all` | Zeile „Zahlungskonto": die Zelle; keine UUID im Seitentext |

`pnpm typecheck`, `check:classes`, `check:language`, `check:when`,
`check:icons` und `pnpm build` grün; Screenshots angesehen. Abnahme durch einen
anderen Agenten steht aus.
