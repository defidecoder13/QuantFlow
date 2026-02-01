import { IndicatorConfig, IndicatorType } from "@/types/strategy";
import { Plus, Trash2, Settings, Save, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

const AVAILABLE_INDICATORS: { type: IndicatorType; label: string; defaultParams: any }[] = [
  { type: 'RSI', label: 'RSI', defaultParams: { period: 14 } },
  { type: 'EMA', label: 'EMA', defaultParams: { period: 20 } },
  { type: 'SMA', label: 'SMA', defaultParams: { period: 20 } },
  { type: 'MACD', label: 'MACD', defaultParams: { fast: 12, slow: 26, signal: 9 } },
  { type: 'BOLLINGER', label: 'Bollinger Bands', defaultParams: { period: 20, stdDev: 2 } },
  { type: 'ATR', label: 'ATR', defaultParams: { period: 14 } },
];

interface Props {
  indicators: IndicatorConfig[];
  onAdd: (indicator: IndicatorConfig) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, params: any) => void;
}

export const IndicatorManager = ({ indicators, onAdd, onRemove, onUpdate }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  // Store temp params while editing
  const [editParams, setEditParams] = useState<any>(null);

  const handleAdd = (type: IndicatorType, defaultParams: any) => {
    const newIndicator: IndicatorConfig = {
      id: `${type.toLowerCase()}-${uuidv4().slice(0, 4)}`,
      type,
      params: defaultParams
    };
    onAdd(newIndicator);
  };

  const startEditing = (ind: IndicatorConfig) => {
    setEditingId(ind.id);
    setEditParams({ ...ind.params });
  };

  const saveEdit = () => {
    if (editingId && editParams) {
      onUpdate(editingId, editParams);
      setEditingId(null);
      setEditParams(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditParams(null);
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-white">Available Indicators</h3>
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_INDICATORS.map((ind) => (
            <button
              key={ind.type}
              onClick={() => handleAdd(ind.type, ind.defaultParams)}
              className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-cyan-500/50 hover:bg-zinc-800 transition-all text-left"
            >
              <span className="text-sm font-medium text-zinc-300">{ind.label}</span>
              <Plus size={14} className="text-cyan-500" />
            </button>
          ))}
        </div>
      </div>

      <div className="glass p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4 text-white">Active Indicators</h3>
        {indicators.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No indicators added yet.</p>
        ) : (
          <div className="space-y-2">
            {indicators.map((ind) => (
              <div key={ind.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-cyan-900/30 flex items-center justify-center text-xs font-bold text-cyan-500">
                      {ind.type.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{ind.type}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">ID: {ind.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                     {editingId === ind.id ? (
                       <>
                         <button onClick={saveEdit} className="p-2 text-emerald-500 hover:bg-zinc-800 rounded">
                           <Save size={14} />
                         </button>
                         <button onClick={cancelEdit} className="p-2 text-rose-500 hover:bg-zinc-800 rounded">
                           <X size={14} />
                         </button>
                       </>
                     ) : (
                       <>
                         <button onClick={() => startEditing(ind)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded">
                           <Settings size={14} />
                         </button>
                         <button onClick={() => onRemove(ind.id)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-zinc-800 rounded">
                           <Trash2 size={14} />
                         </button>
                       </>
                     )}
                  </div>
                </div>
                
                {/* Params Area */}
                {editingId === ind.id ? (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                    {Object.keys(editParams || {}).map((key) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">{key}</label>
                        <input 
                          type="number"
                          value={editParams[key]}
                          onChange={(e) => setEditParams({ ...editParams, [key]: parseFloat(e.target.value) })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(ind.params).map(([k, v]) => (
                      <span key={k} className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        <span className="text-zinc-500 mr-1">{k}:</span>{v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
