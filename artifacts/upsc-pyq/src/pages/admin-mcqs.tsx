import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Plus, Trash2, Upload, X, Save, BookOpen, Search } from 'lucide-react';
import { api, type Mcq } from '@/lib/api';
import { isAdminLoggedIn, adminLogout } from '@/lib/admin-auth';

const SUBJECTS = ['Polity', 'History', 'Economy', 'Environment', 'Geography', 'Science & Tech'];
const YEARS    = ['2026', '2025', '2024', '2023', '2022', '2021', 'Practice'];

const EMPTY_MCQ: Omit<Mcq, 'id'> = {
  questionText: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctOption: 'A', explanation: '', year: 'Practice', subject: 'Polity', topic: '',
};

function parseCSV(text: string): Omit<Mcq, 'id'>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[" ]/g, '_'));
  return lines.slice(1).map(line => {
    // Naive CSV parse (handles simple cases)
    const cells: string[] = [];
    let cur = ''; let inQ = false;
    for (const ch of line) {
      if (ch === '"')  { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return {
      questionText:  row['question_text']  || '',
      optionA:       row['option_a']        || '',
      optionB:       row['option_b']        || '',
      optionC:       row['option_c']        || '',
      optionD:       row['option_d']        || '',
      correctOption: (row['correct_option'] || 'A').toUpperCase().slice(0, 1),
      explanation:   row['explanation']     || '',
      year:          row['year']            || 'Practice',
      subject:       row['subject']         || 'Polity',
      topic:         row['topic']           || '',
    };
  }).filter(r => r.questionText);
}

export default function AdminMcqs() {
  const [, navigate] = useLocation();
  const [mcqs,    setMcqs]    = useState<Mcq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form,    setForm]    = useState<Omit<Mcq, 'id'>>({ ...EMPTY_MCQ });
  const [saving,  setSaving]  = useState(false);
  const [formError, setFormError] = useState('');

  // CSV
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<Omit<Mcq, 'id'>[]>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMsg,       setCsvMsg]       = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate('/admin');
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setMcqs(await api.mcqs.list()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function logout() { adminLogout(); navigate('/admin'); }

  function setField<K extends keyof Omit<Mcq,'id'>>(k: K, v: Omit<Mcq,'id'>[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function saveMcq() {
    setSaving(true); setFormError('');
    try {
      const created = await api.mcqs.create(form);
      setMcqs(prev => [created, ...prev]);
      setForm({ ...EMPTY_MCQ });
      setShowForm(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Save failed');
    } finally { setSaving(false); }
  }

  async function deleteMcq(id: number) {
    if (!confirm('Delete this question?')) return;
    await api.mcqs.delete(id);
    setMcqs(prev => prev.filter(m => m.id !== id));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseCSV(ev.target?.result as string);
      setCsvPreview(parsed);
      setCsvMsg(`${parsed.length} questions parsed from CSV. Click "Import" to confirm.`);
    };
    reader.readAsText(file);
  }

  async function importCsv() {
    if (!csvPreview.length) return;
    setCsvUploading(true); setCsvMsg('');
    try {
      const { inserted } = await api.mcqs.bulkCreate(csvPreview);
      setCsvMsg(`✓ Imported ${inserted} questions.`);
      setCsvPreview([]);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (e: any) {
      setCsvMsg(`Error: ${e.message}`);
    } finally { setCsvUploading(false); }
  }

  const filtered = mcqs.filter(m =>
    !search || m.questionText.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">MCQ Manager</h1>
          <p className="text-sm text-muted-foreground">{mcqs.length} questions in database</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(true); setFormError(''); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Add MCQ
          </button>
          <button onClick={logout} className="px-3 py-2 rounded-lg border text-sm text-muted-foreground hover:bg-secondary transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary w-fit">
        <button onClick={() => navigate('/admin/posts')} className="px-4 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">Posts</button>
        <button className="px-4 py-1.5 rounded-lg bg-card text-sm font-medium shadow-sm">MCQs</button>
      </div>

      {/* CSV Bulk Upload */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Bulk CSV Import</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          CSV headers: <code className="bg-secondary px-1 rounded">question_text, option_a, option_b, option_c, option_d, correct_option, explanation, year, subject, topic</code>
        </p>
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:bg-secondary file:text-sm file:font-medium file:cursor-pointer" />
          {csvPreview.length > 0 && (
            <button
              onClick={importCsv}
              disabled={csvUploading}
              className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {csvUploading ? 'Importing…' : `Import ${csvPreview.length} questions`}
            </button>
          )}
        </div>
        {csvMsg && <p className={`text-sm ${csvMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{csvMsg}</p>}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…" className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
      </div>

      {/* MCQs table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 rounded-xl border bg-card animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-xl border bg-card">
          <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No MCQs yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Question</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Year</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Ans</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-2 text-sm">{m.questionText}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{m.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{m.year}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="h-6 w-6 rounded-full bg-green-500/10 text-green-600 text-xs font-bold flex items-center justify-center">{m.correctOption}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteMcq(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add MCQ modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="w-full max-w-2xl bg-card rounded-2xl border shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">Add Question</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Question Text *</label>
                <textarea value={form.questionText} onChange={e => setField('questionText', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y" placeholder="Enter the MCQ question…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['A','B','C','D'] as const).map(opt => (
                  <div key={opt} className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Option {opt} *</label>
                    <input value={form[`option${opt}` as 'optionA']} onChange={e => setField(`option${opt}` as any, e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder={`Option ${opt}`} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Correct Option *</label>
                  <select value={form.correctOption} onChange={e => setField('correctOption', e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {['A','B','C','D'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Year</label>
                  <select value={form.year} onChange={e => setField('year', e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
                  <select value={form.subject} onChange={e => setField('subject', e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Topic</label>
                <input value={form.topic} onChange={e => setField('topic', e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. Fundamental Rights" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Explanation *</label>
                <textarea value={form.explanation} onChange={e => setField('explanation', e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y" placeholder="Detailed solution / explanation…" />
              </div>
              {formError && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{formError}</p>}
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border text-sm hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={saveMcq} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save MCQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
