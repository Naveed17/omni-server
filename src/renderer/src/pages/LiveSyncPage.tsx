import React from 'react';
import {
  CheckCircle2,
  Activity,
  Zap,
} from 'lucide-react';

export default function LiveSyncPage() {
  const syncTransactions = [
    { id: 'tx_9918', store: 'Al-Madina Fast Food', type: 'Order Created', amount: 'PKR 1,450', stage: 'Paid', status: 'Synced', time: 'Just now' },
    { id: 'tx_9917', store: 'Gourmet Mart & Bakery', type: 'Barcode Sale', amount: 'PKR 850', stage: 'Paid', status: 'Synced', time: '2m ago' },
    { id: 'tx_9916', store: 'Al-Madina Fast Food', type: 'Kitchen Order (KOT)', amount: 'PKR 2,100', stage: 'Cooking', status: 'Synced', time: '3m ago' },
    { id: 'tx_9915', store: 'Crispy Byte Express', type: 'Customer Khata Entry', amount: 'PKR 500', stage: 'Credit Received', status: 'Synced', time: '5m ago' },
  ];

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
                  Event Bus Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-indigo-200/60 mt-1 m-0">
                Real-time incoming transaction ledger received from edge cashier registers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/25 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Live Ingestion Active
        </div>
      </div>

      {/* Glassmorphism Table Container */}
      <div className="bg-white/90 dark:bg-white/[0.05] backdrop-blur-2xl border border-indigo-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300 relative hover:border-indigo-200 dark:hover:border-white/20">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <table className="w-full text-left text-xs text-slate-700 dark:text-indigo-100">
          <thead className="bg-indigo-50/80 dark:bg-black/25 text-[11px] font-semibold text-slate-600 dark:text-indigo-200/70 uppercase tracking-wider border-b border-indigo-100 dark:border-white/10">
            <tr>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Originating Store</th>
              <th className="px-6 py-4">Transaction Event</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Stage</th>
              <th className="px-6 py-4">Sync Status</th>
              <th className="px-6 py-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-indigo-100 dark:divide-white/5 font-medium">
            {syncTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-indigo-50/50 dark:hover:bg-white/[0.04] transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{tx.id}</td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{tx.store}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-indigo-100/70">{tx.type}</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{tx.amount}</td>
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
                <td className="px-6 py-4 text-right text-xs text-slate-400 dark:text-indigo-200/50 font-mono">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

