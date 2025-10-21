const SITE_ORIGIN = 'https://www.bumsiku.kr';
const ORIGIN_URL = new URL(SITE_ORIGIN);

export const SITE_URL = SITE_ORIGIN;
export const SITE_HOSTNAME = ORIGIN_URL.hostname;

/**
 * Normalize an incoming path or absolute URL so that it always uses the
 * canonical site origin (`https://www.bumsiku.kr`).
 */
export function normalizeSiteUrl(pathOrUrl: string): string {
  try {
    const url = pathOrUrl.startsWith('http') ? new URL(pathOrUrl) : new URL(pathOrUrl, ORIGIN_URL);

    url.protocol = ORIGIN_URL.protocol;
    url.hostname = ORIGIN_URL.hostname;
    url.port = ORIGIN_URL.port;

    if (url.pathname === '/' && !url.search && !url.hash) {
      return ORIGIN_URL.origin;
    }

    return url.toString();
  } catch {
    const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    if (normalizedPath === '/') {
      return ORIGIN_URL.origin;
    }
    return `${ORIGIN_URL.origin}${normalizedPath}`;
  }
}
