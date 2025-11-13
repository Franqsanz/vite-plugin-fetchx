import type { FetchxOptions } from './types';

export function createRuntimeCode(options: FetchxOptions): string {
  return `
  const originalFetch = window.fetch;
  const opts = ${JSON.stringify(options)};
  const getToken = ${options.getToken || '() => localStorage.getItem("token")'};
  const refreshToken = ${options.refreshToken || 'async () => null'};

  window.fetch = async function(url, config = {}) {
    const shouldInclude = opts.include?.length
      ? opts.include.some(p => url.includes(p))
      : true;
    const shouldExclude = opts.exclude?.some(p => url.includes(p));
    if (shouldExclude) return originalFetch(url, config);

    const token = getToken?.();
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
