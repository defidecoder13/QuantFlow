import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SIGNAL_CATEGORIES } from '@/lib/signal-categories';

interface Props {
  onSelect: (signalId: string, categoryId: string) => void;
}

export const SignalLibrary = ({ onSelect }: Props) => {
  const [expanded, setExpanded] = useState<string[]>(['RSI', 'MACD']);

  const toggle = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'BULLISH') return <TrendingUp size={12} />;
    if (type === 'BEARISH') return <TrendingDown size={12} />;
    return <Minus size={12} />;
  };

  const getColors = (type: string) => {
      if (type === 'BULLISH') return 'text-emerald-500 border-emerald-900/30 bg-emerald-900/10 group-hover:bg-emerald-900/20';
      if (type === 'BEARISH') return 'text-rose-500 border-rose-900/30 bg-rose-900/10 group-hover:bg-rose-900/20';
      return 'text-zinc-400 border-zinc-800 bg-zinc-900 group-hover:bg-zinc-800';
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-bold text-zinc-100">Signal Library</h3>
        <p className="text-xs text-zinc-500 mt-1">Select logic to add to your strategy.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {SIGNAL_CATEGORIES.map(cat => (
          <div key={cat.id} className="border border-zinc-900 rounded-lg overflow-hidden">
            <button 
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors text-left"
            >
              <span className="text-sm font-semibold text-zinc-300">{cat.label}</span>
              {expanded.includes(cat.id) ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
            </button>
            
            {expanded.includes(cat.id) && (
              <div className="bg-zinc-950/50 p-2 space-y-1">
                {cat.signals.map(signal => (
                  <button 
                    key={signal.id}
                    onClick={() => onSelect(signal.id, cat.id)}
                    className={`w-full flex items-center justify-between p-2 pl-3 rounded-md border group transition-all text-left ${getColors(signal.type)}`}
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(signal.type)}
                      <span className="text-xs font-bold">{signal.label}</span>
                    </div>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
