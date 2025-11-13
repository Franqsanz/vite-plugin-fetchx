# vite-plugin-fetchx

[Leer en Español](./README_ES.md)

A lightweight Vite plugin that intercepts the global `fetch` and adds advanced features without modifying your existing code.

## ✨ Features

- 🔐 Token authentication
- 🔄 Automatic token refresh
- 🧩 Integrated base URL
- 🎯 `include` / `exclude` filters
- 🧾 Global headers
- 👮🏻‍♂️ Optional logging
- ⚡ Zero external dependencies

---

## Installation

```bash
pnpm install vite-plugin-fetchx -D
```

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

The plugin detects that it's not an absolute URL and adds the `baseURL` automatically.

## Available Options

| Option | Type | Description |
|--------|------|-------------|
| `baseURL` | `string` | Automatically prefixes any relative URL used in `fetch`. |
| `include` | `string[]` | List of routes that should be intercepted. If specified, only those routes pass through the interceptor. |
| `exclude` | `string[]` | Routes that should not be intercepted, even if `include` accepts them. |
| `headers` | `Record<string, string>` | Global headers attached to all intercepted fetch calls. |
| `getToken` | `() => string \| null` | Optional function to retrieve a token (defaults to `localStorage.getItem("token")`). |
| `refreshToken` | `() => Promise<string \| null>` | Optional function to refresh the token when the response is `401`. |
| `log` | `boolean` | Enables console logs for debugging. |
