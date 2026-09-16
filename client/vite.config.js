import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config.
 *  - dev server 0.0.0.0 par (mobile/LAN se bhi khol sakte ho)
 *  - "/api" requests auto-proxy hoti hain backend par (localhost:5000)
 *    isliye local dev me CORS ki koi problem nahi hoti
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'http://localhost:5000';

  const proxy = {
    '/api': { target, changeOrigin: true },
  };

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: true,
      proxy,
    },
    preview: {
      host: true,
      port: 4173,
      allowedHosts: true,
      proxy,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
    },
  };
});
