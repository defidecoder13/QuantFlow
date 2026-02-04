import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { SignalLibrary } from "./signal-library";
import { FilterGroup } from "./filter-group";
import { RiskSection } from "./risk-section";
import { StrategyBuilderState, FilterGroup as GroupType, StrategyFilter, OperatorType } from "@/types/strategy-builder";
import { Save, Plus, ArrowLeft } from "lucide-react";

import { useStrategyStore } from "@/lib/strategy-store";

interface Props {
  onBack?: () => void;
  initialState?: StrategyBuilderState;
  strategyId?: string;
}

export const StrategyBuilder = ({ onBack, initialState, strategyId }: Props) => {
  const { addStrategy, updateStrategy } = useStrategyStore();
  
  const [state, setState] = useState<StrategyBuilderState>(initialState || {
    name: 'New Strategy',
    groupOperator: 'AND',
    groups: [
      { id: 'g1', operator: 'AND', filters: [] }
    ],
    risk: { stopLoss: 2, takeProfit: 5, positionSize: 10 }
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(
    initialState?.groups?.[0]?.id || 'g1'
  );

  // Actions
  const handleAddGroup = () => {
    const newId = uuidv4();
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, { id: newId, operator: 'AND', filters: [] }]
    }));
    setActiveGroupId(newId);
  };

  const handleSelectSignal = (signal: string, categoryId: string) => {
    if (!activeGroupId && state.groups.length > 0) setActiveGroupId(state.groups[0].id);
    
    // If absolutely no groups, create one
    if (state.groups.length === 0) {
      const newId = uuidv4();
      setState(prev => ({
        ...prev,
        groups: [{ id: newId, operator: 'AND', filters: [{ id: uuidv4(), signal, categoryId }] }]
      }));
      setActiveGroupId(newId);
      return;
    }

    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === activeGroupId) {
          return {
            ...g,
            filters: [...g.filters, { id: uuidv4(), signal, categoryId }]
          };
        }
        return g;
      })
    }));
  };

  const handleUpdateGroup = (id: string, updates: Partial<GroupType>) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const handleRemoveGroup = (id: string) => {
    if (state.groups.length <= 1) return; // Prevent deleting last group
    setState(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== id)
    }));
    if (activeGroupId === id) {
      setActiveGroupId(state.groups[0].id);
    }
  };

  const handleRemoveFilter = (groupId: string, filterId: string) => {
    setState(prev => ({
      ...prev,
      groups: prev.groups.map(g => {
        if (g.id === groupId) {
          return { ...g, filters: g.filters.filter(f => f.id !== filterId) };
        }
        return g;
      })
    }));
  };

  const handleSave = () => {
    if (strategyId) {
      updateStrategy(strategyId, state);
    } else {
      addStrategy(state);
    }
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-t border-zinc-800 md:border-none">
      
      {/* Top Bar */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 bg-zinc-950 flex-shrink-0">
         <div className="flex items-center gap-4">
           {onBack && (
             <button onClick={onBack} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors">
               <ArrowLeft size={20} />
             </button>
           )}
           <input 
             value={state.name}
             onChange={(e) => setState({ ...state, name: e.target.value })}
             className="bg-transparent text-lg md:text-xl font-bold text-white outline-none placeholder-zinc-600 focus:placeholder-zinc-500 w-40 md:w-64"
             placeholder="Strategy Name"
           />
         </div>
         <div className="flex items-center gap-2 md:gap-4">
             {strategyId && <span className="hidden md:inline text-xs text-zinc-500 uppercase font-bold">Editing Mode</span>}
             <button onClick={handleSave} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs md:text-sm font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all">
               <Save size={16} /> <span className="hidden md:inline">{strategyId ? 'Update Strategy' : 'Save Strategy'}</span><span className="md:hidden">Save</span>
             </button>
         </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Library */}
        <div className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-zinc-800 h-[300px] md:h-auto overflow-hidden flex flex-col">
          <SignalLibrary onSelect={handleSelectSignal} />
        </div>

        {/* Right Panel: Rule Builder */}
        <div className="flex-1 flex flex-col bg-zinc-900/20 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-8">
             <div className="max-w-4xl mx-auto space-y-8">
               
               {/* Logic Connector Header */}
               <div className="flex items-center gap-4 justify-center">
                 <div className="h-px bg-zinc-800 w-20" />
                 <select 
                   value={state.groupOperator}
                   onChange={(e) => setState({ ...state, groupOperator: e.target.value as OperatorType })}
                   className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold rounded-full px-4 py-1.5 outline-none hover:border-zinc-700 cursor-pointer"
                 >
                   <option value="AND">AND (Match All Groups)</option>
                   <option value="OR">OR (Match Any Group)</option>
                 </select>
                 <div className="h-px bg-zinc-800 w-20" />
               </div>

               {/* Groups */}
               <div className="space-y-6">
                 {state.groups.map((group) => (
                   <FilterGroup 
                     key={group.id}
                     group={group}
                     isActive={activeGroupId === group.id}
                     onSelectGroup={() => setActiveGroupId(group.id)}
                     onUpdate={(updates) => handleUpdateGroup(group.id, updates)}
                     onRemove={() => handleRemoveGroup(group.id)}
                     onRemoveFilter={(fid) => handleRemoveFilter(group.id, fid)}
                   />
                 ))}
               </div>

               {/* Add Group Button */}
               <button 
                 onClick={handleAddGroup}
                 className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
               >
                 <Plus size={16} /> Add Logic Group
               </button>

             </div>
          </div>

          {/* Bottom: Risk */}
          {/* Bottom: Risk */}
          <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950 p-4">
              <RiskSection 
                 risk={state.risk} 
                 onChange={(updates) => setState(prev => ({ ...prev, risk: { ...prev.risk, ...updates } }))} 
              />
          </div>
          
        </div>
      </div>
    </div>
  );
};
