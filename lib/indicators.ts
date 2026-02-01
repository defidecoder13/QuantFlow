import {
    RSI, SMA, EMA, MACD, BollingerBands, Stochastic, ADX, CCI, PSAR
} from 'technicalindicators';
import { OHLCV } from '@/utils/binance-client';

export interface IndicatorValues {
    rsi: number;
    ema20: number;
    ema50: number;
    ema200: number;
    sma50: number;
    sma200: number;
    stochK: number;
    stochD: number;
    macd: { MACD?: number; signal?: number; histogram?: number };
    adx: number;
    supertrend: { direction: 1 | -1; value: number }; // Direction 1=Bullish, -1=Bearish. Custom approx
    psar: number;
    bb: { lower: number; middle: number; upper: number };
    volumeSma: number;
    cci: number;
    pivot: { p: number; r1: number; s1: number };
}

// Helper: Calculate standard pivot points (Daily)
const calculatePivot = (high: number, low: number, close: number) => {
    const p = (high + low + close) / 3;
    const r1 = 2 * p - low;
    const s1 = 2 * p - high;
    return { p, r1, s1 };
};

// Helper: Simple Supertrend approximation (ATR based)
// Note: technicalindicators doesn't have native Supertrend, usually calculated with ATR.
// We will placeholder or simplify. For now, let's skip complex custom supertrend unless critical.
// We'll use Parabolic SAR as main trend follower proxy or implement basic ATR Channel.

export const calculateIndicators = (candles: OHLCV[]): IndicatorValues | null => {
    if (candles.length < 200) return null; // Need enough history

    const closePrices = candles.map(c => c.close);
    const highPrices = candles.map(c => c.high);
    const lowPrices = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);

    // 1. Moving Averages
    const ema20 = EMA.calculate({ period: 20, values: closePrices });
    const ema50 = EMA.calculate({ period: 50, values: closePrices });
    const ema200 = EMA.calculate({ period: 200, values: closePrices });
    const sma50 = SMA.calculate({ period: 50, values: closePrices });
    const sma200 = SMA.calculate({ period: 200, values: closePrices }); // Used for Golden/Death cross

    // 2. RSI
    const rsi = RSI.calculate({ period: 14, values: closePrices });

    // 3. Stochastic
    const stoch = Stochastic.calculate({
        high: highPrices, low: lowPrices, close: closePrices,
        period: 14, signalPeriod: 3
    });

    // 4. MACD
    const macd = MACD.calculate({
        values: closePrices,
        fastPeriod: 12, slowPeriod: 26, signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });

    // 5. ADX
    const adx = ADX.calculate({
        high: highPrices, low: lowPrices, close: closePrices, period: 14
    });

    // 6. Bollinger Bands
    const bb = BollingerBands.calculate({ period: 20, stdDev: 2, values: closePrices });

    // 7. CCI
    const cci = CCI.calculate({ high: highPrices, low: lowPrices, close: closePrices, period: 20 });

    // 8. PSAR
    const psar = PSAR.calculate({ high: highPrices, low: lowPrices, step: 0.02, max: 0.2 });

    // 9. Volume SMA
    const volumeSma = SMA.calculate({ period: 20, values: volumes });

    // Pivot (Last completed candle)
    const lastCompleted = candles[candles.length - 2];
    const pivot = calculatePivot(lastCompleted.high, lastCompleted.low, lastCompleted.close);

    // Generic helper
    const getLastItem = <T>(arr: T[]): T => arr[arr.length - 1];

    // Safety check for empty arrays
    if (!rsi.length) return null;

    const lastStoch = getLastItem(stoch);
    const lastAdx = getLastItem(adx);

    return {
        rsi: getLastItem(rsi),
        ema20: getLastItem(ema20),
        ema50: getLastItem(ema50),
        ema200: getLastItem(ema200),
        sma50: getLastItem(sma50),
        sma200: getLastItem(sma200),
        stochK: lastStoch ? lastStoch.k : 0,
        stochD: lastStoch ? lastStoch.d : 0,
        macd: getLastItem(macd) || {},
        adx: lastAdx ? lastAdx.adx : 0,
        supertrend: { direction: 1, value: 0 },
        psar: getLastItem(psar),
        bb: getLastItem(bb),
        volumeSma: getLastItem(volumeSma),
        cci: getLastItem(cci),
        pivot
    };
};

