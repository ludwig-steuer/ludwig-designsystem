export const CYCLE_ORIGIN = ["imported", "created"] as const;
export type CycleOrigin = (typeof CYCLE_ORIGIN)[number];

export const CYCLE_STATUS = ["open", "closed"] as const;
export type CycleStatus = (typeof CYCLE_STATUS)[number];

export interface FiscalYearListItem {
  cycleId: string;
  clientId: string;
  year: number;
  startDate: string;
  endDate: string;
  origin: CycleOrigin;
  status: CycleStatus;
  accountFrameworkCode: string;
  openedAt: string;
  closedAt: string | null;
  entryCount: number;
  invoiceCount: number;
}
