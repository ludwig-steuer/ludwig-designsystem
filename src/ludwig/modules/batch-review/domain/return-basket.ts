/**
 * Die Sorten des Rücklauf-Korbs und ihr Wort — pure Domäne, ohne DB und ohne
 * `server-only`, weil `ReviewExits` (Client) dieselben Wörter zeigt, die
 * `return-basket` (Server) zusammenstellt. Die Query bleibt drüben.
 *
 * Abgelehnte Sätze und verworfene Konventionen liest Ludwig nicht (F395) — sie
 * stehen am Sachverhalt bzw. in Schritt Konventionen.
 */
export type KorbKind =
  | "answered_question"
  | "open_agent_question"
  | "reopened_doc"
  | "return_note";

export interface KorbItem {
  kind: KorbKind;
  id: string;
  text: string;
  /** Begründung bzw. Antwort — die eigentliche Nachricht an den Agenten. */
  detail: string | null;
  at: string;
  /** Sprungziel relativ zum Mandanten-Jahr, oder null. */
  href: string | null;
}

const KIND_LABEL: Record<KorbKind, string> = {
  answered_question: "Beantwortete Frage",
  open_agent_question: "Frage an Ludwig",
  reopened_doc: "Zurückgesetzter Beleg",
  return_note: "Auftrag an Ludwig",
};

export function korbKindLabel(kind: KorbKind): string {
  return KIND_LABEL[kind];
}
