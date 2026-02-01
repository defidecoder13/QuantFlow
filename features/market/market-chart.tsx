 'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartData {
  time: string;
  value: number;
}

export const MarketChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [latestTime, setLatestTime] = useState<string>("");
  const searchParams = useSearchParams();
  const pairParam = searchParams?.get('pair') ?? 'BTCUSDT';
  const pair = typeof pairParam === 'string' ? pairParam : 'BTCUSDT';
  const MAX_POINTS = 100;

  useEffect(() => {
    // Clear state on pair change/mount
    setChartData([]);
    setLatestPrice(null);
    setLatestTime("");

    // Fetch data via server-side API
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/candles?pair=${pair}`);
        if (!res.ok) return;
        const candles = await res.json();
        const mapped = (candles || []).map((c: any) => ({ time: c.time, value: Number(c.price) }));
        setChartData(mapped);
        if (mapped.length > 0) {
          const last = mapped[mapped.length - 1];
          setLatestPrice(last.value);
          setLatestTime(last.time);
        }
      } catch (err) {
        console.error('MarketChart fetch error:', err);
      }
    };
    fetchData();
    const t = setInterval(fetchData, 2000);
    return () => clearInterval(t);
  }, [pair]);



  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>Live BTC/USDT price movement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold">BTC/USDT Live Market Price</span>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold">{latestPrice != null ? `$${latestPrice.toFixed(2)}` : ''}</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-semibold text-emerald-400">LIVE</span>
            </span>
            <span className="text-xs text-zinc-400">{latestTime}</span>
          </div>
        </div>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            Loading chart...
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #3f3f46', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22d3ee" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
