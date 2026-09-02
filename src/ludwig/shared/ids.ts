import { z } from "zod";

/**
 * Branded ID types — never accept a bare `string` as an identity.
 * Construct via the corresponding `*IdSchema.parse(value)` at the boundary.
 */

declare const tenantIdBrand: unique symbol;
declare const clientIdBrand: unique symbol;
declare const invoiceIdBrand: unique symbol;
declare const userIdBrand: unique symbol;
declare const fileUploadIdBrand: unique symbol;

export type TenantId = string & { readonly [tenantIdBrand]: true };
export type ClientId = string & { readonly [clientIdBrand]: true };
export type InvoiceId = string & { readonly [invoiceIdBrand]: true };
export type UserId = string & { readonly [userIdBrand]: true };
export type FileUploadId = string & { readonly [fileUploadIdBrand]: true };

const uuid = z.string().uuid();

export const TenantIdSchema = uuid.transform((v) => v as TenantId);
export const ClientIdSchema = uuid.transform((v) => v as ClientId);
export const InvoiceIdSchema = uuid.transform((v) => v as InvoiceId);
export const UserIdSchema = uuid.transform((v) => v as UserId);
export const FileUploadIdSchema = uuid.transform((v) => v as FileUploadId);
