'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { useStrategyStore } from '@/lib/strategy-store';
import { runBacktest, BacktestResult } from '@/lib/backtest-engine';
import { useState } from 'react';
import { Play, Calendar, TrendingUp, DollarSign, Activity, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function BacktestPage() {
  const strategies = useStrategyStore((state) => state.strategies);
  
  // Form State
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [pair, setPair] = useState<string>('BTC/USDT');
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [dateRange, setDateRange] = useState<string>('2023-10-01 to 2023-11-20');
  
  // Results State
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [history, setHistory] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRunTest = async () => {
    if (!selectedStrategyId) {
      alert("Please select a strategy first.");
      return;
    }
    
    setLoading(true);
    // Simulate network delay for "realism"
    await new Promise(resolve => setTimeout(resolve, 800));

    const strategy = strategies.find(s => s.id === selectedStrategyId);
    if (!strategy) return;

    const newResult = runBacktest(
      strategy,
      pair, 
      timeframe, 
      '2023-01-01', // Mock dates passed to engine
      '2023-02-01'
    );

    setResult(newResult);
    setHistory(prev => [newResult, ...prev]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Backtest Engine</h1>
              <p className="text-zinc-500">Simulate your strategies against historical market data.</p>
            </div>

            {/* Controls */}
            <div className="glass p-6 rounded-xl border border-zinc-800 grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Strategy</label>
                  <select 
                    value={selectedStrategyId}
                    onChange={(e) => setSelectedStrategyId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option value="">-- Select Strategy --</option>
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.groups.length} Groups)</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Pair</label>
                  <select 
                    value={pair}
                    onChange={(e) => setPair(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option>BTC/USDT</option>
                    <option>ETH/USDT</option>
                    <option>SOL/USDT</option>
                    <option>LINK/USDT</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 uppercase font-bold mb-2 block">Timeframe</label>
                  <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 outline-none focus:border-cyan-500/50 transition-all"
                  >
                    <option>15m</option>
                    <option>1h</option>
                    <option>4h</option>
                    <option>1d</option>
                  </select>
                </div>

                <button 
                  onClick={handleRunTest}
                  disabled={loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg p-3 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                >
                  {loading ? <Activity className="animate-spin" size={18} /> : <Play size={18} />}
                  Run Test
                </button>
            </div>

            {/* Results */}
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="glass p-5 rounded-xl border-l-4 border-emerald-500 bg-zinc-900/30">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Percent size={20} /></div>
                        <span className="text-xs text-zinc-500 uppercase font-bold">Win Rate</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-zinc-100">{result.winRate}%</p>
                  </div>
                  
                  <div className="glass p-5 rounded-xl border-l-4 border-cyan-500 bg-zinc-900/30">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500"><DollarSign size={20} /></div>
                        <span className="text-xs text-zinc-500 uppercase font-bold">Net Profit</span>
                    </div>
                    <p className={`text-3xl font-bold font-mono ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.netProfit >= 0 ? '+' : ''}{result.netProfit.toFixed(2)}
                    </p>
                    <span className="text-xs text-zinc-500">Base: $100</span>
                  </div>

                  <div className="glass p-5 rounded-xl border-l-4 border-purple-500 bg-zinc-900/30">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Activity size={20} /></div>
                        <span className="text-xs text-zinc-500 uppercase font-bold">Total Trades</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-zinc-100">{result.totalTrades}</p>
                  </div>

                  <div className="glass p-5 rounded-xl border-l-4 border-amber-500 bg-zinc-900/30">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><TrendingUp size={20} /></div>
                        <span className="text-xs text-zinc-500 uppercase font-bold">Profit Factor</span>
                    </div>
                    <p className="text-3xl font-bold font-mono text-zinc-100">{result.profitFactor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="lg:col-span-2 glass p-6 rounded-xl border border-zinc-800">
                      <h3 className="font-bold text-zinc-400 mb-6 flex items-center gap-2"><TrendingUp size={16} /> Equity Curve</h3>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equityCurve}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                                <YAxis stroke="#52525b" fontSize={12} domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                    itemStyle={{ color: '#22d3ee' }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Trades Table */}
                    <div className="glass p-6 rounded-xl border border-zinc-800 flex flex-col h-[380px]">
                      <h3 className="font-bold text-zinc-400 mb-4 flex items-center gap-2"><Activity size={16} /> Trade Log</h3>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {result.trades.map((trade) => (
                           <div key={trade.id} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-center justify-between text-sm">
                              <div>
                                <div className={`font-bold ${trade.status === 'WIN' ? 'text-emerald-500' : 'text-rose-500'}`}>{trade.status}</div>
                                <div className="text-[10px] text-zinc-500">{trade.exitDate}</div>
                              </div>
                              <div className="text-right">
                                <div className={`font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-zinc-500">{trade.type} @ {trade.entryPrice.toFixed(2)}</div>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                </div>

              </div>
            ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-zinc-600 space-y-4 border-2 border-dashed border-zinc-900 rounded-xl">
                    <Activity size={48} className="opacity-20" />
                    <p>Select a strategy and click Run Test to see results</p>
                </div>
            )}

            {/* History */}
             {history.length > 0 && (
                <div className="glass p-6 rounded-xl border border-zinc-800">
                    <h3 className="font-bold text-zinc-400 mb-4">Historical Tests</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900/50 text-zinc-500 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Strategy</th>
                                    <th className="p-3">Pair</th>
                                    <th className="p-3">Result</th>
                                    <th className="p-3">Win Rate</th>
                                    <th className="p-3">Trades</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {history.map((h) => (
                                    <tr key={h.scanId} className="hover:bg-zinc-900/30 transition-colors cursor-pointer" onClick={() => setResult(h)}>
                                        <td className="p-3 font-medium text-white">{h.strategyName}</td>
                                        <td className="p-3 text-zinc-400">{h.pair} / {h.timeframe}</td>
                                        <td className={`p-3 font-mono font-bold ${h.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {h.netProfit >= 0 ? '+' : ''}{h.netProfit.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-zinc-300">{h.winRate}%</td>
                                        <td className="p-3 text-zinc-500">{h.totalTrades}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             )}

          </div>
        </main>
      </div>
    </div>
  );
}