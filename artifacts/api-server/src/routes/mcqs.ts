import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db, mcqsTable, type InsertMcq } from '@workspace/db';
import { requireAdmin } from '../lib/admin-auth.js';

const router = Router();

// GET /api/mcqs  — filter by ?year=&subject=&topic=
router.get('/mcqs', async (req, res) => {
  try {
    const { year, subject, topic } = req.query as Record<string, string>;
    let rows = await db.select().from(mcqsTable).orderBy(desc(mcqsTable.id));
    if (year && year !== 'All Years') rows = rows.filter(r => r.year === year);
    if (subject && subject !== 'All Subjects') rows = rows.filter(r => r.subject === subject);
    if (topic && topic !== 'All Topics') rows = rows.filter(r => r.topic === topic);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/mcqs/topics?subject=
router.get('/mcqs/topics', async (req, res) => {
  try {
    const { subject } = req.query as Record<string, string>;
    let rows = await db.select({ topic: mcqsTable.topic }).from(mcqsTable);
    if (subject && subject !== 'All Subjects') rows = rows.filter(r => r.subject === subject);
    const topics = [...new Set(rows.map(r => r.topic).filter(Boolean))].sort();
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/mcqs  (admin)
router.post('/mcqs', requireAdmin, async (req, res) => {
  try {
    const body = req.body as InsertMcq;
    const rows = await db.insert(mcqsTable).values(body).returning();
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// POST /api/mcqs/bulk  (admin) — array of MCQs
router.post('/mcqs/bulk', requireAdmin, async (req, res) => {
  try {
    const items = req.body as InsertMcq[];
    if (!Array.isArray(items) || !items.length) {
      res.status(400).json({ error: 'Expected array of MCQs' });
      return;
    }
    const rows = await db.insert(mcqsTable).values(items).returning();
    res.status(201).json({ inserted: rows.length, rows });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// DELETE /api/mcqs/:id  (admin)
router.delete('/mcqs/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(mcqsTable).where(eq(mcqsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
