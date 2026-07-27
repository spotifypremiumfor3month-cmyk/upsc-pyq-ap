import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useIndexData, SUBJECT_CATEGORIES, PrelimsYearInfo } from '@/hooks/use-subject-data';
import { BookOpen, GraduationCap, Award, Library, PlayCircle, Calendar, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getBaseUrl = () => import.meta.env.BASE_URL.replace(/\/$/, '');

function usePrelimsIndex() {
  const [data, setData] = useState<PrelimsYearInfo[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    fetch(`${getBaseUrl()}/data/prelims/index.json`)
      .then(r => r.json())
      .then(json => { if (mounted) { setData(json); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return { data, loading };
}

const getSubjectColor = (slug: string) => {
  const colors: Record<string, string> = {
    current_affairs:  'bg-[#C9A84C]', // gold
    ancient_history:  'bg-[#b45309]', // amber-700
    general_science:  'bg-[#0369a1]', // sky-700
    indian_economy:   'bg-[#15803d]', // green-700
    indian_geography: 'bg-[#c2410c]', // orange-700
    indian_polity:    'bg-[#4338ca]', // indigo-700
    medieval_history: 'bg-[#a21caf]', // fuchsia-700
    modern_history:   'bg-[#be123c]', // rose-700
    world_geography:  'bg-[#1d4ed8]', // blue-700
  };
  return colors[slug] || 'bg-primary';
};

export default function Home() {
  const { data, loading, error } = useIndexData();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
          <Award className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Failed to Load Content</h2>
        <p className="text-muted-foreground mt-2 max-w-md">We couldn't connect to the database. Please try refreshing the page.</p>
      </div>
    );
  }

  // Pre-calculate stats
  const totalQuestions = data.reduce((acc, curr) => acc + curr.count, 0);
  const totalSubjects = data.length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-both">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background/50 pointer-events-none" />
        <div className="relative z-10 px-6 py-16 md:px-12 md:py-24 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold mb-2 ring-1 ring-primary/20">
            <GraduationCap className="h-4 w-4" />
            <span>46 Years of UPSC Papers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
            Master the <span className="text-primary">Civil Services</span> Exam
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The definitive collection of UPSC Previous Year Questions from 1979 to 2025. Practice, analyze, and conquer.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
            <div className="bg-background/50 backdrop-blur rounded-xl p-4 border shadow-sm">
              <div className="text-3xl font-bold text-foreground">{loading ? <Skeleton className="h-9 w-20 mx-auto" /> : totalQuestions.toLocaleString()}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Questions</div>
            </div>
            <div className="bg-background/50 backdrop-blur rounded-xl p-4 border shadow-sm">
              <div className="text-3xl font-bold text-foreground">{loading ? <Skeleton className="h-9 w-12 mx-auto" /> : totalSubjects}</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Subjects</div>
            </div>
            <div className="bg-background/50 backdrop-blur rounded-xl p-4 border shadow-sm">
              <div className="text-3xl font-bold text-foreground">1979-2025</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">Timeline</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-6">
        <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
          <Library className="h-6 w-6 text-primary" />
          The Strategy
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">1</span>
            </div>
            <h3 className="font-bold text-lg">Pick a Subject</h3>
            <p className="text-muted-foreground text-sm">Focus on one core area at a time. Review chronological trends and patterns in UPSC questioning.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">2</span>
            </div>
            <h3 className="font-bold text-lg">Deep Study</h3>
            <p className="text-muted-foreground text-sm">Read questions along with detailed explanations to understand the depth and breadth required.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <span className="font-bold text-xl">3</span>
            </div>
            <h3 className="font-bold text-lg">Mock Testing</h3>
            <p className="text-muted-foreground text-sm">Challenge yourself under timed conditions with randomized MCQ tests to build exam temperament.</p>
          </div>
        </div>
      </section>

      {/* Subjects Grid grouped by domain category */}
      <section id="subjects" className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Subject Question Banks
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Categorized by subject area for systematic preparation</p>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {SUBJECT_CATEGORIES.map((cat) => {
              const catSubjects = data.filter((s) => cat.slugs.includes(s.slug));
              if (catSubjects.length === 0) return null;
              return (
                <div key={cat.category} className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <h3 className="text-lg font-bold text-foreground">{cat.category}</h3>
                    <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full font-semibold">
                      {catSubjects.reduce((a, b) => a + b.count, 0)} Questions
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catSubjects.map((subject) => (
                      <div 
                        key={subject.slug} 
                        className="group relative bg-card rounded-2xl border p-6 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md flex flex-col h-full overflow-hidden"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getSubjectColor(subject.slug)} transition-all opacity-80 group-hover:opacity-100 group-hover:w-2`} />
                        
                        <h4 className="text-lg font-bold leading-tight mb-2 pl-2 pr-2">{subject.subject}</h4>
                        
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-6 pl-2">
                          <span className="flex items-center gap-1.5"><span className="font-medium text-foreground">{subject.count}</span> Questions</span>
                          <span className="flex items-center gap-1.5"><span className="font-medium text-foreground">{subject.yearRange}</span></span>
                        </div>
                        
                        <div className="mt-auto grid grid-cols-2 gap-2">
                          <Link href={`/subject/${subject.slug}`} className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 px-3 rounded-lg text-sm font-semibold transition-colors">
                            <BookOpen className="h-4 w-4" />
                            Study
                          </Link>
                          <Link href={`/test/${subject.slug}`} className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-3 rounded-lg text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(255,170,0,0.2)] group-hover:shadow-[0_0_20px_rgba(255,170,0,0.4)]">
                            <PlayCircle className="h-4 w-4" />
                            Test
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}