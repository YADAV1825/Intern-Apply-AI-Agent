import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Send, Building2, User } from 'lucide-react';
import { generateEmailContent, buildGmailComposeUrl } from '../utils/mailer';

export default function EmailPreviewModal({
  contact,
  honorific,
  isSent,
  onClose,
  onChangeHonorific,
  onToggleSent
}) {
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!contact) return null;

  const { subject, body } = generateEmailContent(contact, honorific);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleSendGmail = () => {
    const url = buildGmailComposeUrl(contact.email, subject, body);
    window.open(url, '_blank', 'noopener,noreferrer');
    if (!isSent) {
      onToggleSent(contact.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Email Letter Preview</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Personalized for {contact.name} at {contact.company}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Recipient Details & Honorific Quick-Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
              <User size={16} color="var(--primary-accent)" />
              <strong>{contact.name}</strong>
              <span style={{ color: 'var(--text-muted)' }}>({contact.email})</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 600 }}>Salutation:</span>
              <div className="honorific-switcher">
                <button
                  className={`honorific-btn ${honorific === 'Sir' ? 'active' : ''}`}
                  onClick={() => onChangeHonorific(contact.id, 'Sir')}
                >
                  Sir 👨
                </button>
                <button
                  className={`honorific-btn female ${honorific === "Ma'am" ? 'active female' : ''}`}
                  onClick={() => onChangeHonorific(contact.id, "Ma'am")}
                >
                  Ma'am 👩
                </button>
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div className="preview-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="preview-label">Subject Line</span>
              <button className="neo-btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleCopySubject}>
                {copiedSubject ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
              </button>
            </div>
            <div className="preview-box" style={{ padding: '8px 12px', minHeight: 'unset' }}>
              {subject}
            </div>
          </div>

          {/* Body Field */}
          <div className="preview-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="preview-label">Email Body (Markdown / Plaintext)</span>
              <button className="neo-btn" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleCopyBody}>
                {copiedBody ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                <span>{copiedBody ? 'Copied' : 'Copy Body'}</span>
              </button>
            </div>
            <div className="preview-box">
              {body}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className={`neo-btn ${isSent ? 'neo-pressed' : ''}`}
            onClick={() => onToggleSent(contact.id)}
          >
            {isSent ? <Check size={15} color="var(--success)" /> : null}
            <span>{isSent ? 'Marked as Sent' : 'Mark as Sent'}</span>
          </button>

          <button className="neo-btn" onClick={onClose}>
            Close
          </button>

          <button className="neo-btn neo-btn-primary" onClick={handleSendGmail}>
            <Send size={15} />
            <span>Open in Gmail & Mark Sent</span>
            <ExternalLink size={13} style={{ opacity: 0.8 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
