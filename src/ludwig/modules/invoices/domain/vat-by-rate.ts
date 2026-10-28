// F502 — `vatByRate` liegt in `@/core/accounting/vat-by-rate` (accounting-cases → invoices wäre ein Modulzyklus).
// ponytail: der alte Pfad bleibt nur für das Designsystem (`SourceDocumentAside.tsx` importiert `VatRateShare` von
// hier); fällt weg, sobald der DS-Worker den Import auf core umstellt.
export { vatByRate, type VatLineAmounts, type VatRateShare } from "@/ludwig/core/accounting/vat-by-rate";
