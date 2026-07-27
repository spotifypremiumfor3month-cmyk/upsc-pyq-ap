import { useState, useEffect } from 'react';

export type SubjectInfo = {
  subject: string;
  slug: string;
  count: number;
  yearRange: string;
  years: number[];
};

export type QuestionOption = {
  a?: string;
  b?: string;
  c?: string;
  d?: string;
  [key: string]: string | undefined;
};

export type Question = {
  id: string;
  subject: string;
  category?: string;
  year: number;
  questionNumber: number;
  question: string;
  options: QuestionOption;
  answer: string;
  explanation: string;
};

export const SUBJECT_ORDER = [
  'current_affairs',
  'ancient_history',
  'medieval_history',
  'modern_history',
  'indian_geography',
  'world_geography',
  'indian_polity',
  'indian_economy',
  'general_science',
];

export type SubjectCategoryGroup = {
  category: string;
  slugs: string[];
};

export const SUBJECT_CATEGORIES: SubjectCategoryGroup[] = [
  {
    category: 'Current Affairs',
    slugs: ['current_affairs'],
  },
  {
    category: 'History',
    slugs: ['ancient_history', 'medieval_history', 'modern_history'],
  },
  {
    category: 'Geography',
    slugs: ['indian_geography', 'world_geography'],
  },
  {
    category: 'Polity & Governance',
    slugs: ['indian_polity'],
  },
  {
    category: 'Economy',
    slugs: ['indian_economy'],
  },
  {
    category: 'General Science',
    slugs: ['general_science'],
  },
];

const getBaseUrl = () => import.meta.env.BASE_URL.replace(/\/$/, '');

export function useIndexData() {
  const [data, setData] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${getBaseUrl()}/data/index.json`);
        if (!res.ok) throw new Error('Failed to load index data');
        const json: SubjectInfo[] = await res.json();
        if (mounted) {
          const sorted = json.sort((a, b) => {
            const indexA = SUBJECT_ORDER.indexOf(a.slug);
            const indexB = SUBJECT_ORDER.indexOf(b.slug);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
          });
          setData(sorted);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}

export function useSubjectData(slug: string) {
  const [data, setData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`${getBaseUrl()}/data/${slug}.json`);
        if (!res.ok) throw new Error(`Failed to load ${slug} data`);
        const json = await res.json();
        if (mounted) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [slug]);

  return { data, loading, error };
}
