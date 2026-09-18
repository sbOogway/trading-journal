import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  LineStyle,
  type IChartApi,
  type IPrimitivePaneRenderer,
  type IPrimitivePaneView,
  type ISeriesApi,
  type ISeriesPrimitive,
  type SeriesAttachedParameter,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

type Side = "LONG" | "SHORT";

type Trade = {
  asset: string;
  side: Side;
  entry: number;
  fill: number | null;
  stop: number | null;
  target: number | null;
  time: number;
  timeframe: string;
};

type Candle = { time: number; open: number; high: number; low: number; close: number };

const GREEN = "#059669";
const RED = "#e11d48";
const ENTRY = "#2563eb";

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function themeOptions() {
  const dark = isDark();
  const text = dark ? "#a3a3a3" : "#525252";
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  return {
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: text,
      fontFamily: "Geist Mono, ui-monospace, monospace",
      attributionLogo: false,
    },
    grid: { vertLines: { color: grid }, horzLines: { color: grid } },
    timeScale: { borderColor: grid, timeVisible: true, secondsVisible: false, rightOffset: 14 },
    rightPriceScale: { borderColor: grid },
    crosshair: {
      vertLine: { color: text, labelBackgroundColor: dark ? "#262626" : "#e5e5e5" },
      horzLine: { color: text, labelBackgroundColor: dark ? "#262626" : "#e5e5e5" },
    },
  };
}

/**
 * Shaded risk (entry→stop) and reward (entry→target) zones, drawn from the
 * fill time to the right edge — the look of TradingView's position tool.
 */
class PositionZones implements ISeriesPrimitive<Time> {
  private series?: ISeriesApi<"Candlestick">;
  private chart?: IChartApi;
  private view: IPrimitivePaneView;

  constructor(private trade: Trade, private barTime: UTCTimestamp) {
    this.view = {
      zOrder: () => "bottom",
      renderer: (): IPrimitivePaneRenderer => ({
        draw: (target) => {
          const { series, chart, trade } = this;
          if (!series || !chart) return;
          const anchor = trade.fill ?? trade.entry;
          const x0 = chart.timeScale().timeToCoordinate(this.barTime);
          const yEntry = series.priceToCoordinate(anchor);
          if (x0 === null || yEntry === null) return;
          const zones: { price: number | null; color: string }[] = [
            { price: trade.stop, color: RED },
            { price: trade.target, color: GREEN },
          ];
          target.useBitmapCoordinateSpace(({ context, horizontalPixelRatio: hr, verticalPixelRatio: vr, bitmapSize }) => {
            for (const { price, color } of zones) {
              if (price === null) continue;
              const y = series.priceToCoordinate(price);
              if (y === null) continue;
              context.fillStyle = color;
              context.globalAlpha = 0.12;
              const top = Math.min(yEntry, y) * vr;
              const height = Math.abs(y - yEntry) * vr;
              context.fillRect(x0 * hr, top, bitmapSize.width - x0 * hr, height);
            }
            context.globalAlpha = 1;
          });
        },
      }),
    };
  }

  attached({ chart, series }: SeriesAttachedParameter<Time, "Candlestick">) {
    this.chart = chart;
    this.series = series;
  }

  paneViews() {
    return [this.view];
  }
}

export function mountTradeChart(el: HTMLElement) {
  const trade: Trade = JSON.parse(el.dataset.trade!);
  const candles: Candle[] = JSON.parse(el.dataset.candles!);

  const chart = createChart(el, {
    ...themeOptions(),
    autoSize: true,
    handleScale: { axisPressedMouseMove: false },
  });

  const series = chart.addSeries(CandlestickSeries, {
    upColor: GREEN,
    downColor: RED,
    wickUpColor: GREEN,
    wickDownColor: RED,
    borderVisible: false,
    priceLineVisible: false,
  });
  series.setData(candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })));

  // Horizontal levels, labelled on the price axis.
  const line = (price: number, color: string, title: string, style = LineStyle.Solid, width: 1 | 2 = 2) =>
    series.createPriceLine({ price, color, title, lineWidth: width, lineStyle: style, axisLabelVisible: true });

  if (trade.fill !== null) line(trade.entry, ENTRY, "Entry (planned)", LineStyle.Dashed, 1);
  else line(trade.entry, ENTRY, "Entry");
  if (trade.fill !== null) line(trade.fill, ENTRY, "Fill");
  if (trade.stop !== null) line(trade.stop, RED, "Stop");
  if (trade.target !== null) line(trade.target, GREEN, "Target");

  // Snap the trade time to a bar: coordinates only resolve for times that exist in the data.
  const step = candles.length > 1 ? candles[1].time - candles[0].time : 3600;
  const last = candles[candles.length - 1].time;
  const fillCandle = Math.min(Math.floor(trade.time / step) * step, last) as UTCTimestamp;

  series.attachPrimitive(new PositionZones(trade, fillCandle));

  // Marker at the candle where the trade was opened.
  createSeriesMarkers(series, [
    {
      time: fillCandle,
      position: trade.side === "LONG" ? "belowBar" : "aboveBar",
      shape: trade.side === "LONG" ? "arrowUp" : "arrowDown",
      color: ENTRY,
      text: `${trade.side} @ ${trade.fill ?? trade.entry}`,
    },
  ]);

  chart.timeScale().fitContent();

  // Follow the site's light/dark toggle.
  new MutationObserver(() => chart.applyOptions(themeOptions())).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}
