export interface ConfigurationTab {
  key: string;
  label: string;
}

/** Reiter der Mandanten-Konfiguration. „Logs“ sieht nur das Plattform-Team (F380). */
export function configurationTabs(canSeeLogs: boolean): ConfigurationTab[] {
  const tabs: ConfigurationTab[] = [
    { key: "overview", label: "Übersicht" },
    { key: "master-data", label: "Stammdaten" },
    { key: "profile", label: "Profil & Leitlinien" },
    { key: "payment-accounts", label: "Geldkonten" },
    { key: "clearing-accounts", label: "Verrechnungskonten" },
    // Route englisch nach der Owner-Regel; die deutschen Nachbarn bleiben, wie
    // sie heißen, werden aber nicht nachgeahmt.
    { key: "recurring-rules", label: "Regelwerk" },
  ];
  return canSeeLogs ? [...tabs, { key: "logs", label: "Logs" }] : tabs;
}
