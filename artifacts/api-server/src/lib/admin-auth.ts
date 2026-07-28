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
  const [ts, sig] = token.split('.');
  if (!ts || !sig) return false;
  const expected = crypto.createHmac('sha256', SECRET).update(`${ts}:admin`).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;
  const age = Date.now() - parseInt(ts, 10);
  return age < 48 * 60 * 60 * 1000; // 48 hours
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
