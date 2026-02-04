'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardKPIs } from '@/features/dashboard/dashboard-kpis';
import { DashboardEquity } from '@/features/dashboard/dashboard-equity';
import { usePaperStore } from '@/lib/paper-store';
import Link from 'next/link';
import { Search, Filter, Download, MoreHorizontal, Wallet, Activity, ArrowRight, TrendingUp, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStrategyStore } from '@/lib/strategy-store';
import { ActivePairRow } from '@/components/layout/active-pair-row';

export default function Home() {
  const router = useRouter();
  const { balance, orders, activeStrategies } = usePaperStore();
  const { strategies } = useStrategyStore();
  
  const [query, setQuery] = useState('');
  const [allPairs, setAllPairs] = useState<string[]>([]);
  const [pairsLoaded, setPairsLoaded] = useState(false);
  
  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'LINK/USDT', 'AVAX/USDT'];
  
  const formatPairLabel = (symbol: string) => {
    if (!symbol || symbol.length <= 4) return symbol;
    const base = symbol.substring(0, symbol.length - 4);
    const quote = symbol.slice(-4);
    return `${base}/${quote}`;
  };

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
              <div className="flex flex-col gap-4 md:hidden">
                
                {/* Active Pairs Section (Synced with Sidebar) */}
                <div className="glass rounded-xl overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                             <TrendingUp size={14} /> Active Pairs
                        </h3>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search pairs..." 
                            value={query}
                            onChange={async (e) => {
                                const v = e.target.value;
                                setQuery(v);
                                if (!pairsLoaded && v.trim().length > 0) {
                                    try {
                                    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
                                    const data: any = await res.json();
                                    const symbols = (data && data.symbols) || [];
                                    const usdtPairs = (symbols as any[])
                                        .filter((s) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
                                        .map((s) => s.symbol as string);
                                    const unique = Array.from(new Set(usdtPairs as string[]));
                                    setAllPairs(unique);
                                    setPairsLoaded(true);
                                    } catch (err) {
                                    console.error('Mobile fetchBinancePairs error:', err);
                                    }
                                }
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 text-zinc-200"
                        />
                         {query && allPairs.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 z-20 bg-zinc-900 border border-zinc-800 rounded-md shadow-sm max-h-60 overflow-auto">
                            {allPairs
                                .filter((p) => p.toLowerCase().includes(query.toLowerCase()))
                                .slice(0, 50)
                                .map((p) => (
                                <div
                                    key={p}
                                    className="px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                                    onClick={() => {
                                        router.push(`/market?pair=${p}`);
                                        setQuery(''); // Clear search on select
                                    }}
                                >
                                    {formatPairLabel(p)}
                                </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-1">
                        {pairs.map((pair) => (
                           <ActivePairRow key={pair} label={pair} />
                        ))}
                    </div>
                </div>

                {/* My Strategies Section (Synced with Sidebar style) */}
                <div className="glass rounded-xl overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                             <Cpu size={14} /> My Strategies
                        </h3>
                        <Link href="/strategy" className="p-1.5 bg-zinc-900 rounded-lg text-cyan-500 hover:bg-zinc-800 transition-colors">
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="space-y-1">
                        {strategies.length === 0 ? (
                            <div className="text-center py-4 text-zinc-500 text-sm italic">
                                No strategies created.
                            </div>
                        ) : (
                            strategies.map(strat => (
                                <div 
                                    key={strat.id} 
                                    onClick={() => router.push(`/strategy?edit=${strat.id}`)}
                                    className="px-2 py-2 group cursor-pointer hover:bg-zinc-900/50 rounded-md transition-all border border-transparent hover:border-zinc-800"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-zinc-200 truncate">{strat.name}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${strat.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                    <span>{strat.groupOperator} Logic</span>
                                    <span className="font-mono">RISK: {strat.risk.stopLoss}%</span>
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