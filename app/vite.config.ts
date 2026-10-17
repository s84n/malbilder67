import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages liefert das Repo unter /<repo>/ aus.
const base = process.env.BASE_PATH ?? '/malbilder67/';

export default defineConfig({
  base,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        // Neue ID, weil Chrome auf einem Pixel eine verwaiste Installation der alten ID (= start_url) festhielt
        id: base + '?app=2',
        name: 'Malbilder67',
        short_name: 'Malbilder67',
        description: 'Ausmalbilder für Kinder – aussuchen und drucken',
        lang: 'de',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        theme_color: '#ffb703',
        background_color: '#fff8ec',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Vorab nur App, Katalog und Menü-Icons (klein → Installation in Sekunden).
        // Vorschau- und Druckbilder werden beim ersten Ansehen gecacht – alle vorab
        // (>1.000 Dateien, ~37 MB) ließ die Installation auf Android minutenlang laufen und scheitern.
        globPatterns: ['**/*.{js,css,html,woff2,png,json}', 'img/icons/*.webp'],
        globIgnores: ['img/p/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/img/p/') && url.pathname.endsWith('.png'),
            handler: 'CacheFirst',
            options: { cacheName: 'druckbilder', expiration: { maxEntries: 400 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/img/p/') && url.pathname.endsWith('.webp'),
            handler: 'CacheFirst',
            options: { cacheName: 'vorschaubilder', expiration: { maxEntries: 3000 } },
          },
        ],
      },
    }),
  ],
});
