'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import { EquityChart } from '@/features/dashboard/equity-chart';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function MarketContent() {
  const searchParams = useSearchParams();
  const pair = searchParams.get('pair') || 'BTCUSDT';
  
  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Market Analysis</h1>
          <p className="text-sm text-zinc-500">Live technical analysis for {pair}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <EquityChart pair={pair} />
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<div className="text-zinc-500 p-8">Loading market data...</div>}>
            <MarketContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
