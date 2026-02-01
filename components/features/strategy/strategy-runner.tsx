'use client';

import { useEffect, useState } from 'react';
import { useBinanceCandles } from '@/lib/binance-socket';
import { usePaperStore } from '@/lib/paper-store';
import { useStrategyStore } from '@/lib/strategy-store';
import { calculateIndicators } from '@/lib/indicators';
import { evaluateStrategy } from '@/lib/strategy-evaluator';
import { fetchBinanceCandles, OHLCV } from '@/utils/binance-client';

export function StrategyRunner() {
  const symbol = 'BTCUSDT'; // Hardcoded for MVP
  const interval = '1m';
  
  const [candles, setCandles] = useState<OHLCV[]>([]);
  const latestSocketCandle = useBinanceCandles(symbol, interval);
  
  const { strategies, fetchStrategies } = useStrategyStore();
  // We ONLY subscribe to actions here to prevent re-renders when 'orders' changes
  // This breaks the infinite loop: updateLivePrices -> orders change -> re-render -> updateLivePrices
  const { placeOrder, closeOrder, updateLivePrices } = usePaperStore();
  
  // 1. Initial Data Load
  useEffect(() => {
    fetchStrategies();
    const loadHistory = async () => {
       try {
         const data = await fetchBinanceCandles(symbol, interval, 200);
         data.sort((a, b) => a.time - b.time);
         setCandles(data);
       } catch (e) {
         console.error('[StrategyRunner] Failed to load history', e);
       }
    };
    loadHistory();
  }, [fetchStrategies]);

  // 2. Handle Socket Updates
  useEffect(() => {
    if (!latestSocketCandle) return;

    setCandles(prev => {
        if (prev.length === 0) return prev;

        const last = prev[prev.length - 1];
        const socketTimeMs = latestSocketCandle.time * 1000;
        
        let newCandles = [...prev];
        
        if (socketTimeMs === last.time) {
            newCandles[newCandles.length - 1] = {
                time: socketTimeMs,
                open: latestSocketCandle.open,
                high: latestSocketCandle.high,
                low: latestSocketCandle.low,
                close: latestSocketCandle.close,
                volume: last.volume 
            };
        } else if (socketTimeMs > last.time) {
             newCandles.push({
                time: socketTimeMs,
                open: latestSocketCandle.open,
                high: latestSocketCandle.high,
                low: latestSocketCandle.low,
                close: latestSocketCandle.close,
                volume: 0 
             });
             if (newCandles.length > 300) newCandles.shift();
        }
        
        return newCandles;
    });
  }, [latestSocketCandle]);
  
  // 3. Logic Engine (Runs on every price update)
  useEffect(() => {
     if (candles.length < 50) return;
     
     const currentCandle = candles[candles.length - 1];
     const currentPrice = currentCandle.close;
     
     // Update Live Prices for PnL
     // This triggers a store update, but since we don't subscribe to 'orders' in this component,
     // it won't re-render this component immediately (or at least won't trigger this effect again).
     // However, to be safe, we access orders via getState() below.
     updateLivePrices({ [symbol]: currentPrice });
     
     // Get fresh orders snapshot for logic
     const { orders } = usePaperStore.getState();

     const indicators = calculateIndicators(candles);
     if (!indicators) return;
     
     // A. Check Open Orders (TP/SL)
     orders.filter(o => o.status === 'OPEN').forEach(order => {
        const strategy = strategies.find(s => s.name === order.strategyName);
        if (strategy && strategy.isActive) {
             const slPercent = (strategy.risk?.stopLoss || 2) / 100;
             const tpPercent = (strategy.risk?.takeProfit || 5) / 100;
             
             if (order.side === 'LONG') {
                 if (currentPrice <= order.entryPrice * (1 - slPercent)) {
                     closeOrder(order.id);
                     console.log(`[Strategy] Closed ${order.strategyName} (SL) @ ${currentPrice}`);
                 } else if (currentPrice >= order.entryPrice * (1 + tpPercent)) {
                     closeOrder(order.id);
                     console.log(`[Strategy] Closed ${order.strategyName} (TP) @ ${currentPrice}`);
                 }
             }
        }
     });

     // B. Evaluate Strategies (Entry)
     // Auto-trading disabled by user request
     /*
     strategies.filter(s => s.isActive).forEach(strat => {
         const hasPosition = orders.some(o => o.strategyName === strat.name && o.status === 'OPEN');
         if (hasPosition) return;
         
         const result = evaluateStrategy(strat, indicators, currentPrice, currentCandle);
         if (result.shouldTrigger) {
             console.log(`[Strategy] Triggered ${strat.name}: ${result.reason}`);
             placeOrder({
                 strategyName: strat.name,
                 pair: symbol,
                 side: 'LONG',
                 amount: 10000, 
                 entryPrice: currentPrice,
             });
         }
     });
     */

  }, [candles, strategies, updateLivePrices, closeOrder, placeOrder]); 
  // 'orders' is intentionally excluded from dependencies to break the loop

  return null;
}
