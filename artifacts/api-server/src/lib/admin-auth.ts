import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const SECRET = process.env.SESSION_SECRET || 'dev-session-secret';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'upsc@admin';

export function signAdminToken(): string {
  const ts = Date.now().toString();
  const sig = crypto.createHmac('sha256', SECRET).update(`${ts}:admin`).digest('hex');
  return `${ts}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');

  // Format 1: <timestamp>.admin.authenticated  (client-side token)
  if (parts.length === 3 && parts[1] === 'admin' && parts[2] === 'authenticated') {
    const ts = parseInt(parts[0], 10);
    if (isNaN(ts)) return false;
    return Date.now() - ts < 48 * 60 * 60 * 1000;
  }

  // Format 2: <timestamp>.<hmac>  (server-signed token)
  if (parts.length === 2) {
    const [ts, sig] = parts;
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

  return false;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
