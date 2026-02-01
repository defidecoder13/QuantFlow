import { RiskSettings } from "@/types/strategy-builder";

interface Props {
  risk: RiskSettings;
  onChange: (updates: Partial<RiskSettings>) => void;
}

export const RiskSection = ({ risk, onChange }: Props) => {
  return (
    <div className="bg-zinc-950 border-t border-zinc-800 p-6">
       <div className="max-w-4xl mx-auto">
         <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Risk Management</h3>
         <div className="grid grid-cols-3 gap-6">
           <div className="space-y-2">
             <label className="text-xs font-semibold text-zinc-300">Stop Loss (%)</label>
             <input 
               type="number" 
               value={risk.stopLoss} 
               onChange={(e) => onChange({ stopLoss: parseFloat(e.target.value) || 0 })}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
               placeholder="2.0"
             />
           </div>
           
           <div className="space-y-2">
             <label className="text-xs font-semibold text-zinc-300">Take Profit (%)</label>
             <input 
               type="number" 
               value={risk.takeProfit} 
               onChange={(e) => onChange({ takeProfit: parseFloat(e.target.value) || 0 })}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
               placeholder="5.0"
             />
           </div>
           
           <div className="space-y-2">
             <label className="text-xs font-semibold text-zinc-300">Position Size (%)</label>
             <input 
               type="number" 
               value={risk.positionSize} 
               onChange={(e) => onChange({ positionSize: parseFloat(e.target.value) || 0 })}
               className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
               placeholder="10.0"
             />
           </div>
         </div>
       </div>
    </div>
  );
};
