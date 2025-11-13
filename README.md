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
| `include` | `string[]` | List of paths that should be intercepted. If specified, only those pass through the interceptor. |
| `exclude` | `string[]` | Paths that should not be intercepted, even if `include` accepts them. |
| `headers` | `Record<string, string>` | Global headers that are attached to all intercepted fetches. |
| `getToken` | `string \| (() => string \| null \| Promise<string \| null>)` | Function to get the current token. Can be an actual function or a serialized function as a string. (default: `() => localStorage.getItem("token")`) |
| `refreshToken` | `string \| (() => Promise<string \| null>)` | Function responsible for refreshing the token when a request returns `401`. Can return a new token or `null`. Can also be an actual function or serialized string.`. |
| `log` | `boolean` | Enables console logs for debugging. |
