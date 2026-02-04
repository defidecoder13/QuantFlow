'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardKPIs } from '@/features/dashboard/dashboard-kpis';
import { DashboardEquity } from '@/features/dashboard/dashboard-equity';
import { usePaperStore } from '@/lib/paper-store';
import Link from 'next/link';
import { Search, Filter, Download, MoreHorizontal, Wallet, Activity, ArrowRight } from 'lucide-react';

export default function Home() {
  const { balance, orders, activeStrategies } = usePaperStore();

  const activeOrders = orders.filter(o => o.status === 'OPEN');
  const closedOrders = orders.filter(o => o.status === 'CLOSED');
  const unrealizedPnL = activeOrders.reduce((acc, o) => acc + o.pnl, 0);
  const totalBalance = balance + unrealizedPnL;
  
  // Calculate Daily PnL (Simple sum of all closed orders for this demo)
  const dailyPnL = closedOrders.reduce((acc, o) => acc + o.pnl, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            <div className="space-y-6">
              
              {/* Dynamic KPIs (Passing props would be better, but assuming DashboardKPIs is static for now, we'll overlay or replace it later. 
                  For now let's manually inject a summary row above if needed, OR we just trust user wants "stats dynamic" meaning the tables/cards below. 
                  Actually, let's replace the top KPI block with a custom dynamic one for this request) */}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="glass p-5 rounded-xl border-l-4 border-cyan-500">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total Balance</p>
                    <p className="text-2xl font-bold font-mono mt-1">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Cash + Unrealized</p>
                 </div>
                 <div className="glass p-5 rounded-xl border-l-4 border-emerald-500">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Realized PnL</p>
                    <p className={`text-2xl font-bold font-mono mt-1 ${dailyPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">Lifetime Paper Profits</p>
                 </div>
                 <div className="glass p-5 rounded-xl border-l-4 border-purple-500">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Active Bots</p>
                    <p className="text-2xl font-bold font-mono mt-1">{activeStrategies.length}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Running Strategies</p>
                 </div>
                 <div className="glass p-5 rounded-xl border-l-4 border-amber-500">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Open Positions</p>
                    <p className="text-2xl font-bold font-mono mt-1">{activeOrders.length}</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Live Trades</p>
                 </div>
              </div>

              <DashboardEquity />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 glass rounded-xl overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Activity size={18} /> Recent Activity</h3>
                    <Link href="/activity" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">View All <ArrowRight size={14} /></Link>
                  </div>
                  <div className="overflow-x-auto">
                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 italic">No trading activity yet.</div>
                    ) : (
                        <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-900/50 text-xs text-zinc-500 uppercase">
                            <th className="px-6 py-3 font-medium">Time</th>
                            <th className="px-6 py-3 font-medium">Strategy</th>
                            <th className="px-6 py-3 font-medium">Pair</th>
                            <th className="px-6 py-3 font-medium">Side</th>
                            <th className="px-6 py-3 font-medium">Entry</th>
                            <th className="px-6 py-3 font-medium">PnL</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {orders.slice(0, 8).map((trade) => (
                            <tr key={trade.id} className="hover:bg-zinc-900/30 transition-colors">
                                <td className="px-6 py-4 text-xs text-zinc-400">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                                <td className="px-6 py-4 text-xs font-medium">{trade.strategyName}</td>
                                <td className="px-6 py-4 text-xs font-bold">{trade.pair}</td>
                                <td className={`px-6 py-4 text-xs font-bold ${trade.side === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>{trade.side}</td>
                                <td className="px-6 py-4 text-xs font-mono">${trade.entryPrice.toFixed(2)}</td>
                                <td className={`px-6 py-4 text-xs font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-xs">
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
          </div>
        </main>
      </div>
      

    </div>
  );
}