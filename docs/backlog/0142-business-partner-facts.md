# 0142 · `BusinessPartnerFacts` — was über einen Geschäftspartner bekannt ist

| | |
|---|---|
| Status | spec — geschrieben 2026-09-09 |
| Stufe | `entities/business-partner/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: USt-Profil, Personenkonto, Reifegrad, DATEV-Herkunft |
| Quelle | Entitätsprofil `docs/entitaeten/business-partner.md` (`geprüft`, 2026-09-09), Abschnitt „Formen", Zeile `BusinessPartnerFacts` |
| Ersetzt | `MasterDataTab` (21 Felder in fünf Boxen) und den Kopfblock der Partnerseite |
| Setzt voraus | **0139** `BusinessPartnerCell` (für das Grabstein-Ziel) · `FieldList` (0006) · `StatusBadge axis="partner"` · `Time`, `MonoCell` |
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
| `partnerHref` | `(partnerId: string) => string` | nein | Nur für das **Grabstein-Ziel**: ein zusammengeführter Partner nennt seinen Nachfolger als `BusinessPartnerCell` | `Tombstone` |
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
| `Tombstone` | Zusammengeführter Partner: die Zeile steht oben, der Nachfolger als Zelle mit Weg |
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
      Überschrift (`Sparse`: zwei Gruppen, drei Zeilen)
- [ ] `usageBookingCount: 0` steht als **0**, nicht als Strich (`Sparse`)
- [ ] Keine lokale Map für das USt-Profil; die Zeile entfällt, statt roh zu
      stehen (`grep -n "domestic_" BusinessPartner.tsx` → 0 Treffer)
- [ ] Die typische Lieferung nutzt `PARTNER_NATURE_LABEL` aus dem Spiegel und
      trägt alle **sechs** Werte (`All`, ein `service`-Partner)
- [ ] Der Reifegrad steht in „Herkunft", nicht in der ersten Gruppe (`All`)
- [ ] Der Grabstein steht als erste Zeile und nennt den Nachfolger als Zelle
      (`Tombstone`)
- [ ] Kein Eingabefeld, kein Speichern-Knopf (`grep -n "input\|onSave" .` → 0)
- [ ] Ersetzt `MasterDataTab` und den Kopfblock der Partnerseite ohne
      Funktionsverlust

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
