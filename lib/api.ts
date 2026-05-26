export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/web';

export type RootCategory = {
  id: string;
  name: string;
  slug: string;
  rootType: string;
  description?: string | null;
};

export type FacetValue = {
  id: string;
  facetKey: string;
  label: string;
  slug: string;
};

export type DocumentFile = {
  id: string;
  medium: string;
  fileName: string;
  sizeBytes: number;
};

export type Document = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  publishedAt?: string | null;
  category?: { name: string; slug: string; rootType: string };
  facets?: { facetValue: FacetValue }[];
  files?: DocumentFile[];
};

async function fetchApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRoots: () => fetchApi<RootCategory[]>('/categories/roots', { next: { revalidate: 0 } }),
  getLatest: (limit = 10) =>
    fetchApi<Document[]>(`/documents/latest?limit=${limit}`),
  getCategoryPage: (path: string, page = 1) =>
    fetchApi<{
      breadcrumbs: RootCategory[];
      facetOptions: { key: string; options: FacetValue[] }[];
      documents: Document[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/categories/page?path=${encodeURIComponent(path)}&page=${page}`),
  searchDocuments: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.set(k, String(v));
    });
    return fetchApi<{
      documents: Document[];
      pagination: { page: number; total: number; totalPages: number };
    }>(`/documents/search?${q}`);
  },
  getDocument: (slug: string) =>
    fetchApi<{ document: Document; related: Document[] }>(`/documents/${slug}`),
  getMe: () =>
    fetchApi<{
      id: string;
      mobile: string;
      subscriptionStatus: string;
      operator: string;
    }>('/auth/me'),
  requestOtp: (mobile: string, operator?: 'DIALOG' | 'MOBITEL') =>
    fetchApi<{ referenceNo: string; devMode?: boolean }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify(operator ? { mobile, operator } : { mobile }),
    }),
  verifyOtp: (referenceNo: string, otp: string, name?: string) =>
    fetchApi<{ user: { id: string; mobile: string; name?: string | null; subscriptionStatus: string } }>(
      '/auth/otp/verify',
      { method: 'POST', body: JSON.stringify({ referenceNo, otp, name }) },
    ),
  logout: () => fetchApi('/auth/logout', { method: 'POST' }),
  previewUrl: (fileId: string) => `${API_URL}/files/${fileId}/preview`,
  downloadUrl: (fileId: string) => `${API_URL}/files/${fileId}/download`,
};

export const ROOT_NAV = [
  { slug: 'past-papers', name: 'Past Papers', icon: 'FileText' },
  { slug: 'model-papers', name: 'Model Papers', icon: 'FileEdit' },
  { slug: 'term-test-papers', name: 'Term Test Papers', icon: 'ClipboardList' },
  { slug: 'syllabus', name: 'Syllabus', icon: 'Book' },
  { slug: 'teacher-guides', name: "Teacher's Guides", icon: 'GraduationCap' },
  { slug: 'text-books', name: 'Text Books', icon: 'BookOpen' },
  { slug: 'gazette', name: 'Government Gazette', icon: 'Newspaper' },
];

export const ROOT_TYPE_ICONS: Record<string, string> = {
  PAST_PAPERS: 'FileText',
  MODEL_PAPERS: 'FileEdit',
  TERM_TEST: 'ClipboardList',
  SYLLABUS: 'Book',
  TEACHERS_GUIDE: 'GraduationCap',
  TEXT_BOOKS: 'BookOpen',
  GAZETTE: 'Newspaper',
};

export const MEDIUM_LABELS: Record<string, string> = {
  SINHALA: 'Sinhala',
  TAMIL: 'Tamil',
  ENGLISH: 'English',
};
