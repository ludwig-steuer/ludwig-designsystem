import type { ThreadItem } from "./ClarificationThread";

const WEBER = "Anna Weber";
const KRAUSE = "Tom Krause";

// Case 2026-0042, Musterfirma GmbH: four questions and a note, oldest first.
export const ITEMS: ThreadItem[] = [
  {
    id: "q1",
    title: "Gehört die Rechnung zu diesem Mandanten?",
    question: "Die Rechnung ist an „Muster GmbH“ adressiert. Ist das der Mandant?",
    state: "answered",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-08-22T08:40:00+02:00",
    answeredAt: "2026-08-22T10:05:00+02:00",
    raisedBy: null,
    history: [{ kind: "answered", at: "2026-08-22T10:05:00+02:00", by: WEBER, text: "Ja · Alter Firmenname bis Juli 2026." }],
  },
  {
    id: "n1",
    title: "Mandant hat telefonisch bestätigt: vier Teilnehmer, Kundentermin",
    state: "answered",
    severity: "optional",
    type: "comment",
    audience: "accounting",
    raisedAt: "2026-08-23T14:12:00+02:00",
    raisedBy: KRAUSE,
  },
  {
    id: "q2",
    title: "Liegt die Teilnehmerliste vor?",
    question: "Für die Bewirtung fehlt die Teilnehmerliste. Liegt sie vor?",
    state: "answered",
    severity: "required",
    type: "question",
    audience: "client",
    raisedAt: "2026-08-24T09:00:00+02:00",
    answeredAt: "2026-08-25T16:30:00+02:00",
    raisedBy: WEBER,
    history: [{ kind: "resolved", at: "2026-08-25T16:30:00+02:00", by: KRAUSE, text: "Telefonisch geklärt — die Liste kommt per Post." }],
  },
  {
    id: "q3",
    title: "Welcher Steuersatz gilt für die Übernachtung?",
    question: "Die Übernachtung ist mit 19 % ausgewiesen. Gilt 7 %?",
    state: "deferred",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-08-26T08:10:00+02:00",
    deferredUntil: "2026-10-12",
    raisedBy: null,
    history: [{ kind: "deferred", at: "2026-08-26T11:00:00+02:00", by: WEBER, text: "wartet auf die korrigierte Hotelrechnung" }],
  },
  {
    id: "q4",
    title: "Bewirtung oder Reisekosten? Beleg nennt beides",
    state: "open",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-08-26T09:12:00+02:00",
    raisedBy: null,
  },
];

