// lib/candle-store.ts
// Store for the latest candles (in memory)
let storedCandles: any[] = [];

export const addCandle = (candle: any) => {
  // Add the new candle to our store
  storedCandles.push(candle);
  
  // Keep only the last 100 candles to prevent unlimited growth
  if (storedCandles.length > 100) {
    storedCandles = storedCandles.slice(-100);
  }
  
  console.log(`Received new candle: ${candle.time} - Close: ${candle.close}`);
};

export const getCandles = (): any[] => {
  return [...storedCandles]; // Return a copy to prevent external mutations
};

export const clearCandles = () => {
  storedCandles = [];
};