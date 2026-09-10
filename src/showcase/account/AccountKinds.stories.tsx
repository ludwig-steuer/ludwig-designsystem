import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AccountPage } from "./AccountPage";
import { ScenarioPage } from "./scenario";
import * as S from "./scenarios";

/**
 * Das Konto als Seite — die Kontoarten aus 0157 (F198 §7, K1–K12).
 *
 * **DATEV führt, Ludwig ist das Delta**: ein Saldo aus dem Spiegel, daneben
 * „nur in Ludwig" als Abweichung mit Zahl und Weg, nie ein zweiter Saldo. Die
 * Bewegungen sind **eine** Liste, die Herkunft ist eine Eigenschaft der Zeile.
 *
 * Alles ist klickbar: Mängelzeilen und Kacheln filtern die Liste, eine Zeile
 * öffnet die Bewegung, ein Gegenkonto seinen Drawer, die Reiter wechseln. Alle
 * Daten sind erfunden.
 */
const meta: Meta<typeof AccountPage> = {
  title: "Seiten/Konto/Konten",
  component: AccountPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof AccountPage>;

/**
 * **K1 — Geldtransit** (Referenzform). Ein Verrechnungskonto ist dieselbe
 * Seite wie jedes andere: 450 Sätze aus DATEV, 110 Vorschläge aus dem Juli nur
 * in Ludwig, ein Rest von 1.240,50 € als Hinweis, nicht als Fehler.
 *
 * Die Mängelzeile „110 Bewegungen … nur in Ludwig" filtert die Liste auf genau
 * diese 110 — dieselbe Zahl wie die Kachel —, und mit genau einer Quelle kommt
 * die Saldospalte zurück.
 */
export const MoneyTransit: Story = { render: () => <ScenarioPage scenario={S.moneyTransit} /> };

/**
 * **K2 — Bankkonto** mit 3.400 Bewegungen und allen vier Herkünften. Oben die
 * Warnung „5 Bewegungen exportiert, in DATEV nicht wiedergefunden" — an der
 * Sache, nicht im Kopf. Die Liste blättert in Fünfzigern.
 */
export const BankAccount: Story = { render: () => <ScenarioPage scenario={S.bankAccount} /> };

/**
 * **K3 — Aufwand, stimmt überein.** 40 Sätze aus DATEV, 8 von Ludwig gebucht
 * und bestätigt. Der gute Fall ist still: ein Haken mit Zahl. „Automatik 19 %"
 * steht in der Randspalte als Fakt, nicht als Farbe.
 */
export const ExpenseReconciled: Story = { render: () => <ScenarioPage scenario={S.expenseReconciled} /> };

/**
 * **K4 — Kreditor.** Ein Personenkonto ist dieselbe Seite; der Partner steht im
 * Kopf mit Weg in seinen Drawer. Der Saldo ist negativ und heißt
 * „Verbindlichkeit" — das Vorzeichen bleibt ungefärbt.
 */
export const Creditor: Story = { render: () => <ScenarioPage scenario={S.creditor} /> };

/** **K4b — Debitor.** Dieselbe Form auf der anderen Seite: positiv, „Forderung". */
export const Debtor: Story = { render: () => <ScenarioPage scenario={S.debtor} /> };

/**
 * **K5 — Erlöskonto**, nur DATEV. Haben-Balken, Soll leer, und in der ganzen
 * Liste kein einziges Herkunftszeichen: wo es nichts zu sagen gibt, fehlt es.
 */
export const RevenueAccount: Story = { render: () => <ScenarioPage scenario={S.revenueAccount} /> };

/**
 * **K6 — unbenutzt.** Im Rahmen, nie bebucht: ein Befund, kein Fehler. Der
 * Saldo ist 0,00 €, nicht leer; der Verlauf fällt weg statt zwölf leerer
 * Balken.
 */
export const Unused: Story = { render: () => <ScenarioPage scenario={S.unused} /> };

/**
 * **K7 — nur in Ludwig.** DATEV kennt das Konto noch nicht, also gibt es
 * keinen Spiegel-Saldo. Die Kennzahl im Kopf wird zu „Nur in Ludwig 540,00 €"
 * — kein Strich. Drei Bewegungen in zwei Monaten sind zu wenig für ein
 * Diagramm; die Tabelle steht an seiner Stelle.
 */
export const LudwigOnly: Story = { render: () => <ScenarioPage scenario={S.ludwigOnly} /> };

/**
 * **K8 — verschwunden.** Ein DATEV-Re-Import kennt das Konto nicht mehr: das
 * ist das eine Signal der Seite. Der Kopf-Zustand bleibt die Kontoart.
 */
export const Disappeared: Story = { render: () => <ScenarioPage scenario={S.disappeared} /> };

/**
 * **K9 — gesperrt.** Sammelkonto mit Kontenfunktion 12. Die Kontenfunktion
 * erscheint in der Randspalte nur, weil sie hier etwas sperrt.
 */
export const Locked: Story = { render: () => <ScenarioPage scenario={S.locked} /> };

/**
 * **K10 — ohne LLM-Profil.** Das Konto aus K3, ohne Beschreibung und
 * Embedding. Die Mängelzeile führt in die Details; dort ist der Leerfall ein
 * Angebot: „Beschreibung schreiben", im Kopf „LLM-Profil erzeugen".
 */
export const WithoutLlmProfile: Story = { render: () => <ScenarioPage scenario={S.withoutLlmProfile} /> };

/**
 * **K11 — SKR03.** Dieselbe Form, Randspalte „SKR03 · Basis 1200". Kein Wort
 * der Seite nimmt SKR04 an.
 */
export const Skr03: Story = { render: () => <ScenarioPage scenario={S.skr03} /> };

/**
 * **K12 — Ränder.** Ein Name mit 50 Zeichen (der Kopf kürzt ab 40, der volle
 * Name steht im Tooltip), ein Buchungstext mit 60, vier Gegenkonten („+3"),
 * ein Betrag von 0,00 € und ein negativer.
 */
export const LongName: Story = { render: () => <ScenarioPage scenario={S.longName} /> };
