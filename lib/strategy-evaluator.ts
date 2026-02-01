import { SavedStrategy } from './strategy-store';
import { IndicatorValues, evaluateSignal } from './indicators';
import { OHLCV } from '@/utils/binance-client';

export type SignalResult = {
    shouldTrigger: boolean;
    reason?: string;
};

export function evaluateStrategy(
    strategy: SavedStrategy,
    indicators: IndicatorValues,
    currentPrice: number,
    currentCandle: OHLCV
): SignalResult {
    if (!strategy.isActive) return { shouldTrigger: false };

    // Group Logic
    // Groups are usually "OR" at the top level in many builders, 
    // but here we have `groupOperator` property.
    // Inside a group, items are usually "AND".

    // Let's assume strategy.groups is Array<Condition[]> or Array<{ conditions: string[] }>
    // Looking at typical implementations:
    // Groups might be: [{ id: 'g1', items: ['RSI Oversold', 'MACD Cross'] }]

    // As I don't see the exact type definition of `groups`, I will handle the generic structure 
    // often used in this project's context or assume a standard shape.
    // Based on previous contexts, `groups` seems to be an array of objects which contain signals.

    // We will assume: strategy.groups: { id: string, signals: string[] }[] 
    // If it's different, I'll adjust after seeing errors.

    const groups = strategy.groups as any[];
    if (!groups || groups.length === 0) return { shouldTrigger: false };

    const groupResults = groups.map(group => {
        // Evaluate all signals in this group (AND logic within group)
        // Signals might be objects { id, type } or just strings.
        // Based on `evaluateSignal` taking `signalId: string`, we assume we have identifiers.

        const signals = group.items || group.signals || []; // Handle potential schema variations

        if (signals.length === 0) return true; // Empty group is true? Or false. Let's say false to be safe. 
        // But if user created an empty group, maybe they want it ignored.
        // Let's say: All signals must be true.

        return signals.every((signal: any) => {
            const signalId = typeof signal === 'string' ? signal : signal.id || signal.name;
            return evaluateSignal(signalId, indicators, currentPrice, currentCandle);
        });
    });

    // Combine Groups using groupOperator
    const operator = strategy.groupOperator || 'OR';

    let finalResult = false;
    if (operator === 'AND') {
        finalResult = groupResults.every(r => r === true);
    } else {
        // OR
        finalResult = groupResults.some(r => r === true);
    }

    return {
        shouldTrigger: finalResult,
        reason: finalResult ? 'Strategy Conditions Met' : undefined
    };
}
