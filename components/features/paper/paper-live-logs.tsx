import { useTradingStore } from '@/store';

export const PaperLiveLogs = () => {
  const { logs } = useTradingStore();

  return (
    <div className="glass rounded-xl h-full overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-widest">Live Logs</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-80">
        {logs.map((log, index) => (
          <div key={index} className="text-xs font-mono text-zinc-400 py-1 border-b border-zinc-800/30 last:border-0">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};