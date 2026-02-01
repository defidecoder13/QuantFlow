export type SignalType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface SignalDefinition {
    id: string;
    label: string;
    type: SignalType;
}

export interface SignalCategory {
    id: string;
    label: string;
    signals: SignalDefinition[];
}

export const SIGNAL_CATEGORIES: SignalCategory[] = [
    // 1. Trend Indicators (Moving Averages)
    {
        id: 'MA',
        label: 'Moving Averages (Trend)',
        signals: [
            { id: 'Price > EMA 20', label: 'Price Above EMA 20 (Short-Term Bull)', type: 'BULLISH' },
            { id: 'Price < EMA 20', label: 'Price Below EMA 20 (Short-Term Bear)', type: 'BEARISH' },
            { id: 'Price > EMA 50', label: 'Price Above EMA 50 (Med-Term Bull)', type: 'BULLISH' },
            { id: 'Price < EMA 50', label: 'Price Below EMA 50 (Med-Term Bear)', type: 'BEARISH' },
            { id: 'Price > EMA 200', label: 'Price Above EMA 200 (Long-Term Bull)', type: 'BULLISH' },
            { id: 'Price < EMA 200', label: 'Price Below EMA 200 (Long-Term Bear)', type: 'BEARISH' },
            { id: 'Golden Cross', label: 'Golden Cross (SMA 50 > SMA 200)', type: 'BULLISH' },
            { id: 'Death Cross', label: 'Death Cross (SMA 50 < SMA 200)', type: 'BEARISH' },
            { id: 'EMA 20 > EMA 50', label: 'Trend Alignment (20 > 50)', type: 'BULLISH' },
            { id: 'EMA 20 < EMA 50', label: 'Trend Alignment (20 < 50)', type: 'BEARISH' },
        ]
    },

    // 2. Momentum Oscillators (RSI)
    {
        id: 'RSI',
        label: 'Relative Strength Index (RSI)',
        signals: [
            { id: 'RSI Oversold', label: 'RSI Oversold (< 30)', type: 'BULLISH' },
            { id: 'RSI Overbought', label: 'RSI Overbought (> 70)', type: 'BEARISH' },
            { id: 'RSI > 50', label: 'RSI Above 50 (Bullish Momentum)', type: 'BULLISH' },
            { id: 'RSI < 50', label: 'RSI Below 50 (Bearish Momentum)', type: 'BEARISH' },
            { id: 'RSI Bullish Div', label: 'RSI Bullish Divergence', type: 'BULLISH' },
            { id: 'RSI Bearish Div', label: 'RSI Bearish Divergence', type: 'BEARISH' },
        ]
    },

    // 3. Stochastic Oscillator
    {
        id: 'STOCH',
        label: 'Stochastic Oscillator',
        signals: [
            { id: 'Stoch Oversold', label: 'Stoch Oversold (< 20)', type: 'BULLISH' },
            { id: 'Stoch Overbought', label: 'Stoch Overbought (> 80)', type: 'BEARISH' },
            { id: 'Stoch Bullish Cross', label: 'Stoch K > D Crossover', type: 'BULLISH' },
            { id: 'Stoch Bearish Cross', label: 'Stoch K < D Crossover', type: 'BEARISH' },
        ]
    },

    // 4. MACD
    {
        id: 'MACD',
        label: 'MACD (Momentum)',
        signals: [
            { id: 'MACD Bullish Cross', label: 'MACD Line > Signal Line', type: 'BULLISH' },
            { id: 'MACD Bearish Cross', label: 'MACD Line < Signal Line', type: 'BEARISH' },
            { id: 'MACD > 0', label: 'MACD Above Zero Line', type: 'BULLISH' },
            { id: 'MACD < 0', label: 'MACD Below Zero Line', type: 'BEARISH' },
        ]
    },

    // 5. Trend Following (ADX & Supertrend)
    {
        id: 'TREND_FOLLOW',
        label: 'Trend Following',
        signals: [
            { id: 'Supertrend Bullish', label: 'Supertrend is Green (Buy)', type: 'BULLISH' },
            { id: 'Supertrend Bearish', label: 'Supertrend is Red (Sell)', type: 'BEARISH' },
            { id: 'ADX > 25', label: 'ADX Strong Trend (> 25)', type: 'NEUTRAL' },
            { id: 'ADX > 50', label: 'ADX Very Strong Trend (> 50)', type: 'NEUTRAL' },
            { id: 'Parabolic SAR < Price', label: 'Parabolic SAR Below Price', type: 'BULLISH' },
            { id: 'Parabolic SAR > Price', label: 'Parabolic SAR Above Price', type: 'BEARISH' },
        ]
    },

    // 6. Ichimoku Cloud
    {
        id: 'ICHIMOKU',
        label: 'Ichimoku Cloud',
        signals: [
            { id: 'Price > Cloud', label: 'Price Above Kumo Cloud', type: 'BULLISH' },
            { id: 'Price < Cloud', label: 'Price Below Kumo Cloud', type: 'BEARISH' },
            { id: 'TK Cross Bullish', label: 'Tenkan-sen > Kijun-sen', type: 'BULLISH' },
            { id: 'TK Cross Bearish', label: 'Tenkan-sen < Kijun-sen', type: 'BEARISH' },
            { id: 'Chikou > Price', label: 'Chikou Span Above Price', type: 'BULLISH' },
        ]
    },

    // 7. Volatility (BB & Keltner)
    {
        id: 'VOLATILITY',
        label: 'Volatility Channels',
        signals: [
            { id: 'Price < Lower BB', label: 'Price Below Lower Bollinger Band', type: 'BULLISH' },
            { id: 'Price > Upper BB', label: 'Price Above Upper Bollinger Band', type: 'BEARISH' },
            { id: 'Bollinger Band Squeeze', label: 'Bollinger Band Squeeze', type: 'NEUTRAL' },
            { id: 'Price > Upper Keltner', label: 'Price Breakout Upper Keltner', type: 'BULLISH' },
            { id: 'Price < Lower Keltner', label: 'Price Breakout Lower Keltner', type: 'BEARISH' },
        ]
    },

    // 8. Volume & Money Flow
    {
        id: 'VOLUME',
        label: 'Volume & Flow',
        signals: [
            { id: 'Volume > SMA 20', label: 'Volume Spike (> 20 Avg)', type: 'NEUTRAL' },
            { id: 'OBV Trending Up', label: 'OBV Trending Up', type: 'BULLISH' },
            { id: 'OBV Trending Down', label: 'OBV Trending Down', type: 'BEARISH' },
            { id: 'MFI Oversold', label: 'MFI Oversold (< 20)', type: 'BULLISH' },
            { id: 'MFI Overbought', label: 'MFI Overbought (> 80)', type: 'BEARISH' },
        ]
    },

    // 9. CCI
    {
        id: 'CCI',
        label: 'Commodity Channel Index',
        signals: [
            { id: 'CCI < -100', label: 'CCI Oversold (< -100)', type: 'BULLISH' },
            { id: 'CCI > 100', label: 'CCI Overbought (> 100)', type: 'BEARISH' },
            { id: 'CCI > 0', label: 'CCI Above Zero', type: 'BULLISH' },
            { id: 'CCI < 0', label: 'CCI Below Zero', type: 'BEARISH' },
        ]
    },

    // 10. Pivot Points
    {
        id: 'PIVOTS',
        label: 'Pivot Points (S/R)',
        signals: [
            { id: 'Price > Pivot P', label: 'Price Above Daily Pivot', type: 'BULLISH' },
            { id: 'Price < Pivot P', label: 'Price Below Daily Pivot', type: 'BEARISH' },
            { id: 'Price at S1', label: 'Price Near Support 1', type: 'BULLISH' },
            { id: 'Price at R1', label: 'Price Near Resistance 1', type: 'BEARISH' },
        ]
    },

    // 11. Price Action
    {
        id: 'PATTERN',
        label: 'Candlestick Patterns',
        signals: [
            { id: 'Bullish Engulfing', label: 'Bullish Engulfing', type: 'BULLISH' },
            { id: 'Bearish Engulfing', label: 'Bearish Engulfing', type: 'BEARISH' },
            { id: 'Hammer', label: 'Hammer (Reversal)', type: 'BULLISH' },
            { id: 'Shooting Star', label: 'Shooting Star (Reversal)', type: 'BEARISH' },
            { id: 'Morning Star', label: 'Morning Star', type: 'BULLISH' },
            { id: 'Evening Star', label: 'Evening Star', type: 'BEARISH' },
        ]
    }
];

export const getSignalLabel = (id: string) => {
    for (const cat of SIGNAL_CATEGORIES) {
        const sig = cat.signals.find(s => s.id === id);
        if (sig) return sig.label;
    }
    return id;
};

export const getSignalCategory = (id: string) => {
    for (const cat of SIGNAL_CATEGORIES) {
        if (cat.signals.some(s => s.id === id)) return cat;
    }
    return null;
};
