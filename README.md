# vite-plugin-fetchx

Un plugin ligero para Vite que intercepta `fetch` globalmente y agrega soporte para:
- Autenticación con token
- Headers globales
- Refresh automático de token
- Logging y filtros por URL

## 🚀 Instalación
```bash
pnpm install vite-plugin-fetchx -D
```

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

Usar un `fecth` clásico
```ts
await fetch('/api/user'); // Ya está interceptado automáticamente
```
