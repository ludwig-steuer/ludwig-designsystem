import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CasePage } from "./CasePage";
import * as C from "./collective-scenarios";
import { ScenarioPage } from "./scenario";

/**
 * Der Sachverhalt als Seite — Sammel- und Dauerfälle aus 0152, Welle 3.
 *
 * Die Extremfälle des Bestands: ein Mandantenstapel mit 508 Ereignissen und
 * zwölf offenen Rückfragen, ein Dauersachverhalt mit Regel über ein ganzes
 * Jahr, eine Ausgleichsgruppe auf dem Verrechnungskonto, eine Sammelzahlung
 * mit zwölf Klammern und eine Spesenabrechnung mit 36 Belegen. Sie prüfen,
 * was die ersten beiden Wellen gebaut haben. Alle Daten sind erfunden.
 */
const meta: Meta<typeof CasePage> = {
  title: "Seiten/Sachverhalt/Sammel und Dauer",
  component: CasePage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CasePage>;

/**
 * **Mandantenstapel** (A5, 9 %). Der Mandant hat in seiner eigenen Software
 * gebucht, die Kanzlei nimmt ab: 508 Stapelzeilen ohne Agenten und ohne
 * Judge, zwölf Rückfragen an die Kanzlei.
 *
 * Der Strang zeigt die **jüngsten 20** Einträge und darunter den Weg in den
 * Reiter, wo blättern möglich ist — der Extremfall bricht das Layout nicht.
 * Kein Gegenpart und kein Personenkonto ist **kein Mangel**: NULL heißt hier
 * „hat bewusst keins".
 */
export const ClientBatch: Story = { render: () => <ScenarioPage scenario={C.clientBatch} /> };

/**
 * **Dauersachverhalt mit Regel** (A9, 3 %; Punkt 8). Zwölf Abgrenzungen, je
 * Monat eine, dazu die Zahlungseingänge und die Dauerrechnung, die die Regel
 * trägt.
 *
 * Eine Regel-Buchung sieht anders aus als eine Agenten-Buchung: Herkunft
 * „Regelwerk", die Regel als Satz, die Periode — **keine** Begründung, keine
 * Quellen, **kein** Judge. `needs_review` an der Dezember-Buchung ist der
 * einzige Hinweis. Der Bestand zeigt die Regel-Welt nur für einen Monat;
 * zwölf sind hochgerechnet, die Form ist die des Bestands.
 */
export const RecurringWithRule: Story = { render: () => <ScenarioPage scenario={C.recurringWithRule} /> };

/**
 * **Ausgleichsgruppe mit Rest** (A10, 2 %; Punkt 9, S15). Zwölf Auszahlungen
 * eines Zahlungsdienstleisters gegen seine Abrechnung, gebucht über das
 * Verrechnungskonto 1360 statt über ein Personenkonto. Der Rest von 12,40 €
 * ist eine Zahl mit Weg, kein Alarm.
 *
 * Fremdtilgung und der Gate-Mangel aus F206 stehen noch nicht im Spiegel —
 * die Story baut gegen die Felder, die es gibt (Befund L-285).
 */
export const ClearingGroup: Story = { render: () => <ScenarioPage scenario={C.clearingGroup} /> };

/** **Ausgleichsgruppe, ausgeglichen** — dieselbe Gruppe mit Rest 0,00 €: nichts zu tun. */
export const ClearingGroupBalanced: Story = { render: () => <ScenarioPage scenario={C.clearingGroupBalanced} /> };

/**
 * **Sammelzahlung** (Punkt 10). Eine Überweisung gleicht zwölf Rechnungen aus,
 * Belegnummern-Modus „mehrere". Die Seite öffnet mit der Zahlung gewählt,
 * damit die **zwölf Klammern** sofort zu sehen sind — p90 im Bestand ist genau
 * zwölf.
 */
export const CollectivePayment: Story = { render: () => <ScenarioPage scenario={C.collectivePayment} /> };

/**
 * **Spesenabrechnung** (A11, 1 %). 36 Belege und eine Erstattung, ein
 * Tankbeleg fehlt noch. Auch hier zeigt der Strang die jüngsten 20.
 */
export const ExpenseReport: Story = { render: () => <ScenarioPage scenario={C.expenseReport} /> };
