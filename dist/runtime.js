/**
 * Genera el código de runtime del plugin para interceptar `fetch`.
 * @param options - Configuración del plugin (baseURL, include, exclude, headers, etc.)
 */
export function createRuntimeCode(options) {
    return `
  const originalFetch = window.fetch;
  const opts = ${JSON.stringify(options)};
  const getToken = ${options.getToken || '() => localStorage.getItem("token")'};
  const refreshToken = ${options.refreshToken || 'async () => null'};

  window.fetch = async function(url, config = {}) {
    // --- BASE URL ---
    if (opts.baseURL && !/^https?:\\/\\//.test(url)) {
      url = opts.baseURL.replace(/\\/$/, '') + '/' + url.replace(/^\\//, '');
    }

    // --- INCLUDE / EXCLUDE ---
    const shouldInclude = opts.include?.length
      ? opts.include.some(p => url.includes(p))
      : true;
    const shouldExclude = opts.exclude?.some(p => url.includes(p));

    if (shouldExclude || !shouldInclude) {
      return originalFetch(url, config);
    }

    // --- HEADERS Y TOKEN ---
    const token = getToken?.();
    const mergedHeaders = {
      ...opts.headers,
      ...(config.headers || {}),
      ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
    };

    try {
      // --- FETCH + REFRESH ---
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

      // --- MANEJO DE ERRORES HTTP ---
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

  // Exponer la versión interceptada
  window.__fetchx = window.fetch;
`;
}
