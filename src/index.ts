import type { Plugin } from 'vite';

import { createRuntimeCode } from './runtime';
import type { FetchxOptions } from './types';

export default function fetchx(options: FetchxOptions = {}): Plugin {
  const virtualModuleId = 'virtual:fetchx';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-fetchx',

    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        return createRuntimeCode(options);
      }
    },

    transform(code, id) {
      if (id.endsWith('main.tsx') || id.endsWith('main.jsx')) {
        return `import "virtual:fetchx";\n${code}`;
      }
    },
  };
}
