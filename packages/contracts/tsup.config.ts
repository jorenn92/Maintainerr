import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
  minify: false,
  onSuccess: 'yarn build:declarations',
})
