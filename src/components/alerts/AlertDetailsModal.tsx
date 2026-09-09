import React, { useState } from 'react';
import { X, ShieldAlert, MapPin, Clock, ExternalLink, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Database } from 'lucide-react';
import { WeatherAlert } from '../../types/alert';
import { AlertBadge } from './AlertBadge';
import './AlertDetailsModal.css';

interface AlertDetailsModalProps {
  alert: WeatherAlert;
  onClose: () => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ alert, onClose }) => {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-top-bar">
          <div className="modal-title-group">
            <ShieldAlert size={24} className="icon-amber" />
            <h3>Weather Alert Details</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Badge & Source Bar */}
        <div className="modal-badge-row">
          <AlertBadge severity={alert.severity} size="lg" />
          <div className="modal-source-pill">
            <Database size={13} className="icon-cyan" />
            <span>Source: <strong>{alert.source}</strong></span>
            {alert.isDemo && <span className="demo-tag">DEMO DATA</span>}
          </div>
        </div>

        {/* Warning Title */}
        <h2 className="modal-alert-title">{alert.title}</h2>

        {/* Key Info Grid */}
        <div className="modal-info-grid">
          <div className="info-cell">
            <span className="cell-label"><MapPin size={14} className="icon-cyan" /> Affected Location</span>
            <span className="cell-val">{alert.location.name}, {alert.location.district} ({alert.location.state})</span>
          </div>

          <div className="info-cell">
            <span className="cell-label"><Clock size={14} className="icon-amber" /> Validity Window</span>
            <span className="cell-val">{alert.validFrom} – {alert.validUntil}</span>
          </div>

          <div className="info-cell">
            <span className="cell-label"><AlertCircle size={14} className="icon-violet" /> Issued Time</span>
            <span className="cell-val">{alert.issuedAt}</span>
          </div>

          <div className="info-cell">
            <span className="cell-label">Weather Event</span>
            <span className="cell-val">{alert.eventTypeName || alert.eventType}</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="modal-section-box">
          <h4 className="section-heading">Expected Conditions & Meteorological Summary</h4>
          <p className="section-body-text">{alert.description}</p>
        </div>

        {/* Recommended Actions */}
        <div className="modal-section-box action-box">
          <h4 className="section-heading action-heading">Recommended Safety Precautions</h4>
          <p className="action-body-text">{alert.recommendedAction}</p>
        </div>

        {/* Expandable "Why am I getting this alert?" Section (Requirement 12) */}
        <div className="why-alert-wrapper">
          <button
            type="button"
            className="why-alert-trigger"
            onClick={() => setShowWhy(!showWhy)}
          >
            <HelpCircle size={16} className="icon-cyan" />
            <span>Why am I getting this alert?</span>
            {showWhy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showWhy && (
            <div className="why-alert-body glass-card">
              <p>
                {alert.whyExplanation ||
                  `You are seeing this alert because your selected location (${alert.location.name}, ${alert.location.district}) falls within the designated ${alert.severity} warning area for ${alert.eventTypeName || alert.eventType} valid between ${alert.validFrom} and ${alert.validUntil}.`}
              </p>
            </div>
          )}
        </div>

        {/* Footer & External Link */}
        <div className="modal-footer-bar">
          {alert.sourceUrl && (
            <a
              href={alert.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-official-source"
            >
              <ExternalLink size={14} />
              <span>Official Warning Source</span>
            </a>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
