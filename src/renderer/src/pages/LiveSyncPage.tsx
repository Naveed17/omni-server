import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Activity,
  Zap,
  RefreshCw,
  Clock,
  Store,
  DollarSign,
  Receipt,
  Inbox,
} from 'lucide-react';

interface OrderRecord {
  id: string;
  store: string;
  type: string;
  amount: string;
  stage: string;
  status: string;
  customerName?: string;
  time: string;
  rawTime?: string;
}

export default function LiveSyncPage() {
  const [transactions, setTransactions] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState('PKR 0');

  const fetchLiveStream = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      let res = await fetch('/api/admin/overview');
      if (!res.ok) {
        res = await fetch('/api/admin/licenses/overview');
      }

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setTransactions(json.data.recentOrders || []);
          setTotalCount(json.data.totalOrders || 0);
          setTotalVolume(json.data.formattedVolume || 'PKR 0');
        }
      }
    } catch (err) {
      console.error('[LiveSyncPage] Failed to fetch sync transactions:', err);
    } finally {
      setLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStream();
    const interval = setInterval(() => {
      fetchLiveStream();
    }, 15000); // 15s live polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 dark:border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight m-0">Live Sync Stream</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 dark:border-indigo-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Neon DB Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-indigo-200/60 mt-1 m-0">
                Real-time incoming transaction ledger ingested from edge cashier registers into PostgreSQL
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 dark:bg-white/5 border border-indigo-200/50 dark:border-white/10 text-slate-700 dark:text-indigo-200 text-xs font-semibold">
            <Receipt className="w-3.5 h-3.5 text-indigo-500" />
            <span>{totalCount} Total Ingested</span>
            <span className="text-slate-300 dark:text-white/20">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalVolume}</span>
          </div>

          <button
            onClick={() => fetchLiveStream(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/25 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Live Ingestion Active
          </div>
        </div>
      </div>

      {/* Glassmorphism Table Container */}
      <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300 relative hover:border-indigo-200 dark:hover:border-white/20">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-600 dark:text-indigo-200">
              Fetching real-time transaction ledger from PostgreSQL...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <Inbox className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">No Orders Synced Yet</h3>
            <p className="text-xs text-slate-500 dark:text-indigo-200/60 max-w-sm">
              When edge counter machines punch orders and sync to the cloud, transactions will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-indigo-100 min-w-[700px]">
              <thead className="bg-indigo-50/80 dark:bg-black/25 text-[11px] font-semibold text-slate-600 dark:text-indigo-200/70 uppercase tracking-wider border-b border-indigo-100 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Originating Store</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Transaction Event</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Sync Status</th>
                  <th className="px-6 py-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100 dark:divide-white/5 font-medium">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-indigo-50/50 dark:hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {tx.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-indigo-500/70" />
                        <span>{tx.store}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-indigo-200/80">
                      {tx.customerName || 'Walk-in'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-indigo-100/70">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/5 text-[11px]">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-indigo-50 dark:bg-black/25 text-indigo-700 dark:text-indigo-200 border border-indigo-200/80 dark:border-white/5">
                        {tx.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-500/30 flex items-center gap-1.5 w-fit shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400 dark:text-indigo-200/50 font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="w-3 h-3 opacity-60" />
                        <span>{tx.time}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
