import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StrategyBuilderState } from '@/types/strategy-builder';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

export interface SavedStrategy extends StrategyBuilderState {
    id: string;
    createdAt: number;
    isActive: boolean;
    performance?: {
        winRate: number;
        profitFactor: number;
    };
    issynced?: boolean;
}

interface StrategyStore {
    strategies: SavedStrategy[];
    isLoading: boolean;
    fetchStrategies: () => Promise<void>;
    addStrategy: (strategy: StrategyBuilderState) => Promise<void>;
    updateStrategy: (id: string, updates: Partial<SavedStrategy>) => Promise<void>;
    deleteStrategy: (id: string) => Promise<void>;
    toggleActive: (id: string) => void;
}

export const useStrategyStore = create<StrategyStore>()(
    persist(
        (set, get) => ({
            strategies: [],
            isLoading: false,

            fetchStrategies: async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                set({ isLoading: true });
                const { data, error } = await supabase
                    .from('strategies')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (data) {
                    const loadedStrategies: SavedStrategy[] = data.map((row: any) => {
                        const content = row.content || {};
                        return {
                            id: row.id,
                            name: row.name,
                            description: row.description,
                            risk: row.risk_settings || { stopLoss: 2, takeProfit: 5 },
                            groups: content.groups || [],
                            groupOperator: content.groupOperator || 'AND',
                            view: 'blocks', // Default to blocks view
                            createdAt: new Date(row.created_at).getTime(),
                            isActive: row.is_active,
                            issynced: true,
                            performance: { winRate: 0, profitFactor: 0 } // Mock stats for now
                        };
                    });
                    set({ strategies: loadedStrategies, isLoading: false });
                } else {
                    set({ isLoading: false });
                }
            },

            addStrategy: async (strategy) => {
                const supabase = createClient();
                const newId = uuidv4();
                const newStrategy: SavedStrategy = {
                    ...strategy,
                    id: newId,
                    createdAt: Date.now(),
                    isActive: true,
                    issynced: false,
                    performance: { winRate: 0, profitFactor: 0 }
                };

                // Optimistic Update
                set((state) => ({ strategies: [newStrategy, ...state.strategies] }));

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error } = await supabase.from('strategies').insert({
                        id: newId, // Use the same UUID
                        user_id: user.id,
                        name: strategy.name,
                        description: strategy.description,
                        risk_settings: strategy.risk,
                        content: { groups: strategy.groups, groupOperator: strategy.groupOperator },
                        is_active: true
                    });

                    if (!error) {
                        set((state) => ({
                            strategies: state.strategies.map(s => s.id === newId ? { ...s, issynced: true } : s)
                        }));
                    }
                }
            },

            updateStrategy: async (id, updates) => {
                set((state) => ({
                    strategies: state.strategies.map((s) =>
                        s.id === id ? { ...s, ...updates } : s
                    )
                }));

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                const currentStrat = get().strategies.find(s => s.id === id);

                if (user && currentStrat) {
                    // Map updates to DB columns if necessary
                    const dbUpdates: any = { updated_at: new Date().toISOString() };
                    if (updates.name) dbUpdates.name = updates.name;
                    if (updates.description) dbUpdates.description = updates.description;
                    if (updates.risk) dbUpdates.risk_settings = updates.risk;

                    if (updates.groups || updates.groupOperator || updates.isActive !== undefined) {
                        if (updates.groups || updates.groupOperator) {
                            const mergedGroups = updates.groups || currentStrat.groups;
                            const mergedOp = updates.groupOperator || currentStrat.groupOperator;
                            dbUpdates.content = { groups: mergedGroups, groupOperator: mergedOp };
                        }
                        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
                    }

                    await supabase.from('strategies').update(dbUpdates).eq('id', id);
                }
            },

            deleteStrategy: async (id) => {
                set((state) => ({
                    strategies: state.strategies.filter((s) => s.id !== id)
                }));
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('strategies').delete().eq('id', id);
                }
            },

            toggleActive: (id) => {
                const strat = get().strategies.find(s => s.id === id);
                if (strat) {
                    get().updateStrategy(id, { isActive: !strat.isActive });
                }
            },
        }),
        {
            name: 'quantflow-strategies',
        }
    )
);
