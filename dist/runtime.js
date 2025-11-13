/**
 * Construye la configuración incrustando funciones como string.
 */
function serializeOptions(options) {
    return `
    ({
      baseURL: ${JSON.stringify(options.baseURL)},
      include: ${JSON.stringify(options.include)},
      exclude: ${JSON.stringify(options.exclude)},
      headers: ${JSON.stringify(options.headers)},
      log: ${JSON.stringify(options.log)},
    })
  `;
}
/**
 * Genera el código de runtime del plugin para interceptar `fetch`.
 */
export function createRuntimeCode(options) {
    const serializedOptions = serializeOptions(options);
    const getTokenFn = typeof options.getToken === 'function'
        ? options.getToken.toString()
        : options.getToken || '() => localStorage.getItem("token")';
    const refreshTokenFn = typeof options.refreshToken === 'function'
        ? options.refreshToken.toString()
        : options.refreshToken || 'async () => null';
    return `
    const originalFetch = window.fetch;
    const opts = ${serializedOptions};
    const getToken = ${getTokenFn};
    const refreshToken = ${refreshTokenFn};

    window.fetch = async function(url, config = {}) {
      if (opts.baseURL && !/^https?:\\/\\//.test(url)) {
        url = opts.baseURL.replace(/\\/$/, '') + '/' + url.replace(/^\\//, '');
      }

      const shouldInclude = opts.include?.length
        ? opts.include.some(p => url.includes(p))
        : true;

      const shouldExclude = opts.exclude?.some(p => url.includes(p));

      if (shouldExclude || !shouldInclude) {
        return originalFetch(url, config);
      }

      const token = getToken?.();

      if (opts.log) console.log('[fetchx] token ->', token);

      const mergedHeaders = {
        ...opts.headers,
        ...(config.headers || {}),
        ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
      };

      try {
        let response = await originalFetch(url, { ...config, headers: mergedHeaders });

        if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            const retryHeaders = {
              ...mergedHeaders,
              Authorization: \`Bearer \${newToken}\`,
            };
            response = await originalFetch(url, { ...config, headers: retryHeaders });
          }
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          const message = \`[fetchx] \${response.status} \${response.statusText}: \${errorText}\`;
          if (opts.log) console.error(message);
          throw new Error(message);
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
