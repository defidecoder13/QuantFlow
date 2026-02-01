import { Condition, ConditionGroup, IndicatorConfig, Operand, ComparisonOperator } from "@/types/strategy";
import { Plus, Trash, Trash2, Copy, Combine, MoreHorizontal, Settings2 } from "lucide-react";

interface LogicBuilderProps {
  root: ConditionGroup;
  indicators: IndicatorConfig[];
  rulesType: 'entry' | 'exit';
  dispatch: any; // Using loose type for dispatch for simplicity here, ideally purely typed
}

// --- Operand Selector ---
const OperandSelector = ({ value, onChange, indicators }: { value: Operand, onChange: (val: Operand) => void, indicators: IndicatorConfig[] }) => {
  const type = value.type;

  return (
    <div className="flex bg-zinc-900 border border-zinc-700 rounded-md overflow-hidden">
       {/* Type Switcher */}
       <select 
         className="bg-zinc-800 text-xs font-bold text-zinc-300 p-2 outline-none border-r border-zinc-700"
         value={type}
         onChange={(e) => {
           const newType = e.target.value as any;
           if(newType === 'constant') onChange({ type: 'constant', value: 0 });
           else if(newType === 'indicator') onChange({ type: 'indicator', indicatorId: indicators[0]?.id || '', sourceVal: 'value' });
           else if(newType === 'pattern') onChange({ type: 'pattern', patternName: 'Bullish Engulfing' });
         }}
       >
         <option value="indicator">Indicator</option>
         <option value="constant">Value</option>
         <option value="pattern">Pattern</option>
       </select>

       {/* Value Input based on Type */}
       {type === 'constant' && (
         <input 
           type="number" 
           className="bg-transparent text-sm text-white p-2 w-24 outline-none"
           value={value.value}
           onChange={(e) => onChange({ ...value, value: parseFloat(e.target.value) })}
         />
       )}

       {type === 'indicator' && (
         <select 
           className="bg-transparent text-sm text-white p-2 w-32 outline-none"
           value={value.indicatorId}
           onChange={(e) => onChange({ ...value, indicatorId: e.target.value })}
         >
           {indicators.length === 0 && <option value="">No Indicators</option>}
           {indicators.map(ind => (
             <option key={ind.id} value={ind.id}>{ind.type} ({ind.id})</option>
           ))}
         </select>
       )}
       
       {type === 'pattern' && (
         <select
            className="bg-transparent text-sm text-white p-2 w-32 outline-none"
            value={value.patternName}
            onChange={(e) => onChange({ ...value, patternName: e.target.value })}
         >
           <option>Bullish Engulfing</option>
           <option>Bearish Engulfing</option>
           <option>Hammer</option>
           <option>Doji</option>
           <option>Shooting Star</option>
           <option>Morning Star</option>
         </select>
       )}
    </div>
  );
};

// --- Condition Row ---
const ConditionRow = ({ 
  condition, 
  indicators,
  onUpdate,
  onDelete 
}: { 
  condition: Condition; 
  indicators: IndicatorConfig[];
  onUpdate: (updates: Partial<Condition>) => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
      {/* Left Operand */}
      <OperandSelector 
        value={condition.left} 
        indicators={indicators} 
        onChange={(op) => onUpdate({ left: op })}
      />

      {/* Operator */}
      <select 
        className="bg-zinc-800 border border-zinc-700 text-cyan-500 font-bold text-sm rounded p-2 outline-none"
        value={condition.operator}
        onChange={(e) => onUpdate({ operator: e.target.value as ComparisonOperator })}
      >
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&ge;</option>
        <option value="<=">&le;</option>
        <option value="==">=</option>
        <option value="!=">!=</option>
        <option value="CROSSES_ABOVE">CROSSES ABOVE</option>
        <option value="CROSSES_BELOW">CROSSES BELOW</option>
      </select>

      {/* Right Operand */}
      <OperandSelector 
        value={condition.right} 
        indicators={indicators} 
        onChange={(op) => onUpdate({ right: op })}
      />

      <div className="flex-1" />

      {/* Action */}
      <button onClick={onDelete} className="text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
        <Trash2 size={16} />
      </button>
    </div>
  );
};

// --- Recursive Group ---
const RuleGroup = ({ 
  group, 
  dispatch,
  rulesType,
  indicators,
  isRoot = false
}: { 
  group: ConditionGroup; 
  dispatch: any; 
  rulesType: 'entry' | 'exit';
  indicators: IndicatorConfig[];
  isRoot?: boolean;
}) => {
  
  const handleAddCondition = () => dispatch({ type: 'ADD_CONDITION', parentId: group.id, rulesType });
  const handleAddGroup = () => dispatch({ type: 'ADD_GROUP', parentId: group.id, rulesType });
  const handleDeleteGroup = () => (!isRoot) && dispatch({ type: 'DELETE_NODE', id: group.id, rulesType });
  const toggleOperator = () => dispatch({ 
    type: 'UPDATE_GROUP_OPERATOR', 
    id: group.id, 
    rulesType, 
    operator: group.operator === 'AND' ? 'OR' : 'AND' 
  });

  return (
    <div className={`
      flex flex-col gap-3 rounded-xl border p-4 transition-all
      ${isRoot ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-700/50 bg-zinc-900/20 ml-6'}
    `}>
      {/* Group Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
           <button 
             onClick={toggleOperator}
             className={`
               px-3 py-1 rounded text-xs font-bold transition-colors
               ${group.operator === 'AND' ? 'bg-cyan-500/20 text-cyan-500' : 'bg-amber-500/20 text-amber-500'}
             `}
           >
             {group.operator}
           </button>
           {!isRoot && <span className="text-xs text-zinc-500 font-mono">GROUP</span>}
         </div>

         <div className="flex items-center gap-2">
            <button onClick={handleAddCondition} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Add Condition">
              <Plus size={16} />
            </button>
            <button onClick={handleAddGroup} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded" title="Add Nested Group">
              <Combine size={16} />
            </button>
            {!isRoot && (
              <button onClick={handleDeleteGroup} className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-zinc-800 rounded">
                <Trash size={16} />
              </button>
            )}
         </div>
      </div>

      {/* Children */}
      <div className="flex flex-col gap-2">
        {group.conditions.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-zinc-800/50 rounded-lg text-zinc-600 text-xs">
            Empty Group. Add a condition.
          </div>
        )}
        {group.conditions.map(child => {
          if (child.type === 'group') {
            return (
              <RuleGroup 
                key={child.id} 
                group={child} 
                dispatch={dispatch} 
                rulesType={rulesType} 
                indicators={indicators} 
              />
            );
          } else {
             return (
               <ConditionRow 
                 key={child.id} 
                 condition={child} 
                 indicators={indicators}
                 onUpdate={(updates) => dispatch({ type: 'UPDATE_CONDITION', id: child.id, rulesType, updates })}
                 onDelete={() => dispatch({ type: 'DELETE_NODE', id: child.id, rulesType })}
               />
             );
          }
        })}
      </div>
    </div>
  );
};

export const LogicBuilder = ({ root, rulesType, dispatch, indicators }: LogicBuilderProps) => {
  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between">
         <h3 className="text-lg font-bold text-white uppercase tracking-wider">
           {rulesType === 'entry' ? '🟢 Buy Signals' : '🔴 Sell Signals'}
         </h3>
       </div>
       <RuleGroup 
         isRoot 
         group={root} 
         dispatch={dispatch} 
         rulesType={rulesType} 
         indicators={indicators} 
       />
    </div>
  );
};
