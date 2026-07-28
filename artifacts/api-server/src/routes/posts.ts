import { Router } from 'express';
import { eq, ilike, or, desc } from 'drizzle-orm';
import { db, postsTable, type InsertPost } from '@workspace/db';
import { requireAdmin } from '../lib/admin-auth.js';

const router = Router();

// GET /api/posts  — list with optional ?category=&search=
router.get('/posts', async (req, res) => {
  try {
    const { category, search } = req.query as Record<string, string>;
    let rows = await db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.publishedAt));

    if (category) rows = rows.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t: string) => t.toLowerCase().includes(q)),
      );
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/posts/:slug
router.get('/posts/:slug', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.slug, req.params.slug))
      .limit(1);
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/posts  (admin)
router.post('/posts', requireAdmin, async (req, res) => {
  try {
    const body = req.body as InsertPost;
    const rows = await db.insert(postsTable).values(body).returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// PUT /api/posts/:id  (admin)
router.put('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body as Partial<InsertPost>;
    const rows = await db.update(postsTable).set(body).where(eq(postsTable.id, id)).returning();
    if (!rows.length) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// DELETE /api/posts/:id  (admin)
router.delete('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
