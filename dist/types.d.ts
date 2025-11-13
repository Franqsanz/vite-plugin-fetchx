/**
 * Opciones de configuración para el plugin Fetchx.
 *
 * Este plugin intercepta las llamadas `fetch()` en tiempo de ejecución,
 * permitiendo inyectar encabezados, manejar tokens y definir rutas incluidas/excluidas.
 */
export interface FetchxOptions {
    /**
     * URL base que se antepondrá automáticamente a las rutas relativas.
     *
     * @example
     * baseURL: 'https://api.miapp.com'
     * // fetch('/users') → fetch('https://api.miapp.com/users')
     */
    baseURL?: string;
    /**
     * Lista de patrones o fragmentos de URL que deben ser interceptados por el plugin.
     * Si no se define, todas las URLs serán incluidas por defecto.
     *
     * @example
     * include: ['/api', 'https://backend.com']
     */
    include?: string[];
    /**
     * Lista de patrones o fragmentos de URL que deben **excluirse** del interceptor.
     *
     * @example
     * exclude: ['/auth/login', '/static']
     */
    exclude?: string[];
    /**
     * Encabezados personalizados que se agregarán a todas las peticiones.
     *
     * @example
     * headers: { 'X-App-Version': '1.2.0' }
     */
    headers?: Record<string, string>;
    /**
      * Función que devuelve el token actual.
      * Puede ser sincrónica o asíncrona.
      *
      * @example
      * getToken: () => localStorage.getItem("token")
      */
    getToken?: (() => string | null | Promise<string | null>) | string;
    /**
     * Intento de refrescar token ante un 401.
     *
     * @example
     * refreshToken: async () => {
     *   const r = await fetch("/refresh");
     *   return (await r.json()).token;
     * }
     */
    refreshToken?: (() => Promise<string | null>) | string;
    /**
     * Si está activado, muestra en consola las peticiones interceptadas y errores.
     *
     * @default false
     * @example
     * log: true
     */
    log?: boolean;
}
