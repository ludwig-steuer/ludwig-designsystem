/**
 * Nur für das Designsystem (`@/ludwig/modules/datev-export/domain/document-group`).
 * App-Code importiert nie von hier. Entfällt, sobald das DS auf `accounting-cases`
 * umgestellt ist (Anliegen an den DS-Worker).
 */
export {
  DOCUMENT_GROUP_LABEL,
  DOCUMENT_GROUP_RANK,
  classifyDocumentGroup,
  sortEntriesByDocumentGroup,
  type DocumentGroup,
  type DocumentGroupLine,
} from "../../accounting-cases/domain/document-group";
