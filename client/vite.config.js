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
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'socket-vendor': ['socket.io-client'],
        },
      },
    },
  },
})
