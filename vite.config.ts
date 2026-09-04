import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { setDefaultResultOrder } from 'node:dns';
import {defineConfig} from 'vite';

// ponytail: host is behind Cloudflare; no working IPv6 route in docker -> prefer IPv4
setDefaultResultOrder('ipv4first');

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Finance Tracker',
          short_name: 'Finance',
          description: 'Personal finance, budgeting, accounts, and goal tracking.',
          theme_color: '#2563eb',
          background_color: '#fafbfc',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: ['.orb.local','.everynaira.ng'],
      // ponytail: API has no CORS headers, proxy /api in dev; add nginx proxy_pass for prod
      proxy: {
        '/api': {
          target: 'https://api.everynaira.ng',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
    preview: {
      proxy: {
        '/api': {
          target: 'https://api.everynaira.ng',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
  };
});
