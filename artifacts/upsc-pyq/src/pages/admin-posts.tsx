import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Plus, Pencil, Trash2, X, Save, FileText, Search, Upload, Paperclip, Loader2 } from 'lucide-react';
import { api, type Post } from '@/lib/api';
import { isAdminLoggedIn, adminLogout } from '@/lib/admin-auth';

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

function getToken(): string | null {
  try { return localStorage.getItem('admin_token'); } catch { return null; }
}

async function uploadPdf(file: File): Promise<string> {
  const token = getToken();
  if (!token) throw new Error('Not logged in');

  // Step 1: get presigned URL
  const res = await fetch('/api/storage/uploads/request-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: 'application/pdf' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Failed to get upload URL');
  }
  const { uploadURL, objectPath } = await res.json();

  // Step 2: upload directly to GCS
  const put = await fetch(uploadURL, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': 'application/pdf' },
  });
  if (!put.ok) throw new Error('Upload to storage failed');

  // Return the URL to serve the PDF via the API
  return `/api/storage${objectPath}`;
}

export default function AdminPosts() {
  const [, navigate] = useLocation();
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function logout() { adminLogout(); navigate('/admin'); }

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

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }
    setUploading(true);
    setUploadProgress('Uploading PDF…');
    setError('');
    try {
      const url = await uploadPdf(file);
      setField('pdfUrl', url);
      setUploadProgress('');
    } catch (err: any) {
      setError(err.message ?? 'PDF upload failed');
      setUploadProgress('');
    } finally {
      setUploading(false);
      // reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
                  <td className="px-4 py-3 font-medium line-clamp-1">
                    {p.title}
                    {p.pdfUrl && <Paperclip className="inline ml-1.5 h-3 w-3 text-muted-foreground" />}
                  </td>
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

                {/* PDF attachment */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">PDF Attachment</label>

                  {/* Upload a PDF file directly */}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-file-input"
                    />
                    <label
                      htmlFor="pdf-file-input"
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                        uploading
                          ? 'opacity-50 cursor-not-allowed bg-secondary'
                          : 'hover:bg-secondary bg-background'
                      }`}
                    >
                      {uploading
                        ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress}</>
                        : <><Upload className="h-4 w-4" />Upload PDF file</>
                      }
                    </label>
                    {editing.pdfUrl && !uploading && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <Paperclip className="h-3.5 w-3.5" />
                        PDF attached
                      </span>
                    )}
                  </div>

                  {/* OR paste a URL */}
                  <div className="relative flex items-center gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">or paste a link:</span>
                    <input
                      value={editing.pdfUrl ?? ''}
                      onChange={e => setField('pdfUrl', e.target.value || null)}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="https://example.com/document.pdf"
                    />
                    {editing.pdfUrl && (
                      <button
                        type="button"
                        onClick={() => setField('pdfUrl', null)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-red-500 transition-colors"
                        title="Remove PDF"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                disabled={saving || uploading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
