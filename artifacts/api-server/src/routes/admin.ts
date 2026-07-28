import { Router } from 'express';
import { ADMIN_PASSWORD, signAdminToken, verifyAdminToken } from '../lib/admin-auth.js';

const router = Router();

router.post('/admin/login', (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }
  res.json({ token: signAdminToken() });
});

router.get('/admin/verify', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  res.json({ valid: !!token && verifyAdminToken(token) });
});

export default router;
