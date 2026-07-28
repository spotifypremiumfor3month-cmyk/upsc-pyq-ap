import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Search, FileText, BookOpen, Newspaper, GraduationCap, Download, Tag } from 'lucide-react';
import { api, type Post } from '@/lib/api';

const CATEGORIES = [
  'Daily Current Affairs',
  'Editorial Analysis',
  'GS 1',
  'GS 2',
  'GS 3',
  'GS 4',
  'PDF Downloads',
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Daily Current Affairs': <Newspaper className="h-5 w-5" />,
  'Editorial Analysis':    <BookOpen  className="h-5 w-5" />,
  'GS 1': <GraduationCap className="h-5 w-5" />,
  'GS 2': <GraduationCap className="h-5 w-5" />,
  'GS 3': <GraduationCap className="h-5 w-5" />,
  'GS 4': <GraduationCap className="h-5 w-5" />,
  'PDF Downloads': <Download className="h-5 w-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Daily Current Affairs': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Editorial Analysis':    'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'GS 1': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'GS 2': 'bg-green-500/10 text-green-600 border-green-500/20',
  'GS 3': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'GS 4': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  'PDF Downloads': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

function readTime(content: string) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Articles() {
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.posts.list({ category: category || undefined, search: search || undefined });
      setPosts(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  // Seed on first load if empty
  useEffect(() => {
    api.seed().catch(() => {});
  }, []);

  const allTags = [...new Set(posts.flatMap(p => p.tags ?? []))];
  const latest  = posts[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">

      {/* Hero — latest post */}
      {latest && !search && !category && (
        <Link href={`/articles/${latest.slug}`}>
          <div className="group relative rounded-2xl border bg-card overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative p-8 md:p-12">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[latest.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                {CATEGORY_ICONS[latest.category]}
                {latest.category}
              </span>
              <h1 className="mt-4 text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                {latest.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {latest.content.replace(/[#*`>\-]/g, '').slice(0, 200)}…
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{formatDate(latest.publishedAt)}</span>
                <span>·</span>
                <span>{readTime(latest.content)} min read</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search articles, tags, topics…"
          className="w-full pl-11 pr-4 py-3 rounded-xl border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs">
            Clear
          </button>
        )}
      </div>

      {/* Category cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!category ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-secondary'}`}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${category === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-secondary'}`}
            >
              {CATEGORY_ICONS[cat]}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && !search && !category && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 20).map(tag => (
              <button
                key={tag}
                onClick={() => setSearch(tag)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium bg-card hover:bg-secondary transition-colors"
              >
                <Tag className="h-3 w-3 text-primary" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">
            {search ? `Results for "${search}"` : category || 'Recent Articles'}
          </h2>
          {(search || category) && (
            <button onClick={() => { setSearch(''); setCategory(''); }} className="text-xs text-primary hover:underline">
              Reset filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No articles found.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <Link key={post.id} href={`/articles/${post.slug}`}>
                <article className="group h-full flex flex-col rounded-xl border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer">
                  <span className={`self-start inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {post.category}
                  </span>
                  <h3 className="mt-3 font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex-1">
                    {post.content.replace(/[#*`>\-]/g, '').slice(0, 120)}
                  </p>
                  {post.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">#{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>·</span>
                    <span>{readTime(post.content)} min read</span>
                    {post.pdfUrl && <span className="ml-auto text-primary flex items-center gap-0.5"><Download className="h-3 w-3" />PDF</span>}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
