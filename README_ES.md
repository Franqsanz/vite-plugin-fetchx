# vite-plugin-fetchx

[Read in English](./README.md)

Un plugin ligero de Vite que intercepta el `fetch` global y añade características avanzadas sin modificar tu código existente.

## Características

- 🔐 Autenticación con tokens
- 🔄 Renovación automática de tokens
- 🧩 URL base integrada
- 🎯 Filtros `include` / `exclude`
- 🧾 Encabezados globales
- 🧾 Registro opcional de logs
- ⚡ Cero dependencias externas

---

<!--## Instalación
```bash
pnpm install vite-plugin-fetchx -D
```-->

## Uso Básico
```ts
// vite.config.ts
import fetchx from 'vite-plugin-fetchx';

export default {
  plugins: [
    fetchx({
      baseURL: 'https://pokeapi.co/api/v2/',
      include: ['/pokemon', '/ability'],
      log: false,
    }),
  ],
};
```

## Interceptor Automático

No necesitas modificar ninguna llamada fetch en tu proyecto.
```ts
// Automáticamente interceptado:
const res = await fetch('pokemon/pikachu'); 
```

El plugin detecta que no es una URL absoluta y añade el `baseURL` automáticamente.

## Opciones Disponibles

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `baseURL` | `string` | Prefija automáticamente cualquier URL relativa usada en `fetch`. |
| `include` | `string[]` | Lista de rutas que deben ser interceptadas. Si se especifica, solo estas pasan por el interceptor. |
| `exclude` | `string[]` | Rutas que no deben ser interceptadas, incluso si `include` las acepta. |
| `headers` | `Record<string, string>` | Encabezados globales que se adjuntan a todos los fetch interceptados. |
| `getToken` | `string \| (() => string \| null \| Promise<string \| null>)` | Función para obtener el token actual. Puede ser una función real o una función serializada como string. (por defecto: `() => localStorage.getItem("token")`) |
| `refreshToken` | `string \| (() => Promise<string \| null>)` | URL del endpoint de refresh o función personalizada para refrescar el token cuando una petición retorna `401`. |
| `tokenKey` | `string` | Nombre de la clave en localStorage donde se guarda el token. Solo se usa cuando `refreshToken` es una URL string. (por defecto: `"token"`) |
| `log` | `boolean` | Habilita logs en consola para depuración. |

---

## Gestión de Tokens

### `getToken`

Esta opción te permite definir cómo el plugin obtiene el token de autenticación para cada petición. El token será automáticamente añadido al encabezado `Authorization` como `Bearer <token>`.

**Comportamiento por defecto:**
```ts
getToken: () => localStorage.getItem("token")
```

**Implementaciones personalizadas:**
```ts
// Usando una función directamente
fetchx({
  getToken: () => {
    return sessionStorage.getItem('authToken');
  }
})

// Obtención asíncrona del token
fetchx({
  getToken: async () => {
    const token = await someAsyncTokenService();
    return token;
  }
})

// Usando un string serializado (útil para configuración en tiempo de compilación)
fetchx({
  getToken: `() => localStorage.getItem("myCustomToken")`
})

// Obteniendo token desde cookies
fetchx({
  getToken: () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
})
```

**Notas importantes:**
- Si `getToken` retorna `null` o `undefined`, no se añadirá el encabezado `Authorization`
- La función se llama en cada petición interceptada
- Soporta implementaciones síncronas y asíncronas

---

### `refreshToken`

Esta opción define la lógica para refrescar un token expirado cuando la API retorna una respuesta `401 Unauthorized`. 

**Uso simple (URL string):**

La forma más sencilla es pasar directamente la URL del endpoint de refresh:

```ts
fetchx({
  refreshToken: '/api/auth/refresh'
})
```

Cuando usas un string, el plugin automáticamente:
1. Detecta una respuesta `401`
2. Hace un `POST` al endpoint especificado
3. Espera una respuesta JSON con formato: `{ token: "..." }`, `{ accessToken: "..." }` o `{ access_token: "..." }`
4. Guarda el nuevo token en `localStorage` usando la clave especificada en `tokenKey` (por defecto: `"token"`)
5. Reintenta la petición original con el nuevo token

**Ejemplos:**
```ts
// Simple - usa los valores por defecto
fetchx({
  refreshToken: '/api/auth/refresh'
})

// Con tokenKey personalizado
fetchx({
  tokenKey: 'authToken',
  refreshToken: '/api/auth/refresh'
})

// URL absoluta
fetchx({
  refreshToken: 'https://api.example.com/auth/refresh'
})
```

---

**Uso avanzado (función):**

Si necesitas lógica más compleja (enviar refresh token, limpiar storage, redirigir, etc.), puedes pasar una función:

```ts
// Usando refresh token desde localStorage
fetchx({
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch('https://api.example.com/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      // Limpiar tokens inválidos
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }

    const { token, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', newRefreshToken);
    return token;
  }
})

// Con manejo de errores y redirección
fetchx({
  refreshToken: async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        // Redirigir al login si el refresh falla
        window.location.href = '/login';
        return null;
      }

      const { accessToken } = await response.json();
      localStorage.setItem('token', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Falló el refresh del token:', error);
      return null;
    }
  }
})

// Usando un string serializado
fetchx({
  refreshToken: `async () => {
    const res = await fetch('/api/refresh');
    if (!res.ok) return null;
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data.token;
  }`
})
```

**Notas importantes:**
- Retornar `null` significa que el refresh falló (el usuario probablemente necesitará iniciar sesión nuevamente)
- El plugin solo intentará refrescar una vez por petición para evitar bucles infinitos
- Ten cuidado de no llamar al refresh en el mismo endpoint de refresh (usa `exclude` si es necesario)

**Ejemplo con exclude:**
```ts
fetchx({
  baseURL: 'https://api.example.com',
  exclude: ['/auth/refresh', '/auth/login'], // No interceptar endpoints de autenticación
  refreshToken: '/api/auth/refresh'
})
```

---

## Ejemplo Completo
```ts
// vite.config.ts
import fetchx from 'vite-plugin-fetchx';

export default {
  plugins: [
    fetchx({
      baseURL: 'https://api.miapp.com',
      include: ['/api'],
      exclude: ['/api/auth/login', '/api/public'],
      headers: {
        'X-App-Version': '1.0.0'
      },
      getToken: () => localStorage.getItem('accessToken'),
      refreshToken: '/api/auth/refresh', // Simple!
      tokenKey: 'accessToken',
      log: true
    })
  ]
};
```

## Uso en Tu Aplicación

Una vez configurado, todas tus llamadas fetch serán automáticamente interceptadas:
```ts
// ¡No necesitas cambios en tu código!
const response = await fetch('/api/users');
const users = await response.json();

// Funciona con todas las opciones de fetch
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'Juan' })
});

// El plugin automáticamente:
// ✓ Añade baseURL
// ✓ Añade encabezado Authorization con el token
// ✓ Refresca el token en 401
// ✓ Reintenta la petición con el nuevo token
```

## Licencia

MIT
