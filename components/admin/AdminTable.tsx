'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
  }[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export default function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  pageSize = 8,
  onRowClick,
  actions,
  emptyMessage = 'No data found',
}: AdminTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let items = [...data];
    if (search.trim() && searchKeys.length > 0) {
      const q = search.toLowerCase();
      items = items.filter((item) =>
        searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      items.sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return items;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      {searchKeys.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border-glass)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 transition-all"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border-glass)] bg-[var(--color-surface)]/30">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-border-glass)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] ${
                    col.sortable ? 'cursor-pointer hover:text-[var(--color-ink)] select-none' : ''
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-[var(--color-accent)]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-muted)] text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-5 py-12 text-center text-sm text-[var(--color-ink-muted)]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((item, i) => (
                <tr
                  key={item.id ?? i}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-[var(--color-border-glass)] last:border-0 transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-[var(--color-accent)]/5' : 'hover:bg-[var(--color-surface)]/50'
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4 text-sm text-[var(--color-ink)]">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-ink-muted)]">
          <span className="text-xs font-mono">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg hover:bg-[var(--color-surface)]/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-[var(--color-ink)]">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg hover:bg-[var(--color-surface)]/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
