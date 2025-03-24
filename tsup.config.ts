import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    outDir: 'lib',
    format: ['esm'],
    dts: true,
  },
  {
    entry: ['src/index.ts'],
    sourcemap: true,
    format: ['cjs'],
    outDir: 'lib',
    dts: false,
  },
]);
