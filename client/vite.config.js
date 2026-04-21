import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    proxy: {
      // Dev-only: proxies /api/* and WebSocket to local Express server
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
      },
    },
  },

  build: {
    // Generate source maps for production debugging
    sourcemap: false,
    // Increase chunk size warning limit to 800kb (default is 500kb)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split large vendor libraries into separate cached chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
            }
          }
        },
      },
    },
  },
})
