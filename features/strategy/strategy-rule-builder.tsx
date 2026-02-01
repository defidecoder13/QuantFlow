import { useStrategyReducer } from "./hooks/use-strategy-reducer";
import { IndicatorManager } from "./components/indicator-manager";
import { LogicBuilder } from "./components/logic-builder";
import { Save, PlayCircle } from "lucide-react";

export const StrategyRuleBuilder = () => {
  const { strategy, dispatch } = useStrategyReducer();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      
      {/* Left Panel: Indicators */}
      <div className="lg:col-span-3 space-y-6">
        <IndicatorManager 
          indicators={strategy.indicators} 
          onAdd={(ind) => dispatch({ type: 'ADD_INDICATOR', indicator: ind })}
          onRemove={(id) => dispatch({ type: 'REMOVE_INDICATOR', id })}
          onUpdate={(id, params) => dispatch({ type: 'UPDATE_INDICATOR', id, params })}
        />
        
        {/* Risk Settings (Moving here for better layout) */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-white">Risk Management</h3>
          <div className="space-y-3">
             <div>
               <label className="text-xs text-zinc-500 uppercase font-bold">Stop Loss (%)</label>
               <input 
                 type="number" 
                 value={strategy.risk.stopLossPercent} 
                 onChange={(e) => dispatch({ type: 'UPDATE_RISK', field: 'stopLossPercent', value: parseFloat(e.target.value) })}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm mt-1" 
               />
             </div>
             <div>
               <label className="text-xs text-zinc-500 uppercase font-bold">Take Profit (%)</label>
               <input 
                 type="number" 
                 value={strategy.risk.takeProfitPercent} 
                 onChange={(e) => dispatch({ type: 'UPDATE_RISK', field: 'takeProfitPercent', value: parseFloat(e.target.value) })}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm mt-1" 
               />
             </div>
             <div>
               <label className="text-xs text-zinc-500 uppercase font-bold">Pos Size (%)</label>
               <input 
                 type="number" 
                 value={strategy.risk.positionSizePercent} 
                 onChange={(e) => dispatch({ type: 'UPDATE_RISK', field: 'positionSizePercent', value: parseFloat(e.target.value) })}
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm mt-1" 
               />
             </div>
          </div>
        </div>
      </div>

      {/* Main Panel: Logic Logic */}
      <div className="lg:col-span-9 space-y-8">
        
        {/* Header */}
        <div className="glass p-6 rounded-xl flex items-center justify-between">
          <div>
            <input 
              value={strategy.name} 
              onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
              className="text-2xl font-bold bg-transparent outline-none text-white placeholder-zinc-600 w-full"
              placeholder="Strategy Name"
            />
            <p className="text-zinc-500 text-sm mt-1">Define your entry and exit logic below.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors font-medium text-sm">
              <PlayCircle size={16} /> Run Backtest
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold text-sm shadow-lg shadow-cyan-900/20">
              <Save size={16} /> Save Strategy
            </button>
          </div>
        </div>

        {/* Entry Logic */}
        <LogicBuilder 
          root={strategy.entryRules} 
          rulesType="entry"
          dispatch={dispatch} 
          indicators={strategy.indicators}
        />

        {/* Exit Logic */}
        <div className="pt-8 border-t border-zinc-800/50">
          <LogicBuilder 
            root={strategy.exitRules} 
            rulesType="exit"
            dispatch={dispatch} 
            indicators={strategy.indicators}
          />
        </div>

      </div>
    </div>
  );
};