import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useSubjectData, useIndexData, Question } from '@/hooks/use-subject-data';
import { Settings, Play, ChevronRight, XCircle, CheckCircle2, ChevronLeft, Flag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export type TestResult = {
  questionId: string;
  question: Question;
  selectedOption: string | null;
  isCorrect: boolean;
};

export default function TestMode() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { data: questions, loading: qLoading } = useSubjectData(slug || '');
  const { data: indexData } = useIndexData();
  
  const [hasStarted, setStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(20);
  const [yearRange, setYearRange] = useState<[number, number]>([1979, 2025]);
  
  // Test State
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string | null>(null);

  const subjectInfo = useMemo(() => indexData?.find(s => s.slug === slug), [indexData, slug]);

  useEffect(() => {
    if (subjectInfo && subjectInfo.years.length > 0) {
      const sorted = [...subjectInfo.years].sort((a,b) => a-b);
      setYearRange([sorted[0], sorted[sorted.length - 1]]);
    }
  }, [subjectInfo]);

  const startTest = () => {
    const filtered = questions.filter(q => q.year >= yearRange[0] && q.year <= yearRange[1]);
    const shuffled = shuffle(filtered).slice(0, numQuestions);
    if (shuffled.length === 0) {
      alert("No questions found for the selected year range. Please adjust your filters.");
      return;
    }
    
    setTestQuestions(shuffled);
    setCurrentIndex(0);
    setResults([]);
    setCurrentSelection(null);
    setStarted(true);
  };

  const handleSelect = (optionKey: string) => {
    if (currentSelection) return; // Prevent changing answer
    setCurrentSelection(optionKey);
  };

  const handleNext = () => {
    const q = testQuestions[currentIndex];
    
    // Save result
    setResults(prev => [...prev, {
      questionId: q.id,
      question: q,
      selectedOption: currentSelection,
      isCorrect: currentSelection === q.answer.toLowerCase()
    }]);

    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSelection(null);
    } else {
      // End of test, we need to pass results. We'll use session storage since we don't have global state.
      const finalResults = [...results, {
        questionId: q.id,
        question: q,
        selectedOption: currentSelection,
        isCorrect: currentSelection === q.answer.toLowerCase()
      }];
      sessionStorage.setItem(`test_results_${slug}`, JSON.stringify(finalResults));
      setLocation(`/test/${slug}/results`);
    }
  };

  if (qLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <Link href={`/subject/${slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to {subjectInfo?.subject}
        </Link>
        
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Configure Test</h1>
              <p className="text-sm text-muted-foreground">Customize your practice session</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground">Number of Questions</label>
              <div className="grid grid-cols-4 gap-3">
                {[10, 20, 30, 50].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={`py-2 rounded-lg text-sm font-bold border transition-colors ${numQuestions === num ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background hover:bg-secondary border-border text-foreground'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {subjectInfo && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-foreground">Year Range</label>
                <div className="flex items-center gap-4">
                  <select 
                    value={yearRange[0]}
                    onChange={(e) => setYearRange([Number(e.target.value), yearRange[1]])}
                    className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                  >
                    {subjectInfo.years.filter(y => y <= yearRange[1]).sort((a,b)=>a-b).map(y => (
                      <option key={`start-${y}`} value={y}>{y}</option>
                    ))}
                  </select>
                  <span className="text-muted-foreground text-sm font-medium">to</span>
                  <select 
                    value={yearRange[1]}
                    onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
                    className="flex-1 bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                  >
                    {subjectInfo.years.filter(y => y >= yearRange[0]).sort((a,b)=>b-a).map(y => (
                      <option key={`end-${y}`} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button 
                onClick={startTest}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,170,0,0.2)] hover:shadow-[0_0_20px_rgba(255,170,0,0.4)]"
              >
                <Play className="h-5 w-5" />
                Start Test Now
              </button>
              <p className="text-center text-xs text-muted-foreground mt-3">Questions will be randomly selected from the filtered pool.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = testQuestions[currentIndex];
  const isAnswered = currentSelection !== null;
  const isCorrectSelection = isAnswered && currentSelection === q.answer.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-300">
      {/* Header / Progress */}
      <div className="mb-6 space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
          <span>Question {currentIndex + 1} of {testQuestions.length}</span>
          <span className="bg-secondary px-2 py-1 rounded text-foreground border">Year: {q.year}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${((currentIndex) / testQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto pr-2 pb-24 scrollbar-thin">
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-lg md:text-xl font-medium leading-relaxed text-foreground">
            {q.question}
          </h2>
        </div>

        <div className="space-y-3">
          {['a', 'b', 'c', 'd'].map(optKey => {
            const optText = q.options[optKey];
            if (!optText) return null;
            
            const isThisSelected = currentSelection === optKey;
            const isThisCorrect = q.answer.toLowerCase() === optKey;
            
            let btnClass = "bg-card border-border hover:border-primary/50 text-foreground hover:bg-secondary/50";
            let Icon = null;

            if (isAnswered) {
              if (isThisCorrect) {
                btnClass = "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400 font-medium";
                Icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
              } else if (isThisSelected) {
                btnClass = "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400";
                Icon = <XCircle className="h-5 w-5 text-red-500" />;
              } else {
                btnClass = "bg-background border-border text-muted-foreground opacity-50";
              }
            } else if (isThisSelected) {
              btnClass = "bg-primary/10 border-primary text-primary font-medium";
            }

            return (
              <button
                key={optKey}
                onClick={() => handleSelect(optKey)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 disabled:cursor-default ${btnClass}`}
              >
                <span className="font-bold uppercase opacity-70 mt-0.5">{optKey}.</span>
                <span className="flex-1 text-sm md:text-base">{optText}</span>
                {Icon && <span className="flex-shrink-0 mt-0.5">{Icon}</span>}
              </button>
            );
          })}
        </div>

        {/* Explanation Block */}
        {isAnswered && (
          <div className="mt-6 p-5 bg-secondary/30 border rounded-xl animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
              <Flag className="h-4 w-4 text-primary" /> Explanation
            </h4>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{q.explanation}</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                setLocation(`/subject/${slug}`);
              }
            }}
            className="text-sm font-bold text-muted-foreground hover:text-destructive transition-colors px-4 py-2"
          >
            Quit Test
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground hover:bg-primary/90 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            {currentIndex < testQuestions.length - 1 ? (
              <>Next Question <ChevronRight className="h-5 w-5" /></>
            ) : (
              <>Submit Test <CheckCircle2 className="h-5 w-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}