import { useEffect, useState, useRef } from 'react';

export type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type TickerData = {
  price: number;
  changePercent: number;
};

type Subscriber = (data: any) => void;

class BinanceChannel {
  private ws: WebSocket | null = null;
  // Map of streamName -> Set of callbacks
  private subscribers: Map<string, Set<Subscriber>> = new Map();
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay = 1000;
  private activeStreams: Set<string> = new Set();
  private pendingMessages: string[] = [];

  private readonly URL = 'wss://stream.binance.com:9443/stream';

  constructor() { }

  /**
   * Universal subscribe method
   */
  public subscribe(streamName: string, callback: Subscriber) {
    if (!this.subscribers.has(streamName)) {
      this.subscribers.set(streamName, new Set());
    }

    const set = this.subscribers.get(streamName)!;
    set.add(callback);

    // If this is the first subscriber for this stream, send SUBSCRIBE
    if (set.size === 1) {
      this.sendSocketMessage('SUBSCRIBE', [streamName]);
    }

    this.ensureConnection();

    return () => {
      const s = this.subscribers.get(streamName);
      if (s) {
        s.delete(callback);
        if (s.size === 0) {
          this.subscribers.delete(streamName);
          this.sendSocketMessage('UNSUBSCRIBE', [streamName]);
        }
      }
    };
  }

  private ensureConnection() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.connect();
  }

  private connect() {
    this.isConnecting = true;

    // Create new socket and capture it in closure
    const socket = new WebSocket(this.URL);
    this.ws = socket;

    socket.onopen = () => {
      // Race condition check: If this socket is no longer the active one, ignore event
      if (this.ws !== socket) return;

      this.isConnecting = false;
      this.reconnectDelay = 1000; // Reset delay
      this.activeStreams.clear();

      // Flushed pending messages safely
      this.pendingMessages.forEach(msg => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(msg);
        }
      });
      this.pendingMessages = [];

      // Resubscribe to streams
      const streamsToSubscribe = Array.from(this.subscribers.keys());
      if (streamsToSubscribe.length > 0) {
        this.sendSocketMessage('SUBSCRIBE', streamsToSubscribe);
      }
    };

    socket.onmessage = (event) => {
      if (this.ws !== socket) return;

      try {
        const data = JSON.parse(event.data);

        if (data.stream && data.data) {
          const streamName = data.stream;
          const payload = data.data;

          if (streamName.includes('kline')) {
            const k = payload.k;
            const point: CandlePoint = {
              time: Math.floor(k.t / 1000), // Seconds
              open: Number(k.o),
              high: Number(k.h),
              low: Number(k.l),
              close: Number(k.c)
            };
            this.notify(streamName, point);
          } else if (streamName.includes('ticker')) {
            const ticker: TickerData = {
              price: Number(payload.c),
              changePercent: Number(payload.P)
            };
            this.notify(streamName, ticker);
          }
        }
      } catch (err) {
        // Quiet parse errors
      }
    };

    socket.onerror = (err) => {
      if (this.ws !== socket) return;
      this.isConnecting = false;
    };

    socket.onclose = () => {
      if (this.ws !== socket) return;

      this.isConnecting = false;
      this.ws = null;
      this.activeStreams.clear();

      if (this.subscribers.size > 0) {
        const delay = this.reconnectDelay;
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      }
    };
  }

  private notify(streamName: string, data: any) {
    const callbacks = this.subscribers.get(streamName);
    callbacks?.forEach((cb) => cb(data));
  }

  private sendSocketMessage(method: 'SUBSCRIBE' | 'UNSUBSCRIBE', params: string[]) {
    const validParams = params.filter(p => {
      if (method === 'SUBSCRIBE') {
        if (this.activeStreams.has(p)) return false;
        this.activeStreams.add(p);
        return true;
      } else {
        if (!this.activeStreams.has(p)) return false;
        this.activeStreams.delete(p);
        return true;
      }
    });

    if (validParams.length === 0) return;

    const msg = JSON.stringify({
      method,
      params: validParams,
      id: Date.now()
    });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msg);
    } else {
      if (method === 'SUBSCRIBE') {
        this.pendingMessages.push(msg);
      }
    }
  }
}

const globalKey = Symbol.for('__BINANCE_SOCKET_MANAGER_V3__');
const globalScope = globalThis as any;

if (!globalScope[globalKey]) {
  globalScope[globalKey] = new BinanceChannel();
}

export const socketManager: BinanceChannel = globalScope[globalKey];

export function useBinanceCandles(symbol: string, interval: string = '1m') {
  const [lastCandle, setLastCandle] = useState<CandlePoint | null>(null);
  const symbolRef = useRef(symbol);
  const intervalRef = useRef(interval);

  useEffect(() => {
    symbolRef.current = symbol;
    intervalRef.current = interval;
    setLastCandle(null);
    if (!symbol) return;

    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const unsubscribe = socketManager.subscribe(streamName, (data: CandlePoint) => {
      if (symbolRef.current === symbol && intervalRef.current === interval) {
        setLastCandle(data);
      }
    });
    return unsubscribe;
  }, [symbol, interval]);

  return lastCandle;
}

export function useBinanceTicker(symbol: string) {
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const symbolRef = useRef(symbol);

  useEffect(() => {
    symbolRef.current = symbol;
    setTicker(null);
    if (!symbol) return;

    // Use 24hr ticker stream
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const unsubscribe = socketManager.subscribe(streamName, (data: TickerData) => {
      if (symbolRef.current === symbol) {
        setTicker(data);
      }
    });
    return unsubscribe;
  }, [symbol]);

  return ticker;
}
