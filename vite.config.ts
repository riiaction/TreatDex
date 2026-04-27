import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

// This replaces __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_MAPS_VIEW': JSON.stringify(env.MapsView || env.VITE_MAPS_VIEW),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Standard practice is to point @ to /src
      },
    },
    server: {
      // HMR setup for local development
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
