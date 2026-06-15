import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      proxy: {
        '/api': {
          target: 'https://api.azendly.net',
          changeOrigin: true,
        }
      }
    },
    plugins: [react(), tailwindcss(),
      Sitemap({ 
        hostname: 'https://azendly.net',
        dynamicRoutes: ['/'] // Add more routes here as you build them
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});