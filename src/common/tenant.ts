import type { Request } from 'express';
import { schemaIdForLicenseKey } from './database-mode';

export function resolveTenantSchemaId(req: Request): string {
  const headerSchema = (req.headers['x-schema-id'] as string) || '';
  if (headerSchema && headerSchema.trim()) {
    return headerSchema.trim();
  }

  const headerKey = (req.headers['x-license-key'] as string) || '';
  if (headerKey && headerKey.trim()) {
    return schemaIdForLicenseKey(headerKey);
  }

  const querySchema = (req.query?.schemaId as string) || '';
  if (querySchema && querySchema.trim()) {
    return querySchema.trim();
  }

  const queryKey = (req.query?.licenseKey as string) || '';
  if (queryKey && queryKey.trim()) {
    return schemaIdForLicenseKey(queryKey);
  }

  // Fallback demo schema for unauthenticated / legacy calls
  return 'lic_demo';
}
