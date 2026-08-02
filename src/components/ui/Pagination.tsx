import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build page number array with ellipsis
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/40">
      {/* Item count info */}
      <span className="text-xs text-slate-400 font-medium">
        Showing <span className="text-slate-200 font-semibold">{startItem}–{endItem}</span> of{' '}
        <span className="text-slate-200 font-semibold">{totalItems}</span> entries
      </span>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-slate-500 text-xs select-none">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all border ${
                currentPage === page
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-transparent hover:border-slate-700'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
            text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
