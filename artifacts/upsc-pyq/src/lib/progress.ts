export type SubjectProgress = {
  slug: string;
  attempts: number;
  bestScore: number;   // percentage 0-100
  lastScore: number;
  lastAttemptAt: string; // ISO date
};

const KEY = 'upsc-progress';

export function getAllProgress(): Record<string, SubjectProgress> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveTestResult(slug: string, correct: number, total: number) {
  const all = getAllProgress();
  const pct = Math.round((correct / total) * 100);
  const prev = all[slug];
  all[slug] = {
    slug,
    attempts: (prev?.attempts ?? 0) + 1,
    bestScore: Math.max(prev?.bestScore ?? 0, pct),
    lastScore: pct,
    lastAttemptAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getSubjectProgress(slug: string): SubjectProgress | null {
  return getAllProgress()[slug] ?? null;
}
