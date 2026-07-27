import { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useSubjectData, useIndexData } from '@/hooks/use-subject-data';
import { ChevronLeft, Search, Filter, CheckCircle2, ChevronRight, PlayCircle, Lock, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';

const SUBJECT_COLORS: Record<string, string> = {
  current_affairs:  'bg-[#C9A84C]',
  ancient_history:  'bg-[#b45309]',
  general_science:  'bg-[#0369a1]',
  indian_economy:   'bg-[#15803d]',
  indian_geography: 'bg-[#c2410c]',
  indian_polity:    'bg-[#4338ca]',
  medieval_history: 'bg-[#a21caf]',
  modern_history:   'bg-[#be123c]',
  world_geography:  'bg-[#1d4ed8]',
};

export default function SubjectDetail() {
  const { slug } = useParams();
  const { user, signInWithGoogle } = useAuth();
  const { data: questions, loading: qLoading, error: qError } = useSubjectData(slug || '');
  const { data: indexData } = useIndexData();

  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isCurrentAffairs = slug === 'current_affairs';
  const ITEMS_PER_PAGE = 20;
  const accentColor = SUBJECT_COLORS[slug || ''] || 'bg-primary';

  const subjectInfo = useMemo(() => indexData?.find(s => s.slug === slug), [indexData, slug]);

  // Unique categories (only relevant for current_affairs)
  const uniqueCategories = useMemo(() => {
    if (!isCurrentAffairs) return [];
    const cats = new Set(questions.map(q => q.category).filter(Boolean));
    return [...cats].sort() as string[];
  }, [questions, isCurrentAffairs]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchYear = yearFilter === 'all' || q.year.toString() === yearFilter;
      const matchCategory = categoryFilter === 'all' || q.category === categoryFilter;
      const matchSearch = searchQuery === '' ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.explanation || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchYear && matchCategory && matchSearch;
    });
  }, [questions, yearFilter, categoryFilter, searchQuery]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuestions, page]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const resetPage = () => setPage(1);

  if (qError) {
    return (
      <div className="text-center py-20 text-destructive">
        <h2 className="text-2xl font-bold">Failed to load subject</h2>
        <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
        <ChevronLeft className="h-4 w-4" />
        Back to Subjects
      </Link>

      {/* Header card */}
      <div className="bg-card border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${accentColor}`} />
        <div className="pl-3">
          <h1 className="text-3xl font-black text-foreground mb-2">
            {subjectInfo ? subjectInfo.subject : <Skeleton className="h-9 w-64" />}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="bg-secondary/50 px-2.5 py-1 rounded-md font-medium border">
              {qLoading ? <Skeleton className="h-4 w-12 inline-block" /> : `${questions.length} Questions`}
            </span>
            <span className="bg-secondary/50 px-2.5 py-1 rounded-md font-medium border">
              {subjectInfo ? subjectInfo.yearRange : <Skeleton className="h-4 w-20 inline-block" />}
            </span>
            {isCurrentAffairs && (
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md font-semibold border border-primary/20">
                {uniqueCategories.length} Topics
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/test/${slug}`}
          onClick={(e) => { if (!user) { e.preventDefault(); setShowLoginPrompt(true); } }}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_28px_rgba(201,168,76,0.5)] whitespace-nowrap"
        >
          {user ? <PlayCircle className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          Take a Practice Test
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
                <p className="text-sm text-muted-foreground">Sign in with your Gmail account to access practice tests.</p>
              </div>
              <button
                onClick={async () => { await signInWithGoogle(); setShowLoginPrompt(false); }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition-all active:scale-95"
              >
                <svg className="h-4 w-4 bg-white rounded-full p-0.5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Sign in with Gmail
              </button>
              <button onClick={() => setShowLoginPrompt(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">Cancel</button>
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
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>

        {/* Year filter */}
        <div className="relative sm:w-44">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); resetPage(); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="all">All Years</option>
            {subjectInfo?.years.slice().sort((a, b) => b - a).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Category filter — only for Current Affairs */}
        {isCurrentAffairs && (
          <div className="relative sm:w-56">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
              className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
            >
              <option value="all">All Topics</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Result count */}
      {!qLoading && (yearFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
        <p className="text-sm text-muted-foreground -mt-2">
          Showing <span className="font-semibold text-foreground">{filteredQuestions.length}</span> of {questions.length} questions
        </p>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {qLoading ? (
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
          paginatedQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                className={`relative bg-card border rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-primary/30 shadow-md' : 'hover:border-primary/30'}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} opacity-70`} />

                <div
                  className="p-5 pl-6 cursor-pointer flex gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[40px]">
                    <span className="text-xs font-bold text-muted-foreground">Q{q.questionNumber}</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{q.year}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isCurrentAffairs && q.category && (
                      <span className="inline-block text-[10px] font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full mb-1.5 border border-primary/15">
                        {q.category}
                      </span>
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
                        const isCorrect = q.answer.toLowerCase() === optKey;
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

                    {q.explanation ? (
                      <div className="mt-5 ml-11 bg-card border rounded-lg p-4">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Explanation</h4>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                      </div>
                    ) : (
                      <div className="mt-4 ml-11 flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        Correct answer: <span className="font-bold text-primary uppercase">{q.answer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!qLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-card border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-card border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
