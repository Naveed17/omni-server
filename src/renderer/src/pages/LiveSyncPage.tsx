import React from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  Store,
  Receipt,
  Smartphone,
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">Live Sync Stream</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Event Bus Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
            Real-time incoming transaction ledger received from edge cashier registers
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Ingestion Active
        </div>
      </div>

      <div className="rounded-2xl bg-white/85 dark:bg-[#0C1222]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden transition-colors relative">
        {/* Top Cyber Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-[#080D1A]/90 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200/80 dark:border-white/5 transition-colors">
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
          <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 font-medium">
            {syncTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-cyan-500/[0.04] transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{tx.id}</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{tx.store}</td>
                <td className="px-6 py-4">{tx.type}</td>
                <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{tx.amount}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-[#151D30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {tx.stage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-400 dark:text-slate-500 font-mono">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
