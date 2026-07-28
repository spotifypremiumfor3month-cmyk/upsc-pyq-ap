import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, CheckCircle2, XCircle, RotateCcw, BookOpen, Trophy, ChevronUp } from 'lucide-react';
import { api, type Mcq } from '@/lib/api';

const YEARS    = ['All Years', '2026', '2025', '2024', '2023', '2022', 'Practice'];
const SUBJECTS = ['All Subjects', 'Polity', 'History', 'Economy', 'Environment', 'Geography', 'Science & Tech'];

type AnswerState = { selected: string; revealed: boolean };

export default function MockTests() {
  const [year,    setYear]    = useState('All Years');
  const [subject, setSubject] = useState('All Subjects');
  const [topic,   setTopic]   = useState('All Topics');
  const [topics,  setTopics]  = useState<string[]>([]);

  const [mcqs,    setMcqs]    = useState<Mcq[]>([]);
  const [loading, setLoading] = useState(false);

  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState<Record<number, AnswerState>>({});
  const [score,    setScore]    = useState(0);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Seed on first load
  useEffect(() => { api.seed().catch(() => {}); }, []);

  // Load topics when subject changes
  useEffect(() => {
    api.mcqs.topics(subject !== 'All Subjects' ? subject : undefined)
      .then(t => setTopics(t))
      .catch(() => setTopics([]));
    setTopic('All Topics');
  }, [subject]);

  const loadMcqs = useCallback(async () => {
    setLoading(true);
    setCurrent(0);
    setAnswers({});
    setScore(0);
    setExpanded({});
    try {
      const data = await api.mcqs.list({
        year:    year    !== 'All Years'    ? year    : undefined,
        subject: subject !== 'All Subjects' ? subject : undefined,
        topic:   topic   !== 'All Topics'   ? topic   : undefined,
      });
      setMcqs(data);
    } catch { setMcqs([]); }
    finally { setLoading(false); }
  }, [year, subject, topic]);

  useEffect(() => { loadMcqs(); }, [loadMcqs]);

  function handleAnswer(mcqId: number, option: string, correctOption: string) {
    if (answers[mcqId]) return; // already answered
    const correct = option === correctOption;
    setAnswers(prev => ({ ...prev, [mcqId]: { selected: option, revealed: false } }));
    setScore(prev => prev + (correct ? 2 : -0.66));
  }

  function revealSolution(mcqId: number) {
    setExpanded(prev => ({ ...prev, [mcqId]: !prev[mcqId] }));
  }

  function reset() {
    setYear('All Years');
    setSubject('All Subjects');
    setTopic('All Topics');
    setAnswers({});
    setScore(0);
    setCurrent(0);
    setExpanded({});
  }

  const mcq = mcqs[current];
  const answered = Object.keys(answers).length;
  const totalMcqs = mcqs.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Tests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Practice MCQs with UPSC-style scoring (+2 / −0.66)</p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border bg-card text-sm font-medium hover:bg-secondary transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border bg-card">
        {/* Year */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Year</label>
          <div className="relative">
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
          <div className="relative">
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Topic */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Topic</label>
          <div className="relative">
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option>All Topics</option>
              {topics.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Quiz header */}
      {totalMcqs > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
          <div className="text-sm font-medium">
            Question <span className="text-primary font-bold">{current + 1}</span> of <span className="font-bold">{totalMcqs}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{answered} answered</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${score >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
              <Trophy className="h-4 w-4" />
              {score >= 0 ? '+' : ''}{score.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Question card */}
      {loading ? (
        <div className="h-72 rounded-xl border bg-card animate-pulse" />
      ) : mcqs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground rounded-xl border bg-card">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No questions match the selected filters.</p>
        </div>
      ) : mcq ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Question */}
          <div className="p-6 border-b">
            <div className="flex gap-2 mb-1">
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{mcq.year}</span>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{mcq.subject}</span>
              {mcq.topic && <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{mcq.topic}</span>}
            </div>
            <p className="text-base font-medium leading-relaxed whitespace-pre-wrap mt-3">{mcq.questionText}</p>
          </div>

          {/* Options */}
          <div className="p-6 space-y-3">
            {(['A','B','C','D'] as const).map(opt => {
              const text = mcq[`option${opt}` as 'optionA'|'optionB'|'optionC'|'optionD'];
              const state = answers[mcq.id];
              const isSelected = state?.selected === opt;
              const isCorrect  = mcq.correctOption === opt;
              let cls = 'border-border bg-background hover:border-primary/50 hover:bg-secondary/50 cursor-pointer';
              if (state) {
                if (isCorrect) cls = 'border-green-500 bg-green-500/10 cursor-default';
                else if (isSelected) cls = 'border-red-500 bg-red-500/10 cursor-default';
                else cls = 'border-border bg-background opacity-60 cursor-default';
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(mcq.id, opt, mcq.correctOption)}
                  disabled={!!state}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${cls}`}
                >
                  <span className="shrink-0 h-7 w-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                    {opt}
                  </span>
                  <span className="text-sm leading-relaxed">{text}</span>
                  {state && isCorrect && <CheckCircle2 className="ml-auto shrink-0 h-5 w-5 text-green-500" />}
                  {state && isSelected && !isCorrect && <XCircle className="ml-auto shrink-0 h-5 w-5 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* Solution */}
          {answers[mcq.id] && (
            <div className="border-t">
              <button
                onClick={() => revealSolution(mcq.id)}
                className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                <span className="text-primary">View Detailed Solution</span>
                {expanded[mcq.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expanded[mcq.id] && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground border-t bg-secondary/20">
                  <p className="pt-4 whitespace-pre-wrap">{mcq.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-secondary/20">
            <button
              onClick={() => setCurrent(p => Math.max(0, p - 1))}
              disabled={current === 0}
              className="px-4 py-2 rounded-lg border bg-card text-sm font-medium disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              ← Prev
            </button>
            <div className="flex gap-1">
              {mcqs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${idx === current ? 'bg-primary scale-125' : answers[mcqs[idx].id] ? 'bg-primary/40' : 'bg-border'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent(p => Math.min(totalMcqs - 1, p + 1))}
              disabled={current === totalMcqs - 1}
              className="px-4 py-2 rounded-lg border bg-card text-sm font-medium disabled:opacity-40 hover:bg-secondary transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
