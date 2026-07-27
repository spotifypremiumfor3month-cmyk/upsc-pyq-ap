import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { Settings, Play, ChevronRight, XCircle, CheckCircle2, ChevronLeft, Flag, Lock, RotateCcw, Award, Target, BarChart3, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { PrelimsQuestion } from '@/hooks/use-subject-data';

const getBaseUrl = () => import.meta.env.BASE_URL.replace(/\/$/, '');

function usePrelimsYearData(year: string) {
  const [data, setData] = useState<PrelimsQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!year) return;
    let mounted = true;
    setLoading(true);
    fetch(`${getBaseUrl()}/data/prelims/${year}.json`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(json => { if (mounted) { setData(json); setLoading(false); } })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [year]);
  return { data, loading };
}

function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

type TestResult = {
  questionId: string;
  question: PrelimsQuestion;
  selectedOption: string | null;
  isCorrect: boolean;
};

type Phase = 'config' | 'test' | 'results';

export default function PrelimsTest() {
  const { year } = useParams<{ year: string }>();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { data: questions, loading: qLoading } = usePrelimsYearData(year || '');

  const [phase, setPhase] = useState<Phase>('config');
  const [numQuestions, setNumQuestions] = useState(25);
  const [subjectFilter, setSubjectFilter] = useState('all');

  const [testQuestions, setTestQuestions] = useState<PrelimsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uniqueSubjects = useMemo(() => {
    const set = new Set(questions.map(q => q.subject?.split('›')[0]?.trim()).filter(Boolean));
    return [...set].sort();
  }, [questions]);

  const startTest = () => {
    const pool = subjectFilter === 'all'
      ? questions
      : questions.filter(q => q.subject?.startsWith(subjectFilter));
    const picked = shuffle(pool).slice(0, numQuestions);
    if (picked.length === 0) { alert('No questions for that filter.'); return; }
    setTestQuestions(picked);
    setCurrentIndex(0);
    setResults([]);
    setCurrentSelection(null);
    setPhase('test');
  };

  const handleNext = () => {
    const q = testQuestions[currentIndex];
    const newResult: TestResult = {
      questionId: q.id,
      question: q,
      selectedOption: currentSelection,
      isCorrect: currentSelection === q.answer,
    };
    const updatedResults = [...results, newResult];

    if (currentIndex < testQuestions.length - 1) {
      setResults(updatedResults);
      setCurrentIndex(i => i + 1);
      setCurrentSelection(null);
    } else {
      setResults(updatedResults);
      setPhase('results');
    }
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (qLoading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 animate-in fade-in zoom-in-95 duration-500">
        <Link href={`/prelims/${year}`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to {year} Paper
        </Link>
        <div className="bg-card border rounded-2xl p-10 shadow-sm text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Sign in to Take Tests</h2>
            <p className="text-sm text-muted-foreground">Practice tests are available to signed-in users only.</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow transition-all"
          >
            Sign in with Gmail
          </button>
        </div>
      </div>
    );
  }

  // ── Config screen ─────────────────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <Link href={`/prelims/${year}`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to {year} Paper
        </Link>

        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">UPSC Prelims {year}</h1>
              <p className="text-sm text-muted-foreground">Configure your practice session</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">Number of Questions</label>
              <div className="grid grid-cols-4 gap-3">
                {[25, 50, 75, 100].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={`py-2 rounded-lg text-sm font-bold border transition-colors ${numQuestions === num ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background hover:bg-secondary border-border'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{questions.length} questions available for {year}</p>
            </div>

            {uniqueSubjects.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Subject Filter</label>
                <select
                  value={subjectFilter}
                  onChange={e => setSubjectFilter(e.target.value)}
                  className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all">All Subjects (Full Paper)</option>
                  {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={startTest}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]"
              >
                <Play className="h-5 w-5" />
                Start Test — {year} Paper
              </button>
              <p className="text-center text-xs text-muted-foreground mt-3">Questions are randomly selected from the {year} paper.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (phase === 'results') {
    const total = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    const incorrect = total - correct;
    const percentage = Math.round((correct / total) * 100);
    const isPass = percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
        <div className="text-center space-y-2 mt-4">
          <h1 className="text-3xl font-black text-foreground">Test Complete</h1>
          <p className="text-muted-foreground">UPSC Prelims {year} — Practice Assessment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className={`md:col-span-2 bg-card border-2 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden ${isPass ? 'border-green-500/30' : 'border-primary/30'}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5"><Award className="h-48 w-48" /></div>
            <div className="relative z-10 space-y-4">
              <div className={`text-6xl font-black ${isPass ? 'text-green-500' : 'text-primary'}`}>{percentage}%</div>
              <div className="text-xl font-bold text-foreground">{correct} out of {total} Correct</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${isPass ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
                {isPass ? <><CheckCircle2 className="h-4 w-4" /> Passed</> : <><Target className="h-4 w-4" /> Needs Revision</>}
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-2xl p-6 flex flex-col justify-center space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Year</span><span className="font-bold">{year}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold">{total}</span></div>
              <div className="flex justify-between text-green-600 dark:text-green-400"><span>Correct</span><span className="font-bold">{correct}</span></div>
              <div className="flex justify-between text-red-600 dark:text-red-400"><span>Incorrect</span><span className="font-bold">{incorrect}</span></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setPhase('config')}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="h-5 w-5" /> Retry Test
          </button>
          <Link
            href={`/prelims/${year}`}
            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border"
          >
            <BookOpen className="h-5 w-5" /> Review {year} Paper
          </Link>
        </div>

        {/* Detailed review */}
        <div className="pt-8 border-t space-y-6">
          <h2 className="text-2xl font-bold">Detailed Review</h2>
          <div className="space-y-4">
            {results.map((res, idx) => {
              const isExpanded = expandedId === res.questionId;
              return (
                <div key={res.questionId} className={`bg-card border rounded-xl overflow-hidden ${res.isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}>
                  <div className="p-5 cursor-pointer flex gap-4" onClick={() => setExpandedId(isExpanded ? null : res.questionId)}>
                    <div className="flex-shrink-0 mt-1">
                      {res.isCorrect ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <XCircle className="h-6 w-6 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Q.{idx + 1}</span>
                        <span className="bg-secondary/50 text-[10px] font-bold px-2 py-0.5 rounded-full border">Q{res.question.questionNumber}</span>
                      </div>
                      <p className={`text-base font-medium text-foreground ${!isExpanded && 'line-clamp-1'}`}>{res.question.question}</p>
                    </div>
                    <ChevronRight className={`h-5 w-5 text-muted-foreground flex-shrink-0 self-center transition-transform ${isExpanded && 'rotate-90'}`} />
                  </div>
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t bg-secondary/10 pt-4 space-y-4">
                      <div className="space-y-2">
                        {(['a', 'b', 'c', 'd'] as const).map(optKey => {
                          const optText = res.question.options[optKey];
                          if (!optText) return null;
                          const isCorrectAnswer = res.question.answer === optKey;
                          const isUserAnswer = res.selectedOption === optKey;
                          let cls = "bg-card border-border text-muted-foreground opacity-60";
                          let Icon = null;
                          if (isCorrectAnswer) { cls = "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 font-medium opacity-100 ring-1 ring-green-500/50"; Icon = <CheckCircle2 className="h-4 w-4 text-green-500" />; }
                          else if (isUserAnswer) { cls = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 opacity-100"; Icon = <XCircle className="h-4 w-4 text-red-500" />; }
                          return (
                            <div key={optKey} className={`p-3 rounded-lg border text-sm flex gap-3 ${cls}`}>
                              <span className="font-bold uppercase">{optKey}.</span>
                              <span className="flex-1">{optText}</span>
                              {Icon && <span className="flex-shrink-0">{Icon}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Active test ───────────────────────────────────────────────────────────
  const q = testQuestions[currentIndex];
  const isAnswered = currentSelection !== null;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Progress header */}
      <div className="mb-6 space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
          <span>Question {currentIndex + 1} of {testQuestions.length}</span>
          <span className="bg-secondary px-2 py-1 rounded border text-foreground">UPSC {year} · Q{q.questionNumber}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentIndex / testQuestions.length) * 100}%` }}
          />
        </div>
        {q.subject && (
          <p className="text-xs text-muted-foreground truncate">
            📚 {q.subject}
          </p>
        )}
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto pr-2 pb-24">
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-lg md:text-xl font-medium leading-relaxed text-foreground">{q.question}</h2>
        </div>

        <div className="space-y-3">
          {(['a', 'b', 'c', 'd'] as const).map(optKey => {
            const optText = q.options[optKey];
            if (!optText) return null;
            const isThisSelected = currentSelection === optKey;
            const isThisCorrect = q.answer === optKey;

            let cls = "bg-card border-border hover:border-primary/50 text-foreground hover:bg-secondary/50";
            let Icon = null;

            if (isAnswered) {
              if (isThisCorrect) { cls = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400 font-medium"; Icon = <CheckCircle2 className="h-5 w-5 text-green-500" />; }
              else if (isThisSelected) { cls = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400"; Icon = <XCircle className="h-5 w-5 text-red-500" />; }
              else { cls = "bg-background border-border text-muted-foreground opacity-50"; }
            } else if (isThisSelected) {
              cls = "bg-primary/10 border-primary text-primary font-medium";
            }

            return (
              <button
                key={optKey}
                onClick={() => { if (!isAnswered) setCurrentSelection(optKey); }}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 disabled:cursor-default ${cls}`}
              >
                <span className="font-bold uppercase opacity-70 mt-0.5">{optKey}.</span>
                <span className="flex-1 text-sm md:text-base">{optText}</span>
                {Icon && <span className="flex-shrink-0 mt-0.5">{Icon}</span>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-6 p-5 bg-secondary/30 border rounded-xl animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-primary" /> Answer: <span className="text-primary uppercase">{q.answer}</span>
            </h4>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => { if (confirm('Quit? Progress will be lost.')) setPhase('config'); }}
            className="text-sm font-bold text-muted-foreground hover:text-destructive transition-colors px-4 py-2"
          >
            Quit Test
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            {currentIndex < testQuestions.length - 1
              ? <><span>Next Question</span><ChevronRight className="h-5 w-5" /></>
              : <><span>Submit Test</span><CheckCircle2 className="h-5 w-5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
