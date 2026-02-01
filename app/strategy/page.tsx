'use client';

import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { StrategyBuilder } from '@/components/features/strategy/strategy-builder';
import { useState, useEffect, Suspense } from 'react';
import { PlusCircle, LayoutGrid, ArrowLeft, Trash2 } from 'lucide-react';
import { useStrategyStore } from '@/lib/strategy-store';
import { useSearchParams, useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

function StrategyContent() {
  const [view, setView] = useState<'initial' | 'create' | 'list'>('initial');
  const { strategies, deleteStrategy } = useStrategyStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const editId = searchParams.get('edit');
  const strategyToEdit = editId ? strategies.find(s => s.id === editId) : undefined;

  useEffect(() => {
    if (editId) {
      setView('create');
    }
  }, [editId]);

  const handleBack = () => {
    setView('initial');
    router.push('/strategy'); // Clear params
  };

  const openEditor = (id?: string) => {
    if (id) {
      router.push(`/strategy?edit=${id}`);
    } else {
      router.push('/strategy');
      setView('create');
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this strategy? This action cannot be undone.')) {
        deleteStrategy(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
             
             {view === 'initial' && (
               <div className="flex flex-col items-center justify-center h-[calc(80vh-100px)] space-y-12">
                 <div className="text-center space-y-4">
                   <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">Strategy Lab</h1>
                   <p className="text-zinc-400 text-lg max-w-lg mx-auto">Design, backtest, and deploy algorithmic trading strategies with our advanced visual builder.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                   <button 
                     onClick={() => openEditor()}
                     className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 p-8 rounded-2xl text-left transition-all hover:shadow-2xl hover:shadow-cyan-900/20"
                   >
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                       <PlusCircle size={120} />
                     </div>
                     <div className="relative z-10 space-y-4">
                       <div className="w-12 h-12 rounded-lg bg-cyan-900/30 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                         <PlusCircle size={24} />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-white mb-2">Create Strategy</h3>
                         <p className="text-zinc-500 text-sm">Start from scratch using our visual logic builder. Combine indicators and patterns.</p>
                       </div>
                     </div>
                   </button>

                   <button 
                     onClick={() => setView('list')}
                     className="group relative overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 p-8 rounded-2xl text-left transition-all hover:shadow-2xl hover:shadow-purple-900/20"
                   >
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                       <LayoutGrid size={120} />
                     </div>
                     <div className="relative z-10 space-y-4">
                       <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                         <LayoutGrid size={24} />
                       </div>
                       <div>
                         <h3 className="text-2xl font-bold text-white mb-2">View Strategies</h3>
                         <p className="text-zinc-500 text-sm">Access your library of saved strategies. Edit, clone, or analyze performance.</p>
                       </div>
                     </div>
                   </button>
                 </div>
               </div>
             )}

             {view === 'create' && (
               <div className="space-y-4">
                 <button onClick={handleBack} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
                   <ArrowLeft size={16} /> Back to Hub
                 </button>
                 {/* Key forces remount when switching strategies */}
                 <StrategyBuilder 
                   key={editId || 'new'} 
                   onBack={handleBack} 
                   initialState={strategyToEdit}
                   strategyId={editId || undefined}
                 />
               </div>
             )}

             {view === 'list' && (
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setView('initial')} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 hover:text-white">
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold">My Strategies</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {strategies.length === 0 ? (
                      <div className="col-span-3 text-center py-20 text-zinc-500 italic border border-dashed border-zinc-900 rounded-xl">
                        No strategies found. create one to get started.
                      </div>
                   ) : (
                     strategies.map((strat) => (
                       <div onClick={() => openEditor(strat.id)} key={strat.id} className="glass p-6 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group hover:bg-zinc-900/50">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-cyan-500/30 transition-colors">
                              <span className="font-bold text-zinc-500 group-hover:text-cyan-500">{strat.name.substring(0,2).toUpperCase()}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded font-medium ${strat.isActive ? 'bg-emerald-900/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                              {strat.isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{strat.name}</h3>
                          <p className="text-xs text-zinc-500 mb-4">{strat.groupOperator} Logic • SL: {strat.risk.stopLoss}%</p>
                          <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-800 group-hover:border-zinc-700">
                            <span>Logic Groups: {strat.groups.length}</span>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => handleDelete(e, strat.id)}
                                    className="text-zinc-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Strategy"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <span className="text-cyan-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Edit Strategy &rarr;</span>
                            </div>
                          </div>
                       </div>
                     ))
                   )}
                   
                   <button onClick={() => openEditor()} className="border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 transition-all min-h-[200px]">
                     <PlusCircle size={32} className="mb-2 opacity-50" />
                     <span className="text-sm font-medium">Create New</span>
                   </button>
                 </div>
               </div>
             )}

          </div>
        </main>
      </div>
      
      {/* Bottom Status Bar */}
      <footer className="h-8 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur px-4 flex items-center justify-between text-[10px] text-zinc-500 font-medium z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>API CONNECTED: BINANCE</span>
          </div>
          <span>LATENCY: 42ms</span>
          <span>UPTIME: 99.9%</span>
        </div>
        <div className="flex items-center gap-4">
          <span>MARKET: BTC/USDT <span className="text-emerald-500 font-mono">$37,450.22 (+1.4%)</span></span>
          <span>© 2023 QUANTFLOW INC.</span>
        </div>
      </footer>
    </div>
  );
}

export default function StrategyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading Strategy Hub...</div>}>
            <StrategyContent />
        </Suspense>
    );
}