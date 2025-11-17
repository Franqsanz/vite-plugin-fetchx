/**
 * Serializa las opciones básicas.
 */
function serializeOptions(options) {
    return `
    ({
      baseURL: ${JSON.stringify(options.baseURL)},
      include: ${JSON.stringify(options.include)},
      exclude: ${JSON.stringify(options.exclude)},
      headers: ${JSON.stringify(options.headers)},
      log: ${JSON.stringify(options.log)},
      tokenKey: ${JSON.stringify(options.tokenKey || 'token')},
    })
  `;
}
/**
 * Genera el código de runtime del plugin para interceptar `fetch`.
 */
export function createRuntimeCode(options) {
    const serializedOptions = serializeOptions(options);
    // getToken por defecto
    const getTokenFn = typeof options.getToken === 'function'
        ? options.getToken.toString()
        : options.getToken || '() => localStorage.getItem("token")';
    // refreshToken: puede ser URL string o función
    let refreshTokenFn;
    if (typeof options.refreshToken === 'string') {
        // Si es string, asumir que es una URL
        const refreshUrl = options.refreshToken;
        refreshTokenFn = `async () => {
      try {
        const res = await originalFetch('${refreshUrl}', {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) return null;
        const data = await res.json();
        const token = data.token || data.accessToken || data.access_token;
        if (token) {
          localStorage.setItem(opts.tokenKey, token);
          return token;
        }
        return null;
      } catch (err) {
        if (opts.log) console.error('[fetchx] refresh failed:', err);
        return null;
      }
    }`;
    }
    else if (typeof options.refreshToken === 'function') {
        // Si es función, usar tal cual
        refreshTokenFn = options.refreshToken.toString();
    }
    else {
        // No hay refresh
        refreshTokenFn = 'async () => null';
    }
    return `
    const originalFetch = window.fetch;
    const opts = ${serializedOptions};
    const getToken = ${getTokenFn};
    const refreshToken = ${refreshTokenFn};

    window.fetch = async function(url, config = {}) {
      // Añadir baseURL si es necesario
      if (opts.baseURL && !/^https?:\\/\\//.test(url)) {
        url = opts.baseURL.replace(/\\/$/, '') + '/' + url.replace(/^\\//, '');
      }

      // Filtros include/exclude
      const shouldInclude = opts.include?.length
        ? opts.include.some(p => url.includes(p))
        : true;
      const shouldExclude = opts.exclude?.some(p => url.includes(p));

      if (shouldExclude || !shouldInclude) {
        return originalFetch(url, config);
      }

      // Obtener token
      const token = await getToken?.();
      if (opts.log) console.log('[fetchx] token ->', token);

      // Merge headers
      const mergedHeaders = {
        ...opts.headers,
        ...(config.headers || {}),
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      };

      try {
        let response = await originalFetch(url, { ...config, headers: mergedHeaders });

        // Manejar 401
        if (response.status === 401) {
          if (opts.log) console.log('[fetchx] 401 detected, attempting refresh...');
          const newToken = await refreshToken();

          if (newToken) {
            if (opts.log) console.log('[fetchx] token refreshed, retrying request...');
            const retryHeaders = {
              ...mergedHeaders,
              Authorization: \`Bearer \${newToken}\`,
            };
            response = await originalFetch(url, { ...config, headers: retryHeaders });
          } else {
            if (opts.log) console.warn('[fetchx] refresh failed, returning 401');
          }
        }

        if (opts.log) console.log(\`[fetchx] \${url} -> \${response.status}\`);
        return response;
      } catch (err) {
        if (opts.log) console.error('[fetchx error]', err);
        throw err;
      }
    };

    window.__fetchx = window.fetch;
  `;
}
