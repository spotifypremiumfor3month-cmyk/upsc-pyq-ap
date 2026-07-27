import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { BookOpen, PlayCircle, ChevronLeft, Calendar, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PrelimsYearInfo } from '@/hooks/use-subject-data';

const getBaseUrl = () => import.meta.env.BASE_URL.replace(/\/$/, '');

function usePrelimsIndex() {
  const [data, setData] = useState<PrelimsYearInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let mounted = true;
    fetch(`${getBaseUrl()}/data/prelims/index.json`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(json => { if (mounted) { setData(json); setLoading(false); } })
      .catch(err => { if (mounted) { setError(err); setLoading(false); } });
    return () => { mounted = false; };
  }, []);
  return { data, loading, error };
}

// colour wheel that cycles through a palette per year
const DECADE_COLORS: Record<number, string> = {
  1990: 'bg-[#1d4ed8]',
  2000: 'bg-[#15803d]',
  2010: 'bg-[#c2410c]',
  2020: 'bg-[#C9A84C]',
};
function accentFor(year: number) {
  const decade = Math.floor(year / 10) * 10;
  return DECADE_COLORS[decade] || 'bg-primary';
}

export default function PrelimsIndex() {
  const { data, loading, error } = usePrelimsIndex();
  const [searchYear, setSearchYear] = useState('');

  const sorted = [...data].sort((a, b) => b.year - a.year);
  const filtered = searchYear
    ? sorted.filter(y => y.year.toString().includes(searchYear))
    : sorted;

  const total = data.reduce((s, y) => s + y.count, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Home
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card px-6 py-12 md:px-12 text-center shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background/50 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-primary/20">
            <Calendar className="h-4 w-4" />
            Year-Wise Prelims Papers
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground">
            UPSC Prelims <span className="text-primary">PYQ</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Complete question papers from every year — study, analyse, and test yourself on the full 100-question prelims paper.
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="bg-background/60 border rounded-xl px-5 py-3">
              <div className="text-2xl font-black text-foreground">{loading ? '—' : total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">Questions</div>
            </div>
            <div className="bg-background/60 border rounded-xl px-5 py-3">
              <div className="text-2xl font-black text-foreground">{loading ? '—' : data.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">Years</div>
            </div>
            <div className="bg-background/60 border rounded-xl px-5 py-3">
              <div className="text-2xl font-black text-foreground">1995–2025</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">Timeline</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Jump to year…"
          value={searchYear}
          onChange={e => setSearchYear(e.target.value)}
          className="w-full bg-card border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Grid */}
      {error ? (
        <p className="text-center text-destructive py-16">Failed to load data. Please refresh.</p>
      ) : loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border p-5 space-y-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-28" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(yr => (
            <div
              key={yr.year}
              className="group relative bg-card rounded-2xl border hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col overflow-hidden"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentFor(yr.year)} opacity-80 group-hover:opacity-100 group-hover:w-2 transition-all`} />

              <div className="p-5 pl-6 flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-2xl font-black text-foreground">{yr.year}</h3>
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border mt-1">
                    UPSC GS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span><span className="font-semibold text-foreground">{yr.count}</span> Questions</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 px-5 pb-5 pl-6">
                <Link
                  href={`/prelims/${yr.year}`}
                  className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Study
                </Link>
                <Link
                  href={`/prelims/${yr.year}/test`}
                  className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-3 rounded-lg text-sm font-semibold transition-colors shadow-[0_0_12px_rgba(201,168,76,0.2)] group-hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                >
                  <PlayCircle className="h-4 w-4" />
                  Test
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-16 text-muted-foreground">
              No year found for "{searchYear}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
