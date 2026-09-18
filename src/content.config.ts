import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    // Trade metadata, rendered by <TradeCard />
    asset: z.string().optional(),
    platform: z.string().optional(),
    side: z.enum(["LONG", "SHORT"]).optional(),
    risk: z.string().optional(),
    // Trade levels, drawn on the chart by <TradeChart />. Requires `asset` and `side`.
    entry: z.number().optional(), // planned entry price
    fill: z.number().optional(), // actual fill price, if different from entry
    stop: z.number().optional(),
    target: z.number().optional(),
    timeframe: z.enum(["1m", "5m", "15m", "30m", "1h", "4h", "1d"]).default("1h"),
  }),
});

export const collections = { blog };
