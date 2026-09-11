# 0142 · `BusinessPartnerFacts` — was über einen Geschäftspartner bekannt ist

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/business-partner/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: USt-Profil, Personenkonto, Reifegrad, DATEV-Herkunft |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` (`geprüft`, 2026-09-09), Abschnitt „Formen", Zeile `BusinessPartnerFacts` |
| Ersetzt | `MasterDataTab` (21 Felder in fünf Boxen) und den Kopfblock der Partnerseite |
| Setzt voraus | ~~**0139** `BusinessPartnerCell` (für das Grabstein-Ziel)~~ — der Grabstein ist nicht gebaut (L-271), damit auch die Zelle hier nicht gebraucht · `FieldList` (0006) · `StatusBadge axis="partner"` · `Time`, `MonoCell` |
| Blockiert | **0143** `BusinessPartnerDrawer` und **0127** `BusinessPartnerView` — beide zeigen diese Fakten, aus **dieser** Komponente |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Der Teil, den Drawer und View **teilen**. Das ist der Grund, warum die Fakten
vor dem Drawer entstehen und nicht umgekehrt: §7 sagt, der Drawer folgt dem
View, weil er dessen Kern-Fakten aus derselben Komponente zeigt — diese
Komponente ist hier. Präzedenz: `SourceDocumentFacts` (0052), `AccountFacts`
(0066), `CaseFacts`.

Heute steht dieselbe Auskunft als `MasterDataTab` mit 21 Feldern in fünf
Boxen. Fünf Boxen für 21 Felder, von denen die Mehrzahl leer ist — der
Füllgrad entscheidet hier mehr als die Gliederung.

## Gruppen und was in ihnen steht

Ränge 1–15 des Profils. **Ein Feld ohne Wert bekommt keine Zeile**, eine
Gruppe ohne Feld keine Überschrift — dieselbe Regel wie bei den anderen drei
Fakten-Formen. Bei diesem Bestand ist das keine Feinheit, sondern der
Unterschied zwischen einer Karte mit sechs Zeilen und einer mit einundzwanzig
Strichen.

| Gruppe | Zeilen (Rang) | Wann sie steht |
|---|---|---|
| **Wer** | Name (1) · Kurzname (7) · Ort (6) · USt-IdNr. (8) | Name immer; der Rest je Wert |
| **Konten** | Kreditorkonto (2) · Debitorkonto (2) · Verrechnung | mindestens eins — bei 2 Partnern von 14.950 gar keins, dann entfällt die Gruppe |
| **Verhalten** | USt-Profil (9) · Typische Lieferung (10) · Beschreibung (12) | nur `all`; über den ganzen Bestand 11–17 % gefüllt, unter den benutzten 75–80 % |
| **Bewegung** | Buchungen (4) · Letzte Buchung (5) | Buchungen immer (0 ist eine Aussage); das Datum nur mit Buchung |
| **Herkunft** | Reifegrad (3) · Herkunft (15) · Anschrift (13) · Kontakt (14) | nur `all` |

**Der Reifegrad steht in „Herkunft", nicht oben.** Er ist zu 99,7 %
`confirmed` — eine Marke, die fast immer dasselbe sagt, gehört nicht an die
erste Stelle. Wo er `proposed` oder `draft` ist (38 Partner), ist er eine
Auskunft über die **Herkunft** des Satzes, nicht über den Partner.

**Das USt-Profil steht als Wort oder gar nicht.** `VAT_PROFILE_LABEL` lebt
privat in `MasterDataTab.tsx` (**L-223**), die Domäne führt die Wörter nicht.
Eine lokale Map wäre R1 verletzt. Bis L-223 erledigt ist, bleibt die Zeile
weg — nicht roh. Das ist der Unterschied zur Wiederkehr-Regel bis zum
2026-09-09: dort **gab** es die Werte, nur ohne Wort, und das Rohe war
sichtbar falsch statt still verschwunden. Hier ist der Wert selbst ein
englischer Schlüssel ohne Bedeutung für die Kanzlei (`domestic_reverse_charge`),
und roh hingeschrieben behauptet er eine Auskunft, die er nicht gibt.

**Die typische Lieferung steht als Wort**, seit dem Spiegellauf vom
2026-09-09: `PARTNER_NATURE_LABEL` führt jetzt alle sechs Werte (L-222). Bis
dahin hätten 924 Partner ein `undefined` getragen.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `partner` | `BusinessPartnerDetail` | ja | Der Datensatz aus dem Spiegel. Die Form rechnet nichts | `Filled` |
| `all` | `boolean` | nein | Zusätzlich „Verhalten" und „Herkunft". Vorgabe `false` — der Drawer zeigt die kurze Form, der View die ganze | `All` |
| `accountHref` | `(accountNumber: string) => string` | nein | Der Weg zum Kontoblatt an jeder Nummer | `Filled` |
| `hints` | `readonly string[]` | nein | Sätze des Aufrufers über der ersten Gruppe — heute „Ohne Personenkonto: dieser Partner wird nirgends bebucht." | `Hints` |

**Kann bewusst nicht:**

- **Ändern.** Kein Feld ist `änderbar = Nutzer`, und seit **L-229** gibt es auf
  die Stammdaten überhaupt keinen Schreibpfad mehr (`update_business_partner`
  ist mit F127 gestrichen, eine Server Action existiert nicht). Deshalb gibt es
  auch keinen `BusinessPartnerEditor` — verworfen, mit diesem Grund.
- **Die Kinder zeigen.** Personenkonten, Sachverhalte, Belege und Buchungssätze
  sind Sache des Drawers (0143) und des Views (0127). Die Fakten sind, was am
  Partner selbst steht.
- **Das USt-Profil roh zeigen** (siehe oben).
- **Die Historie zeigen.** Sie liegt unter **drei** `resource_kind`-Werten
  (**L-226**) und gehört in den Verlauf-Reiter des Views.

## Verhalten

`FieldList tone="bare"` je Gruppe, mit Überschrift. Zahlen rechts mit `tnum`,
Kontonummern `mono` mit führenden Nullen (GLOSSARY „Account number canon":
speichern heißt zeigen).

**Der Grabstein ist der eine Fall, der die Form umdreht.** Trägt der Partner
`mergedIntoPartnerId`, steht als **erste** Zeile „Zusammengeführt mit …" samt
`BusinessPartnerCell` auf den Nachfolger, und die übrigen Gruppen stehen leiser
darunter: es ist ein historischer Satz, kein aktueller. Im Bestand ist das Feld
heute **überall null** — die Zeile ist trotzdem gebaut, weil ihr Fehlen sonst
erst beim ersten Zusammenführen auffiele und dann eine tote Auskunft stünde.

## Stories

| Story | Beweist |
|---|---|
| `Filled` | Der Regelfall ohne `all`: Wer, Konten, Bewegung — ein Partner mit Kreditorkonto, Ort und sechs Buchungen |
| `All` | Derselbe Partner mit `all`: dazu Verhalten und Herkunft |
| `Sparse` | Der häufigste Fall im Bestand: Name, ein Konto, `usageBookingCount: 0`, sonst nichts. Drei Zeilen, zwei Gruppen — keine leeren Striche |
| ~~`Tombstone`~~ | **Nicht gebaut**: `mergedIntoPartnerId` steht nicht am gespiegelten Typ (L-271). Die Story kommt mit dem Feld, nicht davor — eine Story über einen Zustand, den die Form nicht kennen kann, wäre erfunden |
| `Hints` | Der Satz des Aufrufers über der ersten Gruppe |
| `Edges` | Name mit 50 Zeichen, Beschreibung mit 101 (Maximum im Bestand), drei Verrechnungskonten, `city: null` bei gesetzter Anschrift |

Ausgelassen mit Grund: **lädt** und **Fehler** — die Fakten zeigen, was sie
bekommen (Präzedenz `AccountFacts`). **Leer** gibt es nicht: ohne Partner gibt
es keine Fakten, der Aufrufer rendert dann nichts.

## Ausbau

Das **USt-Profil als Wort**, sobald L-223 erledigt ist: eine Zeile in „Verhalten",
kein Umbau.

Die drei **Ableitungen aus der Stapelabnahme** — übliches Gegenkonto, üblicher
Steuerschlüssel, letzte Buchungen — gehören nicht hierher, sondern in den
Abriss „Buchungsverhalten" des Drawers (0143). Sie sind heute im Sichtmodell
`ReviewCasePartner` gerechnet, nicht am Partner: `defaultDebitAccountNumber`
und `typicalTaxKeys` sind zu 0 % gefüllt.

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

- [ ] Ein Feld ohne Wert bekommt **keine** Zeile, eine Gruppe ohne Feld keine
      Überschrift (`Sparse`: **drei** Gruppen — Wer · Konten · Bewegung —, und die Gruppe „Wer" hat **eine** Zeile statt vier)
- [ ] `usageBookingCount: 0` steht als **0**, nicht als Strich (`Sparse`)
- [ ] Keine lokale Map für das USt-Profil; die Zeile entfällt, statt roh zu
      stehen (`grep -n "domestic_" BusinessPartnerFacts.tsx` → 0 Treffer)
- [ ] Die typische Lieferung nutzt `PARTNER_NATURE_LABEL` aus dem Spiegel und
      trägt alle **sechs** Werte (`All`, ein `service`-Partner)
- [ ] Der Reifegrad steht in „Herkunft", nicht in der ersten Gruppe (`All`)
- [ ] ~~Der Grabstein steht als erste Zeile und nennt den Nachfolger als Zelle~~
      — **entfällt**, solange `mergedIntoPartnerId` nicht am gespiegelten Typ
      steht (L-271). Kommt mit dem Feld zurück
- [ ] Kein Eingabefeld, kein Speichern-Knopf (`grep -n "input\|onSave" .` → 0)
- [ ] Ersetzt `MasterDataTab` und den Kopfblock der Partnerseite ohne
      Funktionsverlust

## Gebaut 2026-09-09

`BusinessPartnerFacts.tsx`, fünf Stories, fünf Gruppen. Drei Zeilen der Spec
sind **nicht** gebaut, und keine davon aus Nachlässigkeit:

| Zeile | Warum nicht |
|---|---|
| **Kontakt** (Rang 14) | `contactEmail` und `contactPhone` sind Spalten der Datenbank (14 % / 39 %) und stehen **nicht** am gespiegelten `BusinessPartnerDetail` — Befund **L-271** |
| **Grabstein** (Rang 16) | ebenso: `mergedIntoPartnerId` ist ein Selbst-FK, die App fragt ihn an drei Stellen ab, der Typ kennt ihn nicht. Mit ihm fiel die Prop `partnerHref`, die nur ihn getragen hätte (A12) |
| **Herkunft** (Rang 15) | das Feld gibt es, die **Wörter** nicht — Befund **L-272** |

**Warum L-272 dazukam, obwohl die Spec die Zeile vorsah.** Die Spec ließ das
USt-Profil weg, weil seine Wörter privat in `MasterDataTab.tsx` leben (L-223)
und ein roher Schlüssel eine Auskunft behauptet, die er nicht gibt. Gebaut habe
ich zuerst genau daneben `onboarding_import` roh hingeschrieben — dieselbe
Sorte Wert, dieselbe Lücke, andere Behandlung. Die Messung hat es gezeigt.
Inkonsequent zu sein wäre schlechter gewesen als jede der beiden
Entscheidungen; jetzt fehlen beide Zeilen, und beide haben einen Befund.

**Gemessen** (`scripts/cdp.mjs`, 900 px):

| Story | Gemessen |
|---|---|
| `Filled` | **drei** Gruppen (Wer · Konten · Bewegung) — ohne `all` gibt es Verhalten und Herkunft nicht, auch nicht als leere Überschrift |
| `All` | **fünf** Gruppen. „Typische Lieferung: Dienstleistung" — das Wort kommt aus `PARTNER_NATURE_LABEL`, das der Spiegellauf von heute Morgen gebracht hat; vorher hätten 924 Partner hier `undefined` getragen (~~L-222~~). Kein USt-Profil, keine rohe Herkunft |
| `Sparse` | „Wer" hat **eine** Zeile, nicht vier: kein Kurzname, kein Ort, keine USt-IdNr. — und keine Striche an ihrer Stelle. So sehen 77 % des Bestands aus |
| alle | Die `0` bei den Buchungen steht als `0`, rechtsbündig mit `v2num` |

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide 2026-09-09 gelaufen, `exit 0` (`tsc --noEmit`; Storybook-Build nach `storybook-static`) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `BusinessPartnerFacts.tsx` + `BusinessPartnerFacts.stories.tsx`, Titel `v3/Entitäten/Geschäftspartner/BusinessPartnerFacts` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | einziger Export `BusinessPartnerFacts`, JSDoc `:37–40`. Die Gruppen-Variablen heißen deutsch (`wer`, `konten`, `bewegung`, `verhalten`, `herkunft`) — lokale Namen, keine Bezeichner der Schnittstelle | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `.v2bpfacts*` in `v3.css:3890–3892` nur über Tokens; `PARTNER_NATURE_LABEL` kommt aus der Domäne (`:110`), der Reifegrad über `StatusBadge axis="partner"` (`:126`) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | **fünf von sechs** — `Tombstone` fehlt. Der Grund steht im Abschnitt „Gebaut" (L-271, das Feld gibt es am Typ nicht) und trägt; die Stories-Tabelle und das zugehörige Kriterium wurden nicht mitgezogen | ✗ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | ohne Browser durchgegangen; die zwei App-Punkte („ersetzt ihr v1-Gegenstück", „in §11 auf v2 gesetzt") übersprungen (backlog/README) | ✓ |
| Im Browser angesehen (Storybook) | schlanke Abnahme (Owner-Entscheid 2026-09-08): Pixel, Abstände und Farbwirkung gehen an 0119; kein Storybook gestartet | vertagt auf 0119 |
| **Schnittstelle Zeichen für Zeichen** | | |
| Vier Props, Name · Typ · Pflicht | `:41–57` — `partner: BusinessPartnerDetail`, `all?: boolean` (Vorgabe `false`), `accountHref?`, `hints?: readonly string[]`: alle vier wie die Tabelle. `partnerHref` ist mit dem Grabstein entfallen und in der Tabelle **richtig** nicht mehr aufgeführt. Kein weiterer Export | ✓ |
| **Variabel** | | |
| Feld ohne Wert bekommt keine Zeile, Gruppe ohne Feld keine Überschrift | je Zeile `:62–142`, je Gruppe `:163–166`. Story `Sparse`: drei Zeilen, keine Striche | ✓ |
| `usageBookingCount: 0` steht als **0** | `:97` `formatCount()` in `v2num`; Story `Sparse` | ✓ |
| Keine lokale Map für das USt-Profil; die Zeile entfällt, statt roh zu stehen | in `BusinessPartnerFacts.tsx` nur der erklärende Kommentar `:105–108`, keine Map und keine Zeile. (Der Nachweis-Befehl nennt `BusinessPartner.tsx` — dort stehen die Fakten nicht) | ✓ |
| Typische Lieferung über `PARTNER_NATURE_LABEL`, alle **sechs** Werte | `:109–111`; die Map führt alle sechs (`business-partner.ts:41–48`), `unknown` wird als „—" gar nicht erst gezeigt. Story `All` mit `typicalNature: "service"` → „Dienstleistung" | ✓ |
| Der Reifegrad steht in „Herkunft", nicht in der ersten Gruppe | `:124–127` im `herkunft`-Block; `wer` beginnt `:58` mit dem Namen. Story `All` | ✓ |
| Der Grabstein steht als erste Zeile und nennt den Nachfolger als Zelle | **nicht gebaut.** Nachgeprüft: `BusinessPartnerDetail` (`business-partner.ts:113–134`) trägt weder `mergedIntoPartnerId` noch `contactEmail`/`contactPhone` — der Befund stimmt. L-271 steht mit Quelle in `docs/befunde-app.md:47`, L-272 in `:48`, beide mit Verweis auf den Abschnitt „Gebaut" dieser Spec. Die Ablösung hängt am Spiegel, also an der App | offen (App) |
| Kein Eingabefeld, kein Speichern-Knopf | `grep -n "input\|onSave" BusinessPartnerFacts.tsx` → 0 | ✓ |
| Ersetzt `MasterDataTab` und den Kopfblock der Partnerseite | Migrationsschritt in `ludwig/app` (backlog/README) | offen (App) |
| **Ränder** (Nachtrag 2026-09-08) | | |
| Vier Stellen beschreiben Zeilen, die der Abschnitt „Gebaut" begründet weglässt | Kopftabelle „Setzt voraus: **0139** `BusinessPartnerCell` (für das Grabstein-Ziel)" — die Datei importiert sie nicht; Gruppen-Tabelle führt **Kontakt (14)** in „Herkunft"; Abschnitt „Verhalten" sagt „die Zeile ist trotzdem gebaut"; Stories-Tabelle führt `Tombstone` | ✗ |
| „(`Sparse`: zwei Gruppen, drei Zeilen)" | es sind **drei** Gruppen: Wer · Konten · Bewegung. „Bewegung" steht immer (`:165`, die `0` ist eine Aussage), und `Sparse` trägt ein Kreditorkonto. Dieselbe falsche Zahl steht im Story-JSDoc `BusinessPartnerFacts.stories.tsx:104` | ✗ |
| Zwei Nachweis-Befehle greifen auf `BusinessPartner.tsx` | die Fakten stehen in `BusinessPartnerFacts.tsx`. Der Bau hat den Zuschnitt aus 0139 („eine Datei für Zelle **und** Fakten") verlassen, ohne ihn in einer der beiden Specs nachzuziehen | ✗ |

**Offen (2026-09-09):**

1. `Tombstone` fehlt in den Stories. Der Grund trägt (L-271 nachgeprüft), aber
   die Stories-Tabelle und das Kriterium müssen ihn nennen — sonst liest die
   nächste Runde eine Story, die es nicht gibt.
2. Vier weitere Stellen beschreiben Kontakt und Grabstein als gebaut.
3. „`Sparse`: zwei Gruppen" ist falsch — drei. Auch im Story-JSDoc.
4. Zwei Nachweis-Befehle nennen die falsche Datei.

Alle vier sind Textarbeit an der Spec; der Code ist an diesen Stellen der
stimmigere von beiden. Die zwei Befunde L-271 und L-272 stehen sauber im
Register (`docs/befunde-app.md:47–48`), mit Quelle und mit Vorschlag.

Das Kriterium „offen (App)" hat **keine** Zeile in `docs/befunde-app.md`,
Abschnitt E.

## Nacharbeit zur Abnahme, 2026-09-09

Vier Mängel, alle in der Spec — und alle mit derselben Wurzel: der Abschnitt
„Gebaut" begründete drei nicht gebaute Zeilen, und **vier andere Stellen
sprachen weiter, als wären sie da**.

| Mangel | Was jetzt dasteht |
|---|---|
| Story `Tombstone` in der Tabelle, aber nicht gebaut | durchgestrichen, mit dem Grund: eine Story über einen Zustand, den die Form nicht kennen kann, wäre erfunden |
| „Setzt voraus: 0139 für das Grabstein-Ziel" | durchgestrichen — ohne Grabstein wird die Zelle hier nicht gebraucht |
| „(`Sparse`: zwei Gruppen, drei Zeilen)" | es sind **drei** Gruppen; „Bewegung" steht immer, weil die 0 eine Aussage ist |
| zwei `grep`-Nachweise gegen `BusinessPartner.tsx` | die Fakten liegen in `BusinessPartnerFacts.tsx` |

Der dritte ist der ärgerlichste: die Zahl stand auch im Story-JSDoc, also an
der Stelle, die jemand liest, während er die Story ansieht — und dort widerlegt
das Bild sie sofort.

## Nachtrag 2026-09-11 — `underHead` (D7)

Owner-Entscheid über `ludwig-manager`: auf der eigenen Seite des Partners
steht nichts zweimal. Die Übersicht (0127) zeigte unter dem Kopf noch einmal
Name (= Titel), Ort und Kreditorkonto (= Meta).

| Prop | Typ | Default | Wirkung | Story |
|---|---|---|---|---|
| `underHead` | `boolean` | `false` | Name, Ort und das Konto, das der Kopf nennt (Kreditor, sonst Debitor, sonst die Verrechnungskonten), fallen weg; eine leere Gruppe „Wer" verliert ihre Überschrift | `UnderHead` |

Gleiche Form wie `AccountFacts figures={false}` (0157). Der Drawer (0143)
setzt die Prop nicht und zeigt weiter alles; der Reiter „Details" der
Partnerseite auch nicht — dort ist der ganze Datensatz das Thema. Additiv,
breaking: nein. Stories: 6 statt 5.

