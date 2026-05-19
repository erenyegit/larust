export type FilterableSubmission = {
  status: string;
  priority: string;
  rating: number | null;
  submittedAt: string;
  searchableText: string | null;
  walrusBlobId: string;
};

export function filterSubmissions<T extends FilterableSubmission>(
  items: T[],
  filters: {
    status: string;
    priority: string;
    minRating: string;
    dateWindow: string;
    keyword: string;
    nowMs: number;
  },
) : T[] {
  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.priority !== "all" && item.priority !== filters.priority) return false;
    if (filters.minRating !== "all" && (item.rating ?? 0) < Number(filters.minRating)) return false;
    if (filters.dateWindow !== "all") {
      const sinceMs = filters.nowMs - Number(filters.dateWindow) * 24 * 60 * 60 * 1000;
      if (new Date(item.submittedAt).getTime() < sinceMs) return false;
    }
    if (filters.keyword) {
      const text = `${item.searchableText ?? ""} ${item.walrusBlobId}`.toLowerCase();
      if (!text.includes(filters.keyword.toLowerCase())) return false;
    }
    return true;
  });
}
