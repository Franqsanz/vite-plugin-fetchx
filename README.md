# vite-plugin-fetchx

[Leer en Español](./README.es.md)

A lightweight Vite plugin that intercepts the global `fetch` and adds advanced features without modifying your existing code.

## Features

- 🔐 Token authentication
- 🔄 Automatic token refresh
- 🧩 Built-in base URL
- 🎯 `include` / `exclude` filters
- 🧾 Global headers
- 🧾 Optional logging
- ⚡ Zero external dependencies

---

<!--## Installation
```bash
pnpm install vite-plugin-fetchx -D
```-->

## Basic Usage
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

## Automatic Interceptor

You don't need to modify any fetch calls in your project.
```ts
// Automatically intercepted:
const res = await fetch('pokemon/pikachu'); 
```

The plugin detects that it's not an absolute URL and automatically adds the `baseURL`.

## Available Options

| Option | Type | Description |
|--------|------|-------------|
| `baseURL` | `string` | Automatically prefixes any relative URL used in `fetch`. |
| `include` | `string[]` | List of routes that should be intercepted. If specified, only these pass through the interceptor. |
| `exclude` | `string[]` | Routes that should not be intercepted, even if `include` accepts them. |
| `headers` | `Record<string, string>` | Global headers attached to all intercepted fetch requests. |
| `getToken` | `string \| (() => string \| null \| Promise<string \| null>)` | Function to get the current token. Can be a real function or a serialized function as a string. (default: `() => localStorage.getItem("token")`) |
| `refreshToken` | `string \| (() => Promise<string \| null>)` | Refresh endpoint URL or custom function to refresh the token when a request returns `401`. |
| `tokenKey` | `string` | Name of the key in localStorage where the token is stored. Only used when `refreshToken` is a URL string. (default: `"token"`) |
| `log` | `boolean` | Enables console logs for debugging. |

---

## Token Management

### `getToken`

This option lets you define how the plugin obtains the authentication token for each request. The token will be automatically added to the `Authorization` header as `Bearer <token>`.

**Default behavior:**
```ts
getToken: () => localStorage.getItem("token")
```

**Custom implementations:**
```ts
// Using a function directly
fetchx({
  getToken: () => {
    return sessionStorage.getItem('authToken');
  }
})

// Async token retrieval
fetchx({
  getToken: async () => {
    const token = await someAsyncTokenService();
    return token;
  }
})

// Using a serialized string (useful for build-time configuration)
fetchx({
  getToken: `() => localStorage.getItem("myCustomToken")`
})

// Getting token from cookies
fetchx({
  getToken: () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
})
```

**Important notes:**
- If `getToken` returns `null` or `undefined`, the `Authorization` header will not be added
- The function is called on each intercepted request
- Supports both synchronous and asynchronous implementations

---

### `refreshToken`

This option defines the logic to refresh an expired token when the API returns a `401 Unauthorized` response.

**Simple usage (URL string):**

The easiest way is to pass the refresh endpoint URL directly:

```ts
fetchx({
  refreshToken: '/api/auth/refresh'
})
```

When you use a string, the plugin automatically:
1. Detects a `401` response
2. Makes a `POST` to the specified endpoint
3. Expects a JSON response with format: `{ token: "..." }`, `{ accessToken: "..." }` or `{ access_token: "..." }`
4. Saves the new token in `localStorage` using the key specified in `tokenKey` (default: `"token"`)
5. Retries the original request with the new token

**Examples:**
```ts
// Simple - uses default values
fetchx({
  refreshToken: '/api/auth/refresh'
})

// With custom tokenKey
fetchx({
  tokenKey: 'authToken',
  refreshToken: '/api/auth/refresh'
})

// Absolute URL
fetchx({
  refreshToken: 'https://api.example.com/auth/refresh'
})
```

---

**Advanced usage (function):**

If you need more complex logic (send refresh token, clear storage, redirect, etc.), you can pass a function:

```ts
// Using refresh token from localStorage
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
      // Clear invalid tokens
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

// With error handling and redirection
fetchx({
  refreshToken: async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return null;
      }

      const { accessToken } = await response.json();
      localStorage.setItem('token', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
})

// Using a serialized string
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

**Important notes:**
- Returning `null` means the refresh failed (the user will likely need to log in again)
- The plugin will only attempt to refresh once per request to avoid infinite loops
- Be careful not to call refresh on the same refresh endpoint (use `exclude` if necessary)

**Example with exclude:**
```ts
fetchx({
  baseURL: 'https://api.example.com',
  exclude: ['/auth/refresh', '/auth/login'], // Don't intercept auth endpoints
  refreshToken: '/api/auth/refresh'
})
```

---

## Complete Example
```ts
// vite.config.ts
import fetchx from 'vite-plugin-fetchx';

export default {
  plugins: [
    fetchx({
      baseURL: 'https://api.myapp.com',
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

## Usage in Your Application

Once configured, all your fetch calls will be automatically intercepted:
```ts
// No changes needed in your code!
const response = await fetch('/api/users');
const users = await response.json();

// Works with all fetch options
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
});

// The plugin automatically:
// ✓ Adds baseURL
// ✓ Adds Authorization header with token
// ✓ Refreshes token on 401
// ✓ Retries request with new token
```

## License

MIT
