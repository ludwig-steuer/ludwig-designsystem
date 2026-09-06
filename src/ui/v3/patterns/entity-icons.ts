/**
 * Achse → Icon/Label.
 *
 * Icons gibt es NUR für die drei Haupt-Entitäten der Datenmodell-Kette; sie
 * spiegeln die Main-Navigation (`ui/components/layout/Sidebar.tsx`). So
 * erkennt der Nutzer am Badge sofort, auf welche Entität sich ein Status
 * bezieht.
 *
 * Welches Zeichen eine Entität trägt, steht nicht hier, sondern in der
 * Icon-Registry (`Icons.tsx`). Diese Datei sagt nur, welche Achse welche
 * Entität meint (`AXIS_ENTITY`); das Zeichen fällt daraus ab.
 *
 * Alle übrigen Achsen (Auftrag, Konto, Zugang, …) haben bewusst kein Icon —
 * sie stehen ohnehin in einem Kontext, der die Entität nennt (Spaltenkopf,
 * Abschnitt), und ein zweites Symbol stiftete nur Unruhe. `StatusBadge`
 * rendert deshalb einfach keins, wenn hier nichts steht.
 */
import type { EntityKey } from "../Icons";
import type { EntityType, StatusAxis } from "@/ludwig/ui/status/status-registry";

/** Welche Achse benennt welche Entität — der Schlüssel in die Icon-Registry. */
export const AXIS_ENTITY: Partial<Record<StatusAxis, EntityKey>> = {
  beleg: "source-document",
  sachverhalt: "accounting-case",
  buchung: "journal-entry",
};



/**
 * Achsen-Name und Herkunft kommen seit 2026-09-06 aus dem **Spiegel**: die App
 * hat `AXIS_LABEL` und `AXIS_SOURCE` in `status-registry.ts` gelegt (reine
 * Daten, `ui/status/entity-icons.ts` re-exportiert sie dort nur noch), und
 * damit spiegeln sie sich mit.
 *
 * Vorher lagen hier zwei Kopien mit 62 Einträgen. Sie waren der Grund, warum
 * **jede neue Achse der App dieses Repo rot machte** — sechs Achsen am
 * 2026-09-06 waren der letzte Fall (0105). Was hier bleibt, ist das, was der
 * App fehlt: welche Achse welche **Entität** meint, und das Zeichen dazu.
 */
export { AXIS_LABEL, AXIS_SOURCE } from "@/ludwig/ui/status/status-registry";

/** Nur die drei Haupt-Entitäten — für Flow-Modal und Icon-Beschriftung. */
export const ENTITY_LABEL: Record<EntityType, string> = {
  beleg: "Beleg",
  sachverhalt: "Sachverhalt",
  buchung: "Buchung",
};
