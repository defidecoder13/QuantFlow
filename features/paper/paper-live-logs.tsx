import React from 'react';
import { useTradingStore } from '@/store';
import { Terminal } from 'lucide-react';

export const PaperLiveLogs = () => {
  const logs = useTradingStore(state => state.logs);

  return (
    <div className="glass rounded-xl h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Live System Logs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-zinc-500 font-mono">REC</span>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-1">
        {logs.map((log, idx) => (
          <div key={idx} className={`${idx === 0 ? 'text-cyan-400' : 'text-zinc-400'} border-l-2 border-transparent hover:border-zinc-700 pl-2`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};