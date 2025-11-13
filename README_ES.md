# vite-plugin-fetchx

[Read in English](./README.md)

Un plugin liviano para Vite que intercepta el `fetch` global y agrega funcionalidades avanzadas sin modificar tu código existente.

## ✨ Características
- 🔐 Autenticación con token
- 🔄 Refresh automático de token
- 🧩 Base URL integrada
- 🎯 Filtros `include` / `exclude`
- 🧾 Headers globales
- 👮🏻‍♂️ Logging opcional
- ⚡ Sin dependencias externas

---

## Instalación

```bash
pnpm install vite-plugin-fetchx -D
```

## Uso básico

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

## Interceptor automático

No tenés que modificar ningún fetch de tu proyecto.

```ts
// Interceptado automáticamente:
const res = await fetch('pokemon/pikachu'); 
```

El plugin detecta que no es una URL absoluta y le agrega la `baseURL`.

## Opciones disponibles

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `baseURL` | `string` | Prefija automáticamente cualquier URL relativa usada en `fetch`. |
| `include` | `string[]` | Lista de rutas que sí deben ser interceptadas. Si se especifica, solo esas pasan por el interceptor. |
| `exclude` | `string[]` | Rutas que no deben ser interceptadas, incluso si `include` las acepta. |
| `headers` | `Record<string, string>` | Headers globales que se adjuntan a todos los fetch interceptados. |
| `getToken` | `string \| (() => string \| null \| Promise<string \| null>)` | Función para obtener el token actual. Puede ser una función real o una función serializada como string. (por defecto: `() => localStorage.getItem("token")`) |
| `refreshToken` | `string \| (() => Promise<string \| null>)` | Función encargada de refrescar el token cuando una petición devuelve `401`. Puede devolver un token nuevo o `null`. También puede ser función real o string serializado.`. |
| `log` | `boolean` | Activa logs en consola para debug. |
