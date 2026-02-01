export interface OHLCV {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export const fetchBinanceCandles = async (symbol: string, interval: string, limit: number = 200): Promise<OHLCV[]> => {
    // Map interval to Binance format if needed (usually matches: 1m, 5m, 1h, 1d)
    const formattedSymbol = symbol.replace('/', '').toUpperCase(); // e.g., BTC/USDT -> BTCUSDT

    const url = `https://api.binance.com/api/v3/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Binance API error: ${response.statusText}`);
        }
        const data = await response.json();

        // Binance returns array of arrays: [time, open, high, low, close, vol, ...]
        return data.map((d: any[]) => ({
            time: d[0],
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5])
        }));
    } catch (error) {
        console.error('Failed to fetch candles:', error);
        return [];
    }
};
