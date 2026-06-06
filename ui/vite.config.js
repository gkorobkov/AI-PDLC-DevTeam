import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],
  server: {
    port: 3000,
    proxy: {
      '/health': 'http://localhost:8000',
      '/status': 'http://localhost:8000',
      '/test-llm': 'http://localhost:8000',
      '/llm-limits': 'http://localhost:8000',
      '/analyze-requirement': 'http://localhost:8000',
    },
  },
  preview: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    transformMode: {
      web: [/\.[jt]sx$/],
    },
    setupFiles: [],
  },
});
