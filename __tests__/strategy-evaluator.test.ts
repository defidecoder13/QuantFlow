import { describe, it, expect } from 'vitest';
import { evaluateStrategy } from '../lib/strategy-evaluator';
import { SavedStrategy } from '../lib/strategy-store';
import { IndicatorValues } from '../lib/indicators';

describe('Strategy Evaluator', () => {
    const mockIndicators: IndicatorValues = {
        rsi: 25, // Oversold
        ema20: 100,
        ema50: 90,
        ema200: 80,
        sma50: 90,
        sma200: 80,
        stochK: 10,
        stochD: 10,
        macd: { MACD: 1, signal: 0, histogram: 1 },
        adx: 30,
        supertrend: { direction: 1, value: 0 },
        psar: 0,
        bb: { lower: 90, middle: 100, upper: 110 },
        volumeSma: 1000,
        cci: -150,
        pivot: { p: 100, r1: 110, s1: 90 }
    };

    const mockPrice = 100;
    const mockCandle = { time: 0, open: 0, high: 0, low: 0, close: 100, volume: 1000 };

    it('should trigger when single condition matches', () => {
        const strategy: SavedStrategy = {
            id: '1',
            name: 'Test Strat',
            createdAt: 0,
            isActive: true,
            groups: [{ id: 'g1', items: ['RSI Oversold'] }],
            groupOperator: 'AND'
        } as any;

        const result = evaluateStrategy(strategy, mockIndicators, mockPrice, mockCandle);
        expect(result.shouldTrigger).toBe(true);
    });

    it('should NOT trigger when condition fails', () => {
        const strategy: SavedStrategy = {
            id: '1',
            name: 'Test Strat',
            createdAt: 0,
            isActive: true,
            groups: [{ id: 'g1', items: ['RSI Overbought'] }],
            groupOperator: 'AND'
        } as any;

        const result = evaluateStrategy(strategy, mockIndicators, mockPrice, mockCandle);
        expect(result.shouldTrigger).toBe(false);
    });

    it('should respect AND operator between groups', () => {
        const strategy: SavedStrategy = {
            id: '1',
            name: 'Test Strat',
            createdAt: 0,
            isActive: true,
            groups: [
                { id: 'g1', items: ['RSI Oversold'] }, // True
                { id: 'g2', items: ['Price > EMA 200'] }   // True (100 > 80)
            ],
            groupOperator: 'AND'
        } as any;

        const result = evaluateStrategy(strategy, mockIndicators, mockPrice, mockCandle);
        expect(result.shouldTrigger).toBe(true);
    });

    it('should fail AND operator if one group fails', () => {
        const strategy: SavedStrategy = {
            id: '1',
            name: 'Test Strat',
            createdAt: 0,
            isActive: true,
            groups: [
                { id: 'g1', items: ['RSI Oversold'] }, // True
                { id: 'g2', items: ['RSI Overbought'] }    // False
            ],
            groupOperator: 'AND'
        } as any;

        const result = evaluateStrategy(strategy, mockIndicators, mockPrice, mockCandle);
        expect(result.shouldTrigger).toBe(false);
    });

    it('should respect OR operator between groups', () => {
        const strategy: SavedStrategy = {
            id: '1',
            name: 'Test Strat',
            createdAt: 0,
            isActive: true,
            groups: [
                { id: 'g1', items: ['RSI Overbought'] }, // False
                { id: 'g2', items: ['Price > EMA 200'] }   // True
            ],
            groupOperator: 'OR'
        } as any;

        const result = evaluateStrategy(strategy, mockIndicators, mockPrice, mockCandle);
        expect(result.shouldTrigger).toBe(true);
    });

    it('should ignore inactive strategies', () => {
        const strategy: SavedStrategy = {
            id: '1',
            name: 'Test Strat',
            createdAt: 0,
            isActive: false, // Inactive
            groups: [{ id: 'g1', items: ['RSI Oversold'] }],
            groupOperator: 'AND'
        } as any;

        const result = evaluateStrategy(strategy, mockIndicators, mockPrice, mockCandle);
        expect(result.shouldTrigger).toBe(false);
    });
});
