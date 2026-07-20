/**
 * Prefix owned public assets with Vite `BASE_URL` (e.g. `/TTSetupBuilder/` on GitHub Pages).
 * Catalog JSON keeps root-absolute paths like `/catalog/…`; this adapts them at runtime.
 */
export function publicAssetUrl(src: string): string {
  if (
    !src ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:') ||
    src.startsWith('data:')
  ) {
    return src;
  }
  const base = import.meta.env.BASE_URL;
  const path = src.replace(/^\//, '');
  return `${base}${path}`;
}

/** React Router basename: BASE_URL without trailing slash (empty → undefined). */
export function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base.length > 0 ? base : undefined;
}
