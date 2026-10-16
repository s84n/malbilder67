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
        // App, Katalog, Icons und Vorschaubilder sind sofort offline verfügbar;
        // die großen Druckbilder werden beim ersten Ansehen gecacht.
        globPatterns: ['**/*.{js,css,html,woff2,png,json}', 'img/icons/*.webp', 'img/p/**/*.webp'],
        globIgnores: ['img/p/**/*.png'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/img/p/') && url.pathname.endsWith('.png'),
            handler: 'CacheFirst',
            options: { cacheName: 'druckbilder', expiration: { maxEntries: 400 } },
          },
        ],
      },
    }),
  ],
});
