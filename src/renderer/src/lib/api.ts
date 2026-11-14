import { useQuery } from '@tanstack/react-query';
import type { OverviewData } from '@common/overview';

export type { OverviewData };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

export const queryKeys = {
  overview: ['overview'] as const,
  health: ['health'] as const,
};

export function useOverview() {
  return useQuery({
    queryKey: queryKeys.overview,
    queryFn: async () => (await getJson<{ success: boolean; data: OverviewData }>('/api/admin/overview')).data,
    refetchInterval: 30_000,
  });
}

export interface HealthResult {
  online: boolean;
  latencyMs: number | null;
}

export function useHealth() {
  return useQuery<HealthResult>({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        return { online: res.ok, latencyMs: Math.round(performance.now() - start) };
      } catch {
        return { online: false, latencyMs: null };
      }
    },
    refetchInterval: 30_000,
    retry: false,
  });
}

/* ── Formatting ─────────────────────────────────────────────────────────── */

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });

export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—';
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['week', 604_800_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'just now';
}
