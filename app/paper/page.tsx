'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { PaperChart } from '@/features/paper/paper-chart';
import { usePaperStore } from '@/lib/paper-store';
import { useStrategyStore } from '@/lib/strategy-store';
import { useEffect, useState } from 'react';
import { Wallet, Plus, Play, StopCircle, RefreshCw, TrendingUp } from 'lucide-react';

export default function PaperPage() {
  const { balance, orders, addFunds, activeStrategies, deployStrategy, stopStrategy, placeOrder, closeOrder } = usePaperStore();
  const strategies = useStrategyStore((state) => state.strategies);

  const activeOrders = orders.filter(o => o.status === 'OPEN');
  const closedOrders = orders.filter(o => o.status === 'CLOSED');
  const unrealizedPnL = activeOrders.reduce((acc, o) => acc + o.pnl, 0);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              
              {/* Left Column: Chart & Orders */}
              <div className="lg:col-span-2 flex flex-col gap-6 h-full">
                <div className="h-[400px]">
                  <PaperChart />
                </div>
                
                {/* Orders Dashboard */}
                <div className="flex-1 glass border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <h3 className="font-bold text-zinc-400 flex items-center gap-2"><RefreshCw size={16} /> Live Positions</h3>
                        <span className="text-xs text-zinc-500">{activeOrders.length} Open</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {activeOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                                <p>No open positions.</p>
                                <p className="text-xs">Deploy a strategy to start trading.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950/50 text-xs text-zinc-500 uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">Strategy</th>
                                        <th className="p-3">Pair</th>
                                        <th className="p-3">Entry</th>
                                        <th className="p-3">Current</th>
                                        <th className="p-3">PnL</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {activeOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-zinc-900/30">
                                            <td className="p-3 font-medium">{order.strategyName}</td>
                                            <td className="p-3 text-zinc-400">{order.pair}</td>
                                            <td className="p-3 font-mono text-zinc-500">${order.entryPrice.toFixed(2)}</td>
                                            <td className="p-3 font-mono">${order.currentPrice.toFixed(2)}</td>
                                            <td className={`p-3 font-mono font-bold ${order.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {order.pnl >= 0 ? '+' : ''}{order.pnl.toFixed(2)} <span className="text-[10px] opacity-70">({order.pnlPercent.toFixed(2)}%)</span>
                                            </td>
                                            <td className="p-3">
                                                <button 
                                                  onClick={() => closeOrder(order.id)}
                                                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white"
                                                >
                                                    Close
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
              </div>

              {/* Right Column: Wallet & Deployment */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Wallet Card */}
                <div className="glass p-5 rounded-xl space-y-4 border-l-4 border-cyan-500">
                  <div className="flex justify-between items-start">
                     <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Wallet size={14} /> Paper Wallet</h3>
                     <button onClick={() => addFunds(10000)} className="p-1 hover:bg-zinc-800 rounded-full text-cyan-500" title="Add $10k">
                         <Plus size={16} />
                     </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold font-mono text-white">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-zinc-500">Available Buying Power</span>
                  </div>
                  <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">Unrealized PnL</span>
                      <span className={`font-mono font-bold text-sm ${unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">Total Trades</span>
                      <span className="font-mono font-bold text-sm text-zinc-300">{closedOrders.length}</span>
                    </div>
                  </div>
                </div>

                {/* Active Strategies */}
                <div className="glass p-5 rounded-xl border border-zinc-800 flex flex-col h-[400px]">
                    <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2"><Play size={14} /> Active Deployments</h3>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                        {strategies.map(strat => {
                            const isRunning = activeStrategies.includes(strat.id);
                            return (
                                <div key={strat.id} className={`p-3 rounded-lg border flex items-center justify-between transition-all ${isRunning ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-zinc-900/30 border-zinc-800'}`}>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-sm truncate">{strat.name}</h4>
                                        <p className="text-[10px] text-zinc-500">{strat.groupOperator} • {strat.groups.length} Groups</p>
                                    </div>
                                    <button 
                                        onClick={() => isRunning ? stopStrategy(strat.id) : deployStrategy(strat.id)}
                                        className={`p-2 rounded-lg transition-colors ${isRunning ? 'text-rose-500 hover:bg-rose-900/20' : 'text-emerald-500 hover:bg-emerald-900/20'}`}
                                    >
                                        {isRunning ? <StopCircle size={18} /> : <Play size={18} />}
                                    </button>
                                </div>
                            );
                        })}
                        {strategies.length === 0 && (
                            <p className="text-xs text-zinc-500 italic text-center py-4">Create strategies to deploy them here.</p>
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