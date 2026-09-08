# Jobs-to-be-done — Register

| | |
|---|---|
| Zweck | Alle Job-Sätze und Nebenjobs an **einem** Ort, je Rolle und je Entität vergleichbar und nach Häufigkeit sortierbar |
| Geerntet aus | 10 Seitenprofile (`docs/seiten/*.md`) + 8 Entitätsprofile (`docs/entitaeten/*.md`), je ohne `TEMPLATE.md` |
| Umfang | 58 Jobs — `bedient` 29 · `halb` 22 · `unbedient` 7 |
| Kennungen in Profilen | noch nicht eingetragen |
| Wächter | `pnpm check:jobs` · Selbstprüfung `pnpm check:jobs --test` |
| Angelegt von / am | Claude, 2026-09-08 · Auftrag des Owners vom selben Tag |

**Das Register ist die Liste, nicht die neue Heimat.** Der Wortlaut jedes Jobs
bleibt in seinem Seiten- oder Entitätsprofil stehen; hier steht er verkürzt,
mit der Fundstelle daneben. Wer einen Job ändern will, ändert ihn im Profil und
zieht die Zeile hier nach — nie umgekehrt.

## Wie die Zeilen zu lesen sind

- **Kennung `J-nn`** ist stabil. Eine Nummer wird nie wiederverwendet; ein Job,
  der wegfällt, bekommt den Zustand, nicht das Löschen.
