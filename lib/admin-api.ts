const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/web';

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    credentials: 'include',
    headers:
      options?.body instanceof FormData
        ? { ...options?.headers }
        : { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminFetch<{ admin: { id: string; email: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => adminFetch<{ ok: boolean }>('/logout', { method: 'POST' }),
  dashboard: () =>
    adminFetch<{
      users: number;
      documents: number;
      downloads: number;
      todayDownloads: number;
    }>('/dashboard'),
  users: (source?: string) =>
    adminFetch<
      {
        id: string;
        mobile: string;
        operator: string;
        subscriptionStatus: string;
        registrationSource: string;
        subscribedAt?: string;
        _count?: { downloadLogs: number };
      }[]
    >(`/users${source && source !== 'ALL' ? `?source=${source}` : ''}`),
  downloads: () =>
    adminFetch<
      {
        id: string;
        createdAt: string;
        user: { mobile: string; operator: string };
        document: { title: string; slug: string };
        documentFile: { medium: string; fileName: string };
      }[]
    >('/downloads'),
  facets: () =>
    adminFetch<{ id: string; label: string; facetKey: string; slug: string; sortOrder: number }[]>('/facets'),
  getFacet: (id: string) =>
    adminFetch<{ id: string; label: string; facetKey: string; slug: string; sortOrder: number }>(`/facets/${id}`),
  createFacet: (data: {
    facetKey: string;
    label: string;
    slug: string;
    sortOrder?: number;
  }) =>
    adminFetch<{ id: string }>('/facets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFacet: (
    id: string,
    data: Partial<{
      label: string;
      slug: string;
      sortOrder: number;
    }>,
  ) =>
    adminFetch(`/facets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteFacet: (id: string) =>
    adminFetch(`/facets/${id}`, { method: 'DELETE' }),
  categories: (rootType?: string) =>
    adminFetch<
      {
        id: string;
        name: string;
        rootType: string;
        slug: string;
        parentId: string | null;
        sortOrder: number;
        allowedFilters: string[];
      }[]
    >(`/categories${rootType ? `?rootType=${rootType}` : ''}`),
  documents: (page = 1) =>
    adminFetch<{
      documents: {
        id: string;
        title: string;
        slug: string;
        status: string;
        category?: { name: string };
        _count?: { downloadLogs: number };
      }[];
    }>(`/documents?page=${page}`),
  getDocument: (id: string) =>
    adminFetch<{
      id: string;
      title: string;
      status: string;
      files: { id: string; medium: string; fileName: string }[];
    }>(`/documents/${id}`),
  createDocument: (data: object) =>
    adminFetch<{ id: string }>('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDocument: (id: string, data: object) =>
    adminFetch(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteDocument: (id: string) =>
    adminFetch(`/documents/${id}`, { method: 'DELETE' }),
  uploadFile: (
    documentId: string,
    medium: string,
    file: File,
    onProgress?: (percent: number) => void,
  ) => {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append('file', file);
      form.append('medium', medium);

      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.message || `Request failed: ${xhr.status}`));
          } catch {
            reject(new Error(`Request failed: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

      xhr.open('POST', `${API_URL}/admin/documents/${documentId}/files`);
      xhr.withCredentials = true;
      xhr.send(form);
    });
  },
  deleteFile: (fileId: string) =>
    adminFetch(`/files/${fileId}`, { method: 'DELETE' }),
  createCategory: (data: {
    name: string;
    slug: string;
    rootType: string;
    parentId?: string;
    sortOrder?: number;
    allowedFilters?: string[];
  }) =>
    adminFetch<{ id: string; name: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      parentId: string | null;
      sortOrder: number;
      allowedFilters: string[];
    }>,
  ) =>
    adminFetch(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    adminFetch(`/categories/${id}`, { method: 'DELETE' }),
  getLoginWarning: () =>
    adminFetch<{ showWarning: boolean }>('/settings/login-warning'),
  toggleLoginWarning: (showWarning: boolean) =>
    adminFetch<{ success: boolean }>('/settings/login-warning', {
      method: 'POST',
      body: JSON.stringify({ showWarning }),
    }),
};
