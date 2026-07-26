import { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useSubjectData, useIndexData } from '@/hooks/use-subject-data';
import { ChevronLeft, Search, Filter, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubjectDetail() {
  const { slug } = useParams();
  const { data: questions, loading: qLoading, error: qError } = useSubjectData(slug || '');
  const { data: indexData, loading: iLoading } = useIndexData();
  
  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getSubjectColor = (s: string) => {
    const colors: Record<string, string> = {
      ancient_history: 'bg-[#b45309]', general_science: 'bg-[#0369a1]',
      indian_economy: 'bg-[#15803d]', indian_geography: 'bg-[#c2410c]',
      indian_polity: 'bg-[#4338ca]', medieval_history: 'bg-[#a21caf]',
      modern_history: 'bg-[#be123c]', world_geography: 'bg-[#1d4ed8]',
    };
    return colors[s] || 'bg-primary';
  };

  const ITEMS_PER_PAGE = 20;

  const subjectInfo = useMemo(() => {
    return indexData?.find(s => s.slug === slug);
  }, [indexData, slug]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchYear = yearFilter === 'all' || q.year.toString() === yearFilter;
      const matchSearch = searchQuery === '' || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchYear && matchSearch;
    });
  }, [questions, yearFilter, searchQuery]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuestions, page]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

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

      <div className="bg-card border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm relative overflow-hidden">
        <div className={`absolute left-0 top-0 bottom-0 w-2 ${getSubjectColor(slug || '')}`} />
        <div className="pl-2">
          <h1 className="text-3xl font-black text-foreground mb-2">
            {subjectInfo ? subjectInfo.subject : <Skeleton className="h-9 w-64" />}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="bg-secondary/50 px-2.5 py-1 rounded-md font-medium border">
              {qLoading ? <Skeleton className="h-4 w-12" /> : `${questions.length} Questions`}
            </span>
            <span className="bg-secondary/50 px-2.5 py-1 rounded-md font-medium border">
              {subjectInfo ? subjectInfo.yearRange : <Skeleton className="h-4 w-20" />}
            </span>
          </div>
        </div>
        <Link 
          href={`/test/${slug}`}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,170,0,0.3)] hover:shadow-[0_0_25px_rgba(255,170,0,0.5)] whitespace-nowrap"
        >
          <PlayCircle className="h-5 w-5" />
          Take a Practice Test
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select 
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="all">All Years</option>
            {subjectInfo?.years.sort((a,b) => b-a).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {qLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5"><Skeleton className="h-6 w-3/4 mb-4" /><Skeleton className="h-4 w-1/2" /></div>
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
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSubjectColor(slug || '')} opacity-60`} />
                
                <div 
                  className="p-5 pl-7 cursor-pointer flex gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <div className="flex-shrink-0 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-muted-foreground">Q.{q.questionNumber}</span>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{q.year}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-base text-foreground font-medium ${!isExpanded && 'line-clamp-2'}`}>
                      {q.question}
                    </p>
                    {!isExpanded && (
                      <div className="mt-3 text-xs font-semibold text-primary flex items-center gap-1">
                        View Options & Answer <ChevronRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t bg-secondary/20 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2 mt-4 ml-12">
                      {['a', 'b', 'c', 'd'].map(optKey => {
                        const optText = q.options[optKey];
                        if (!optText) return null;
                        const isCorrect = q.answer.toLowerCase() === optKey;
                        return (
                          <div 
                            key={optKey} 
                            className={`p-3 rounded-lg border text-sm flex gap-3 ${isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-card border-border text-foreground'}`}
                          >
                            <span className={`font-bold uppercase ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>{optKey}.</span>
                            <span className="flex-1">{optText}</span>
                            {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 ml-12 bg-card border rounded-lg p-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Explanation</h4>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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