import React from 'react';
import { Users, Send, Clock, Award } from 'lucide-react';

export default function StatsBar({ total, sentCount, pendingCount, onSelectTab, currentTab }) {
  const percentage = total > 0 ? ((sentCount / total) * 100).toFixed(1) : 0;

  return (
    <>
      <div className="stats-grid">
        <div 
          className={`neo-card stat-card ${currentTab === 'all' ? 'neo-pressed' : ''}`}
          onClick={() => onSelectTab('all')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ color: 'var(--primary-accent)' }}>
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total Contacts</span>
          </div>
        </div>

        <div 
          className={`neo-card stat-card ${currentTab === 'sent' ? 'neo-pressed' : ''}`}
          onClick={() => onSelectTab('sent')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ color: 'var(--success)' }}>
            <Send size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{sentCount}</span>
            <span className="stat-label">Emails Sent</span>
          </div>
        </div>

        <div 
          className={`neo-card stat-card ${currentTab === 'pending' ? 'neo-pressed' : ''}`}
          onClick={() => onSelectTab('pending')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon-wrapper" style={{ color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="neo-card stat-card">
          <div className="stat-icon-wrapper" style={{ color: '#8b5cf6' }}>
            <Award size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{percentage}%</span>
            <span className="stat-label">Completion</span>
          </div>
        </div>
      </div>

      <div className="neo-card progress-container">
        <div className="progress-header">
          <span>Overall Outreach Progress</span>
          <span><strong>{sentCount}</strong> of <strong>{total}</strong> sent ({percentage}%)</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${Math.max(percentage, sentCount > 0 ? 1 : 0)}%` }} 
          />
        </div>
      </div>
    </>
  );
}
