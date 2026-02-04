"use client";
import Link from 'next/link';
import { Search, TrendingUp, Cpu, Hash, LayoutDashboard, Zap, History, PlayCircle, FileText, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { ActivePairRow } from './active-pair-row';
import { useStrategyStore } from '@/lib/strategy-store';
import { usePaperStore } from '@/lib/paper-store';

import { StrategyRunner } from '@/components/features/strategy/strategy-runner';

export const Sidebar = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [allPairs, setAllPairs] = useState<string[]>([]);
  const [pairsLoaded, setPairsLoaded] = useState(false);
  const { strategies, fetchStrategies } = useStrategyStore();
  const { fetchOrders } = usePaperStore();

  useEffect(() => {
    // Initial Data Sync
    fetchStrategies();
    fetchOrders();
  }, []);

  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'LINK/USDT', 'AVAX/USDT'];

  const formatPairLabel = (symbol: string) => {
    if (!symbol || symbol.length <= 4) return symbol;
    const base = symbol.substring(0, symbol.length - 4);
    const quote = symbol.slice(-4);
    return `${base}/${quote}`;
  };

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex-col h-full overflow-y-auto hidden md:flex">
      <StrategyRunner />
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
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
                  console.error('Sidebar fetchBinancePairs error:', err);
                }
              }
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
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
      </div>

      <div className="flex-1">

        <section className="p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <TrendingUp size={14} /> Active Pairs
          </h3>
          <div className="space-y-1">
            {pairs.map((pair) => (
              <ActivePairRow key={pair} label={pair} />
            ))}
          </div>
        </section>

        <section className="p-4 border-t border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
            <Cpu size={14} /> My Strategies
          </h3>
          <div className="space-y-1">
            {strategies.length === 0 ? (
               <p className="text-[10px] text-zinc-500 italic px-2">No strategies created.</p>
            ) : (
                strategies.map((strat) => (
                  <div 
                    key={strat.id} 
                    onClick={() => router.push(`/strategy?edit=${strat.id}`)}
                    className="px-2 py-2 group cursor-pointer hover:bg-zinc-900 rounded-md transition-all"
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
        </section>

      </div>


    </aside>
  );
};
