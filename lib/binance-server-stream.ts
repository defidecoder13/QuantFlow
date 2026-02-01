import WebSocket from 'ws';

let ws: WebSocket | null = null;
let candles: any[] = [];

export function startBinanceStream(pair: string) {
  if (ws) return;

  const normalizedPair = pair.replace('/', '').toLowerCase();
  ws = new WebSocket(
    `wss://stream.binance.com:9443/ws/${normalizedPair}@kline_1m`
  );

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data.toString());
      const k = data.k;

      if (k.x) {
        const point = {
          time: new Date(k.t).toLocaleTimeString(),
          price: Number(k.c),
        };

        candles.push(point);
        candles = candles.slice(-100);
      }
    } catch {
      // ignore parse errors
    }
  };
}

export function getCandles() {
  return candles;
}

export default startBinanceStream;