- **Rolle · Situation · Ziel · Nutzen** kommen aus dem Job-Satz. Die
  **Nebenjobs** der Seitenprofile stehen dort *nicht* in dieser Form — sie
  haben nur Namen, Häufigkeit und Budget. Für sie gilt: die Rolle ist die der
  Seite (markiert mit „Seitenrolle"), die Situation steht in der Spalte „Wie
  oft" des Profils, und der Nutzen ist `nicht genannt`, wo das Profil ihn
  nicht nennt. **Nichts davon ist ergänzt.**
- **Häufigkeit** ist das Wort des Profils oder `unbekannt`. Geschätzt wird
  hier nichts: eine erfundene Häufigkeit wäre schlimmer als eine fehlende,
  weil nach ihr sortiert werden soll. Gemessene Umfänge (p50/p90, Füllgrade)
  stehen in der Quellspalte — sie sagen, wie **groß** ein Durchgang ist, nicht
  wie **oft** er vorkommt.
- **Bedient von** nennt den Ort und den Rang dort. Ein Job ohne Ort trägt
  `—` und dahinter den Grund; das ist zugleich die Bedingung für den Zustand
  `unbedient` (der Wächter prüft beides gegeneinander).
- **Zustand**: `bedient` = das Profil nennt einen Ort ohne Mangel · `halb` =
  es nennt einen Ort **und** einen Mangel daran (Zweifel, Befund, „fehlt",
  „wirkt nicht", „schneidet ab", „kein Seitenprofil") · `unbedient` = es nennt
  keinen Ort, oder der Ort ist weg.
- **Doppelt genannte Jobs bekommen eine Kennung, nicht zwei.** Zwölf Jobs
  (J-02, J-04, J-05, J-06, J-09, J-10, J-13, J-16, J-17, J-32, J-40, J-41)
  stehen in einem Seiten- **und** einem Entitätsprofil, teils wörtlich gleich,
  teils in zwei Formulierungen. Sie stehen hier einmal, mit beiden
  Fundstellen — sonst zählt die Sortierung nach Häufigkeit denselben Job
  zweimal.

## Register

| Kennung | Rolle | Situation | Ziel | Nutzen | Häufigkeit | Quelle der Häufigkeit | Entität(en) | Bedient von | Zustand |
|---|---|---|---|---|---|---|---|---|---|
| J-01 | Sachbearbeiterin (Kanzlei) | ein Beleg fällt auf — in einer Liste, an einem Sachverhalt oder weil die Pipeline ihn liegen ließ | sehen, was auf dem Papier steht und was Ludwig daraus gemacht hat | den einen falschen Wert richtigstellen — oder den Beleg abhaken | einmal pro Zweifel | `seiten/beleg-detail.md` §Job („selten hundertmal hintereinander, sondern einmal pro Zweifel") | source-document | Beleg-Detailseite, Rang 1–9; im Set noch keiner (0071 `SourceDocumentView`) | bedient |
| J-02 | Kanzlei | ein Buchungsmonat soll abgeschlossen werden | alle Belege der Periode nach Eingangsdatum durchgehen | kein unerledigter Beleg bleibt im Jahr zurück | unbekannt | Umfang p50 66 · p90 102 Belege je Mandantenjahr — `entitaeten/source-document.md` §Listen | source-document | Belegliste, Rang 1–8; Spaltensatz `DOCUMENT_LIST_COLUMNS` (0070) | bedient |
| J-03 | Kanzlei | gegen DATEV soll gebucht werden und der Spiegel ist Tage alt | wissen, wie alt der Stand ist, ihn neu holen und sehen, was DATEV enthält, das Ludwig nicht kennt | auf einem Stand arbeiten, der wirklich gilt | unbekannt | Bestand: Spiegel-Stand 7 · 9 · 18 · 27 Tage alt je Mandant, 23 Läufe / 7 gescheitert — `seiten/datev-spiegel.md` §Der Bestand | DATEV-Spiegelbuchung, Buchungsstapel, Abgleich-Lauf (kein Entitätsprofil) | DATEV-Spiegel, Rang 1–3 — aber auf zwei Reiter verteilt („Übersicht" trägt die Zahlen, „Abgleich" den Knopf), Zweifel 9 | halb |
| J-04 | Kanzlei | der Kontenrahmen eines Mandantenjahres wird geprüft | die Konten finden, die nicht stimmen — angelegt und nie bebucht, gebucht und nicht angelegt, falsch eingeordnet | die Buchungen des Jahres laufen auf Konten, die es geben soll | unbekannt | Umfang 41.570 Konten je Mandant+Jahr, 85 % ohne Buchung — `seiten/kontenplan.md` §Job | account | Kontenplan, Rang 1–7; im Set noch keiner (0062 `AccountRow` + `AccountList`). Der Filter `usedOnly` filtert über `status='active'` statt über die Buchungszahl (L-90) | halb |
| J-05 | Sachbearbeiterin (Kanzlei) | eine Buchung auf einem Konto ist zweifelhaft | sehen, was sonst auf diesem Konto liegt und ob Ludwig und DATEV dasselbe sagen | das Konto bestätigen oder verwerfen | unbekannt | Umfang p50 4 · p90 20, p99 250, max 3.400 Bewegungen — `entitaeten/account.md` §Listen | account | Konto-Detailseite, Rang 1–7; `LedgerAccountView` (0063, gebaut). Die App zeigt heute zwei getrennte Auszüge statt einer Liste mit Herkunft-Spalte, Zweifel 1 | halb |
| J-06 | Sachbearbeiterin (Kanzlei) | ein Kontoauszug ist importiert | sehen, welche Zahlungen noch keinem Vorgang gehören | kein Geldfluss rutscht ungebucht durch | unbekannt | Umfang p50 36 · p90 251 · max 952 je Konto+Jahr, 65 % ohne Vorgang — `entitaeten/bank-transaction.md` §Listen | bank-transaction | Kontoauszug, Rang 1–6; Spaltensatz 0101, Liste 0085 offen. Kein Saldo (L-58), Zweck ohne Chips (L-59), Datum ohne Jahr | halb |
| J-07 | Kanzlei | eine Zahlung geht ein oder eine Mahnung steht an | wissen, welche Rechnungen zu einem Stichtag offen waren | den Posten finden, zu dem die Zahlung gehört — und keinen mahnen, der längst bezahlt hat | unbekannt | Bestand 53.975 offene Posten — `seiten/datev-spiegel.md` §Der Bestand | open-item (kein Entitätsprofil, `seiten/opos.md` Kopf) | Offene Posten, Rang 1–6; `OpenItemRow` (0029, abgenommen) | bedient |
| J-08 | Sachbearbeiterin (Kanzlei) | ein Sachverhalt liegt in ihrem Vorrat | ihn zur Buchung bringen — oder begründet weglegen | der Vorgang verlässt die Kette Beleg → Ereignis → Sachverhalt → Buchung und muss nicht zweimal angefasst werden | 117-mal hintereinander je Vorrat | `seiten/sachverhalt-detail.md` §Job („`1/117` im Kopf sagt, dass diese Seite 117-mal hintereinander bedient wird") | accounting-case | Sachverhalt-Detailseite, Rang 1–9; im Set noch keiner (0050) | bedient |
| J-09 | Sachbearbeiterin (Kanzlei) | der Vorrat eines Wirtschaftsjahres ist offen | den nächsten Fall finden, den sie selbst zur Buchung bringen kann | sie öffnet nicht 117 Fälle einzeln, um zu sehen, wer am Zug ist | unbekannt | Umfang p50 86 · p90 190 · max 259 offene Fälle je Mandant+Jahr — `entitaeten/accounting-case.md` §Listen | accounting-case | Sachverhaltsliste, Rang 1–6; `CaseList` (0082), `caseColumns()` (0096). Der Zuständigkeits-Filter steht da und wirkt nicht; Sortierung nur nach „Eröffnet" (L-15) | halb |
| J-10 | Sachbearbeiterin (Kanzlei) | ein Mandant hat Papier geschickt | es in Ludwig haben und wissen, dass es angekommen und richtig erkannt ist | die Verarbeitung läuft ohne ihr Zutun weiter, nichts wird zweimal angefasst | unbekannt | Umfang p50 64 · p90 102 — `entitaeten/source-document.md` §Listen; Grenzen 25 MB/Datei, 10 Dateien/Anfrage — `seiten/upload-inbox.md` §Vorbedingungen | source-document | `document-inbox` (Upload & Inbox) — am 2026-09-05 gelöscht, am 2026-09-08 nach `docs/seiten/upload-inbox.md` neu gebaut und in Betrieb | bedient |
| J-11 | Sachbearbeiterin (Seitenrolle) | bei Reihenarbeit | zum nächsten Beleg derselben Liste springen | nicht genannt | bei Reihenarbeit ständig, sonst nie — geschätzt | `seiten/beleg-detail.md` §Nebenjobs | source-document | Beleg-Detailseite, Nebenjob; `InvoiceListNav` (`1/117`), Budget: eine Taste (`J`/`K`) | bedient |
| J-12 | Sachbearbeiterin (Seitenrolle) | nach jedem Beleg | zurück zu der Liste, aus der sie kam | nicht genannt | jedes Mal | `seiten/beleg-detail.md` §Nebenjobs | source-document | Beleg-Detailseite, Nebenjob; `RecordPager back`, der die Liste nennt | bedient |
| J-13 | Sachbearbeiterin (Kanzlei) | sie prüft einen Kontovorschlag | sehen, welche Positionen der Beleg hat und wie Ludwig jede eingeordnet hat | die eine Zeile finden, die falsch liegt | nur bei Rechnungen, geschätzt jede fünfte | `seiten/beleg-detail.md` §Nebenjobs; Umfang p50 1 · p90 5, max 22 — `entitaeten/invoice-line.md` §Listen | invoice-line | Beleg-Detailseite, Reiter `positionen` (`PositionenTab`) | bedient |
| J-14 | Sachbearbeiterin (Seitenrolle) | nur bei Rechnungen mit Vorsteuer-Fakten | die Vorsteuer prüfen | nicht genannt | nur bei Rechnungen mit VSt-Fakten | `seiten/beleg-detail.md` §Nebenjobs | source-document | Beleg-Detailseite, Reiter `vorsteuer` | bedient |
| J-15 | Sachbearbeiterin (Seitenrolle) | im Fehlerfall | einen Beleg neu verarbeiten, zurücksetzen oder DATEV-Meta importieren | nicht genannt | selten, im Fehlerfall | `seiten/beleg-detail.md` §Nebenjobs | source-document | Beleg-Detailseite, `DocActionsMenu` — nie ein Knopf in der ersten Reihe | bedient |
| J-16 | Kanzlei | die Pipeline lässt etwas liegen | sehen, was gerade in Verarbeitung ist | keiner verschwindet still | täglich, kurz | `seiten/belegliste.md` §Nebenjobs | source-document | Belegliste, Reiter „In Verarbeitung"; `STUCK_COLUMNS` mit `stuckVariant` (0070) | bedient |
| J-17 | Kanzlei | die Pipeline lässt etwas liegen | sehen, welche Belege nicht weiterkommen | keiner verschwindet still | wöchentlich | `seiten/belegliste.md` §Nebenjobs; Umfang p50 6 · p90 10 — `entitaeten/source-document.md` §Listen | source-document | Belegliste, Reiter „Problematisch" — jahresunabhängig, das ist sein Existenzgrund | bedient |
| J-18 | Kanzlei (Seitenrolle) | im Buchungslauf | die Belege mit offener Rückfrage herausgreifen | nicht genannt | im Buchungslauf | `seiten/belegliste.md` §Nebenjobs | source-document, clarification | Belegliste, Reiter „Klärungsfragen" | bedient |
| J-19 | Kanzlei (Seitenrolle) | ein Beleg hängt | einen hängenden Beleg neu anstoßen | nicht genannt | selten | `seiten/belegliste.md` §Nebenjobs | source-document | Belegliste, Knopf **in der Zeile** — keine Massenaktion | bedient |
| J-20 | Kanzlei (Seitenrolle) | beim Prüfen einer Festschreibung | in einem Stapel nachsehen, was drin ist | nicht genannt | beim Prüfen einer Festschreibung | `seiten/datev-spiegel.md` §Nebenjobs; Bestand 563 Stapel, 480 festgeschrieben, p50 146 Sätze | Buchungsstapel (kein Entitätsprofil) | DATEV-Spiegel, `StapelTab` + Drawer | bedient |
| J-21 | Kanzlei (Seitenrolle) | selten, und die Stammdaten stehen woanders vollständig | ein Personenkonto nachschlagen (Kreditor/Debitor) | nicht genannt | selten | `seiten/datev-spiegel.md` §Nebenjobs; Bestand 12.920 Debitoren · 1.983 Kreditoren, größter Mandant 6.228 | business-partner, account | DATEV-Spiegel, `PartnerTab` — schneidet bei `PARTNER_LIMIT = 1000` still ab und zeigt trotzdem `rows.length`; Zweifel 3 will den Reiter streichen | halb |
| J-22 | Kanzlei (Seitenrolle) | bei der Einrichtung | die Wirtschaftsjahre sehen, die DATEV führt | nicht genannt | bei der Einrichtung, danach nie | `seiten/datev-spiegel.md` §Nebenjobs | Wirtschaftsjahr (kein Entitätsprofil) | DATEV-Spiegel, `WirtschaftsjahreTab` | bedient |
| J-23 | Kanzlei (Seitenrolle) | beim Debuggen | die Rohdaten einer Zeile lesen | nicht genannt | beim Debuggen, nicht im Alltag | `seiten/datev-spiegel.md` §Nebenjobs | DATEV-Spiegelbuchung (kein Entitätsprofil) | DATEV-Spiegel, `RawRowDrawer` — Budget: ein Icon in der Zeile | bedient |
| J-24 | Kanzlei (Seitenrolle) | bei der Jahresprüfung | den Kontenplan nach Klasse gruppiert lesen statt flach | nicht genannt | geschätzt bei der Jahresprüfung, sonst nie | `seiten/kontenplan.md` §Nebenjobs | account | Kontenplan, `AccountsGroupedTable` (`view=grouped`) — **ohne Pager**, bei 41.570 Zeilen; Zweifel 2 | halb |
| J-25 | Kanzlei (Seitenrolle) | selten | die Seitengröße der Kontenliste ändern | nicht genannt | selten | `seiten/kontenplan.md` §Nebenjobs | account | Kontenplan, Pager (heute 50); Budget: ein Feld im Pager | bedient |
| J-26 | Kanzlei (Seitenrolle) | bei der Einrichtung eines Mandanten | den SKR-Katalog dazunehmen | nicht genannt | bei der Einrichtung eines Mandanten | `seiten/kontenplan.md` §Nebenjobs | account | Kontenplan, `scope=all` (Rang 6) — der Schalter muss sagen, was er dazunimmt | bedient |
| J-27 | Sachbearbeiterin (Seitenrolle) | der Grund, warum jemand auf der Kontoseite ist | eine einzelne Buchung aufschlagen | nicht genannt | oft | `seiten/konto-detail.md` §Nebenjobs | account | Konto-Detailseite, `DatevEntryDrawer` **und** `LudwigEntryDrawer` — zwei Drawer für eine Zeileneigenschaft; das Profil verlangt einen Klick und **einen** URL-Parameter | halb |
| J-28 | Sachbearbeiterin (Seitenrolle) | zur Abschlussprüfung | Monat für Monat vergleichen | nicht genannt | zur Abschlussprüfung, geschätzt einmal je Jahr | `seiten/konto-detail.md` §Nebenjobs | account | Konto-Detailseite, Reiter „Monate" | bedient |
| J-29 | Sachbearbeiterin (Seitenrolle) | bei Zweifeln an der Einordnung | das LLM-Profil des Kontos prüfen | nicht genannt | selten, bei Zweifeln an der Einordnung | `seiten/konto-detail.md` §Nebenjobs | account | Konto-Detailseite, Reiter „LLM-Profil" (Rang 7) | bedient |
| J-30 | Sachbearbeiterin (Seitenrolle) | im Auszug | eine Zahlung nachschlagen, ohne die Liste zu verlassen | nicht genannt | oft | `seiten/kontoauszug.md` §Nebenjobs | bank-transaction | Kontoauszug, `BankTransactionDrawer` (0103) | bedient |
| J-31 | Sachbearbeiterin (Seitenrolle) | bei aufgeteilten Zeilen | sehen, woraus eine Zeile aufgeteilt ist | nicht genannt | bei 4 % der Zeilen (Z3) | `seiten/kontoauszug.md` §Nebenjobs | bank-transaction | Kontoauszug, Aufklapper je Zeile (`DataTable` 0057) | bedient |
| J-32 | wer das Konto einrichtet | ein Import ist gelaufen | sehen, was tatsächlich angekommen ist, und Liegengebliebenes gleich zuordnen | den Import beurteilen, ohne ins Buchungsjahr zu wechseln | nach jedem Lauf | `seiten/kontoauszug.md` §Nebenjobs | bank-transaction | Route `configuration/bankkonten/[accountId]/transactions` — schneidet hart bei `limit 500` ab, ohne es anzuzeigen; kein Seitenprofil, im Profil bis 2026-09-08 nicht verzeichnet | halb |
| J-33 | Kanzlei (Seitenrolle) | Experiment-Mandant | zum Replay-Cutoff springen | nicht genannt | selten, aber dann sofort | `seiten/opos.md` §Nebenjobs | open-item (kein Entitätsprofil) | Offene Posten, Knopf neben dem Stichtag | bedient |
| J-34 | Kanzlei (Seitenrolle) | beim Nachfassen | ein Personenkonto öffnen | nicht genannt | beim Nachfassen | `seiten/opos.md` §Nebenjobs | open-item, account | `OpenItemRow onOpen` (0029) steht; die Seite zeigt das Personenkonto als Text und führt nirgendwohin, Zweifel 3 | halb |
| J-35 | Kanzlei (Seitenrolle) | im Mahnlauf | die offenen Posten nach Alter gruppieren (Mahnstufen) | nicht genannt | im Mahnlauf | `seiten/opos.md` §Nebenjobs | open-item | OPOS-Seite, `groupByAge` an der Regel (App `3a8411c5`); der Baustein `OpenItemAgeGroup` stand seit 0029 bereit | bedient |
| J-36 | Sachbearbeiterin (Seitenrolle) | selten | einen Beleg nachträglich an den Fall anhängen | nicht genannt | selten (geschätzt) | `seiten/sachverhalt-detail.md` §Nebenjobs | accounting-case, source-document | Sachverhalt-Detailseite, Knopf im Kopf | bedient |
| J-37 | Sachbearbeiterin (Seitenrolle) | begründungspflichtig | den Belegnummern-Modus umstufen (S3) | nicht genannt | selten, begründungspflichtig | `seiten/sachverhalt-detail.md` §Nebenjobs | accounting-case | Sachverhalt-Detailseite, ein Klick + Dialog mit Grund | bedient |
| J-38 | Sachbearbeiterin (Seitenrolle) | selten | eine Zusammenfassung zum Fall schreiben | nicht genannt | selten | `seiten/sachverhalt-detail.md` §Nebenjobs | accounting-case | Sachverhalt-Detailseite — die Zusammenfassung belegt heute eine Zeile, um mitzuteilen, dass sie leer ist (Zweifel 5); Budget ist ein Bleistift im Ruhezustand | halb |
| J-39 | Sachbearbeiterin (Seitenrolle) | mittel häufig | einen Fall an die Kanzlei zurückgeben | nicht genannt | mittel | `seiten/sachverhalt-detail.md` §Nebenjobs | accounting-case | Sachverhalt-Detailseite, Eintrag im Überlaufmenü | bedient |
| J-40 | Sachbearbeiterin (Kanzlei) | ein Geschäftspartner ist offen | alle Vorgänge mit ihm über die Jahre hinweg sehen | beurteilen, ob ein neuer Fall zu einem alten gehört | selten | `seiten/sachverhalte.md` §Nebenjobs (zweimal: „über den Geschäftspartner suchen", „über Jahre hinweg sehen"); Deckel 50 — `entitaeten/accounting-case.md` §Listen | accounting-case, business-partner | Reiter „Sachverhalte" der Geschäftspartner-Seite (`CasesTab.tsx`) — Deckel 50 ohne `Pagination`, kein Seitenprofil `partner`, im Set Backlog | halb |
| J-41 | Buchhalterin | ein Buchungslauf ist durch | die Vorschläge in der Reihenfolge abnehmen, in der sie Aufmerksamkeit brauchen | nicht 34 Sätze gleichrangig durchklicken | am Ende eines Buchungslaufs | `seiten/sachverhalte.md` §Nebenjobs; `entitaeten/accounting-case.md` §Listen („nicht gemessen — hängt am Lauf, nicht am Bestand") | accounting-case | `CloseCasesPanel.tsx` (941 Z.) in der App; seit dem Owner-Entscheid 2026-09-08 kein Reiter der Sachverhaltsliste mehr, im Set Backlog an `CaseCard` (0081) | halb |
| J-42 | Sachbearbeiterin (Seitenrolle) | bei jedem größeren Stapel | eine Dublette erkennen und verwerfen | nicht genannt | bei jedem größeren Stapel (geschätzt) | `seiten/upload-inbox.md` §Nebenjobs | source-document | Upload & Inbox, Nebenjob — die Seite ist seit 2026-09-08 wieder da | halb |
| J-43 | Sachbearbeiterin (Seitenrolle) | ein Sammel-PDF liegt im Eingang | ein Sammel-PDF in Einzelbelege trennen | nicht genannt | selten, aber teuer wenn übersehen | `seiten/upload-inbox.md` §Nebenjobs | source-document | Upload & Inbox, Nebenjob — die Seite ist seit 2026-09-08 wieder da | halb |
| J-44 | Sachbearbeiterin (Seitenrolle) | ein Beleg gehört nicht hierher | einen Beleg löschen, der nicht hierher gehört | nicht genannt | selten | `seiten/upload-inbox.md` §Nebenjobs | source-document | Upload & Inbox, Nebenjob — die Seite ist seit 2026-09-08 wieder da | halb |
| J-45 | Mandant | der Mandant wurde gefragt | seine offenen Fragen und Belegwünsche an einem Ort beantworten | die Kanzlei kann weiterarbeiten | unbekannt | 0 Fälle im Bestand — kein Sachverhalt in Staging steht auf `disposition='client'`; `entitaeten/accounting-case.md` §Listen | accounting-case, clarification | `PortalCaseList.tsx` im Mandantenportal — kein Seitenprofil unter `docs/seiten/`, durch die Komponente belegt, nicht durch Daten | halb |
| J-46 | Sachbearbeiterin (Kanzlei) | Zahlungen ohne Vorgang liegen | sie in einem Zug einem neuen oder bestehenden Sachverhalt zuordnen | sie geht nicht Konto für Konto durch | unbekannt | 65 % aller Positionen haben kein Ereignis — `entitaeten/bank-transaction.md` §Listen | bank-transaction, accounting-case | `BankTransactionAssignmentTable` im Reiter „Offene Zahlungen" der Sachverhaltsseite — eine fremde Entität in dieser Reiterleiste, sie gehört zur Bank-Seite; kein Seitenprofil, im Set 0086 | halb |
| J-47 | Sachbearbeiterin (Kanzlei) | sie hat eine Kontonummer oder einen Namen vor sich und weiß nicht, wer dahintersteht | alle Geschäftspartner des Mandanten durchsuchen | den vorhandenen Stammsatz finden, statt einen zweiten anzulegen | unbekannt | Umfang 553 · 6.335 Partner je Mandant — `entitaeten/business-partner.md` §Listen | business-partner | Route `/clients/:slug/:year/partners` — sortiert heute nicht (L-15), kein Seitenprofil unter `docs/seiten/` | halb |
| J-48 | Kanzlei | die Kanzlei überblickt den Monat | die Kreditoren mit dem größten Volumen sehen | wissen, wo eine Abweichung teuer wäre | unbekannt | 5 Zeilen — `entitaeten/business-partner.md` §Listen | business-partner | Kachel „Top Kreditoren" in `[year]/page.tsx` — gehört ins Seitenprofil des Dashboards, das es nicht gibt; im Set Backlog | halb |
| J-49 | Sachbearbeiterin (Kanzlei) | ein Sachverhalt liegt vor ihr | sehen, was ihn aufhält, und es an Ort und Stelle beantworten | der Fall läuft weiter | unbekannt | Umfang p50 0 · p90 1, max 6 — `entitaeten/clarification.md` §Listen | clarification, accounting-case | `ClarificationsBanner` am Fall; Sachverhalt-Detailseite Rang 6 | bedient |
| J-50 | Sachbearbeiterin (Kanzlei) | sie nimmt einen Buchungsstapel ab | alle Rückfragen des Stapels an einem Stück abarbeiten | statt in dreißig Sachverhalte zu springen | unbekannt | Umfang p50 6 · p90 28, max 33 — `entitaeten/clarification.md` §Listen | clarification | `Schritt2Liste` der Stapelabnahme — kein Seitenprofil unter `docs/seiten/` | halb |
| J-51 | Mandant | der Mandant kommt ins Portal | sehen, was seine Kanzlei von ihm braucht, und es beantworten | ohne verstehen zu müssen, warum gefragt wird | unbekannt | 9 Zeilen gesamt — `entitaeten/clarification.md` §Listen | clarification | `PortalCaseList` — kein Seitenprofil unter `docs/seiten/` | halb |
| J-52 | wer einen Buchungslauf nachvollzieht | jemand vollzieht einen Buchungslauf nach | sehen, was der Lauf gefragt hat, ohne antworten zu können | nicht genannt | unbekannt | Umfang p50 6 · p90 22, max 26 — `entitaeten/clarification.md` §Listen | clarification | `agent-runs/[runId]` — kein Seitenprofil unter `docs/seiten/` | halb |
| J-53 | Buchhalterin | ein Buchungszyklus steht zur Abnahme | sehen, welche erwartete Dauerzahlung im Zeitraum nicht kam | nachfragen, statt den Stapel blind freizugeben | unbekannt | im Bestand nicht messbar (hängt am Stapelzeitraum), Obergrenze 29 aktive Regeln — `entitaeten/recurring-rule.md` §Listen | recurring-rule | `Schritt5.tsx` Z. 74–110 (`OverdueRecurringItem`) — die Liste wird bei 0 Treffern ganz ausgeblendet und verschweigt so den Erfolg; die Ränge 2 und 3 fehlen | halb |
| J-54 | Sachbearbeiterin (Kanzlei) | ein Mandant ist übernommen | alle Dauerbuchungs-Regeln nebeneinander sehen | erkennen, welche stillsteht, welche kein Personenkonto hat und welche doppelt greift | unbekannt | 1 · 3 · 26 Regeln je Mandant (drei Mandanten im Bestand) — `entitaeten/recurring-rule.md` §Listen | recurring-rule | — `rule-overview-queries.ts` ist gebaut, hat aber **keine Oberfläche und keinen Ort**; Backlog 0131 | unbedient |
| J-55 | Kanzlei | ein Mandant wird onboardet | die aus der DATEV-Historie erkannten Dauerbuchungen in einem Zug übernehmen | die Dauersachverhalte samt Regel stehen, bevor die erste Zahlung kommt | unbekannt | nicht messbar (keine Persistenz) — `entitaeten/recurring-rule.md` §Listen | recurring-rule | Admin-Seite Z. 812–911 — „alle/keine" fehlt, der Leerfall sind zwei handgebaute `<div>` statt `EmptyState`; Backlog 0130 | halb |
| J-56 | Kanzlei | der Buchungszyklus läuft | die eingeordneten Rechnungen an die Verarbeitung übergeben | sie werden im Zyklus gebucht | unbekannt | „klein" — `entitaeten/source-document.md` §Listen | source-document | kein eigener Screen, aber ein Ort: die Liste lebt als Zustand in Upload & Inbox (`review/*` zurückgebaut, `SUBMIT_COLUMNS` bleibt) — berichtigt 2026-09-08 | halb |
| J-57 | Sachbearbeiterin (Kanzlei) | jemand prüft einen Sachverhalt | die Belege sehen, auf denen er beruht | die Buchung gegen das Papier halten | unbekannt | Umfang p50 0 · p90 1 · max 20 — `entitaeten/source-document.md` §Listen | source-document, accounting-case | `BelegeTab` am Sachverhalt; Sachverhalt-Detailseite Rang 5 | bedient |
| J-58 | Kanzlei | ein Sammel-PDF wurde zerlegt | sehen, was daraus entstanden ist | die Spur vom Original zum Einzelbeleg behalten | unbekannt | Umfang p50 0 · p90 0 · max 23 — `entitaeten/source-document.md` §Listen | source-document | `ChildDocsCard`; Beleg-Detailseite Rang 6 (`SourceDocumentCard parts`) | bedient |

## Fundstellen

Damit das Nachtragen der Kennungen in die Profile **mechanisch** möglich ist:
Datei, Abschnitt und der Anfang des Wortlauts, an dem die Kennung zu stehen
kommt. Ein Job mit zwei Zeilen steht in zwei Profilen — dann bekommen beide
dieselbe Kennung.

| Kennung | Datei | Abschnitt | Wortlaut-Anfang |
|---|---|---|---|
| J-01 | `docs/seiten/beleg-detail.md` | Job | „Wenn **ein Beleg auffällt — in einer Liste, an einem Sachverhalt…" |
| J-02 | `docs/seiten/belegliste.md` | Job | „Wenn **ein Buchungsmonat abgeschlossen werden soll**, will **die Kanzlei**…" |
| J-02 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Belegliste des Jahres**" — „Wenn ein Buchungsmonat abgeschlossen werden soll…" |
| J-03 | `docs/seiten/datev-spiegel.md` | Job | „Wenn **gegen DATEV gebucht werden soll und der Spiegel Tage alt ist**…" |
| J-04 | `docs/seiten/kontenplan.md` | Job | „Wenn **die Kanzlei den Kontenrahmen eines Mandantenjahres prüft**…" |
| J-04 | `docs/entitaeten/account.md` | Listen | Zeile „`AccountList` „Kontenplan"" — „Wenn die Kanzlei den Kontenrahmen prüft…" |
| J-05 | `docs/seiten/konto-detail.md` | Job | „Wenn **eine Buchung auf einem Konto zweifelhaft ist**…" |
| J-05 | `docs/entitaeten/account.md` | Listen | Zeile „`AccountEntryList` „Kontoauszug"" — „Wenn die Sachbearbeiterin mitten in einer Buchung…" |
| J-06 | `docs/seiten/kontoauszug.md` | Job | „Wenn **ein Kontoauszug importiert ist**, will **die Sachbearbeiterin der Kanzlei**…" |
| J-06 | `docs/entitaeten/bank-transaction.md` | Listen | Zeile „`BankTransactionList` — der Kontoauszug" — „Wenn **ein Kontoauszug importiert ist**…" |
| J-07 | `docs/seiten/opos.md` | Job | „Wenn **eine Zahlung eingeht oder eine Mahnung ansteht**…" |
| J-08 | `docs/seiten/sachverhalt-detail.md` | Job | „Wenn **ein Sachverhalt in ihrem Vorrat liegt**…" |
| J-09 | `docs/seiten/sachverhalte.md` | Job | „Wenn **der Vorrat eines Wirtschaftsjahres offen ist**…" |
| J-09 | `docs/entitaeten/accounting-case.md` | Listen | Zeile „`CaseList` (ein Baustein, Reiter als Prop)" — „Wenn **der Vorrat eines Wirtschaftsjahres offen ist**…" |
| J-10 | `docs/seiten/upload-inbox.md` | Job | „Wenn **ein Mandant Papier geschickt hat**…" |
| J-10 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Upload & Inbox**" — „Wenn ein Stapel PDFs hochgeladen wird…" |
| J-11 | `docs/seiten/beleg-detail.md` | Nebenjobs | Zeile „Zum nächsten Beleg derselben Liste (`InvoiceListNav`, `1/117`)" |
| J-12 | `docs/seiten/beleg-detail.md` | Nebenjobs | Zeile „Zurück zur Liste, aus der sie kam" |
| J-13 | `docs/seiten/beleg-detail.md` | Nebenjobs | Zeile „Positionen einer Rechnung prüfen" |
| J-13 | `docs/entitaeten/invoice-line.md` | Listen | Zeile „`InvoiceLineList` „Positionen des Belegs"" — „Wenn **die Sachbearbeiterin einen Kontovorschlag prüft**…" |
| J-14 | `docs/seiten/beleg-detail.md` | Nebenjobs | Zeile „Vorsteuer prüfen" |
| J-15 | `docs/seiten/beleg-detail.md` | Nebenjobs | Zeile „Neu verarbeiten, zurücksetzen, DATEV-Meta importieren" |
| J-16 | `docs/seiten/belegliste.md` | Nebenjobs | Zeile „Sehen, was in der Pipeline gerade läuft" |
| J-16 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Stockende Belege**", Ausprägung „in Verarbeitung" |
| J-17 | `docs/seiten/belegliste.md` | Nebenjobs | Zeile „Sehen, was hängengeblieben ist" |
| J-17 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Stockende Belege**", Ausprägung „problematisch" — „Wenn die Pipeline etwas liegen lässt…" |
| J-18 | `docs/seiten/belegliste.md` | Nebenjobs | Zeile „Die Belege mit offener Rückfrage herausgreifen" |
| J-19 | `docs/seiten/belegliste.md` | Nebenjobs | Zeile „Einen hängenden Beleg neu anstoßen" |
| J-20 | `docs/seiten/datev-spiegel.md` | Nebenjobs | Zeile „In einem Stapel nachsehen, was drin ist" |
| J-21 | `docs/seiten/datev-spiegel.md` | Nebenjobs | Zeile „Ein Personenkonto nachschlagen (Kreditor/Debitor)" |
| J-22 | `docs/seiten/datev-spiegel.md` | Nebenjobs | Zeile „Die Wirtschaftsjahre sehen, die DATEV führt" |
| J-23 | `docs/seiten/datev-spiegel.md` | Nebenjobs | Zeile „Die Rohdaten einer Zeile lesen" |
| J-24 | `docs/seiten/kontenplan.md` | Nebenjobs | Zeile „Nach Klasse gruppiert lesen statt flach (`view=grouped`)" |
| J-25 | `docs/seiten/kontenplan.md` | Nebenjobs | Zeile „Seitengröße ändern (heute 50)" |
| J-26 | `docs/seiten/kontenplan.md` | Nebenjobs | Zeile „Den SKR-Katalog dazunehmen" |
| J-27 | `docs/seiten/konto-detail.md` | Nebenjobs | Zeile „Eine einzelne Buchung aufschlagen" |
| J-28 | `docs/seiten/konto-detail.md` | Nebenjobs | Zeile „Monat für Monat vergleichen" |
| J-29 | `docs/seiten/konto-detail.md` | Nebenjobs | Zeile „Das LLM-Profil prüfen" |
| J-30 | `docs/seiten/kontoauszug.md` | Nebenjobs | Zeile „Eine Zahlung nachschlagen, ohne die Liste zu verlassen" |
| J-31 | `docs/seiten/kontoauszug.md` | Nebenjobs | Zeile „Sehen, woraus eine Zeile aufgeteilt ist" |
| J-32 | `docs/seiten/kontoauszug.md` | Nebenjobs | Zeile „Den Import beurteilen" |
| J-32 | `docs/entitaeten/bank-transaction.md` | Listen | Zeile „dieselbe Komponente, zweiter Aufrufer — **Transaktionen eines Kontos**…" — „Wenn **ein Import gelaufen ist**…" |
| J-33 | `docs/seiten/opos.md` | Nebenjobs | Zeile „Zum Replay-Cutoff springen (Experiment-Mandant)" |
| J-34 | `docs/seiten/opos.md` | Nebenjobs | Zeile „Ein Personenkonto öffnen" |
| J-35 | `docs/seiten/opos.md` | Nebenjobs | Zeile „Nach Alter gruppieren (Mahnstufen)" |
| J-36 | `docs/seiten/sachverhalt-detail.md` | Nebenjobs | Zeile „Beleg nachträglich anhängen" |
| J-37 | `docs/seiten/sachverhalt-detail.md` | Nebenjobs | Zeile „Belegnummern-Modus umstufen (S3)" |
| J-38 | `docs/seiten/sachverhalt-detail.md` | Nebenjobs | Zeile „Zusammenfassung schreiben" |
| J-39 | `docs/seiten/sachverhalt-detail.md` | Nebenjobs | Zeile „Fall an die Kanzlei zurückgeben" |
| J-40 | `docs/seiten/sachverhalte.md` | Nebenjobs | Zeilen „Einen Fall über den Geschäftspartner suchen" **und** „Den Vorrat über Jahre hinweg sehen" |
| J-40 | `docs/entitaeten/accounting-case.md` | Listen | Zeile „Reiter „Sachverhalte" der Geschäftspartner-Seite" — „Wenn **ein Geschäftspartner offen ist**…" |
| J-41 | `docs/seiten/sachverhalte.md` | Nebenjobs | Zeile „Mehrere Fälle auf einmal schließen" |
| J-41 | `docs/entitaeten/accounting-case.md` | Listen | Zeile „`CloseCaseList` (Reiter „Zum Schließen")" — „Wenn **ein Buchungslauf durch ist**…" |
| J-42 | `docs/seiten/upload-inbox.md` | Nebenjobs | Zeile „Dublette erkennen und verwerfen" |
| J-43 | `docs/seiten/upload-inbox.md` | Nebenjobs | Zeile „Sammel-PDF in Einzelbelege trennen" |
| J-44 | `docs/seiten/upload-inbox.md` | Nebenjobs | Zeile „Einen Beleg löschen, der nicht hierher gehört" |
| J-45 | `docs/entitaeten/accounting-case.md` | Listen | Zeile „`PortalCaseList`" — „Wenn **der Mandant gefragt wurde**…" |
| J-46 | `docs/entitaeten/bank-transaction.md` | Listen | Zeile „`BankTransactionWorklist` — offene Zahlungen" — „Wenn **Zahlungen ohne Vorgang liegen**…" |
| J-47 | `docs/entitaeten/business-partner.md` | Listen | Zeile „`BusinessPartnerList` „Stammsätze"" — „Wenn eine Sachbearbeiterin eine Kontonummer oder einen Namen vor sich hat…" |
| J-48 | `docs/entitaeten/business-partner.md` | Listen | Zeile „Dashboard „Top Kreditoren"" — „Wenn die Kanzlei den Monat überblickt…" |
| J-49 | `docs/entitaeten/clarification.md` | Listen | Zeile „**Am Fall**" — „Wenn ein Sachverhalt vor ihr liegt…" |
| J-50 | `docs/entitaeten/clarification.md` | Listen | Zeile „**Im Stapel** (Abnahme, Schritt 2)" — „Wenn sie einen Buchungsstapel abnimmt…" |
| J-51 | `docs/entitaeten/clarification.md` | Listen | Zeile „**Im Portal**" — „Wenn der Mandant ins Portal kommt…" |
| J-52 | `docs/entitaeten/clarification.md` | Listen | Zeile „**Im Lauf**" — „Wenn jemand einen Buchungslauf nachvollzieht…" |
| J-53 | `docs/entitaeten/recurring-rule.md` | Listen | Zeile „`RecurringRuleList` „Erwartete Zahlungen ohne Eingang"" — „Wenn **ein Buchungszyklus zur Abnahme steht**…" |
| J-54 | `docs/entitaeten/recurring-rule.md` | Listen | Zeile „`RecurringRuleList` „Regelwerk des Mandanten" — **Backlog 0131**" — „Wenn **ein Mandant übernommen ist**…" |
| J-55 | `docs/entitaeten/recurring-rule.md` | Listen | Zeile „`RecurringCandidateList` „Dauersachverhalte übernehmen" — **Backlog 0130**" — „Wenn **ein Mandant onboardet wird**…" |
| J-56 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Beleg einreichen**" — „Wenn der Buchungszyklus läuft…" |
| J-57 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Belege am Sachverhalt**" — „Wenn jemand einen Sachverhalt prüft…" |
| J-58 | `docs/entitaeten/source-document.md` | Listen | Zeile „**Teilbelege**" — „Wenn ein Sammel-PDF zerlegt wurde…" |

## Unbedient — die Liste, aus der die nächste Umstrukturierung kommt

Sieben Jobs haben heute keinen Ort. Fünf davon hat der Seiten-Rückbau vom
2026-09-05 hinterlassen, und das ist der Punkt: **Jobs überleben Seiten.**

| Kennung | Job | Warum ohne Ort |
|---|---|---|
| J-10 | Papier hereinholen und wissen, dass es erkannt ist | Route `document-inbox` am 2026-09-05 gelöscht, Neubau steht aus |
| J-42 | Dublette erkennen und verwerfen | hing an J-10 |
| J-43 | Sammel-PDF in Einzelbelege trennen | hing an J-10 |
| J-44 | Einen Beleg löschen, der nicht hierher gehört | hing an J-10 |
| J-56 | Belege an die Verarbeitung übergeben | Route `review/*` am 2026-09-05 zurückgebaut; das Profil verweist auf J-10, die es auch nicht mehr gibt |
| J-35 | Offene Posten nach Alter gruppieren (Mahnstufen) | „eine Gruppierung, die es heute nicht gibt" — `OpenItemAgeGroup` liegt fertig daneben |
| J-54 | Regelwerk des Mandanten sehen | Query gebaut, Oberfläche und Ort fehlen (Backlog 0131) |

Die 22 Jobs im Zustand `halb` sind die zweite Liste: dort gibt es einen Ort,
aber das Profil nennt einen Mangel daran. Acht davon haben denselben Mangel:
**kein Seitenprofil** — J-32, J-45, J-46, J-47, J-48, J-50, J-51, J-52.

## Pflegeregel

- **Neuer Job → erst Register, dann Profil.** Er bekommt hier die nächste
  freie Kennung und eine Zeile in „Fundstellen"; im Profil steht danach der
  Wortlaut mit der Kennung davor. Andersherum entsteht ein Job, den keine
  Sortierung findet.
- **Fällt eine Seite weg, bleibt der Job.** Sein Zustand wechselt auf
  `unbedient`, „Bedient von" beginnt mit `—` und nennt den Grund samt Datum.
  Die Zeile wird **nicht** gelöscht: die `unbedient`-Liste ist der Vorrat für
  die nächste Umstrukturierung, und ein gelöschter Job kommt als
  „neue Idee" zurück, statt als Schuld.
- **Kennungen werden nie wiederverwendet.** Wie die Nummern in
  `docs/backlog/`.
- **Der Wortlaut bleibt im Profil.** Wer ihn hier ändert, ohne ihn dort zu
  ändern, hat eine zweite Wahrheit gebaut — genau das, was
  `docs/detailseiten-standard.md` mit den Kennungen abstellen will.
- **Nach jeder Änderung `pnpm check:jobs`.** Er prüft, dass jedes Profil nur
  existierende Kennungen zitiert, dass jeder `bedient`-Job auch zitiert wird
  und dass „ohne Ort" und `unbedient` dasselbe sagen.

## Rückfragen

1. **Zählt „kein Seitenprofil" als Mangel — also `halb` statt `bedient`?**
   Acht Jobs hängen daran (J-32, J-45, J-46, J-47, J-48, J-50, J-51, J-52):
   sie sind in der App gebaut und tun, was sie sollen, aber niemand hat ihren
   Ort je als Seite beschrieben. *Ohne Antwort: ja, `halb`* — sonst
   verschwinden acht ungeschriebene Seitenprofile aus der Liste, aus der die
   nächste Umstrukturierung kommt.
2. **Bleibt J-56 („Belege an die Verarbeitung übergeben") `unbedient`?**
   `entitaeten/source-document.md` sagt (berichtigt 2026-09-08), die Liste
   lebe als Zustand in Upload & Inbox — aber `seiten/upload-inbox.md` sagt,
   diese Route sei am 2026-09-05 gelöscht. Eines der beiden Profile ist alt.
   *Ohne Antwort: `unbedient`* — ein Ort, den es nicht gibt, ist kein Ort.
3. **Bekommen die Nebenjobs einen vollen Job-Satz?** 29 der 58 Zeilen haben
   heute keinen Nutzen („nicht genannt"), weil die Nebenjob-Tabellen der
   Seitenprofile nur Name, Häufigkeit und Budget führen. *Ohne Antwort: nein* —
   das Register erfindet keinen Wortlaut; wer einen Nebenjob ausformulieren
   will, tut das im Profil, und die Zeile hier zieht nach.

## Beantwortete Rückfragen (2026-09-08)

1. **„Kein Seitenprofil" zählt als Mangel → `halb`.** Der Default gilt. Acht
   Jobs hängen daran; sie sind gebaut und tun, was sie sollen, aber niemand
   hat ihren Ort je als Seite beschrieben. Stünden sie auf `bedient`,
   verschwänden acht ungeschriebene Seitenprofile aus genau der Liste, aus der
   die nächste Umstrukturierung kommt.
2. **J-56 ist `halb`, nicht `unbedient`** — und der Widerspruch, den die Frage
   aufdeckte, war ein Faktenfehler in einem Profil, nicht in der Sache: die
   Route `document-inbox` **existiert** (`app/(app)/clients/[clientSlug]/document-inbox/page.tsx`).
   `upload-inbox.md` behauptete drei Tage länger als wahr, die Seite sei
   gelöscht; sie ist am 2026-09-08 nach genau diesem Profil neu gebaut worden.
   Berichtigt — und mit ihr **fünf** Jobs, die als unbedient geführt waren
   (J-10, J-42, J-43, J-44, J-56).
3. **Nebenjobs bekommen keinen erfundenen Nutzen.** Der Default gilt: Das
   Register erfindet keinen Wortlaut. Wo eine Nebenjob-Tabelle nur Name,
   Häufigkeit und Budget führt, steht hier `nicht genannt`; ausformuliert wird
   im Profil, und die Zeile hier zieht nach.
