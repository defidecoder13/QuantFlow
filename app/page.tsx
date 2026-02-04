'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardKPIs } from '@/features/dashboard/dashboard-kpis';
import { DashboardEquity } from '@/features/dashboard/dashboard-equity';
import { usePaperStore } from '@/lib/paper-store';
import Link from 'next/link';
import { Search, Filter, Download, MoreHorizontal, Wallet, Activity, ArrowRight } from 'lucide-react';

import { useStrategyStore } from '@/lib/strategy-store';

export default function Home() {
  const { balance, orders, activeStrategies } = usePaperStore();
  const { strategies } = useStrategyStore();

  const activeOrders = orders.filter(o => o.status === 'OPEN');
  
  // Get full strategy objects for active IDs
  const runningStrategies = strategies.filter(s => activeStrategies.includes(s.id));
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
              
              {/* Desktop: Recent Activity / Mobile: Hidden */}
              <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-6">
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

              {/* Mobile Only Sections */}
              <div className="flex flex-col gap-6 md:hidden">
                
                {/* Active Pairs Section */}
                <div className="glass rounded-xl overflow-hidden p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-zinc-100">Active Pairs</h3>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="bg-zinc-900 border border-zinc-800 rounded-full pl-8 pr-3 py-1 text-xs text-zinc-300 w-28 focus:border-cyan-500/50 outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {activeOrders.length === 0 ? (
                            <div className="text-center py-4 text-zinc-500 text-sm italic">
                                No active pairs.
                            </div>
                        ) : (
                            // Deduplicate pairs from active orders
                            Array.from(new Set(activeOrders.map(o => o.pair))).map(pair => {
                                const order = activeOrders.find(o => o.pair === pair);
                                return (
                                    <div key={pair} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs">
                                                {pair.split('/')[0].substring(0,1)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{pair}</div>
                                                <div className="text-[10px] text-zinc-500">{order?.side} • Entry: {order?.entryPrice.toFixed(2)}</div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-bold font-mono ${order?.pnl && order.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {order?.pnl && order.pnl >= 0 ? '+' : ''}{order?.pnl.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* My Strategies Section */}
                <div className="glass rounded-xl overflow-hidden p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-zinc-100">My Strategies</h3>
                        <Link href="/strategy" className="p-1.5 bg-zinc-900 rounded-lg text-cyan-500 hover:bg-zinc-800 transition-colors">
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {runningStrategies.length === 0 ? (
                            <div className="text-center py-4 text-zinc-500 text-sm italic">
                                No active strategies.
                            </div>
                        ) : (
                            runningStrategies.map(strat => (
                                <div key={strat.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-sm">{strat.name}</div>
                                        <div className="text-[10px] text-zinc-500">{strat.groupOperator} Logic • {strat.groups.length} Groups</div>
                                    </div>
                                    <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/20 text-emerald-500 border border-emerald-900/30">
                                        ACTIVE
                                    </div>
                                </div>
                            ))
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