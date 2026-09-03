import { createHash } from 'crypto';

export function schemaIdForLicenseKey(key: string): string {
  const normalized = String(key || '').trim().toUpperCase();
  if (!normalized) return '';
  const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return `lic_${hash}`;
}
