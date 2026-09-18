// Prefix an absolute path with the configured `base` (needed for GitHub project pages).
export const withBase = (path: string) =>
	import.meta.env.BASE_URL.replace(/\/$/, '') + path;
