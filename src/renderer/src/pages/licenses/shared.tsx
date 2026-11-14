import React from 'react';
import { EXPIRING_WINDOW_DAYS } from '@common/overview';
import { timeAgo } from '../../lib/api';
import type { LicenseStatus } from '../../lib/licenses';

const DAY = 86_400_000;

export function StatusChip({ status }: { status: LicenseStatus }) {
  const cls = status === 'active' ? 'chip-ok' : status === 'expired' ? 'chip-bad' : '';
  return (
    <span className={`chip ${cls}`}>
      <span className="dot" />
      {status}
    </span>
  );
}

export function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function expiryInfo(expiresAt: string | null, now = Date.now()) {
  if (!expiresAt) return { label: 'Never', sub: 'Lifetime', tone: 'text-muted' };
  const ms = new Date(expiresAt).getTime() - now;
  const label = formatDate(expiresAt);
  if (ms < 0) return { label, sub: `Expired ${timeAgo(expiresAt, now)}`, tone: 'text-bad' };
  if (ms < EXPIRING_WINDOW_DAYS * DAY) return { label, sub: `in ${Math.ceil(ms / DAY)} days`, tone: 'text-warn' };
  return { label, sub: timeAgo(expiresAt, now), tone: 'text-fg' };
}
