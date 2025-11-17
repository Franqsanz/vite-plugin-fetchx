/**
 * Configuration options for the Fetchx plugin.
 */
export interface FetchxOptions {
  /**
   * Base URL prepended to relative routes.
   * @example 'https://api.myapp.com'
   */
  baseURL?: string;

  /**
   * URL patterns to intercept. If undefined, all URLs are included.
   * @example ['/api', 'https://backend.com']
   */
  include?: string[];

  /**
   * URL patterns to exclude from interception.
   * @example ['/auth/login', '/static']
   */
  exclude?: string[];

  /**
   * Custom headers added to all requests.
   * @example { 'X-App-Version': '1.2.0' }
   */
  headers?: Record<string, string>;

  /**
   * Function or string that returns the current token.
   * @default () => localStorage.getItem("token")
   * @example () => sessionStorage.getItem("authToken")
   */
  getToken?: (() => string | null | Promise<string | null>) | string;

  /**
   * Refresh token on 401 response.
   *
   * **Simple usage (URL string):**
   * The plugin will POST to this URL and expect `{ token: string }` in response.
   * The new token will be automatically saved to localStorage with the same key as getToken.
   *
   * @example '/api/auth/refresh'
   *
   * **Advanced usage (function):**
   * Custom logic for token refresh.
   *
   * @example
   * async () => {
   *   const r = await fetch("/refresh");
   *   const data = await r.json();
   *   localStorage.setItem('token', data.token);
   *   return data.token;
   * }
   */
  refreshToken?: string | (() => Promise<string | null>);

  /**
   * Token key name in localStorage.
   * Only used when refreshToken is a URL string.
   * @default "token"
   */
  tokenKey?: string;

  /**
   * Shows intercepted requests and errors in console.
   * @default false
   */
  log?: boolean;
}
