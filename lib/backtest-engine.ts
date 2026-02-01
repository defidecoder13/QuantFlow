import { StrategyBuilderState, FilterGroup } from "@/types/strategy-builder";
import { v4 as uuidv4 } from 'uuid';
import { fetchBinanceCandles, OHLCV } from "@/utils/binance-client";
import { calculateIndicators, evaluateSignal, IndicatorValues } from "./indicators";

export interface Trade {
    id: string;
    entryDate: string;
    entryPrice: number;
    exitDate?: string;
    exitPrice?: number;
    type: 'LONG' | 'SHORT';
    pnl: number;
    pnlPercent: number;
    status: 'WIN' | 'LOSS' | 'OPEN';
}

export interface BacktestResult {
    scanId: string;
    strategyName: string;
    date: string;
    pair: string;
    timeframe: string;
    totalTrades: number;
    winRate: number;
    netProfit: number;
    profitFactor: number;
    maxDrawdown: number;
    equityCurve: { time: string; value: number }[];
    trades: Trade[];
}

const evaluateGroup = (
    group: FilterGroup,
    indicators: IndicatorValues,
    price: number,
    candle: OHLCV
): boolean => {
    if (group.filters.length === 0) return true;
    const results = group.filters.map(filter => evaluateSignal(filter.signal, indicators, price, candle));
    if (group.operator === 'AND') {
        return results.every(r => r);
    } else {
        return results.some(r => r);
    }
};

const evaluateStrategy = (
    strategy: StrategyBuilderState,
    indicators: IndicatorValues,
    price: number,
    candle: OHLCV
): boolean => {
    if (strategy.groups.length === 0) return false;
    const groupResults = strategy.groups.map(g => evaluateGroup(g, indicators, price, candle));
    if (strategy.groupOperator === 'AND') {
        return groupResults.every(r => r);
    } else {
        return groupResults.some(r => r);
    }
};

export const runBacktest = async (
    strategy: StrategyBuilderState,
    pair: string,
    timeframe: string,
    startDate: string,
    endDate: string
): Promise<BacktestResult> => {

    const candles = await fetchBinanceCandles(pair, timeframe, 500);

    // Default result if no data
    if (!candles || candles.length < 200) {
        return {
            scanId: uuidv4(),
            strategyName: strategy.name,
            date: new Date().toLocaleDateString(),
            pair, timeframe, totalTrades: 0, winRate: 0, netProfit: 0, profitFactor: 0, maxDrawdown: 0, equityCurve: [], trades: []
        };
    }

    const trades: Trade[] = [];
    let balance = 100;
    let equityCurve = [{ time: new Date(candles[0].time).toISOString().split('T')[0], value: 100 }];

    let openTrade: Trade | null = null;
    let maxBalance = 100;
    let maxDrawdown = 0;

    // Start from index 200 to allow warmup
    for (let i = 200; i < candles.length; i++) {
        const candle = candles[i];
        const dateStr = new Date(candle.time).toISOString().split('T')[0];

        // Optimizing calculation: Pass only necessary history? 
        // calculateIndicators slices internally or logic handles full array? 
        // Indicators library usually takes full array and returns full array.
        // We need VALUES at index i. But calculateIndicators implementation we wrote takes standard TechnicalIndicators approach.
        // Let's pass the slice up to i+1.

        const history = candles.slice(0, i + 1);
        const indicators = calculateIndicators(history);

        if (!indicators) continue;

        // 1. Manage Open Trade
        if (openTrade) {
            const slPrice = openTrade.entryPrice * (1 - strategy.risk.stopLoss / 100);
            const tpPrice = openTrade.entryPrice * (1 + strategy.risk.takeProfit / 100);

            let closePrice = 0;
            let status: 'WIN' | 'LOSS' | 'OPEN' = 'OPEN';

            if (candle.low <= slPrice) {
                closePrice = slPrice;
                status = 'LOSS';
            }
            else if (candle.high >= tpPrice) {
                closePrice = tpPrice;
                status = 'WIN';
            }

            if (status !== 'OPEN') {
                const pnlPercent = (closePrice - openTrade.entryPrice) / openTrade.entryPrice;
                const investment = balance * (strategy.risk.positionSize / 100);
                const pnlAmt = investment * pnlPercent;

                balance += pnlAmt;
                openTrade.exitPrice = closePrice;
                openTrade.exitDate = dateStr;
                openTrade.status = status;
                openTrade.pnl = parseFloat(pnlAmt.toFixed(2));
                openTrade.pnlPercent = parseFloat((pnlPercent * 100).toFixed(2));

                trades.push(openTrade);
                openTrade = null;

                if (balance > maxBalance) maxBalance = balance;
                const dd = (maxBalance - balance) / maxBalance * 100;
                if (dd > maxDrawdown) maxDrawdown = dd;

                equityCurve.push({ time: dateStr, value: parseFloat(balance.toFixed(2)) });
            }
        }

        // 2. Check Entry Signal
        if (!openTrade) {
            const isEntry = evaluateStrategy(strategy, indicators, candle.close, candle);
            if (isEntry) {
                openTrade = {
                    id: uuidv4(),
                    entryDate: new Date(candle.time).toISOString(),
                    entryPrice: candle.close,
                    type: 'LONG',
                    pnl: 0,
                    pnlPercent: 0,
                    status: 'OPEN'
                };
            }
        }
    }

    const wins = trades.filter(t => t.status === 'WIN').length;
    const losses = trades.filter(t => t.status === 'LOSS').length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    const grossProfit = trades.filter(t => t.pnl > 0).reduce((a, b) => a + b.pnl, 0);
    const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((a, b) => a + b.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

    return {
        scanId: uuidv4(),
        strategyName: strategy.name,
        date: new Date().toLocaleDateString(),
        pair,
        timeframe,
        totalTrades: trades.length,
        winRate: parseFloat(winRate.toFixed(1)),
        netProfit: parseFloat((balance - 100).toFixed(2)),
        profitFactor: parseFloat(profitFactor.toFixed(2)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(1)),
        equityCurve,
        trades: trades.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
    };
};
