import { createHash } from 'crypto';

export function schemaIdForLicenseKey(key: string): string {
  const normalized = String(key || '').trim().toUpperCase();
  if (!normalized) return 'lic_demo';
  // Demo licenses share the sample seed schema
  if (normalized === 'OMNI-DEMO-2026-LIVE' || normalized.includes('DEMO')) {
    return 'lic_demo';
  }
  // All real customer licenses get their own isolated, pristine schema with 0 mock data
  const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return `lic_${hash}`;
}
