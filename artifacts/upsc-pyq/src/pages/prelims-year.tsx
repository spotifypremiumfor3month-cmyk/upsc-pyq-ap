import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { ChevronLeft, Search, Filter, CheckCircle2, ChevronRight, PlayCircle, Lock, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { PrelimsQuestion } from '@/hooks/use-subject-data';

const getBaseUrl = () => import.meta.env.BASE_URL.replace(/\/$/, '');

function usePrelimsYearData(year: string) {
  const [data, setData] = useState<PrelimsQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    if (!year) return;
    let mounted = true;
    setLoading(true);
    fetch(`${getBaseUrl()}/data/prelims/${year}.json`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(json => {
        if (mounted) {
          const parsedYear = Number(year);
          const yearQuestions = (json as PrelimsQuestion[]).filter(q =>
            q.year === parsedYear && q.questionNumber >= 1 && q.questionNumber <= 100
          );
          setData(yearQuestions.sort((a, b) => a.questionNumber - b.questionNumber));
          setLoading(false);
        }
      })
      .catch(err => { if (mounted) { setError(err); setLoading(false); } });
    return () => { mounted = false; };
  }, [year]);
  return { data, loading, error };
}

const ITEMS_PER_PAGE = 20;

export default function PrelimsYear() {
  const { year } = useParams<{ year: string }>();
  const { user, signInWithGoogle } = useAuth();
  const { data: questions, loading, error } = usePrelimsYearData(year || '');

  const [page, setPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(questions.map(q => q.subject?.split('›')[0]?.trim()).filter(Boolean));
    return [...set].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSubject = subjectFilter === 'all' || q.subject?.startsWith(subjectFilter);
      const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchSearch = !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchDiff && matchSearch;
    });
  }, [questions, subjectFilter, difficultyFilter, searchQuery]);

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, page]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const resetPage = () => setPage(1);

  const difficultyBadge: Record<string, string> = {
    easy: 'bg-green-500/10 text-green-600 dark:text-green-400',
    moderate: 'bg-primary/10 text-primary',
    difficult: 'bg-red-500/10 text-red-600 dark:text-red-400',
    hard: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  if (error) return (
    <div className="text-center py-20 text-destructive">
      <h2 className="text-2xl font-bold">Failed to load {year} paper</h2>
      <Link href="/prelims" className="text-primary hover:underline mt-4 inline-block">← Back to Prelims</Link>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/prelims" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Prelims Papers
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{year}</span>
      </div>

      {/* Header card */}
      <div className="bg-card border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
        <div className="pl-3">
          <h1 className="text-3xl font-black text-foreground mb-2">UPSC Prelims {year}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="bg-secondary/50 px-2.5 py-1 rounded-md font-medium border">
              {loading ? <Skeleton className="h-4 w-16 inline-block" /> : `${questions.length} Questions`}
            </span>
            <span className="bg-secondary/50 px-2.5 py-1 rounded-md font-medium border">GS Paper I</span>
            {!loading && uniqueSubjects.length > 0 && (
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-semibold border border-primary/20">
                {uniqueSubjects.length} Subjects
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/prelims/${year}/test`}
          onClick={e => { if (!user) { e.preventDefault(); setShowLoginPrompt(true); } }}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_28px_rgba(201,168,76,0.5)] whitespace-nowrap"
        >
          {user ? <PlayCircle className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          Full Paper Test
        </Link>

        {showLoginPrompt && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowLoginPrompt(false)} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border rounded-2xl shadow-2xl z-[101] p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-foreground">Login Required</h3>
                <p className="text-sm text-muted-foreground">Sign in with Google to access practice tests.</p>
              </div>
              <button
                onClick={async () => { await signInWithGoogle(); setShowLoginPrompt(false); }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition-all"
              >
                Sign in with Gmail
              </button>
              <button onClick={() => setShowLoginPrompt(false)} className="text-xs text-muted-foreground hover:text-foreground block mx-auto mt-1">Cancel</button>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="relative sm:w-52">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={subjectFilter}
            onChange={e => { setSubjectFilter(e.target.value); resetPage(); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="relative sm:w-40">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={difficultyFilter}
            onChange={e => { setDifficultyFilter(e.target.value); resetPage(); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>
      </div>

      {!loading && (subjectFilter !== 'all' || difficultyFilter !== 'all' || searchQuery) && (
        <p className="text-sm text-muted-foreground -mt-2">
          Showing <span className="font-semibold text-foreground">{filteredQuestions.length}</span> of {questions.length} questions
        </p>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center text-muted-foreground">
            No questions found matching your criteria.
          </div>
        ) : (
          paginated.map(q => {
            const isExpanded = expandedId === q.id;
            const topSubject = q.subject?.split('›')[0]?.trim();
            const subTopic = q.subject?.includes('›') ? q.subject.split('›').slice(1).join('›').trim() : '';

            return (
              <div
                key={q.id}
                className={`relative bg-card border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/30 shadow-md' : 'hover:border-primary/30'}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-70" />

                <div
                  className="p-5 pl-6 cursor-pointer flex gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[40px]">
                    <span className="text-xs font-bold text-muted-foreground">Q{q.questionNumber}</span>
                    {q.difficulty && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${difficultyBadge[q.difficulty] || 'bg-secondary text-muted-foreground'}`}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {topSubject && (
                      <div className="flex flex-wrap items-center gap-1 mb-1.5">
                        <span className="inline-block text-[10px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">
                          {topSubject}
                        </span>
                        {subTopic && (
                          <span className="inline-block text-[10px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                            {subTopic}
                          </span>
                        )}
                      </div>
                    )}
                    <p className={`text-base text-foreground font-medium leading-snug ${!isExpanded && 'line-clamp-2'}`}>
                      {q.question}
                    </p>
                    {!isExpanded && (
                      <div className="mt-2.5 text-xs font-semibold text-primary flex items-center gap-1">
                        View Options & Answer <ChevronRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t bg-secondary/20 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2 mt-4 ml-11">
                      {(['a', 'b', 'c', 'd'] as const).map(optKey => {
                        const optText = q.options[optKey];
                        if (!optText) return null;
                        const hasAnswer = ['a', 'b', 'c', 'd'].includes(q.answer.toLowerCase());
                        const isCorrect = hasAnswer && q.answer.toLowerCase() === optKey;
                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-lg border text-sm flex gap-3 ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-card border-border text-foreground'}`}
                          >
                            <span className={`font-bold uppercase flex-shrink-0 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>{optKey}.</span>
                            <span className="flex-1">{optText}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 ml-11 flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      {['a', 'b', 'c', 'd'].includes(q.answer.toLowerCase()) ? (
                        <span>Correct answer: <span className="font-bold text-primary uppercase">{q.answer}</span></span>
                      ) : (
                        <span>
                          Answer not available in the source.
                          {q.answerNote && <span className="block mt-1 text-muted-foreground/80">{q.answerNote}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-card border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-card border rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
