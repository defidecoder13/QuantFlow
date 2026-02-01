import { create } from 'zustand';
import { BotStatus, Trade, Strategy } from '@/types';

interface TradingState {
  activeBot: BotStatus | null;
  activeStrategy: Strategy | null;
  trades: Trade[];
  paperBalance: number;
  setPaperBalance: (balance: number) => void;
  setActiveBot: (bot: BotStatus) => void;
  addTrade: (trade: Trade) => void;
  logs: string[];
  addLog: (log: string) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  activeBot: {
    id: '1',
    name: 'Alpha Grid',
    status: 'RUNNING',
    uptime: '12d 4h',
    pair: 'BTC/USDT',
    pnlDay: 245.50
  },
  activeStrategy: null,
  trades: [],
  paperBalance: 50000,
  setPaperBalance: (balance) => set({ paperBalance: balance }),
  setActiveBot: (bot) => set({ activeBot: bot }),
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  logs: [
    "[10:24:05] Bot initialized successfully.",
    "[10:25:00] Scanning indicators for BTC/USDT...",
    "[10:25:30] RSI level detected at 28.5 (Oversold)",
    "[10:25:32] Rule Triggered: RSI < 30"
  ],
  addLog: (log) => set((state) => ({ logs: [`[${new Date().toLocaleTimeString()}] ${log}`, ...state.logs] })),
}));