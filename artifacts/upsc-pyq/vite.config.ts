import path from 'path';
import crypto from 'node:crypto';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT || '3000';
const port = Number(rawPort) || 3000;
const basePath = process.env.BASE_PATH || '/';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'upsc@admin';
const SECRET = process.env.SESSION_SECRET || 'dev-session-secret';

function signAdminToken(): string {
  const ts = Date.now().toString();
  const sig = crypto.createHmac('sha256', SECRET).update(`${ts}:admin`).digest('hex');
  return `${ts}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const [ts, sig] = token.split('.');
  if (!ts || !sig) return false;
  try {
    const expected = crypto.createHmac('sha256', SECRET).update(`${ts}:admin`).digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    const sigBuf = Buffer.from(sig, 'hex');
    if (expectedBuf.length !== sigBuf.length) return false;
    if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return false;
    const age = Date.now() - parseInt(ts, 10);
    return age < 48 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// Vite plugin: handle admin API routes directly in the dev server
// so they work regardless of proxy/routing configuration.
function adminApiPlugin(): Plugin {
  return {
    name: 'admin-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? '';

        // Strip query string for matching
        const pathname = url.split('?')[0];

        // POST /api/admin/login  (also handle without /api prefix)
        if (req.method === 'POST' && (pathname === '/api/admin/login' || pathname === '/admin/login')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { password } = JSON.parse(body);
              if (!password || password !== ADMIN_PASSWORD) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid password' }));
              } else {
                const token = signAdminToken();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ token }));
              }
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Bad request' }));
            }
          });
          return;
        }

        // GET /api/admin/verify
        if (req.method === 'GET' && (pathname === '/api/admin/verify' || pathname === '/admin/verify')) {
          const auth = (req.headers['authorization'] as string) || '';
          const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: !!token && verifyAdminToken(token) }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    adminApiPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
