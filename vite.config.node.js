// vite.config.node.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Define API server as the build target
  build: {
    outDir: 'dist-api',
    ssr: true,
    minify: false,
    rollupOptions: {
      // Externalize all node modules to avoid bundling issues
      external: [
        'pg', 
        'express', 
        'cors', 
        'morgan', 
        'uuid', 
        'node-cron',
        'fs',
        'path',
        'net',
        'tls',
        /node_modules/
      ],
      input: {
        server: resolve(__dirname, 'src/api/server.js')
      },
      output: {
        format: 'esm',
        entryFileNames: '[name].js'
      }
    }
  },
  // Avoid browser-specific transformations for Node.js code
  ssr: {
    noExternal: []
  }
});
