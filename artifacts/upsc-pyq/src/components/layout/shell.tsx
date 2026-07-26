import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BookOpen, GraduationCap, Sun, Moon, MoreVertical,
  TrendingUp, CheckCircle2, Target, Trophy, X, BarChart3,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useIndexData, SUBJECT_CATEGORIES } from '@/hooks/use-subject-data';
import { getAllProgress } from '@/lib/progress';
import { AuthButton } from '@/components/auth-button';

const SUBJECT_COLORS: Record<string, string> = {
  ancient_history: 'bg-amber-600',
  general_science: 'bg-sky-600',
  indian_economy: 'bg-green-600',
  indian_geography: 'bg-orange-600',
  indian_polity: 'bg-indigo-600',
  medieval_history: 'bg-fuchsia-600',
  modern_history: 'bg-rose-600',
  world_geography: 'bg-blue-600',
};

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="text-xs font-bold text-green-500">{score}%</span>;
  if (score >= 60) return <span className="text-xs font-bold text-primary">{score}%</span>;
  return <span className="text-xs font-bold text-red-400">{score}%</span>;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const { data: subjects } = useIndexData();
  const [, navigate] = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the three-dot menu when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const progress = getAllProgress();
  const attempted = Object.keys(progress).length;
  const passed = Object.values(progress).filter(p => p.bestScore >= 60).length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight transition-opacity hover:opacity-80"
          >
            <GraduationCap className="h-7 w-7" />
            <span className="hidden sm:inline">UPSC PYQ Master</span>
            <span className="sm:hidden">UPSC</span>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Google Sign In / User menu */}
            <AuthButton />

            {/* Progress button */}
            <button
              onClick={() => setProgressOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="My Progress"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Progress</span>
              {attempted > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-primary-foreground rounded-full text-[10px] font-black flex items-center justify-center">
                  {attempted}
                </span>
              )}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Three-dot subject picker */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Jump to subject"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-card border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b bg-secondary/30">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Subject Area</p>
                  </div>
                  <div className="py-2 max-h-96 overflow-y-auto px-2 space-y-3">
                    {SUBJECT_CATEGORIES.map(cat => {
                      const catSubjects = subjects.filter(s => cat.slugs.includes(s.slug));
                      if (catSubjects.length === 0) return null;
                      return (
                        <div key={cat.category} className="space-y-1">
                          <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-primary/80 flex items-center gap-1.5 border-b border-border/40 pb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {cat.category}
                          </div>
                          {catSubjects.map(s => {
                            const p = progress[s.slug];
                            return (
                              <button
                                key={s.slug}
                                onClick={() => {
                                  navigate(`/subject/${s.slug}`);
                                  setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors text-left group"
                              >
                                <span className={`h-2 w-2 rounded-full flex-shrink-0 ${SUBJECT_COLORS[s.slug] ?? 'bg-primary'}`} />
                                <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.subject}</span>
                                {p ? (
                                  <ScoreBadge score={p.bestScore} />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">New</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t px-4 py-2.5 bg-secondary/20">
                    <button
                      onClick={() => {
                        navigate('/');
                        setMenuOpen(false);
                      }}
                      className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> View All Subjects
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center max-w-6xl text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} UPSC PYQ Master. A Premium Preparation Portal.
        </div>
      </footer>

      {/* Progress Panel (slide-over) */}
      {progressOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setProgressOpen(false)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">My Progress</h2>
              </div>
              <button
                onClick={() => setProgressOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-px bg-border m-6 mb-4 rounded-xl overflow-hidden border">
              <div className="bg-card px-3 py-4 text-center">
                <div className="text-2xl font-black text-foreground">{attempted}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">Attempted</div>
              </div>
              <div className="bg-card px-3 py-4 text-center">
                <div className="text-2xl font-black text-green-500">{passed}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">Passed</div>
              </div>
              <div className="bg-card px-3 py-4 text-center">
                <div className="text-2xl font-black text-foreground">
                  {subjects.length > 0 ? Math.round((attempted / subjects.length) * 100) : 0}%
                </div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">Coverage</div>
              </div>
            </div>

            {/* Subject list grouped by category */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
              {subjects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">Loading subjects…</p>
              )}
              {SUBJECT_CATEGORIES.map(cat => {
                const catSubjects = subjects.filter(s => cat.slugs.includes(s.slug));
                if (catSubjects.length === 0) return null;
                return (
                  <div key={cat.category} className="space-y-2.5">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {cat.category}
                    </div>
                    {catSubjects.map(s => {
                      const p = progress[s.slug];
                      return (
                        <div
                          key={s.slug}
                          className="bg-background rounded-xl border p-3.5 cursor-pointer hover:border-primary/40 transition-colors group"
                          onClick={() => {
                            navigate(`/subject/${s.slug}`);
                            setProgressOpen(false);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${SUBJECT_COLORS[s.slug] ?? 'bg-primary'}`} />
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {s.subject}
                              </span>
                            </div>
                            {p ? (
                              <div className="flex items-center gap-1.5">
                                {p.bestScore >= 60 ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Target className="h-4 w-4 text-primary" />
                                )}
                                <span className="text-sm font-bold text-foreground">{p.bestScore}%</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not started</span>
                            )}
                          </div>

                          {p ? (
                            <>
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${p.bestScore >= 60 ? 'bg-green-500' : 'bg-primary'}`}
                                  style={{ width: `${p.bestScore}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                                <span>{p.attempts} attempt{p.attempts !== 1 ? 's' : ''}</span>
                                <span>Best: {p.bestScore}% · Last: {p.lastScore}%</span>
                              </div>
                            </>
                          ) : (
                            <div className="h-1.5 w-full bg-secondary rounded-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {attempted === 0 && subjects.length > 0 && (
                <div className="text-center py-6 space-y-3">
                  <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">No tests taken yet.<br />Start a test to track your progress here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
