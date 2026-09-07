# 0058 · ClarificationDrawer

| | |
|---|---|
| Status | verworfen |
| Freigabe | 2026-09-07 — kein Baustein: `Drawer` + `ClarificationCard` decken den Fall an der Aufrufstelle; zwei Auslöser im Abschnitt „Freigabe" |
| Stufe | `entities/clarification/` |
| Klassen-Test | nein — „Klärung" ist ein Ludwig-Fachwort |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` §Formen, §Zuschnitt (2026-09-04) |
| Ersetzt | noch nichts — heute führt der Verweis in `RationaleSources` auf die Sachverhaltsseite |
| Blockiert | nichts |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`, §3 Regel 1) |

## Auftrag

Eine beantwortete Klärung wird aus der Begründung einer Buchung heraus
verwiesen (`RationaleSource.kind='clarification'`, 31 % der Klärungen tragen
selbst Quellen). Wer sie dort nachschlagen will, verlässt heute den Vorgang
und landet auf der Sachverhaltsseite. Regel 5 aus `entitaet-analysieren` §7
trifft dem Grunde nach zu: die Frage taucht mitten in der Arbeit an einer
anderen Entität auf.

## Warum vertagt

Der Bedarf ist **nicht belegt** — kein Screen zeigt heute einen Drawer für
eine Klärung, und ohne `ClarificationView` (verworfen: das Detail einer
Klärung ist der Sachverhalt) wäre der Drawer nur die `ClarificationCard` im
Rahmen. Solange `EntityDrawer` (0052) plus Karte das leisten, entsteht hier
keine eigene Komponente.

## Wieder aufnehmen, wenn

- eine Ansicht auf eine Klärung verweist und den Kontext dahinter nicht
  verlieren darf (Buchungs-Begründung, Prüfpunkt), **oder**
- der Klärungs-Faden im Datenmodell existiert (Befund B8) und eine Gegenfrage
  ihre Vorgängerin zeigen muss.

Dann: Spec mit `spec-schreiben`, Quelle bleibt das Entitätsprofil.

## Spec 2026-09-07 (Skill `spec-schreiben`) — **keine Komponente**

Das Ergebnis dieser Spec ist, dass keine gebaut wird. `spec-schreiben` §3
Regel 1 greift: „Ein `@when` deckt den Fall → verwenden. Die Spec nennt den
Export und ist damit meist keine Komponenten-Spec mehr, sondern eine
Seiten-Aufgabe."

### Was den Fall schon deckt

| Teil | Export | `@when` |
|---|---|---|
| Der Rahmen | `Drawer` (`primitives/Drawer.tsx`) | „Looking at something existing next to a list … without leaving the list" |
| Der Inhalt | `ClarificationCard` (0060) | „One clarification with everything it carries — read it, or answer it" |
| Der Verweis, aus dem heraus aufgeschlagen wird | `ClarificationCell` (0059) | „A clarification named inside something else — the source behind a booking rationale" |

Der Drawer über eine Klärung ist damit **Markup an der Aufrufstelle**, kein
Baustein — rund acht Zeilen plus den Loader:

```tsx
// Die Aufrufstelle lädt das Detail: `RationaleSource` trägt nur die Id.
const clarification = await getClarificationDetail(sourceId);

<Drawer
  open={openId !== null}
  onClose={close}
  title={clarification.title}
  size="md"
  // Der Ausgang gehört in den Fuß, wie bei jedem Drawer (A10) — die Karte
  // kennt ihn **nicht**: sie hat keine `caseHref`-Prop und soll auch keine
  // bekommen, denn wohin „mehr dazu" führt, weiß die Seite.
  footer={<Button variant="primary" href={caseHref}>Zum Sachverhalt →</Button>}
>
  <ClarificationCard clarification={clarification} mode="read" />