export const evaluateSignal = (signalId: string, indicators: IndicatorValues, currentPrice: number, currentCandle: OHLCV): boolean => {
    if (!indicators) return false;

    switch (signalId) {
        // --- MA ---
        case 'Price > EMA 20': return currentPrice > indicators.ema20;
        case 'Price < EMA 20': return currentPrice < indicators.ema20;
        case 'Price > EMA 50': return currentPrice > indicators.ema50;
        case 'Price < EMA 50': return currentPrice < indicators.ema50;
        case 'Price > EMA 200': return currentPrice > indicators.ema200;
        case 'Price < EMA 200': return currentPrice < indicators.ema200;
        case 'Golden Cross': return indicators.sma50 > indicators.sma200 && indicators.sma50 * 0.99 < indicators.sma200; // Recent cross logic simplified
        case 'Death Cross': return indicators.sma50 < indicators.sma200 && indicators.sma50 * 1.01 > indicators.sma200;
        case 'EMA 20 > EMA 50': return indicators.ema20 > indicators.ema50;
        case 'EMA 20 < EMA 50': return indicators.ema20 < indicators.ema50;

        // --- RSI ---
        case 'RSI Oversold': return indicators.rsi < 30;
        case 'RSI Overbought': return indicators.rsi > 70;
        case 'RSI > 50': return indicators.rsi > 50;
        case 'RSI < 50': return indicators.rsi < 50;
        // Div logic requires history, simplifying to simple extreme check for now
        case 'RSI Bullish Div': return indicators.rsi < 30;
        case 'RSI Bearish Div': return indicators.rsi > 70;

        // --- Stoch ---
        case 'Stoch Oversold': return indicators.stochK < 20;
        case 'Stoch Overbought': return indicators.stochK > 80;
        case 'Stoch Bullish Cross': return indicators.stochK > indicators.stochD;
        case 'Stoch Bearish Cross': return indicators.stochK < indicators.stochD;

        // --- MACD ---
        case 'MACD Bullish Cross': return (indicators.macd.MACD || 0) > (indicators.macd.signal || 0);
        case 'MACD Bearish Cross': return (indicators.macd.MACD || 0) < (indicators.macd.signal || 0);
        case 'MACD > 0': return (indicators.macd.MACD || 0) > 0;
        case 'MACD < 0': return (indicators.macd.MACD || 0) < 0;

        // --- Trend ---
        case 'ADX > 25': return indicators.adx > 25;
        case 'ADX > 50': return indicators.adx > 50;
        case 'Parabolic SAR < Price': return indicators.psar < currentPrice;
        case 'Parabolic SAR > Price': return indicators.psar > currentPrice;

        // --- Volatility ---
        case 'Price < Lower BB': return currentPrice < indicators.bb.lower;
        case 'Price > Upper BB': return currentPrice > indicators.bb.upper;
        case 'Bollinger Band Squeeze':
            const width = (indicators.bb.upper - indicators.bb.lower) / indicators.bb.middle;
            return width < 0.05; // 5% width roughly squeeze

        // --- Volume ---
        case 'Volume > SMA 20': return currentCandle.volume > indicators.volumeSma;

        // --- CCI ---
        case 'CCI < -100': return indicators.cci < -100;
        case 'CCI > 100': return indicators.cci > 100;
        case 'CCI > 0': return indicators.cci > 0;
        case 'CCI < 0': return indicators.cci < 0;

        // --- Pivots ---
        case 'Price > Pivot P': return currentPrice > indicators.pivot.p;
        case 'Price < Pivot P': return currentPrice < indicators.pivot.p;

        // --- Patterns (Simplified: Check Candle Color/Shape) ---
        case 'Bullish Engulfing': return currentCandle.close > currentCandle.open && (currentCandle.close - currentCandle.open) > (currentCandle.high - currentCandle.low) * 0.7; // Big green candle
        case 'Bearish Engulfing': return currentCandle.close < currentCandle.open && (currentCandle.open - currentCandle.close) > (currentCandle.high - currentCandle.low) * 0.7; // Big red candle

        default: return false;
    }
};
