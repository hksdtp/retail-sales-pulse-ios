import react from '@vitejs/plugin-react-swc';
import { componentTagger } from 'lovable-tagger';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8088,
    // Fix CORS and development server issues
    cors: true,
    strictPort: false,
    // Proxy API calls to test server
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🚨 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Proxying request:', req.method, req.url, '→', options.target + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  // Fix React Refresh issues
  define: {
    global: 'globalThis',
  },
  plugins: [
    react({
      // Fix React Refresh issues
      fastRefresh: true,
    }),
    mode === 'development' && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Fix build issues
  build: {
    sourcemap: mode === 'development',
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    },
  },
}));
