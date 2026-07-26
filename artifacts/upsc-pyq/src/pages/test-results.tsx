import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useIndexData } from '@/hooks/use-subject-data';
import { TestResult } from './test-mode';
import { Award, Target, CheckCircle2, XCircle, RotateCcw, BookOpen, ChevronRight, BarChart3 } from 'lucide-react';
import { saveTestResult } from '@/lib/progress';

export default function TestResults() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { data: indexData } = useIndexData();
  
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`test_results_${slug}`);
      if (stored) {
        const parsed: TestResult[] = JSON.parse(stored);
        setResults(parsed);
        // Persist to progress tracker
        const correct = parsed.filter(r => r.isCorrect).length;
        saveTestResult(slug || '', correct, parsed.length);
      } else {
        setLocation(`/subject/${slug}`);
      }
    } catch (e) {
      setLocation(`/subject/${slug}`);
    }
  }, [slug, setLocation]);

  if (!results) return null;

  const subjectInfo = indexData?.find(s => s.slug === slug);
  
  const total = results.length;
  const correct = results.filter(r => r.isCorrect).length;
  const incorrect = total - correct;
  const percentage = Math.round((correct / total) * 100);
  const isPass = percentage >= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-3xl font-black text-foreground">Test Complete</h1>
        <p className="text-muted-foreground">{subjectInfo?.subject || 'Practice Test'} Assessment</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <div className={`md:col-span-2 bg-card border-2 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden ${isPass ? 'border-green-500/30' : 'border-primary/30'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Award className="h-48 w-48" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className={`text-6xl font-black animate-in zoom-in duration-700 ${isPass ? 'text-green-500' : 'text-primary'}`}>
              {percentage}%
            </div>
            <div className="text-xl font-bold text-foreground animate-in slide-in-from-bottom-2 duration-500 delay-150 fill-both">
              {correct} out of {total} Correct
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${isPass ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
              {isPass ? (
                <><CheckCircle2 className="h-4 w-4" /> Passed: Ready for Exam</>
              ) : (
                <><Target className="h-4 w-4" /> Failed: Needs Revision</>
              )}
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4">
          <div className="bg-card border rounded-2xl p-6 h-full flex flex-col justify-center space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Overview
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-bold">{total}</span>
              </div>
              <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                <span>Correct Answers</span>
                <span className="font-bold">{correct}</span>
              </div>
              <div className="flex items-center justify-between text-red-600 dark:text-red-400">
                <span>Incorrect Answers</span>
                <span className="font-bold">{incorrect}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link 
          href={`/test/${slug}`}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,170,0,0.2)] hover:shadow-[0_0_20px_rgba(255,170,0,0.4)]"
        >
          <RotateCcw className="h-5 w-5" />
          Retry Test
        </Link>
        <Link 
          href={`/subject/${slug}`}
          className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border"
        >
          <BookOpen className="h-5 w-5" />
          Return to Subject
        </Link>
      </div>

      <div className="pt-8 border-t space-y-6">
        <h2 className="text-2xl font-bold">Detailed Review</h2>
        <div className="space-y-4">
          {results.map((res, idx) => {
            const isExpanded = expandedId === res.questionId;
            return (
              <div key={res.questionId} className={`bg-card border rounded-xl overflow-hidden transition-colors ${res.isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}>
                <div 
                  className="p-5 cursor-pointer flex gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : res.questionId)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {res.isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Q.{idx + 1}</span>
                      <span className="bg-secondary/50 text-[10px] font-bold px-2 py-0.5 rounded-full border">{res.question.year}</span>
                    </div>
                    <p className={`text-base font-medium text-foreground ${!isExpanded && 'line-clamp-1'}`}>
                      {res.question.question}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center">
                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded && 'rotate-90'}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t bg-secondary/10 pt-4 space-y-4">
                    <div className="space-y-2">
                      {['a', 'b', 'c', 'd'].map(optKey => {
                        const optText = res.question.options[optKey];
                        if (!optText) return null;
                        
                        const isCorrectAnswer = res.question.answer.toLowerCase() === optKey;
                        const isUserAnswer = res.selectedOption === optKey;
                        
                        let optClass = "bg-card border-border text-muted-foreground opacity-60";
                        let Icon = null;
                        
                        if (isCorrectAnswer) {
                          optClass = "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400 font-medium opacity-100 ring-1 ring-green-500/50";
                          Icon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
                        } else if (isUserAnswer) {
                          optClass = "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400 opacity-100";
                          Icon = <XCircle className="h-4 w-4 text-red-500" />;
                        }

                        return (
                          <div key={optKey} className={`p-3 rounded-lg border text-sm flex gap-3 ${optClass}`}>
                            <span className="font-bold uppercase">{optKey}.</span>
                            <span className="flex-1">{optText}</span>
                            {Icon && <span className="flex-shrink-0 mt-0.5">{Icon}</span>}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Explanation</h4>
                      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{res.question.explanation}</p>
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