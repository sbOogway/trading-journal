import rss from "@astrojs/rss";
import { SITE } from "@consts";
import { withBase } from "@lib/utils";
import { getCollection } from "astro:content";

export async function GET(context) {
  const items = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    site: new URL(withBase("/"), context.site).href,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.date,
      link: withBase(`/blog/${item.id}/`),
    })),
  });
}
