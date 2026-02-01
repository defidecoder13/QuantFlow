'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBinanceCandles } from '@/lib/binance-socket';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const EquityChart = ({ pair = 'BTCUSDT' }: { pair?: string }) => {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestCandle = useBinanceCandles(pair);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=1m&limit=50`);
        const klines = await res.json();
        
        // Check if klines is an array (error response from binance is an object)
        if (Array.isArray(klines)) {
          const formattedData = klines.map((k: any) => ({
            time: new Date(k[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(k[4]) // Close price
          }));
          setData(formattedData);
          
          if (formattedData.length > 0) {
            setCurrentPrice(formattedData[formattedData.length - 1].value);
          }
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [pair]);

  // Handle live updates
  useEffect(() => {
    if (latestCandle) {
      const timeStr = new Date(latestCandle.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setData((prev) => {
        const newData = [...prev, { time: timeStr, value: latestCandle.close }];
        return newData.slice(-50); // Keep last 50
      });
      setCurrentPrice(latestCandle.close);
    }
  }, [latestCandle]);

  const displayPrice = currentPrice || 0;

  if (isLoading) {
    return (
      <div className="glass p-6 rounded-xl w-full h-[400px] flex flex-col items-center justify-center space-y-4">
         <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
         <p className="text-zinc-500 text-sm animate-pulse">Loading market data for {pair}...</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-xl w-full h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Market: {pair}</h3>
          <p className="text-xs text-zinc-500">Real-time 1m Candles</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-500 font-mono">
            ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">LIVE</span>
        </div>
      </div>
      
      <div className="w-full h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="time" stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis 
                stroke="#52525b" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              />
              <Area 
                isAnimationActive={false} 
                type="monotone" 
                dataKey="value" 
                stroke="#22d3ee" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            No data available for this pair.
          </div>
        )}
      </div>
    </div>
  );
};