</Drawer>
```

Eine eigene `ClarificationDrawer`-Komponente wäre nach §3 Regel 3 nur
gerechtfertigt, wenn sie etwas entschiede, was die beiden nicht entscheiden.
Sie entschiede nichts: der Titel kommt aus der Klärung, die Breite ist die
Voreinstellung, der Fuß ist leer, und die Karte kann bereits lesen (`read`),
beantworten (`answer`) und als Vorschau erscheinen (`preview`).

### Der Unterschied zu 0052, und warum er hier nicht trägt

`SourceDocumentDrawer` (0052) ist eine eigene Komponente, weil er **fünf
Zonen** ordnet, die kein Aufrufer zweimal richtig zusammensetzt: Kopf,
Original, Kernfakten, die ausdrückliche **Grenze** („mehr steht im View") und
genau einen Ausgang. Diese Grenze ist die eigentliche Entscheidung — der
Drawer beantwortet die eine Frage, die woanders aufkam, und bietet für alles
Weitere den Weg an.

Die Klärung hat diese Grenze nicht: **ihr Detail ist der Sachverhalt** (so
steht es im Entitätsprofil, Zeile `ClarificationView`: „verworfen"). Ein
Drawer über der Klärung hätte also entweder keinen Ausgang — dann ist er die
Karte im Rahmen — oder seinen Ausgang zum Sachverhalt, und der ist **eine
Zeile im Fuß**, die die Seite ohnehin bauen muss: sie kennt den Sachverhalt,
die Karte nicht. Es gibt nichts zu zonieren.

### Die Aufgabe, die bleibt (Seiten-Aufgabe)

An **einer** Stelle in `ludwig/app`: `RationaleSources` verweist heute mit
`kind='clarification'` auf die Sachverhaltsseite und reißt damit den Vorgang
auf, in dem die Rolle gerade steckt (Buchungs-Begründung lesen). Die Aufgabe
lautet: den Verweis zu einem `Drawer` machen, Inhalt `ClarificationCard`
`mode="read"`. Kein Baustein hier, ein Aufruf drüben.

### Abnahmekriterien

Diese Aufgabe wird nicht gebaut, also gibt es keine Story und keine Messung.
Sie ist **erledigt**, wenn eins von beidem gilt:

- [ ] Die Aufrufstelle in `ludwig/app` benutzt `Drawer` + `ClarificationCard`
      (offen (App)), **oder**
- [ ] einer der beiden Auslöser unten tritt ein und die Aufgabe wird neu
      aufgemacht.

### Wieder aufmachen, wenn — präzisiert

Der ursprüngliche Auftrag nannte zwei Auslöser; nach dem Bau der Familie sind
sie schärfer zu fassen:

1. **Ein Rahmen braucht mehr als eine Zone.** Sobald der Drawer einer Klärung
   zusätzlich zur Karte etwas Eigenes tragen soll — den Klärungs-**Faden**
   (Gegenfrage zeigt ihre Vorgängerin, Befund B8) oder eine Antwortfläche
   **im** Drawer mit eigenem Fuß —, dann ordnet er wieder etwas und ist eine
   Komponente. Vorher nicht. (Die **Quellen** gehören nicht dazu: die Karte
   zeigt sie schon als eigenen Block.)
2. **Zwei Aufrufstellen bauen denselben Rahmen.** Dann greift `spec-schreiben`
   **§4** — „ein Teil wird woanders **allein** gebraucht", und er bekommt sein
   eigenes `@when`. Heute ist es eine Stelle (`RationaleSources`).

### Befunde für `ludwig/app`

Keine neuen. **B8** (der Klärungs-Faden fehlt im Datenmodell) steht im
Entitätsprofil und ist zugleich der erste der beiden Auslöser oben.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: der Schluss trägt — Status `verworfen`** mit den zwei Auslösern, wann die Aufgabe wieder aufgeht. Zwei Korrekturen in die Spec: (a) „den Ausgang zum Sachverhalt kennt die Karte schon (`caseHref`)" ist falsch — `ClarificationCard` hat keine `caseHref`-Prop; der A10-Ausgang gehört in `Drawer.footer` an der Aufrufstelle, und die Stelle muss das Detail-VM laden (`RationaleSource` trägt nur die id): rund acht Zeilen plus Loader, nicht fünf, aber weiterhin Markup, kein Baustein; (b) Auslöser 2 zitiert §3 Regel 3, richtig ist §4 („ein Teil wird woanders allein gebraucht"); Auslöser 1 ohne „Quellen als eigene Zone" (die Karte zeigt sie schon als Block).

Ins Register, Abschnitt E: eine Zeile für den Seitenwechsel `RationaleSources kind='clarification'` → `Drawer` + `ClarificationCard mode="read"` mit Fuß-Ausgang (Vorbild 0098).
