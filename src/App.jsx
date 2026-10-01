import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import Controls from './components/Controls';
import ContactCard from './components/ContactCard';
import EmailPreviewModal from './components/EmailPreviewModal';
import contactsData from './data/contacts.json';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('outreach_theme') || 'light';
  });

  // Sent IDs & custom honorifics
  const [sentIds, setSentIds] = useState(() => {
    try {
      const local = localStorage.getItem('outreach_sent_ids');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [customHonorifics, setCustomHonorifics] = useState(() => {
    try {
      const local = localStorage.getItem('outreach_custom_honorifics');
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  });

  const [lastSaved, setLastSaved] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState('all'); // 'all' | 'pending' | 'sent'
  const [honorificFilter, setHonorificFilter] = useState('all'); // 'all' | 'Sir' | "Ma'am"
  const [companyLetterFilter, setCompanyLetterFilter] = useState('ALL'); // 'ALL' | 'A'..'Z' | '#'
  const [sortBy, setSortBy] = useState('company'); // Default sorted by company name!
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Modals & Feedback
  const [previewContact, setPreviewContact] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Set theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('outreach_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync from disk /api/status on initial mount
  const syncWithDisk = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.sentIds && Array.isArray(data.sentIds)) {
          setSentIds(data.sentIds);
          localStorage.setItem('outreach_sent_ids', JSON.stringify(data.sentIds));
        }
        if (data.customHonorifics && typeof data.customHonorifics === 'object') {
          setCustomHonorifics(data.customHonorifics);
          localStorage.setItem('outreach_custom_honorifics', JSON.stringify(data.customHonorifics));
        }
        if (data.lastUpdated) {
          setLastSaved(data.lastUpdated);
        }
        showToast('Synced with sent_status.json');
      }
    } catch (err) {
      console.warn('Local disk API not reachable (running static build), relying on localStorage.', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWithDisk();
  }, []);

  // Save to disk whenever sentIds or customHonorifics change
  const saveStatus = async (newSentIds, newHonorifics) => {
    const timestamp = new Date().toISOString();
    const payload = {
      sentIds: newSentIds,
      customHonorifics: newHonorifics,
      lastUpdated: timestamp
    };

    // Update localStorage
    localStorage.setItem('outreach_sent_ids', JSON.stringify(newSentIds));
    localStorage.setItem('outreach_custom_honorifics', JSON.stringify(newHonorifics));
    setLastSaved(timestamp);

    // Save to disk via Vite middleware API
    try {
      await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Could not post to /api/status:', err);
    }
  };

  // Toggle single sent status
  const handleToggleSent = (id) => {
    setSentIds(prev => {
      let updated;
      if (prev.includes(id)) {
        updated = prev.filter(x => x !== id);
        showToast(`Marked #${id} as Pending`);
      } else {
        updated = [...prev, id];
        showToast(`Marked #${id} as Sent (Saved to JSON)`);
      }
      saveStatus(updated, customHonorifics);
      return updated;
    });
  };

  // Change single honorific (Sir / Ma'am)
  const handleChangeHonorific = (id, newHonorific) => {
    setCustomHonorifics(prev => {
      const updated = { ...prev, [id]: newHonorific };
      saveStatus(sentIds, updated);
      showToast(`Updated #${id} salutation to "${newHonorific}"`);
      return updated;
    });
  };

  // Handle Sort Change
  const handleSortChange = (newSortBy, newOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    const label = newSortBy === 'company' ? 'Company Name' : 
                  newSortBy === 'net_worth' ? 'Net Worth / Financials' :
                  newSortBy === 'name' ? 'Contact Name' : newSortBy;
    showToast(`Sorted by ${label} (${newOrder.toUpperCase()})`);
  };

  // Sent set for O(1) lookups
  const sentSet = useMemo(() => new Set(sentIds), [sentIds]);

  // Parse financial string to numeric value for accurate sorting
  const parseFinancialValue = (valStr) => {
    if (!valStr || valStr === '-' || valStr === 'nan') return -1;
    const clean = String(valStr).replace(/,/g, '').trim();
    // Match number like 93.9, 1.2, 5, 481, etc.
    const match = clean.match(/(\d+(?:\.\d+)?)\s*([BMKbmk])?/);
    if (!match) return 0;
    let num = parseFloat(match[1]);
    const unit = (match[2] || '').toUpperCase();
    if (unit === 'B') num *= 1_000_000_000;
    else if (unit === 'M') num *= 1_000_000;
    else if (unit === 'K') num *= 1_000;
    return num;
  };

  // Filtered & Sorted contacts
  const filteredAndSortedContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Filtering
    const filtered = contactsData.filter(contact => {
      const isSent = sentSet.has(contact.id);
      const effectiveHonorific = customHonorifics[contact.id] || contact.honorific || (contact.gender === 'female' ? "Ma'am" : "Sir");

      // Tab filter
      if (tabFilter === 'pending' && isSent) return false;
      if (tabFilter === 'sent' && !isSent) return false;

      // Honorific filter
      if (honorificFilter !== 'all' && effectiveHonorific !== honorificFilter) return false;

      // Company initial letter filter
      if (companyLetterFilter !== 'ALL') {
        const firstLetter = (contact.company || '').trim().toUpperCase()[0];
        if (companyLetterFilter === '#') {
          if (firstLetter && firstLetter >= 'A' && firstLetter <= 'Z') return false;
        } else {
          if (firstLetter !== companyLetterFilter) return false;
        }
      }

      // Search query (matches company, name, title, email, net_worth)
      if (query) {
        const matchCompany = contact.company.toLowerCase().includes(query);
        const matchName = contact.name.toLowerCase().includes(query);
        const matchTitle = contact.title.toLowerCase().includes(query);
        const matchEmail = contact.email.toLowerCase().includes(query);
        const matchNetWorth = (contact.net_worth || '').toLowerCase().includes(query);
        if (!matchCompany && !matchName && !matchTitle && !matchEmail && !matchNetWorth) return false;
      }

      return true;
    });

    // 2. Sorting
    const sorted = [...filtered].sort((a, b) => {
      let comp = 0;
      if (sortBy === 'company') {
        const compA = (a.company || '').trim().toLowerCase();
        const compB = (b.company || '').trim().toLowerCase();
        comp = compA.localeCompare(compB);
        return sortOrder === 'asc' ? comp : -comp;
      } else if (sortBy === 'net_worth') {
        const valA = parseFinancialValue(a.net_worth);
        const valB = parseFinancialValue(b.net_worth);
        if (valA === -1 && valB === -1) {
          return a.id - b.id;
        }
        if (valA === -1) return 1; // unpopulated always at bottom
        if (valB === -1) return -1; // unpopulated always at bottom
        comp = valA - valB;
        return sortOrder === 'asc' ? comp : -comp;
      } else if (sortBy === 'name') {
        const nameA = (a.name || '').trim().toLowerCase();
        const nameB = (b.name || '').trim().toLowerCase();
        comp = nameA.localeCompare(nameB);
        return sortOrder === 'asc' ? comp : -comp;
      } else if (sortBy === 'status') {
        const sentA = sentSet.has(a.id) ? 1 : 0;
        const sentB = sentSet.has(b.id) ? 1 : 0;
        comp = sentA - sentB;
        return sortOrder === 'asc' ? comp : -comp;
      } else {
        // default by id
        comp = a.id - b.id;
        return sortOrder === 'asc' ? comp : -comp;
      }
    });

    return sorted;
  }, [contactsData, searchQuery, tabFilter, honorificFilter, companyLetterFilter, sortBy, sortOrder, sentSet, customHonorifics]);

  // Reset page when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tabFilter, honorificFilter, companyLetterFilter, sortBy, sortOrder, pageSize]);

  // Pagination slicing
  const paginatedContacts = useMemo(() => {
    if (pageSize === 'all') return filteredAndSortedContacts;
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedContacts.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedContacts, currentPage, pageSize]);

  const handleBulkMarkSent = () => {
    const pageIds = paginatedContacts.map(c => c.id);
    if (pageIds.length === 0) return;
    const updated = Array.from(new Set([...sentIds, ...pageIds]));
    setSentIds(updated);
    saveStatus(updated, customHonorifics);
    showToast(`Marked ${pageIds.length} contacts on this page as Sent (Saved to JSON)`);
  };

  const handleBulkMarkPending = () => {
    const pageIdsSet = new Set(paginatedContacts.map(c => c.id));
    if (pageIdsSet.size === 0) return;
    const updated = sentIds.filter(id => !pageIdsSet.has(id));
    setSentIds(updated);
    saveStatus(updated, customHonorifics);
    showToast(`Marked current page contacts as Pending (Saved to JSON)`);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataToExport = {
      description: "HR Outreach Sent Status Tracking",
      exportedAt: new Date().toISOString(),
      totalContacts: contactsData.length,
      sentCount: sentIds.length,
      pendingCount: contactsData.length - sentIds.length,
      sentIds: sentIds,
      customHonorifics: customHonorifics
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sent_status_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported sent_status.json');
  };

  // Import JSON
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && Array.isArray(parsed.sentIds)) {
          const mergedSent = Array.from(new Set([...sentIds, ...parsed.sentIds]));
          const mergedHonorifics = { ...customHonorifics, ...(parsed.customHonorifics || {}) };
          setSentIds(mergedSent);
          setCustomHonorifics(mergedHonorifics);
          saveStatus(mergedSent, mergedHonorifics);
          showToast(`Imported ${parsed.sentIds.length} sent records successfully!`);
        } else {
          showToast('Invalid JSON file format (must contain sentIds array).');
        }
      } catch (err) {
        showToast('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onExport={handleExportJSON}
        onImportClick={() => fileInputRef.current?.click()}
        onSyncDisk={syncWithDisk}
        isSyncing={isSyncing}
        lastSaved={lastSaved}
      />

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Statistics and Progress */}
      <StatsBar
        total={contactsData.length}
        sentCount={sentIds.length}
        pendingCount={contactsData.length - sentIds.length}
        onSelectTab={setTabFilter}
        currentTab={tabFilter}
      />

      {/* Controls with Search, Company Sort, and Alphabet Bar */}
      <Controls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        tabFilter={tabFilter}
        onTabChange={setTabFilter}
        honorificFilter={honorificFilter}
        onHonorificFilterChange={setHonorificFilter}
        companyLetterFilter={companyLetterFilter}
        onCompanyLetterChange={setCompanyLetterFilter}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={contactsData.length}
        filteredCount={filteredAndSortedContacts.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onBulkMarkSent={handleBulkMarkSent}
        onBulkMarkPending={handleBulkMarkPending}
      />

      {/* Contact Cards List */}
      <div className="contact-list">
        {paginatedContacts.length > 0 ? (
          paginatedContacts.map(contact => {
            const isSent = sentSet.has(contact.id);
            const honorific = customHonorifics[contact.id] || contact.honorific || (contact.gender === 'female' ? "Ma'am" : "Sir");

            return (
              <ContactCard
                key={contact.id}
                contact={contact}
                isSent={isSent}
                honorific={honorific}
                onToggleSent={handleToggleSent}
                onChangeHonorific={handleChangeHonorific}
                onPreviewEmail={(c, h) => setPreviewContact({ contact: c, honorific: h })}
              />
            );
          })
        ) : (
          <div className="neo-card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No matching companies found</p>
            <p style={{ fontSize: '0.875rem', marginTop: 6 }}>Try clearing your search query, adjusting the initial letter, or switching filters.</p>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {previewContact && (
        <EmailPreviewModal
          contact={previewContact.contact}
          honorific={customHonorifics[previewContact.contact.id] || previewContact.honorific}
          isSent={sentSet.has(previewContact.contact.id)}
          onClose={() => setPreviewContact(null)}
          onChangeHonorific={handleChangeHonorific}
          onToggleSent={handleToggleSent}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
