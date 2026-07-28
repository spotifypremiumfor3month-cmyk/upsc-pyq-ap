import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { Plus, Pencil, Trash2, X, Save, FileText, Search } from 'lucide-react';
import { api, type Post } from '@/lib/api';
import { isAdminLoggedIn, clearAdminToken } from '@/lib/admin-session';

const CATEGORIES = [
  'Daily Current Affairs', 'Editorial Analysis',
  'GS 1', 'GS 2', 'GS 3', 'GS 4', 'PDF Downloads',
];

const EMPTY: Omit<Post, 'id' | 'publishedAt'> = {
  title: '', slug: '', category: CATEGORIES[0], content: '', tags: [], pdfUrl: null,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminPosts() {
  const [, navigate] = useLocation();
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate('/admin');
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPosts(await api.posts.list()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function logout() { clearAdminToken(); navigate('/admin'); }

  function openNew()          { setEditing({ ...EMPTY }); setError(''); }
  function openEdit(p: Post)  { setEditing({ ...p }); setError(''); }
  function closeForm()        { setEditing(null); setError(''); }

  function setField<K extends keyof Post>(k: K, v: Post[K]) {
    setEditing(prev => {
      if (!prev) return prev;
      const next = { ...prev, [k]: v } as Partial<Post>;
      if (k === 'title' && !prev.id) next.slug = slugify(v as string);
      return next;
    });
  }

  async function savePost() {
    if (!editing) return;
    setSaving(true); setError('');
    try {
      const payload = {
        title:    editing.title    ?? '',
        slug:     editing.slug     ?? '',
        category: editing.category ?? CATEGORIES[0],
        content:  editing.content  ?? '',
        tags:     editing.tags     ?? [],
        pdfUrl:   editing.pdfUrl ?? null,
      };
      if (editing.id) {
        const updated = await api.posts.update(editing.id, payload);
        setPosts(ps => ps.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await api.posts.create(payload);
        setPosts(ps => [created, ...ps]);
      }
      closeForm();
    } catch (e: any) {
      setError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: number) {
    if (!confirm('Delete this post?')) return;
    await api.posts.delete(id);
    setPosts(ps => ps.filter(p => p.id !== id));
  }

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Study Material</h1>
          <p className="text-sm text-muted-foreground">{posts.length} articles published</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Post
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-lg border text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary w-fit">
        <button className="px-4 py-1.5 rounded-lg bg-card text-sm font-medium shadow-sm">Posts</button>
        <button
          onClick={() => navigate('/admin/mcqs')}
          className="px-4 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          MCQs
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Posts table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl border bg-card animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-xl border bg-card">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No posts yet. Click "New Post" to add one.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium line-clamp-1">{p.title}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                    {new Date(p.publishedAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deletePost(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="w-full max-w-2xl bg-card rounded-2xl border shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg">{editing.id ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Title *</label>
                  <input
                    value={editing.title ?? ''}
                    onChange={e => setField('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Article title"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Slug *</label>
                  <input
                    value={editing.slug ?? ''}
                    onChange={e => setField('slug', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                    placeholder="url-safe-slug"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category *</label>
                  <select
                    value={editing.category ?? CATEGORIES[0]}
                    onChange={e => setField('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Tags (comma-separated)</label>
                  <input
                    value={(editing.tags ?? []).join(', ')}
                    onChange={e => setField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Polity, Economy, PIB"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">PDF URL (optional)</label>
                  <input
                    value={editing.pdfUrl ?? ''}
                    onChange={e => setField('pdfUrl', e.target.value || null)}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="https://example.com/doc.pdf"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Content (Markdown) *</label>
                  <textarea
                    value={editing.content ?? ''}
                    onChange={e => setField('content', e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono resize-y"
                    placeholder="## Heading&#10;&#10;Write your article in Markdown…"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="flex items-center justify-end gap-2 p-5 border-t">
              <button onClick={closeForm} className="px-4 py-2 rounded-lg border text-sm hover:bg-secondary transition-colors">Cancel</button>
              <button
                onClick={savePost}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
