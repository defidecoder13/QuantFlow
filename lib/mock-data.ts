export const equityData = [
  { time: '01:00', value: 45000 },
  { time: '02:00', value: 45200 },
  { time: '03:00', value: 44800 },
  { time: '04:00', value: 46000 },
  { time: '05:00', value: 46500 },
  { time: '06:00', value: 46200 },
  { time: '07:00', value: 47800 },
  { time: '08:00', value: 48500 },
  { time: '09:00', value: 48200 },
  { time: '10:00', value: 49500 },
  { time: '11:00', value: 50000 },
];

export const recentTrades = [
  { id: '1', timestamp: '2023-11-20 10:24', pair: 'BTC/USDT', type: 'BUY', price: 37450.20, amount: 0.05, status: 'CLOSED', pnl: 45.20, reason: 'RSI Divergence' },
  { id: '2', timestamp: '2023-11-20 09:15', pair: 'ETH/USDT', type: 'SELL', price: 2105.50, amount: 1.2, status: 'CLOSED', pnl: -12.40, reason: 'Stop Loss Hit' },
  { id: '3', timestamp: '2023-11-20 08:45', pair: 'SOL/USDT', type: 'BUY', price: 58.12, amount: 10, status: 'OPEN', pnl: 8.50, reason: 'EMA Crossover' },
];

export const backtestResults = [
  { pair: 'BTC/USDT', timeframe: '1h', winRate: '68%', pnl: '+12.4%', drawdown: '4.2%', sharpe: '2.1' },
  { pair: 'ETH/USDT', timeframe: '15m', winRate: '54%', pnl: '+8.1%', drawdown: '6.8%', sharpe: '1.4' },
];

export const logsData = [
  { timestamp: '2023-11-20 10:24:55', pair: 'BTC/USDT', action: 'OPEN LONG', reason: 'RSI < 30', price: '37,450.20' },
  { timestamp: '2023-11-20 10:20:12', pair: 'ETH/USDT', action: 'CLOSE SHORT', reason: 'Take Profit', price: '2,104.55' },
  { timestamp: '2023-11-20 10:15:33', pair: 'SOL/USDT', action: 'UPDATE SL', reason: 'Trailing Stop', price: '57.80' },
  { timestamp: '2023-11-20 10:10:01', pair: 'BTC/USDT', action: 'SIGNAL SCAN', reason: 'Routine Check', price: '37,200.10' },
];