import type { FetchxOptions } from './types';
/**
 * Genera el código de runtime del plugin para interceptar `fetch`.
 * @param options - Configuración del plugin (baseURL, include, exclude, headers, etc.)
 */
export declare function createRuntimeCode(options: FetchxOptions): string;
