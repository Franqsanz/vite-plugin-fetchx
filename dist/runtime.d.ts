import type { FetchxOptions } from './types';
/**
 * Genera el código de runtime del plugin para interceptar `fetch`.
 */
export declare function createRuntimeCode(options: FetchxOptions): string;
