'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

export const PaperChart = () => {
  const containerId = 'tv-chart-container';
  const hasMounted = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.TradingView && !hasMounted.current) {
      new window.TradingView.widget({
        autosize: true,
        symbol: 'BINANCE:BTCUSDT',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: containerId,
        backgroundColor: 'rgba(9, 9, 11, 1)',
        gridColor: 'rgba(39, 39, 42, 0.3)',
      });
      hasMounted.current = true;
    }
  }, []);

  return (
    <div className="w-full h-full glass rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">BTC/USDT</span>
          <span className="text-xs text-emerald-500 font-mono">$37,450.22</span>
          <span className="text-xs text-zinc-500">1m</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-md">BUY</button>
          <button className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-md">SELL</button>
        </div>
      </div>
      <div id={containerId} className="flex-1" />
    </div>
  );
};