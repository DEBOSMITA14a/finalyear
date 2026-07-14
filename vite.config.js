import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true, // Set to true for HTTPS targets
          ws: false,
          rewrite: (path) => path,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Remove Origin header to avoid CORS issues from backend
              proxyReq.removeHeader('Origin');
              // Remove Referer header too, just to be safe
              proxyReq.removeHeader('Referer');
              console.log('Proxying request:', req.method, req.url, '→', proxyTarget + req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Set CORS headers on the response so browser accepts it
              proxyRes.headers['access-control-allow-origin'] = '*';
              proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['access-control-allow-headers'] = '*';
              console.log('Proxy response status:', proxyRes.statusCode, proxyRes.statusMessage);
            });
            proxy.on('error', (err, req, res) => {
              console.error('Proxy error:', err);
            });
          }
        }
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          auth: 'auth.html',
          dashboard: 'dashboard.html',
          assessment: 'assessment.html',
          result: 'result.html',
          game: 'game.html',
        }
      }
    }
  };
});
