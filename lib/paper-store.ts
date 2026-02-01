import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/utils/supabase/client';

export interface PaperOrder {
    id: string;
    strategyName: string;
    pair: string;
    side: 'LONG' | 'SHORT';
    amount: number; // Investment amount in USD
    entryPrice: number;
    currentPrice: number;
    pnl: number; // unrealized PnL amount
    pnlPercent: number;
    status: 'OPEN' | 'CLOSED';
    timestamp: string;
    issynced?: boolean;
}

interface PaperStore {
    balance: number;
    orders: PaperOrder[];
    activeStrategies: string[]; // IDs of strategies running

    addFunds: (amount: number) => void;
    deployStrategy: (strategyId: string) => void;
    stopStrategy: (strategyId: string) => void;

    fetchOrders: () => Promise<void>;
    placeOrder: (order: Omit<PaperOrder, 'id' | 'timestamp' | 'currentPrice' | 'pnl' | 'pnlPercent' | 'status'>) => Promise<void>;
    updateLivePrices: (priceMap: Record<string, number>) => void;
    closeOrder: (orderId: string) => Promise<void>;
}

export const usePaperStore = create<PaperStore>()(
    persist(
        (set, get) => ({
            balance: 50000,
            orders: [],
            activeStrategies: [],

            addFunds: async (amount) => {
                set((state) => ({ balance: state.balance + amount }));
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('user_settings').upsert({ user_id: user.id, paper_balance: get().balance });
                }
            },

            deployStrategy: (id) => set((state) => ({
                activeStrategies: state.activeStrategies.includes(id) ? state.activeStrategies : [...state.activeStrategies, id]
            })),

            stopStrategy: (id) => set((state) => ({
                activeStrategies: state.activeStrategies.filter(s => s !== id)
            })),

            fetchOrders: async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Sync Balance
                const { data: settings } = await supabase.from('user_settings').select('paper_balance').single();
                if (settings) {
                    set({ balance: settings.paper_balance });
                } else {
                    await supabase.from('user_settings').insert({ user_id: user.id, paper_balance: 50000 });
                    set({ balance: 50000 });
                }

                const { data } = await supabase
                    .from('paper_positions')
                    .select('*')
                    .order('opened_at', { ascending: false });

                if (data) {
                    const loadedOrders: PaperOrder[] = data.map((row: any) => ({
                        id: row.id,
                        strategyName: row.strategy_name || 'Manual',
                        pair: row.pair,
                        side: row.side,
                        amount: row.amount,
                        entryPrice: row.entry_price,
                        currentPrice: row.exit_price || row.entry_price, // Fallback if still open
                        pnl: row.pnl || 0,
                        pnlPercent: 0, // Recalculated by updatePrices loop
                        status: row.status,
                        timestamp: row.opened_at,
                        issynced: true
                    }));
                    set({ orders: loadedOrders });
                }
            },

            placeOrder: async (orderData) => {
                const newId = uuidv4();
                const newOrder: PaperOrder = {
                    ...orderData,
                    id: newId,
                    currentPrice: orderData.entryPrice,
                    pnl: 0,
                    pnlPercent: 0,
                    status: 'OPEN',
                    timestamp: new Date().toISOString(),
                    issynced: false
                };

                // Optimistic Local State Update
                set((state) => ({
                    orders: [newOrder, ...state.orders],
                    balance: state.balance - orderData.amount
                }));

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error } = await supabase.from('paper_positions').insert({
                        id: newId,
                        user_id: user.id,
                        strategy_name: orderData.strategyName,
                        pair: orderData.pair,
                        side: orderData.side,
                        amount: orderData.amount,
                        entry_price: orderData.entryPrice,
                        status: 'OPEN'
                    });

                    // Sync Balance
                    await supabase.from('user_settings').upsert({ user_id: user.id, paper_balance: get().balance });

                    if (!error) {
                        set((state) => ({
                            orders: state.orders.map(o => o.id === newId ? { ...o, issynced: true } : o)
                        }));
                    }
                }
            },

            closeOrder: async (id) => {
                const order = get().orders.find(o => o.id === id);
                if (!order || order.status === 'CLOSED') return;

                // Optimistic Local Update
                set((state) => ({
                    orders: state.orders.map(o => o.id === id ? { ...o, status: 'CLOSED' } : o),
                    balance: state.balance + order.amount + order.pnl
                }));

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user && order.issynced) {
                    await supabase.from('paper_positions').update({
                        status: 'CLOSED',
                        exit_price: order.currentPrice,
                        pnl: order.pnl,
                        closed_at: new Date().toISOString()
                    }).eq('id', id);

                    // Sync Balance
                    await supabase.from('user_settings').upsert({ user_id: user.id, paper_balance: get().balance });
                }
            },

            updateLivePrices: (priceMap) => set((state) => ({
                orders: state.orders.map(order => {
                    if (order.status === 'CLOSED') return order;

                    const newPrice = priceMap[order.pair];
                    if (!newPrice) return order;

                    const pnlPercent = order.side === 'LONG'
                        ? (newPrice - order.entryPrice) / order.entryPrice
                        : (order.entryPrice - newPrice) / order.entryPrice;

                    const pnl = order.amount * pnlPercent;

                    return {
                        ...order,
                        currentPrice: newPrice,
                        pnl: parseFloat(pnl.toFixed(2)),
                        pnlPercent: parseFloat((pnlPercent * 100).toFixed(2))
                    };
                })
            }))

        }),
        {
            name: 'quantflow-paper-store',
        }
    )
);
