import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BookOpen, GraduationCap, Sun, Moon, MoreVertical,
  TrendingUp, CheckCircle2, Target, Trophy, X, BarChart3,
  Newspaper, TestTube2, FileDown, Home, Shield,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useIndexData, SUBJECT_CATEGORIES } from '@/hooks/use-subject-data';
import { getAllProgress } from '@/lib/progress';
import { AuthButton } from '@/components/auth-button';

const SUBJECT_COLORS: Record<string, string> = {
  current_affairs:  'bg-[#C9A84C]',
  ancient_history:  'bg-amber-600',
  general_science:  'bg-sky-600',
  indian_economy:   'bg-green-600',
  indian_geography: 'bg-orange-600',
  indian_polity:    'bg-indigo-600',
  medieval_history: 'bg-fuchsia-600',
  modern_history:   'bg-rose-600',
  world_geography:  'bg-blue-600',
};

const STUDIO_NAV = [
  { href: '/articles',                        label: 'Daily CA',    icon: <Newspaper  className="h-3.5 w-3.5" /> },
  { href: '/articles?category=GS%201',        label: 'GS Papers',   icon: <BookOpen   className="h-3.5 w-3.5" /> },
  { href: '/mock-tests',                      label: 'Mock Tests',  icon: <TestTube2  className="h-3.5 w-3.5" /> },
  { href: '/articles?category=PDF%20Downloads', label: 'PDF Library', icon: <FileDown   className="h-3.5 w-3.5" /> },
];

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return <span className="text-xs font-bold text-green-500">{score}%</span>;
  if (score >= 60) return <span className="text-xs font-bold text-primary">{score}%</span>;
  return <span className="text-xs font-bold text-red-400">{score}%</span>;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const { data: subjects } = useIndexData();
  const [location, navigate] = useLocation();

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const progress  = getAllProgress();
  const attempted = Object.keys(progress).length;
  const passed    = Object.values(progress).filter(p => p.bestScore >= 60).length;

  const isStudio = ['/articles', '/mock-tests'].some(p => location.startsWith(p));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">

      {/* ── Primary header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-6xl">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight transition-opacity hover:opacity-80"
          >
            <GraduationCap className="h-6 w-6" />
            <span className="hidden sm:inline">UPSC Study Studio</span>
            <span className="sm:hidden">UPSC</span>
          </Link>

          {/* Studio nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-0.5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
            {STUDIO_NAV.map(({ href, label, icon }) => {
              const active = location.startsWith(href.split('?')[0]);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {icon}{label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            <AuthButton />

            {/* Progress */}
            <button
              onClick={() => setProgressOpen(true)}
              className="relative hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="My Progress"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden lg:inline">Progress</span>
              {attempted > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary text-primary-foreground rounded-full text-[10px] font-black flex items-center justify-center">
                  {attempted}
                </span>
              )}
            </button>

            {/* Admin (desktop) */}
            <Link href="/admin"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Admin Dashboard"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden lg:inline">Admin</span>
            </Link>

            {/* Dark mode */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile three-dot menu */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border bg-card shadow-xl py-1 z-50">
                  <Link href="/" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                    <Home className="h-4 w-4 text-muted-foreground" /> Home
                  </Link>
                  {STUDIO_NAV.map(({ href, label, icon }) => (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                      <span className="text-muted-foreground">{icon}</span>{label}
                    </Link>
                  ))}
                  <div className="border-t my-1" />
                  <button
                    onClick={() => { setProgressOpen(true); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" /> My Progress
                  </button>
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors text-muted-foreground">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Progress drawer ───────────────────────────────────────── */}
      {progressOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setProgressOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-card border-l shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="font-bold text-base">My Progress</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {attempted} tests · {passed} passed
                </p>
              </div>
              <button onClick={() => setProgressOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary row */}
            {attempted > 0 && (
              <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{attempted}</p>
                  <p className="text-[11px] text-muted-foreground">Attempted</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-500">{passed}</p>
                  <p className="text-[11px] text-muted-foreground">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-amber-500">
                    {attempted > 0 ? Math.round((passed / attempted) * 100) : 0}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">Pass Rate</p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {SUBJECT_CATEGORIES.map(group => {
                const groupSubjects = subjects.filter(s => group.slugs.includes(s.slug));
                if (!groupSubjects.length) return null;
                return (
                  <div key={group.category}>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      {group.category}
                    </h3>
                    <div className="space-y-3">
                      {groupSubjects.map(sub => {
                        const p = progress[sub.slug];
                        return (
                          <div
                            key={sub.slug}
                            className="p-3 rounded-xl border bg-background cursor-pointer hover:border-primary/30 transition-colors"
                            onClick={() => { navigate(`/subject/${sub.slug}`); setProgressOpen(false); }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${SUBJECT_COLORS[sub.slug] || 'bg-muted'}`} />
                                <span className="text-sm font-medium">{sub.subject}</span>
                              </div>
                              {p ? (
                                <div className="flex items-center gap-1.5">
                                  {p.bestScore >= 60
                                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    : <Target className="h-4 w-4 text-primary" />}
                                  <ScoreBadge score={p.bestScore} />
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
