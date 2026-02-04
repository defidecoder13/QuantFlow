'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { usePaperStore } from '@/lib/paper-store';
import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';

export default function ActivityPage() {
  const orders = usePaperStore((state) => state.orders);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            <div className="space-y-6">
              <div className="glass rounded-xl overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                    <h3 className="text-lg font-semibold">Activity Log</h3>
                    <div className="flex items-center bg-zinc-900 rounded-md border border-zinc-800 px-3 py-1 w-full md:w-auto">
                      <Search size={14} className="text-zinc-500 mr-2" />
                      <input type="text" placeholder="Filter trades..." className="bg-transparent border-none text-xs focus:outline-none w-full md:w-48" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400"><Download size={18} /></button>
                    <button className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400"><Filter size={18} /></button>
                    <button className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400"><MoreHorizontal size={18} /></button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500 italic">No activity recorded yet.</div>
                    ) : (
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-zinc-900/50 text-zinc-500 uppercase">
                          <tr>
                            <th className="px-6 py-3 font-medium">Time</th>
                            <th className="px-6 py-3 font-medium">Strategy</th>
                            <th className="px-6 py-3 font-medium">Pair</th>
                            <th className="px-6 py-3 font-medium">Side</th>
                            <th className="px-6 py-3 font-medium">Entry</th>
                            <th className="px-6 py-3 font-medium">Current/Exit</th>
                            <th className="px-6 py-3 font-medium">PnL</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {orders.map((trade) => (
                            <tr key={trade.id} className="hover:bg-zinc-900/30 transition-colors">
                              <td className="px-6 py-4 text-zinc-400">{new Date(trade.timestamp).toLocaleString()}</td>
                              <td className="px-6 py-4 font-medium text-zinc-300">{trade.strategyName}</td>
                              <td className="px-6 py-4 font-bold text-zinc-300">{trade.pair}</td>
                              <td className={`px-6 py-4 font-bold ${trade.side === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trade.side}
                              </td>
                              <td className="px-6 py-4 text-zinc-300">${trade.entryPrice.toFixed(2)}</td>
                              <td className="px-6 py-4 text-zinc-300">${trade.currentPrice.toFixed(2)}</td>
                              <td className={`px-6 py-4 font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded ${trade.status === 'OPEN' ? 'bg-cyan-900/20 text-cyan-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {trade.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}