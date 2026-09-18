import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Trading Journal",
  DESCRIPTION: "A journal of trades, decisions and the emotions behind them.",
  EMAIL: "mattiapapaccioli@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 10,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "A journal of trades, decisions and the emotions behind them.",
};

export const BLOG: Metadata = {
  TITLE: "Journal",
  DESCRIPTION: "Every entry documents a single trade: the thesis, the execution, and what it felt like.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/sbOogway",
  },
];
