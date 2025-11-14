/**
 * Configuration options for the Fetchx plugin.
 *
 * This plugin intercepts `fetch()` calls at runtime,
 * allowing you to inject headers, handle tokens, and define included/excluded routes.
 */
export interface FetchxOptions {
    /**
     * Base URL that will be automatically prepended to relative routes.
     *
     * @example
     * baseURL: 'https://api.myapp.com'
     * // fetch('/users') → fetch('https://api.myapp.com/users')
     */
    baseURL?: string;
    /**
     * List of URL patterns or fragments that should be intercepted by the plugin.
     * If not defined, all URLs will be included by default.
     *
     * @example
     * include: ['/api', 'https://backend.com']
     */
    include?: string[];
    /**
     * List of URL patterns or fragments that should be **excluded** from the interceptor.
     *
     * @example
     * exclude: ['/auth/login', '/static']
     */
    exclude?: string[];
    /**
     * Custom headers that will be added to all requests.
     *
     * @example
     * headers: { 'X-App-Version': '1.2.0' }
     */
    headers?: Record<string, string>;
    /**
     * Function that returns the current token.
     * Can be synchronous or asynchronous.
     *
     * @example
     * getToken: () => localStorage.getItem("token")
     */
    getToken?: (() => string | null | Promise<string | null>) | string;
    /**
     * Attempt to refresh token on a 401 response.
     *
     * @example
     * refreshToken: async () => {
     *   const r = await fetch("/refresh");
     *   return (await r.json()).token;
     * }
     */
    refreshToken?: (() => Promise<string | null>) | string;
    /**
     * If enabled, shows intercepted requests and errors in the console.
     *
     * @default false
     * @example
     * log: true
     */
    log?: boolean;
}
