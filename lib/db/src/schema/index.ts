import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

// ── Posts / Study Material ──────────────────────────────────────────────────

export const postsTable = pgTable('posts', {
  id:          serial('id').primaryKey(),
  title:       text('title').notNull(),
  slug:        varchar('slug', { length: 255 }).notNull().unique(),
  category:    varchar('category', { length: 60 }).notNull(),
  content:     text('content').notNull().default(''),
  tags:        text('tags').array().notNull().default([]),
  pdfUrl:      text('pdf_url'),
  publishedAt: timestamp('published_at').defaultNow().notNull(),
});

export type Post       = typeof postsTable.$inferSelect;
export type InsertPost = typeof postsTable.$inferInsert;

// ── MCQs ───────────────────────────────────────────────────────────────────

export const mcqsTable = pgTable('mcqs', {
  id:            serial('id').primaryKey(),
  questionText:  text('question_text').notNull(),
  optionA:       text('option_a').notNull(),
  optionB:       text('option_b').notNull(),
  optionC:       text('option_c').notNull(),
  optionD:       text('option_d').notNull(),
  correctOption: varchar('correct_option', { length: 1 }).notNull(),
  explanation:   text('explanation').notNull().default(''),
  year:          varchar('year', { length: 20 }).notNull().default('Practice'),
  subject:       varchar('subject', { length: 100 }).notNull(),
  topic:         varchar('topic', { length: 200 }).notNull().default(''),
});

export type Mcq       = typeof mcqsTable.$inferSelect;
export type InsertMcq = typeof mcqsTable.$inferInsert;
