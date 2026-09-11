import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BusinessPartnerFacts } from "@/ui/v3/entities/business-partner/BusinessPartnerFacts";
import { Button } from "@/ui/v3/primitives/Button";
import { MonoCell } from "@/ui/v3/primitives/Cells";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { RawRecord } from "@/ui/v3/primitives/RawRecord";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead, Table, Row, HeadRow } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { PartnerPage } from "./PartnerPage";
import { accountHref, ACCOUNTS, partnerFixture, casesHref } from "./fixtures";

/**
 * Der Geschäftspartner — die Seite hinter dem Fuß-Knopf des Drawers (0127).
 *
 * Sie ist der **vierte Fall des Detailseiten-Standards** und der erste
 * Aufrufer des gemeinsamen Rahmens `DetailView` (0138 Weg 1). Alle Daten sind
 * erfunden; die Zahlen, die den Schnitt begründen, stehen im Seitenprofil
 * `docs/seiten/partner-detail.md`.
 */
const meta: Meta<typeof PartnerPage> = {
  title: "Seiten/Geschäftspartner/Detail",
  component: PartnerPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof PartnerPage>;

/**
 * The personal accounts per fiscal year — **in the overview**, not a tab of their
 * own: rank 2 of the page with p90 two rows; a tab would cost a click on the most
 * important answer.
 */
function Accounts() {
  return (
    <Card>
      <CardHead title="Personenkonten" sub="je Wirtschaftsjahr" />
      <Table cols="90px 120px minmax(0, 1fr) 120px">
        <HeadRow>
          <th scope="col">Jahr</th>
          <th scope="col">Konto</th>
          <th scope="col">Rolle</th>
          <th scope="col" className="v2num">Buchungen</th>
        </HeadRow>
        {ACCOUNTS.map((k) => (
          <Row key={k.year}>
            <span>{k.year}</span>
            <a className="v2link" href={accountHref(k.number)}>
              <MonoCell value={k.number} />
            </a>
            <span>{k.role}</span>
            <span className="v2num">{k.journalEntries}</span>
          </Row>
        ))}
      </Table>
    </Card>
  );
}

/**
 * Zone 4: **three counters instead of three tabs.** The number answers "what is
 * going on with them?", and the way leads to the entity's list filtered to this
 * partner — with sorting, filter and pager there.
 */
function Cases({
  cases: cases = 0,
  documents: documents = 0,
  journalEntries: journalEntries = 0,
}: {
  cases?: number;
  documents?: number;
  journalEntries?: number;
}) {
  const row = (n: number, wort: string, href: string) =>
    [
      wort,
      n === 0 ? (
        // Zero is information, not a way: a link to an empty list leads nowhere.
        <span className="v2muted" key={wort}>
          keine
        </span>
      ) : (
        <TextButton href={href} key={wort}>
          {n} ansehen
        </TextButton>
      ),
    ] as [string, React.ReactNode];

  return (
    <Card>
      <CardHead title="Vorgänge" sub="was an diesem Partner hängt" />
      <div style={{ padding: "12px 20px 16px" }}>
        <FieldList
          tone="bare"
          rows={[
            row(cases, "Sachverhalte", casesHref.cases),
            row(documents, "Belege", casesHref.documents),
            row(journalEntries, "Buchungssätze", casesHref.journalEntries),
          ]}
        />
      </div>
    </Card>
  );
}

function Overview({
  partner,
  cases: cases,
  documents: documents,
  journalEntries: journalEntries,
}: {
  partner: ReturnType<typeof partnerFixture>;
  cases?: number;
  documents?: number;
  journalEntries?: number;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <CardHead title="Geschäftspartner" sub="wer das ist und was er üblicherweise liefert" />
        <div style={{ padding: "12px 20px 16px" }}>
          {/* **Without `all`** — measured 2026-09-10: with `all` the card is 1,160 px
              tall and pushes zone 4 below the fold. The overview is the short form
              (ranks 1–7); the full list is in the details tab. */}
          <BusinessPartnerFacts partner={partner} underHead accountHref={accountHref} />
        </div>
      </Card>
      <Accounts />
      <Cases cases={cases} documents={documents} journalEntries={journalEntries} />
    </div>
  );
}

/**
 * **Der Normalfall: ein bestätigter Kreditor mit Buchungen.**
 *
 * Rang 1 bis 4 stehen ohne Scrollen — Name, Kontonummer, Reifegrad im Kopf,
 * Buchungen in den Fakten. Kein Signal: an einem bestätigten Partner ist
 * nichts zu tun, und ein Banner „alles in Ordnung" wäre eine Zeile, die
 * niemand braucht.
 *
 * Die Seite **schreibt nicht** (D1). Das ist hier kein Verzicht, sondern der
 * Bestand: es gibt in der App keinen Schreibpfad auf die Stammdaten —
 * `updateBusinessPartner` existiert nicht, das Agenten-Tool ist mit F127
 * gestrichen.
 */
export const Typical: Story = {
  render: () => {
    const partner = partnerFixture();
    return (
      <PartnerPage partner={partner}>
        <Overview partner={partner} cases={4} documents={3} journalEntries={12} />
      </PartnerPage>
    );
  },
};

/**
 * **Die Karteileiche — und sie ist der Regelfall.** 77 % der Partner haben
 * **null** Buchungen; von 14.950 tragen nur 197 überhaupt einen Beleg, einen
 * Sachverhalt oder einen Buchungssatz.
 *
 * Die Seite sagt das in drei Zeilen „keine" statt in drei leeren Reitern —
 * und die Fakten bleiben schmal, weil bei einem unbenutzten Partner auch
 * USt-Profil und typische Lieferung leer sind (11 % bzw. 14 % im Gesamtbestand,
 * gegenüber 75 % und 79 % bei den benutzten).
 */
export const NoActivity: Story = {
  render: () => {
    const partner = partnerFixture({
      legalName: "Testhandel Nord OHG",
      shortName: null,
      usageBookingCount: 0,
      lastBookingDate: null,
      vatProfile: "unknown",
      typicalNature: "unknown",
      businessDescription: null,
      ustIds: [],
      city: null,
      postalCode: null,
      addressLine1: null,
    });
    return (
      <PartnerPage partner={partner} position={4711}>
        <Overview partner={partner} />
      </PartnerPage>
    );
  },
};

/**
 * **Vorgeschlagen — die einzige Handlung der Seite.** 36 Partner stehen auf
 * `proposed`, 2 auf `draft`; der Weg `proposed → confirmed` ist einbahnig.
 *
 * Er steht als **ein** Knopf im Signal-Slot und dann nicht zusätzlich im Kopf
 * (D8, Ausnahme für den nächsten Schritt aus dem Zustand).
 */
export const Proposed: Story = {
  render: () => {
    const partner = partnerFixture({
      legalName: "Musterfirma Logistik GmbH",
      onboardingState: "proposed",
      usageBookingCount: 0,
      lastBookingDate: null,
      creditorAccount: { accountNumber: "89012", isInternal: true },
      source: "manual",
    });
    return (
      <PartnerPage
        partner={partner}
        signal={
          <StatusCallout
            tone="neutral"
            kicker="Vorgeschlagen"
            title="Dieser Partner ist vorgeschlagen, nicht bestätigt."
            sub="Ludwig hat ihn aus einer Rechnung abgeleitet und ihm die interne Nummer 89012 gegeben. Mit der Bestätigung bekommt er seine DATEV-Nummer und taucht in der Auswahl auf."
            actions={<Button variant="primary" size="sm">Bestätigen</Button>}
          />
        }
      >
        <Overview partner={partner} documents={2} />
      </PartnerPage>
    );
  },
};

/**
 * **Der Abrechner.** Zwölf im Bestand (0,08 %) — und **alle zwölf** tragen
 * weder Kreditor- noch Debitornummer: ihr Kreditor *ist* das Auslagenkonto.
 *
 * Ohne die Verrechnungszeile stünde im Kopf an der Stelle, an der bei allen
 * anderen die Nummer steht, **nichts**. Das ist Zweifel 2 des Seitenprofils,
 * und hier ist er behoben.
 */
export const BillingProvider: Story = {
  render: () => {
    const partner = partnerFixture({
      legalName: "Musterfirma Reisekosten-Abrechnung",
      shortName: null,
      creditorAccount: null,
      debtorAccount: null,
      clearingAccounts: [
        { accountNumber: "1370", isInternal: false },
        { accountNumber: "1371", isInternal: false },
      ],
      typicalNature: "expense",
      businessDescription: "Sammelkonto für Auslagen der Mitarbeitenden",
      usageBookingCount: 38,
      lastBookingDate: "2026-08-30",
    });
    return (
      <PartnerPage partner={partner}>
        <Overview partner={partner} journalEntries={38} />
      </PartnerPage>
    );
  },
};

/**
 * **Zwei gleichnamige Partner — der Fall, an dem die Seite scheitern kann.**
 * Beim größten Mandanten teilen sich 149 Zeilen einen `legalName`. Weder
 * Kurzname (143 Kollisionen) noch Ort (löst 35 %) entscheiden ihn; die
 * **Kontonummer** tut es — 6.288 verschiedene Debitornummern unter 6.396
 * Geschwistern.
 *
 * Deshalb steht sie im Kopf, direkt hinter der Rolle, und nicht erst in den
 * Fakten.
 */
export const DuplicateName: Story = {
  render: () => {
    const a = partnerFixture({ city: "Musterstadt", creditorAccount: { accountNumber: "70044", isInternal: false } });
    const b = partnerFixture({
      businessPartnerId: "bp-4712",
      city: "Musterstadt",
      creditorAccount: { accountNumber: "70091", isInternal: false },
      usageBookingCount: 6,
      lastBookingDate: "2026-03-12",
      businessDescription: "Baustoffhandel, zweite Niederlassung",
    });
    return (
      <div style={{ display: "grid", gap: 40 }}>
        <PartnerPage partner={a} position={12}>
          <Overview partner={a} cases={4} documents={3} journalEntries={12} />
        </PartnerPage>
        <PartnerPage partner={b} position={13}>
          <Overview partner={b} journalEntries={6} />
        </PartnerPage>
      </div>
    );
  },
};

/**
 * **Die zwei anderen Reiter.** „Details" trägt alle 16 Ränge, „Rohdaten" den
 * Satz, wie er in der Tabelle steht.
 *
 * „Rohdaten" **ersetzt den heutigen Reiter „Technik"** (D12): eine Detailseite
 * hat genau eine Technik-Sicht, sie steht immer zuletzt und heißt überall
 * gleich.
 */
export const Reiter: Story = {
  render: () => {
    const partner = partnerFixture();
    return (
      <div style={{ display: "grid", gap: 40 }}>
        <PartnerPage partner={partner} tab="details">
          <Card>
            <CardHead title="Details" sub="alle Felder des Partners" />
            <div style={{ padding: "12px 20px 16px" }}>
              <BusinessPartnerFacts partner={partner} all accountHref={accountHref} />
            </div>
          </Card>
        </PartnerPage>

        <PartnerPage partner={partner} tab="raw">
          <Card>
            <CardHead title="Rohdaten" sub="der Satz, wie er in der Tabelle steht" />
            <div style={{ padding: "12px 20px 16px" }}>
              <RawRecord record={partner as unknown as Record<string, unknown>} />
            </div>
          </Card>
        </PartnerPage>
      </div>
    );
  },
};
