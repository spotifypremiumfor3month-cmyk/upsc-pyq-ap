import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowLeft, Calendar, Clock, Download, Tag, ExternalLink } from 'lucide-react';
import { api, type Post } from '@/lib/api';

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
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Simple markdown renderer (headings, bold, italic, tables, blockquotes, lists)
function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  function inlineFormat(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return parts.map((p, idx) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={idx}>{p.slice(2, -2)}</strong>;
      if (p.startsWith('*')  && p.endsWith('*'))  return <em key={idx}>{p.slice(1, -1)}</em>;
      if (p.startsWith('`')  && p.endsWith('`'))  return <code key={idx} className="px-1.5 py-0.5 rounded bg-secondary text-sm font-mono">{p.slice(1, -1)}</code>;
      return p;
    });
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} className="text-lg font-bold mt-6 mb-2">{inlineFormat(line.slice(4))}</h3>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h2 key={i} className="text-xl font-bold mt-8 mb-3 text-primary">{inlineFormat(line.slice(3))}</h2>);
    } else if (line.startsWith('# ')) {
      nodes.push(<h1 key={i} className="text-2xl font-bold mt-8 mb-3">{inlineFormat(line.slice(2))}</h1>);
    } else if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={i} className="border-l-4 border-primary pl-4 my-4 text-muted-foreground italic">
          {inlineFormat(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i} className="ml-1">{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      nodes.push(<ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3 text-sm">{items}</ul>);
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i}>{inlineFormat(lines[i].replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      nodes.push(<ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-3 text-sm">{items}</ol>);
      continue;
    } else if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].match(/^[\|\s\-:]+$/)) {
          rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()));
        }
        i++;
      }
      nodes.push(
        <div key={`tbl-${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse rounded-lg overflow-hidden">
            {rows.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? 'bg-primary/10 font-semibold' : ri % 2 === 0 ? 'bg-secondary/40' : ''}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-border px-3 py-2">{inlineFormat(cell)}</td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('---')) {
      nodes.push(<hr key={i} className="my-6 border-border" />);
    } else if (line.trim() === '') {
      nodes.push(<div key={i} className="h-2" />);
    } else {
      nodes.push(<p key={i} className="leading-relaxed text-[15px]">{inlineFormat(line)}</p>);
    }
    i++;
  }
  return nodes;
}

export default function ArticleDetail() {
  const [, params] = useRoute('/articles/:slug');
  const slug = params?.slug ?? '';
  const [post, setPost]     = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.posts.get(slug)
      .then(p => { setPost(p); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
      <div className="h-8 w-32 bg-secondary rounded animate-pulse" />
      <div className="h-10 w-3/4 bg-secondary rounded animate-pulse" />
      <div className="space-y-2 mt-8">
        {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-secondary rounded animate-pulse" />)}
      </div>
    </div>
  );

  if (notFound || !post) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">Article not found.</p>
      <Link href="/articles" className="mt-4 inline-flex items-center gap-1 text-primary hover:underline text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Articles
      </Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      {/* Header */}
      <header className="mb-8">
        <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[post.category] ?? 'bg-muted text-muted-foreground border-border'}`}>
          {post.category}
        </span>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{readTime(post.content)} min read</span>
        </div>
        {post.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map(t => (
              <span key={t} className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                <Tag className="h-3 w-3 text-primary" />#{t}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* PDF viewer */}
      {post.pdfUrl && (
        <div className="mb-8 rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-secondary/30">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Download className="h-4 w-4 text-primary" /> Attached PDF
            </span>
            <a
              href={post.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Download PDF
            </a>
          </div>
          <iframe
            src={post.pdfUrl}
            className="w-full h-[500px]"
            title="PDF viewer"
          />
        </div>
      )}

      {/* Article body */}
      <article className="prose-sm max-w-none space-y-1">
        {renderMarkdown(post.content)}
      </article>
    </div>
  );
}
