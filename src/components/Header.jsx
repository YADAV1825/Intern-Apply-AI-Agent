import React from 'react';
import { Mail, Sun, Moon, Download, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header({ 
  theme, 
  onToggleTheme, 
  onExport, 
  onImportClick, 
  onSyncDisk, 
  isSyncing,
  lastSaved
}) {
  return (
    <header className="header-wrapper">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-icon">
            <Mail size={26} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <h1>Outreach Diary & Todo</h1>
            <p>Direct Gmail Mailer for 1,842 HRs • Soft-UI Neomorphic Tracker</p>
          </div>
        </div>

        <div className="header-actions">
          {lastSaved && (
            <div className="neo-pill" title="Auto-saved to sent_status.json on disk" style={{ color: 'var(--success)' }}>
              <CheckCircle2 size={13} />
              <span>Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          <button 
            className="neo-btn" 
            onClick={onSyncDisk}
            title="Reload from sent_status.json on disk"
          >
            <RefreshCw size={15} className={isSyncing ? 'spin-anim' : ''} />
            <span>Sync</span>
          </button>

          <button 
            className="neo-btn" 
            onClick={onExport}
            title="Download sent status as JSON file"
          >
            <Download size={15} />
            <span>Export JSON</span>
          </button>

          <button 
            className="neo-btn" 
            onClick={onImportClick}
            title="Import sent status from JSON file"
          >
            <Upload size={15} />
            <span>Import JSON</span>
          </button>

          <button 
            className="neo-btn" 
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
