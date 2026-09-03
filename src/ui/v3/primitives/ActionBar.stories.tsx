import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ActionBar, RowActions } from "./ActionBar";
import { Button } from "./Button";

const meta: Meta<typeof ActionBar> = { title: "v3/Primitives/Aktion/ActionBar", component: ActionBar };
export default meta;
type Story = StoryObj<typeof ActionBar>;

/** Feste Reihenfolge: primär, sekundär, tertiär, Infotext. */
export const FullyStaffed: Story = {
  render: () => (
    <ActionBar
      primary={<Button variant="primary" hotkey="A">Freigeben</Button>}
      secondary={<Button variant="secondary" hotkey="R">Zurück an Agenten</Button>}
      tertiary={<Button variant="tertiary" size="sm">Abbrechen</Button>}
      info="Nach der Freigabe geht der Stapel an DATEV."
    />
  ),
};

/** Zustand ohne Handlung: nur der Hinweis, warum gerade nothing zu tun ist. */
export const InfoOnly: Story = {
  render: () => <ActionBar info="Der Agent arbeitet — Aktionen sind so lange gesperrt." />,
};

/** Erneut übertragen ist die einzige sinnvolle Handlung nach einem Fehlschlag. */
export const AfterFailure: Story = {
  render: () => (
    <ActionBar
      primary={<Button variant="primary">Erneut übertragen</Button>}
      tertiary={<Button variant="tertiary" size="sm">Protokoll ansehen</Button>}
      info="Letzter Versuch am 26.08., 09:40 abgebrochen."
    />
  ),
};

/** Zeilen-Aktionen: tertiäre Knöpfe rechtsbündig, jedes Icon mit Wort. */
export const ActionsInRow: Story = {
  render: () => (
    <RowActions>
      <button type="button" className="v2link">Öffnen</button>
      <button type="button" className="v2link v2link--quiet">Zurückstellen</button>
    </RowActions>
  ),
};
