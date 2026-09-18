import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type Candle = { time: number; open: number; high: number; low: number; close: number };
export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

const TIMEFRAME_MS: Record<Timeframe, number> = {
  "1m": 60_000,
  "5m": 300_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "4h": 14_400_000,
  "1d": 86_400_000,
};

// Bybit's kline `interval` values.
const BYBIT_INTERVAL: Record<Timeframe, string> = {
  "1m": "1", "5m": "5", "15m": "15", "30m": "30", "1h": "60", "4h": "240", "1d": "D",
};

const CACHE_DIR = join(process.cwd(), "node_modules", ".cache", "candles");

export function timeframeMs(tf: Timeframe) {
  return TIMEFRAME_MS[tf];
}

/**
 * Fetch OHLC candles around a trade from Bybit's public API (runs at build time).
 * `before`/`after` are candle counts; the window is capped at "now".
 * Results are cached on disk once the window is fully in the past.
 */
export async function fetchCandles(opts: {
  platform?: string;
  symbol: string;
  timeframe: Timeframe;
  at: Date;
  before?: number;
  after?: number;
}): Promise<Candle[]> {
  const { symbol, timeframe, at, before = 60, after = 40 } = opts;
  const platform = (opts.platform ?? "BYBIT").toUpperCase();
  if (platform !== "BYBIT") {
    console.warn(`[candles] platform ${platform} not supported, skipping chart for ${symbol}`);
    return [];
  }

  const step = TIMEFRAME_MS[timeframe];
  const anchor = Math.floor(at.getTime() / step) * step;
  const start = anchor - before * step;
  const end = Math.min(anchor + after * step, Date.now());
  const complete = anchor + after * step < Date.now();

  const cacheFile = join(CACHE_DIR, `${platform}-${symbol}-${timeframe}-${start}-${anchor + after * step}.json`);
  if (complete) {
    try {
      return JSON.parse(await readFile(cacheFile, "utf8"));
    } catch {
      /* not cached yet */
    }
  }

  let candles: Candle[] = [];
  // Perpetuals first, then spot: Bybit keys the same ticker under both.
  for (const category of ["linear", "spot"]) {
    const url = new URL("https://api.bybit.com/v5/market/kline");
    url.search = new URLSearchParams({
      category,
      symbol,
      interval: BYBIT_INTERVAL[timeframe],
      start: String(start),
      end: String(end),
      limit: "1000",
    }).toString();
    try {
      const res = await fetch(url);
      const json = await res.json();
      const list: string[][] = json?.result?.list ?? [];
      if (list.length) {
        candles = list
          .map((c) => ({
            time: Math.floor(Number(c[0]) / 1000),
            open: Number(c[1]),
            high: Number(c[2]),
            low: Number(c[3]),
            close: Number(c[4]),
          }))
          .sort((a, b) => a.time - b.time);
        break;
      }
    } catch (err) {
      console.warn(`[candles] fetch failed for ${symbol} (${category}):`, err);
    }
  }

  if (candles.length && complete) {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cacheFile, JSON.stringify(candles));
  }
  return candles;
}
