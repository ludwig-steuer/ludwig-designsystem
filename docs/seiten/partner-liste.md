# Geschäftspartner (Liste) — Seitenprofil

| | |
|---|---|
| Status | Entwurf — geschrieben als Voraussetzung von 0128 |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/partners/page.tsx` (201 Z.); Einstieg über die Mandanten-Navigation „Geschäftspartner" (`ui/components/layout/mandant-nav.ts`) |
| Heute gebaut in | der Route selbst: `DataTable` und `businessPartnerColumns()` **aus dem Set**, dazu `Tabs`, ein rohes `<form className="section__filters">` mit Inline-`<select>` (px-Werte), eine lokale `Stat`-Komponente und die Zusatzspalte `AcceptCreditorForm` |
| Entitäten | Geschäftspartner (`docs/entitaeten/business-partner.md`, geprüft 2026-09-09); am Rand das Personenkonto (Drawer) |
| Baustein in v3 | `businessPartnerColumns()` in `DataTable` (0057) — beide gebaut. **Keine** eigene Listen-Komponente, siehe „Folgerung für 0128" |
| Fachliche Quelle | Entitätsprofil §Listen; Owner-Entscheid 2026-09-08 „Reiter sind keine Filter" (R9 in `docs/web-ui-regeln.md`, Wortlaut in `sachverhalte.md`) |
| Zahlen | Staging 2026-09-10, sechs Mandanten, nur Aggregate |
| Profil von / am | Claude, 2026-09-10 · gelesen: Route, `partner-queries.ts` (`listBusinessPartners`, `getBusinessPartnerStats`, `baseConditions`), Entitätsprofil, `partner-detail.md` |

## Job

> Wenn **die Sachbearbeiterin eine Kontonummer, einen Namen oder eine
> USt-IdNr. vor sich hat und nicht weiß, wer dahintersteht**, will **sie**
> **den Stammsatz finden**, damit **sie die Buchung gegen den richtigen
> Partner stellt**.

- **Fertig ist sie, wenn** sie den Partner geöffnet hat oder seine Nummer
  kennt — auf der Partnerseite (0127) oder im Konto-Drawer.
- **Misslungen ist die Seite, wenn** zwei gleichnamige Partner untereinander
  stehen und die Zeile nicht sagt, welcher gemeint ist — beim größten Mandanten
  teilen sich **149 Zeilen einen Namen**, und die Kontonummer entscheidet es
  (`partner-detail.md`). Oder wenn die Suche nach „70123" nichts findet, weil
  sie nur Namen durchsucht.

**Warum nicht „… statt einen zweiten anzulegen"** (Wortlaut des
Entitätsprofils und von 0128): Die App hat **keinen Weg, einen Partner
anzulegen**. Stammsätze schreiben nur der Onboarding-Import und der
Workflows-Dienst (`partner-detail.md`, „Was nie gefragt wird"). Der Nutzen ist,
den richtigen zu finden, nicht einen zweiten zu verhindern.

**Umfang: 544 · 552 · 555 · 572 · 6.331 · 6.396 Partner je Mandant.** Die
Seite ist ein Suchwerkzeug; niemand liest sechstausend Zeilen.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Wo ist der, den ich suche?" | Freitext über Name, Kurzname, USt-IdNr. **und Kontonummer** — so sucht der Loader schon heute (`baseConditions`) | `FilterBar` mit Suchfeld |
| 2 | „Welcher von den gleichnamigen?" | Zeile: Name mit Kurzname, Kreditor- bzw. Debitornummer, Ort | `businessPartnerColumns()` Ränge 1–2, 6–7 |
| 3 | „Darf ich ihm trauen?" | Reifegrad in der Zeile — **99,7 %** `confirmed`, die Marke fällt nur bei den übrigen auf | `StatusBadge axis="partner"` |
| 4 | „Ist er überhaupt in Gebrauch?" | Buchungen und letzte Buchung — **77 % haben 0**; die Standardsortierung stellt die benutzten nach oben | Spalten, Sortierung `usage` ↓ |
| 5 | „Wie viele gibt es?" | Vorratszähler im Kopf der Liste, mit Filter „n von m" | `DataTable` `head.meta` / `filtered` |
| 6 | „Was liegt auf seinem Konto?" | Klick auf die Nummer → Konto-Drawer (`?account=`), die Liste bleibt stehen | `AccountDrawer` |
| 7 | „Alles über ihn" | Klick auf den Namen → Partnerseite | Zeilenlink |

Suche und die ersten Zeilen stehen ohne Scrollen. Rang 6 verlässt die Liste,
nicht die Seite; Rang 7 verlässt die Seite.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Vorgeschlagene Kreditoren annehmen: DATEV-Nummer zuweisen und bestätigen (`AcceptCreditorForm`) | **0 · 1 · 1 · 7 · 9 · 18** Vorschläge je Mandant, dazu 0–1 Entwurf (gezählt) | eine Sonderansicht mit Zähler — sie hat eine eigene Spalte mit Formular, also eine eigene Form |
| Nach Rolle eingrenzen (Kreditor · Debitor · ohne Konto) | selten — die Suche trifft meist schon | ein Filter |
| Nach Reifegrad eingrenzen | selten | ein Filter, **kein** Reiter (siehe unten) |
| Nach USt-Profil eingrenzen | der Loader kann es (`?vat=`), die Seite bietet es nicht an | nichts, bis es einen Job dafür gibt |

## Reiter: eine Liste und eine Sonderansicht

Heute vier Reiter: „Alle · Bestätigt · Vorgeschlagen · Entwurf". Nach dem
Owner-Entscheid vom 2026-09-08 (R9) sind Reiter keine Filter; Zielbild ist
**1 + n Sonderansichten**.

| Heute | Künftig | Warum, mit Zahl |
|---|---|---|
| Alle | **Geschäftspartner** — die eine Liste | der Hauptjob |
| Bestätigt | Filter Reifegrad | 99,7 % des Bestands — ein Reiter, der fast alles zeigt, ist „Alle" unter anderem Namen |
| Entwurf | Filter Reifegrad | 0–1 je Mandant, 2 im ganzen Bestand |
| Vorgeschlagen | **Sonderansicht „Vorschläge"** mit Zähler | eigene Form (Spalte „Akzeptieren" mit Formular) und eine Arbeitsliste mit Ende: 0–18 je Mandant. Ihr Leerfall ist ein **Erfolg** („Keine Vorschläge offen"), nicht ein Filterproblem |

Offene Frage 1.

## Was hier nicht hingehört

- **Anlegen, Ändern, Zusammenführen.** Kein Schreibweg in der App;
  Zusammenführen (Grabstein) hat 0 Fälle im Bestand.
- **Die Stat-Leiste in ihrer heutigen Form** — Zweifel 2.
- **„Top Kreditoren".** Gestrichen (Owner, Mandantenjahr-Seite; L-228).
- **Die Vorschlagsliste aus dem Belegbestand** (`CreditorProposalsReview`:
  Lieferanten aus Belegen, die noch kein Partner sind) — eine andere Entität
  mit eigenem Profil, nicht die Sonderansicht oben.
- **Ein Saldo je Partner.** Er steht auf dem Personenkonto, der Weg ist Rang 6.
- **Das Wirtschaftsjahr.** Partner gelten mandantweit; die Route trägt
  `[year]` nur, damit der Konto-Link ins richtige Jahr führt (R24). Kein Jahr
  in Kopf oder Filter.

## Zweifel am heutigen Format

1. **Vier Reiter, drei davon Filter.** Widerspricht R9. Folgerung: der
   Reiterschnitt oben.
2. **Die Stat-Leiste zählt, was niemand fragt — und meldet einen Mangel, wo
   keiner ist.** Sie zeigt mandantweit Kreditoren, Debitoren, „Ohne
   Personenkonto" und „Mit USt-ID". „Ohne Personenkonto" steht bei fünf von
   sechs Mandanten auf 0 oder 1, beim sechsten auf 12 — und das sind die
   **12 Abrechner, die richtigerweise kein Personenkonto haben** (GLOSSARY
   „Abrechner"). „Mit USt-ID" liegt bei 7–25 Partnern (0,1–5 %). Keine der
   vier Zahlen dient einer Frage oben. Folgerung: die Leiste fällt. Der Vorrat
   steht als Zähler im Kopf, die Rollenaufteilung liefert der Filter, der dabei
   sagt, wie viel er wegnimmt. Wer „ohne Konto" filtert, findet die Abrechner —
   erkennbar an der Verrechnungsspalte.
3. **Die Filterzeile steht außerhalb des Sets.** Ein rohes Formular mit
   Inline-`<select>` (eigene px-Werte, eigene Schrift) und dem Knopf „Filter
   anwenden". Folgerung: `FilterBar` (0003) mit `Input` und `Select`; als
   GET-Formular bleibt sie ohne Client-Code.
4. **Sortierung: Profil und App widersprechen sich.** 0128 und das
   Entitätsprofil nennen „Name aufsteigend" und führen L-15 als offen. Die App
   sortiert über `parsePageRequest(raw, PARTNER_SORT_KEYS)` und **standardmäßig
   nach Nutzung absteigend**, der Name ist zweiter Schlüssel. Folgerung: die
   App-Wahl dient Rang 4 besser — die 77 % ohne Buchung wandern nach unten.
   L-15 ist für diese Liste erledigt; 0128 wird nachgezogen.
5. **Die Liste steht schon auf dem Set.** 0128 beschreibt „ersetzt die rohe
   `<table>`" — das ist erledigt: die Route benutzt `DataTable` und
   `businessPartnerColumns()`. Auch die zwei Leerfälle stehen schon: `empty`
   („Für diesen Mandanten sind keine Geschäftspartner importiert") und
   `filtered` (was gefiltert ist, mit Zurücksetzen).
6. **Die Reiter tragen keinen Zähler.** Der Kommentar in der Route sagt, die
   Zahlen ergäben sich aus dem Kopf der Tabelle — der zeigt aber nur den
   aktiven Reiter. Folgerung: die Sonderansicht „Vorschläge" trägt ihren
   Zähler; sonst weiß niemand, ob dort etwas wartet.

## Folgerung für 0128

**Keine eigene Komponente `BusinessPartnerList`.** Die Liste ist `DataTable`
mit `businessPartnerColumns()`, und beides steht; Kopfzeile, Filter und Pager
gehören der Seite (Präzedenz Kontenplan, Sachverhalte). Was 0128 noch liefern
kann, ist die **Seite als Szenarien** unter `src/showcase/partner/`, wie 0144,
0152 und 0157:

- die Liste mit Suche nach Name und Nummer, Filter Rolle und Reifegrad, 6.396
  Zeilen paginiert;
- die Sonderansicht „Vorschläge" mit dem Annahme-Rundlauf;
- drei Leerfälle: Bestand leer · Filter ohne Treffer · „Keine Vorschläge
  offen" (Erfolg);
- Laden und Fehler;
- der Konto-Drawer aus der Nummer.

Zuschnitt und Story-Liste nach Rückmeldung zu diesem Profil.

## Offene Fragen

1. **Bleibt „Vorgeschlagen" als Sonderansicht?** *Ohne Antwort: ja* — eigene
   Spalte mit Formular, absehbares Ende (R9: Reiter nur für eine eigene Ansicht).
2. **Fällt die Stat-Leiste?** *Ohne Antwort: ja* (Zweifel 2).
3. **Standardsortierung Nutzung ↓ statt Name ↑?** *Ohne Antwort: Nutzung ↓, wie
   die App sie hat* (Zweifel 4).
