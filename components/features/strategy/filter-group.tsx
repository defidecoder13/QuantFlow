import { FilterGroup as FilterGroupType, StrategyFilter, OperatorType } from '@/types/strategy-builder';
import { Trash2, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SIGNAL_CATEGORIES } from '@/lib/signal-categories';

interface Props {
  group: FilterGroupType;
  isActive: boolean;
  onUpdate: (updates: Partial<FilterGroupType>) => void;
  onRemove: () => void;
  onRemoveFilter: (filterId: string) => void;
  onSelectGroup: () => void;
}

export const FilterGroup = ({ group, isActive, onUpdate, onRemove, onRemoveFilter, onSelectGroup }: Props) => {
  
  const getSignalDef = (id: string) => {
     for (const cat of SIGNAL_CATEGORIES) {
        const s = cat.signals.find(sig => sig.id === id);
        if (s) return s;
     }
     return { id, label: id, type: 'NEUTRAL' };
  };

  const getColors = (type: string) => {
      if (type === 'BULLISH') return 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200';
      if (type === 'BEARISH') return 'bg-rose-950/20 border-rose-900/30 text-rose-200';
      return 'bg-zinc-900/50 border-zinc-800 text-zinc-300';
  };

  const getTypeIcon = (type: string) => {
    if (type === 'BULLISH') return <TrendingUp size={12} className="text-emerald-500" />;
    if (type === 'BEARISH') return <TrendingDown size={12} className="text-rose-500" />;
    return <Minus size={12} className="text-zinc-500" />;
  };

  return (
    <div 
      className={`
        rounded-xl border transition-all duration-200 relative
        ${isActive ? 'bg-zinc-900/80 border-cyan-500/50 ring-1 ring-cyan-900/50' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'}
      `}
      onClick={onSelectGroup}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
        <select
          value={group.operator}
          onChange={(e) => onUpdate({ operator: e.target.value as OperatorType })}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500/50"
          onClick={(e) => e.stopPropagation()}
        >
          <option value="AND">All filters must match (AND)</option>
          <option value="OR">At least one matches (OR)</option>
        </select>

        <div className="flex items-center gap-2">
          {isActive && <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider px-2">Editing</span>}
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Filters List */}
      <div className="p-4 space-y-2 min-h-[100px]">
        {group.filters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-zinc-600 gap-2 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/30">
            <span className="text-xs">No filters in this group.</span>
            <span className="text-[10px] bg-cyan-900/20 text-cyan-500 px-2 py-0.5 rounded">Select from library on left</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {group.filters.map(filter => {
              const sig = getSignalDef(filter.signal);
              return (
                <div 
                    key={filter.id} 
                    className={`
                    flex items-center gap-2 pl-2 pr-1 py-1 rounded-md border text-sm transition-colors
                    ${getColors(sig.type as string)}
                    `}
                >
                    {getTypeIcon(sig.type as string)}
                    <span className="text-xs font-medium">{sig.label}</span>
                    <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveFilter(filter.id); }}
                    className="p-1 hover:bg-black/20 rounded-full"
                    >
                    <X size={12} />
                    </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
