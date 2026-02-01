'use client';

import { useEffect, useRef, useState } from 'react';
import { usePaperStore } from '@/lib/paper-store';
import { useBinanceCandles, useBinanceTicker } from '@/lib/binance-socket';
import { fetchBinanceCandles } from '@/utils/binance-client';
import { createChart, ColorType, IChartApi, ISeriesApi, LineStyle, CandlestickSeries } from 'lightweight-charts';
import { Plus, Minus, X, RefreshCw, Maximize } from 'lucide-react';

export const PaperChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLineRef = useRef<any>(null);

  const [interval, setInterval] = useState('1m');
  const { placeOrder, orders, closeOrder } = usePaperStore();
  const activeOrders = orders.filter(o => o.status === 'OPEN' && o.pair === 'BTCUSDT'); 

  // Data Hooks
  const ticker = useBinanceTicker('BTCUSDT');
  const lastCandle = useBinanceCandles('BTCUSDT', interval);
  const displayPrice = ticker?.price || 0;

  // 1. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'rgba(9, 9, 11, 1)' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(39, 39, 42, 0.3)' },
        horzLines: { color: 'rgba(39, 39, 42, 0.3)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400, 
      timeScale: {
         timeVisible: true,
         secondsVisible: false,
      }
    });

    const series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderUpColor: '#10b981',
        borderDownColor: '#f43f5e',
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Resize Handler
    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
    };
  }, []);

  // 2. Load History on Interval Change
  useEffect(() => {
    const loadHistory = async () => {
        if (!seriesRef.current) return;
        
        // Clear existing data (optional, but good for UX so we don't mix timeframes visually during fetch)
        // series.setData([]); // lightweight-charts v5 might flash if we do this. 
        // Better to just overwrite.
        
        const data = await fetchBinanceCandles('BTCUSDT', interval, 1000);
        if (data && data.length > 0) {
            const chartData = data.map(d => ({
                time: Math.floor(d.time / 1000) as any, 
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close
            }));
            
            // sort by time just in case
            chartData.sort((a, b) => (a.time as number) - (b.time as number));
            
            seriesRef.current.setData(chartData);
            chartRef.current?.timeScale().fitContent();
        }
    };
    
    // Slight delay to ensure chart init
    if (chartRef.current) {
        loadHistory();
    } else {
        setTimeout(loadHistory, 100);
    }
  }, [interval]);

  // 3. Live Updates
  useEffect(() => {
    if (seriesRef.current && lastCandle) {
        seriesRef.current.update({
            time: lastCandle.time as any,
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close
        });
    }
  }, [lastCandle]);

  // 4. Update Entry Line (No changes needed logic-wise)
  useEffect(() => {
    if (!seriesRef.current) return;

    if (priceLineRef.current) {
        seriesRef.current.removePriceLine(priceLineRef.current);
        priceLineRef.current = null;
    }

    if (activeOrders.length === 0) return;

    const totalUnits = activeOrders.reduce((acc, o) => acc + (o.amount / o.entryPrice), 0);
    const avgEntry = totalUnits > 0 ? (activeOrders.reduce((acc, o) => acc + o.amount, 0) / totalUnits) : 0;

    if (avgEntry > 0) {
        priceLineRef.current = seriesRef.current.createPriceLine({
            price: avgEntry,
            color: '#3b82f6', 
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'Avg Entry',
        });
    }

  }, [activeOrders]); 

  const handleTrade = (side: 'LONG' | 'SHORT') => {
    if (!displayPrice) return;
    placeOrder({
      strategyName: 'Manual Trade',
      pair: 'BTCUSDT',
      side,
      amount: 5000, 
      entryPrice: displayPrice,
    });
  };

  return (
    <div className="w-full h-full glass rounded-xl overflow-hidden flex flex-col relative group">
      {/* Header / Controls */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">BTC/USDT</span>
          <span className={`text-xs font-mono transition-colors ${ticker?.changePercent && ticker.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${displayPrice.toFixed(2)}
          </span>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setInterval(tf)}
                        className={`px-2 py-1 text-[10px] rounded-md transition-all ${
                            interval === tf 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {tf}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => chartRef.current?.timeScale().fitContent()}
                className="p-1.5 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-lg transition-colors"
                title="Reset Zoom"
            >
                <Maximize size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleTrade('LONG')}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center gap-1"
          >
            <Plus size={12} /> BUY
          </button>
          <button 
            onClick={() => handleTrade('SHORT')}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-rose-900/20 active:scale-95 flex items-center gap-1"
          >
            <Minus size={12} /> SELL
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative flex-1 bg-zinc-950">
         <div ref={chartContainerRef} className="absolute inset-0 z-0" />
         
         {/* Visual Overlay for Orders */}
         <div className="absolute inset-0 pointer-events-none z-10 p-4 flex flex-col items-end gap-2">
            {activeOrders.map((order) => (
              <div 
                key={order.id} 
                className={`pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-md shadow-xl transition-all animate-in slide-in-from-right-4 duration-300 ${
                  order.side === 'LONG' ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-rose-900/30 border-rose-500/50'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold ${order.side === 'LONG' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {order.side} {order.pair}
                  </span>
                  <div className="flex gap-2 text-xs font-mono text-zinc-300">
                     <span>@{order.entryPrice.toFixed(0)}</span>
                     <span className={order.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                       {order.pnl >= 0 ? '+' : ''}{order.pnl.toFixed(2)}
                     </span>
                  </div>
                </div>
                <button 
                  onClick={() => closeOrder(order.id)}
                  className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};