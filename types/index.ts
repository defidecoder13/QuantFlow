// Re-export new robust strategy types
export * from './strategy';

export interface KPI {
  label: string;
  value: string;
  trend: number;
  icon: string;
}

export interface Trade {
  id: string;
  timestamp: string;
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  pnl?: number;
  status: 'OPEN' | 'CLOSED';
  reason: string;
}

export interface BotStatus {
  id: string;
  name: string;
  status: 'RUNNING' | 'PAUSED' | 'IDLE';
  uptime: string;
  pair: string;
  pnlDay: number;
}

export interface LogEntry {
  timestamp: string;
  pair: string;
  action: string;
  reason: string;
  price: string;
}