import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { withBase } from '../utils';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: new URL(withBase('/'), context.site).href,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description ?? '',
			pubDate: post.data.pubDate,
			link: withBase(`/blog/${post.id}/`),
		})),
	});
}
