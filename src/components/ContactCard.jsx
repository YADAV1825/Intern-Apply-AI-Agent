import React, { useState } from 'react';
import { Mail, Check, Copy, ExternalLink, Eye, Building2, Briefcase } from 'lucide-react';
import { generateEmailContent, buildGmailComposeUrl } from '../utils/mailer';

export default function ContactCard({
  contact,
  isSent,
  honorific,
  onToggleSent,
  onChangeHonorific,
  onPreviewEmail
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendGmail = (e) => {
    e.stopPropagation();
    const { subject, body } = generateEmailContent(contact, honorific);
    const gmailUrl = buildGmailComposeUrl(contact.email, subject, body);
    
    // Open Gmail composer in a new tab
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    // Auto-mark as sent if not already sent
    if (!isSent) {
      onToggleSent(contact.id);
    }
  };

  // Extract 2 initials from company name for avatar
  const getCompanyInitials = (comp) => {
    if (!comp) return 'CO';
    const words = comp.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return (comp.slice(0, 2)).toUpperCase();
  };

  const initials = getCompanyInitials(contact.company);

  return (
    <div className={`neo-card contact-card ${isSent ? 'sent-card' : ''}`}>
      <div className="contact-left">
        {/* Single Save / Sent Checkbox */}
        <label 
          className="neo-checkbox-label"
          title={isSent ? "Marked as Sent (Click to unmark)" : "Mark as Sent & Save to JSON"}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="neo-checkbox-input"
            checked={isSent}
            onChange={() => onToggleSent(contact.id)}
          />
          <div className="neo-checkbox-box" title={isSent ? "Sent" : "Mark as Sent"}>
            {isSent && <Check size={14} strokeWidth={3} />}
          </div>
        </label>

        {/* Company Avatar with Initials */}
        <div className="company-avatar" title={contact.company}>
          <span>{initials}</span>
        </div>

        {/* Contact & Company Details */}
        <div className="contact-info">
          <div className="contact-name-row">
            {/* Prominent Company Badge / Name */}
            <span className="contact-company-badge">
              <Building2 size={14} style={{ color: 'var(--primary-accent)' }} />
              <strong>{contact.company}</strong>
            </span>

            {/* Financial Metric Column (Beside Company) */}
            <span 
              className={`company-networth-tag ${contact.net_worth && contact.net_worth !== '-' ? 'has-val' : 'is-dash'}`}
              title={contact.net_worth && contact.net_worth !== '-' ? `Company Financials: ${contact.net_worth}` : "Financial data: -"}
            >
              {contact.net_worth && contact.net_worth !== '-' ? (
                <>
                  <span style={{ fontSize: '0.85rem' }}>💰</span>
                  <span>{contact.net_worth}</span>
                </>
              ) : (
                <span className="networth-dash">-</span>
              )}
            </span>

            <span className="contact-index">#{contact.id}</span>

            {isSent && (
              <span className="neo-pill" style={{ color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                ✓ Sent
              </span>
            )}
          </div>

          <div className="contact-person-row">
            <span className="contact-name">{contact.name}</span>

            {/* Honorific Switcher */}
            <div className="honorific-switcher" title="Toggle Salutation (Sir / Ma'am)">
              <button
                className={`honorific-btn ${honorific === 'Sir' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeHonorific(contact.id, 'Sir');
                }}
              >
                Sir 👨
              </button>
              <button
                className={`honorific-btn female ${honorific === "Ma'am" ? 'active female' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChangeHonorific(contact.id, "Ma'am");
                }}
              >
                Ma'am 👩
              </button>
            </div>

            <span className="contact-title">
              <Briefcase size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              {contact.title}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Email Address */}
      <div className="contact-email-wrapper">
        <span className="contact-email">{contact.email}</span>
        <button
          className="copy-btn"
          onClick={handleCopyEmail}
          title={copiedEmail ? "Copied!" : "Copy email address"}
        >
          {copiedEmail ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
        </button>
      </div>

      {/* Right: Actions */}
      <div className="contact-actions">
        <button
          className="neo-btn"
          onClick={() => onPreviewEmail(contact, honorific)}
          title="Preview personalized email letter"
        >
          <Eye size={15} />
          <span>Preview</span>
        </button>

        <button
          className="neo-btn neo-btn-primary"
          onClick={handleSendGmail}
          title="Open draft in Gmail Web and mark as sent"
        >
          <Mail size={15} />
          <span>Send via Gmail</span>
          <ExternalLink size={13} style={{ opacity: 0.8 }} />
        </button>
      </div>
    </div>
  );
}
