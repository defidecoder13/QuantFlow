"use client";

import { useBinanceTicker } from '@/lib/binance-socket';
import { useRouter } from 'next/navigation';

export const ActivePairRow = ({ label }: { label: string }) => {
  const router = useRouter();
  const symbol = label.replace('/', '');
  const ticker = useBinanceTicker(symbol);

  const navigateToPair = () => {
    router.push(`/market?pair=${symbol}`);
  };

  const change = ticker ? ticker.changePercent : 0;
  const isPositive = change >= 0;
  const isZero = change === 0 && !ticker; // Initial state

  return (
    <button 
      className="w-full text-left px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-md transition-colors flex items-center justify-between"
      onClick={navigateToPair}
    >
      <span>{label}</span>
      <span className={`text-[10px] font-mono ${isZero ? 'text-zinc-600' : isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {ticker ? `${isPositive ? '+' : ''}${change.toFixed(2)}%` : '--'}
      </span>
    </button>
  );
};
