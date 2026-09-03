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
    <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Sync Stream</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time incoming transactions received from cashier registers operating offline
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Ingestion Active
        </div>
      </div>

      <div className="rounded-2xl bg-[#141a24] border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1b2331] text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Transaction ID</th>
              <th className="px-6 py-3.5">Originating Store</th>
              <th className="px-6 py-3.5">Transaction Event</th>
              <th className="px-6 py-3.5">Amount</th>
              <th className="px-6 py-3.5">Stage</th>
              <th className="px-6 py-3.5">Sync Status</th>
              <th className="px-6 py-3.5 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {syncTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-blue-400">{tx.id}</td>
                <td className="px-6 py-4 font-semibold text-white">{tx.store}</td>
                <td className="px-6 py-4">{tx.type}</td>
                <td className="px-6 py-4 font-bold text-white">{tx.amount}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1b2331] text-slate-300 border border-white/10">
                    {tx.stage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                    <CheckCircle2 className="w-3 h-3" /> {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
