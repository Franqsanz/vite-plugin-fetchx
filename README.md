# vite-plugin-fetchx

Un plugin ligero para Vite que intercepta `fetch` globalmente y agrega soporte para:
- Autenticación con token
- Headers globales
- Refresh automático de token
- Logging y filtros por URL

## 🚀 Instalación
```bash
npm install vite-plugin-fetchx -D
```
```ts
// vite.config.ts
import fetchx from 'vite-plugin-fetchx';

export default {
  plugins: [
    fetchx({
      include: ['api.miapp.com'],
      log: true,
      getToken: `() => localStorage.getItem('accessToken')`,
      refreshToken: `async () => {
        const res = await fetch('/auth/refresh');
        const data = await res.json();
        localStorage.setItem('accessToken', data.token);
        return data.token;
      }`,
    }),
  ],
};
```
```ts
await fetch('/api/user'); // Ya está interceptado automáticamente
```
