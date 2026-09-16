import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  width?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  pageSizeDefault?: number;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  extraFilters?: React.ReactNode;
  actions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
}

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSizeDefault = 10,
  searchPlaceholder = 'Search records...',
  onSearchChange,
  searchValue,
  extraFilters,
  actions,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search criteria or filters.',
  onRowClick,
}: AdminDataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeDefault);

  const totalRecords = data.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Reset to page 1 if current page becomes invalid after filter changes
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedData = data.slice(startIndex, endIndex);

  return (
    <div className="admin-table-container">
      {/* Top Filter & Search Toolbar */}
      {(onSearchChange || extraFilters || actions) && (
        <div className="admin-table-toolbar">
          <div className="toolbar-left">
            {onSearchChange && (
              <div className="admin-search-input">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue || ''}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="admin-input compact"
                />
              </div>
            )}
            {extraFilters}
          </div>
          {actions && <div className="toolbar-right">{actions}</div>}
        </div>
      )}

      {/* Main Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table-cell">
                  <div className="admin-empty-wrap">
                    <Inbox size={32} />
                    <h4>{emptyTitle}</h4>
                    <p>{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={col.className}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : col.accessor
                        ? String((item as Record<string, unknown>)[col.accessor as string] ?? '—')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalRecords > 0 && (
        <div className="admin-pagination">
          <div className="pagination-info">
            Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{' '}
            <strong>{totalRecords}</strong> entries
          </div>

          <div className="pagination-controls">
            <div className="page-size-selector">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="admin-select compact"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="page-buttons">
              <button
                type="button"
                className="btn-page"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="btn-page"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
