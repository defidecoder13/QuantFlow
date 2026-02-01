import { startBinanceStream, getCandles } from '@/lib/binance-server-stream';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pair = searchParams.get('pair') ?? 'BTCUSDT';

  startBinanceStream(pair);

  // Return current candles snapshot
  const candles = getCandles();
  return new Response(JSON.stringify(candles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
