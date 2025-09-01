export default {
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options: any, context: any) {
    if (context.format === 'cjs') {
      options.banner = {
        js: '"use strict";'
      }
    }
  }
}