import { Settings as SettingsIcon } from 'lucide-react';

export const StrategyRuleBuilder = () => {
  return (
    <div className="glass p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Rule Builder</h3>
        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md transition-colors">
          + Add Condition
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <select className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm">
            <option>RSI</option>
            <option>MACD</option>
            <option>EMA</option>
            <option>Bollinger Bands</option>
          </select>
          
          <select className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm">
            <option>&lt;</option>
            <option>&gt;</option>
            <option>=</option>
            <option>&lt;=</option>
            <option>&gt;=</option>
          </select>
          
          <input 
            type="number" 
            placeholder="Value" 
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm" 
          />
          
          <button className="p-2 text-zinc-500 hover:text-zinc-300">
            <SettingsIcon size={16} />
          </button>
        </div>
        
        <div className="text-center my-2 text-zinc-500 text-sm">AND</div>
        
        <div className="flex items-center gap-4">
          <select className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm">
            <option>Volume</option>
            <option>Price</option>
            <option>Stochastic</option>
          </select>
          
          <select className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm">
            <option>&gt;</option>
            <option>&lt;</option>
            <option>=</option>
            <option>&lt;=</option>
            <option>&gt;=</option>
          </select>
          
          <input 
            type="number" 
            placeholder="Value" 
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm" 
          />
          
          <button className="p-2 text-zinc-500 hover:text-zinc-300">
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};