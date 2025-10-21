import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets',
    rollupOptions: {
      input: {
        'operation-selector': resolve(__dirname, 'widgets/operation-selector.tsx'),
        'number-input': resolve(__dirname, 'widgets/number-input.tsx'),
        'result-display': resolve(__dirname, 'widgets/result-display.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  server: {
    port: 4444
  }
});
