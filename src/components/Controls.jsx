import React from 'react';
import { 
  Search, X, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, CheckCheck, Undo2, Building2, 
  ArrowUpDown, ArrowUpAZ, ArrowDownZA, User, Hash, Clock, DollarSign
} from 'lucide-react';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'];

export default function Controls({
  searchQuery,
  onSearchChange,
  tabFilter,
  onTabChange,
  honorificFilter,
  onHonorificFilterChange,
  companyLetterFilter,
  onCompanyLetterChange,
  sortBy,
  sortOrder,
  onSortChange,
  currentPage,
  pageSize,
  totalItems,
  filteredCount,
  onPageChange,
  onPageSizeChange,
  onBulkMarkSent,
  onBulkMarkPending
}) {
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(filteredCount / pageSize);

  const handleSortToggle = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle direction
      onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort with asc default
      onSortChange(newSortBy, 'asc');
    }
  };

  return (
    <div className="neo-card controls-bar">
      {/* Row 1: Search, Status Tabs & Honorific Filter */}
      <div className="controls-row-top">
        {/* Search */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="neo-input search-input"
            placeholder="Search company, name, title, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => onSearchChange('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="tabs-group">
          <button
            className={`tab-btn ${tabFilter === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            All
          </button>
          <button
            className={`tab-btn ${tabFilter === 'pending' ? 'active' : ''}`}
            onClick={() => onTabChange('pending')}
          >
            Pending
          </button>
          <button
            className={`tab-btn ${tabFilter === 'sent' ? 'active' : ''}`}
            onClick={() => onTabChange('sent')}
          >
            Sent
          </button>
        </div>

        {/* Honorific Filter */}
        <div className="tabs-group">
          <button
            className={`tab-btn ${honorificFilter === 'all' ? 'active' : ''}`}
            onClick={() => onHonorificFilterChange('all')}
          >
            All Honorifics
          </button>
          <button
            className={`tab-btn ${honorificFilter === 'Sir' ? 'active' : ''}`}
            onClick={() => onHonorificFilterChange('Sir')}
          >
            Sir 👨
          </button>
          <button
            className={`tab-btn ${honorificFilter === "Ma'am" ? 'active' : ''}`}
            onClick={() => onHonorificFilterChange("Ma'am")}
          >
            Ma'am 👩
          </button>
        </div>
      </div>

      {/* Row 2: Sort By Controls (Prominent Company Sorting!) */}
      <div className="sort-toolbar">
        <div className="sort-label-group">
          <ArrowUpDown size={15} style={{ color: 'var(--primary-accent)' }} />
          <span className="sort-title">Sort By:</span>
        </div>

        <div className="sort-buttons-group">
          {/* Sort by Company Button */}
          <button
            className={`neo-btn sort-btn ${sortBy === 'company' ? 'active neo-btn-primary' : ''}`}
            onClick={() => handleSortToggle('company')}
            title="Sort contacts alphabetically by Company name"
          >
            <Building2 size={15} />
            <span>Company Name</span>
            {sortBy === 'company' && (
              sortOrder === 'asc' ? <ArrowUpAZ size={15} /> : <ArrowDownZA size={15} />
            )}
          </button>

          {/* Sort by Net Worth / Financials Button */}
          <button
            className={`neo-btn sort-btn ${sortBy === 'net_worth' ? 'active neo-btn-primary' : ''}`}
            onClick={() => handleSortToggle('net_worth')}
            title="Sort contacts by Company Net Worth / Financials (ARR, Funding, Valuation)"
          >
            <DollarSign size={15} />
            <span>Net Worth (Financials)</span>
            {sortBy === 'net_worth' && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                {sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
              </span>
            )}
          </button>

          {/* Sort by Name Button */}
          <button
            className={`neo-btn sort-btn ${sortBy === 'name' ? 'active neo-btn-primary' : ''}`}
            onClick={() => handleSortToggle('name')}
            title="Sort contacts alphabetically by Contact name"
          >
            <User size={15} />
            <span>Contact Name</span>
            {sortBy === 'name' && (
              sortOrder === 'asc' ? <ArrowUpAZ size={15} /> : <ArrowDownZA size={15} />
            )}
          </button>

          {/* Sort by SNo / ID */}
          <button
            className={`neo-btn sort-btn ${sortBy === 'id' ? 'active neo-btn-primary' : ''}`}
            onClick={() => handleSortToggle('id')}
            title="Sort contacts by original list index (#1 - #1842)"
          >
            <Hash size={15} />
            <span>Original #</span>
            {sortBy === 'id' && (
              <span style={{ fontSize: '0.75rem' }}>{sortOrder === 'asc' ? '1→1842' : '1842→1'}</span>
            )}
          </button>

          {/* Sort by Status */}
          <button
            className={`neo-btn sort-btn ${sortBy === 'status' ? 'active neo-btn-primary' : ''}`}
            onClick={() => handleSortToggle('status')}
            title="Sort by sent status"
          >
            <Clock size={15} />
            <span>Status</span>
            {sortBy === 'status' && (
              <span style={{ fontSize: '0.75rem' }}>{sortOrder === 'asc' ? 'Pending 1st' : 'Sent 1st'}</span>
            )}
          </button>

          {/* Ascending / Descending Toggle */}
          <button
            className="neo-btn"
            style={{ padding: '7px 12px' }}
            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Toggle order: currently ${sortOrder === 'asc' ? 'Ascending (A→Z)' : 'Descending (Z→A)'}`}
          >
            {sortOrder === 'asc' ? <ArrowUpAZ size={16} /> : <ArrowDownZA size={16} />}
            <span>{sortOrder === 'asc' ? 'A → Z' : 'Z → A'}</span>
          </button>
        </div>
      </div>

      {/* Row 3: Alphabet Quick Jump Bar for Company Names */}
      <div className="alphabet-bar-wrapper">
        <span className="alphabet-label">Company Initial:</span>
        <div className="alphabet-bar">
          {ALPHABET.map(letter => (
            <button
              key={letter}
              className={`alphabet-btn ${companyLetterFilter === letter ? 'active' : ''}`}
              onClick={() => onCompanyLetterChange(letter)}
              title={letter === 'ALL' ? 'Show all companies' : `Filter companies starting with ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Row 4: Page Actions, Counter & Pagination */}
      <div className="controls-row-bottom">
        <div className="bulk-actions">
          <button 
            className="neo-btn"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={onBulkMarkSent}
            title="Mark all contacts on this page as Sent and save to JSON"
          >
            <CheckCheck size={15} color="var(--success)" />
            <span>Mark Page Sent</span>
          </button>

          <button 
            className="neo-btn"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={onBulkMarkPending}
            title="Mark all contacts on this page as Pending and save to JSON"
          >
            <Undo2 size={15} />
            <span>Mark Page Pending</span>
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 8 }}>
            Showing <strong>{filteredCount}</strong> of <strong>{totalItems}</strong> companies
            {companyLetterFilter !== 'ALL' && ` (Starts with "${companyLetterFilter}")`}
          </span>
        </div>

        {/* Pagination */}
        <div className="pagination-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Per page:</span>
            <select
              className="neo-input"
              style={{ padding: '6px 10px', fontSize: '0.825rem' }}
              value={pageSize}
              onChange={(e) => onPageSizeChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value="all">All</option>
            </select>
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="neo-btn"
                style={{ padding: '6px 10px' }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                className="neo-btn"
                style={{ padding: '6px 10px' }}
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="neo-btn"
                style={{ padding: '6px 10px' }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
              <button
                className="neo-btn"
                style={{ padding: '6px 10px' }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
