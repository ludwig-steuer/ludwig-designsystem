/**
 * Die Sorten des Rücklauf-Korbs und ihr Wort — pure Domäne, ohne DB und ohne
 * `server-only`, weil `ReviewExits` (Client) dieselben Wörter zeigt, die
 * `return-basket` (Server) zusammenstellt. Die Query bleibt drüben.
 */
export type KorbKind =
  | "rejected_entry"
  | "answered_question"
  | "open_agent_question"
  | "discarded_convention"
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
  rejected_entry: "Abgelehnter Satz",
  answered_question: "Beantwortete Frage",
  open_agent_question: "Frage an den Agenten",
  discarded_convention: "Verworfene Konvention",
  reopened_doc: "Zurückgesetzter Beleg",
  return_note: "Auftrag an den Agenten",
};

export function korbKindLabel(kind: KorbKind): string {
  return KIND_LABEL[kind];
}
