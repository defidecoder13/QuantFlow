import { describe, it, expect } from 'vitest';
import { evaluateSignal, IndicatorValues } from '../lib/indicators';
import { OHLCV } from '../utils/binance-client';

describe('evaluateSignal', () => {
    // Helper to create base mock indicators
    const mockInd = (overrides: Partial<IndicatorValues>): IndicatorValues => ({
        rsi: 50,
        ema20: 100,
        ema50: 100,
        ema200: 100,
        sma50: 100,
        sma200: 100,
        stochK: 50,
        stochD: 50,
        macd: { MACD: 0, signal: 0, histogram: 0 },
        adx: 20,
        supertrend: { direction: 1, value: 0 },
        psar: 0,
        bb: { lower: 90, middle: 100, upper: 110 },
        volumeSma: 1000,
        cci: 0,
        pivot: { p: 100, r1: 110, s1: 90 },
        ...overrides
    });

    const mockCandle: OHLCV = { time: 0, open: 100, high: 105, low: 95, close: 100, volume: 1000 };

    describe('RSI Logic', () => {
        it('RSI Oversold (<30)', () => {
            expect(evaluateSignal('RSI Oversold', mockInd({ rsi: 25 }), 100, mockCandle)).toBe(true);
            expect(evaluateSignal('RSI Oversold', mockInd({ rsi: 35 }), 100, mockCandle)).toBe(false);
        });
        it('RSI Overbought (>70)', () => {
            expect(evaluateSignal('RSI Overbought', mockInd({ rsi: 75 }), 100, mockCandle)).toBe(true);
            expect(evaluateSignal('RSI Overbought', mockInd({ rsi: 65 }), 100, mockCandle)).toBe(false);
        });
    });

    describe('MA Logic', () => {
        it('Price > EMA 20', () => {
            expect(evaluateSignal('Price > EMA 20', mockInd({ ema20: 90 }), 100, mockCandle)).toBe(true);
            expect(evaluateSignal('Price > EMA 20', mockInd({ ema20: 110 }), 100, mockCandle)).toBe(false);
        });
        it('Golden Cross (SMA50 > SMA200 check)', () => {
            // Logic in code: indicators.sma50 > indicators.sma200 && indicators.sma50 * 0.99 < indicators.sma200
            // Basically JUST crossed.

            // Case 1: SMA50 way above SMA200 (Old cross) -> Should fail?
            // Code: indicators.sma50 * 0.99 < indicators.sma200 implies SMA50 is within 1% above SMA200.

            const justCrossed = mockInd({ sma50: 100.5, sma200: 100 });
            expect(evaluateSignal('Golden Cross', justCrossed, 100, mockCandle)).toBe(true);

            const oldCross = mockInd({ sma50: 150, sma200: 100 });
            // 150 * 0.99 = 148.5, which is NOT < 100. So false.
            expect(evaluateSignal('Golden Cross', oldCross, 100, mockCandle)).toBe(false);

            const below = mockInd({ sma50: 90, sma200: 100 });
            expect(evaluateSignal('Golden Cross', below, 100, mockCandle)).toBe(false);
        });
    });

    describe('Patterns', () => {
        it('Bullish Engulfing', () => {
            // close > open && (close - open) > (high - low) * 0.7
            const bullishCandle = { ...mockCandle, open: 100, close: 110, high: 110, low: 100, volume: 1000 };
            // Body=10. Range=10. 10 > 7. True.
            expect(evaluateSignal('Bullish Engulfing', mockInd({}), 110, bullishCandle)).toBe(true);

            const smallGreen = { ...mockCandle, open: 100, close: 101, high: 110, low: 90, volume: 1000 };
            // Body=1. Range=20. 1 > 14 False.
            expect(evaluateSignal('Bullish Engulfing', mockInd({}), 101, smallGreen)).toBe(false);

            const redCandle = { ...mockCandle, open: 110, close: 100 };
            expect(evaluateSignal('Bullish Engulfing', mockInd({}), 100, redCandle)).toBe(false);
        });
    });
});
