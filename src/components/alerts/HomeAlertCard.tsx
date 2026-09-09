import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, MapPin, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { WeatherAlert, AlertContext } from '../../types/alert';
import { AlertBadge } from './AlertBadge';
import { AlertDetailsModal } from './AlertDetailsModal';
import './HomeAlertCard.css';

interface HomeAlertCardProps {
  alertContext: AlertContext | null;
  onRefreshAlerts?: () => void;
  isLoading?: boolean;
}

export const HomeAlertCard: React.FC<HomeAlertCardProps> = ({ alertContext, onRefreshAlerts, isLoading = false }) => {
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  if (!alertContext) return null;

  const { activeAlerts, location, isDemo, provider, retrievedAt } = alertContext;
  // Prefer any non-GREEN alert; fall back to the GREEN advisory if that's all there is
  const activeAlert = activeAlerts.find((a) => a.severity !== 'GREEN') || activeAlerts[0];
  const hasActiveWarning = activeAlert && activeAlert.severity !== 'GREEN';
  // GREEN advisory — show same structured display but with green styling
  const hasGreenAdvisory = activeAlert && activeAlert.severity === 'GREEN';

  const cardClass = hasActiveWarning
    ? `has-warning-${activeAlert.severity.toLowerCase()}`
    : hasGreenAdvisory
    ? 'has-warning-green'
    : 'no-warning-card';

  return (
    <div className={`home-alert-card glass-card ${cardClass}`}>
      {/* Top Source & Freshness Bar */}
      <div className="home-alert-header-bar">
        <div className="source-info-group">
          <ShieldAlert size={18} className={hasActiveWarning ? 'icon-amber' : 'icon-emerald'} />
          <span className="source-name">Source: <strong>{provider}</strong></span>
          {isDemo && <span className="demo-badge-tag">Demo Warning Data</span>}
        </div>

        <div className="header-right-actions">
          <span className="retrieved-time-text">Updated {retrievedAt || 'just now'}</span>
          {onRefreshAlerts && (
            <button
              type="button"
              className="btn-refresh-alerts-sm"
              onClick={onRefreshAlerts}
              disabled={isLoading}
              title="Fetch latest warning telemetry"
            >
              <RefreshCw size={12} className={isLoading ? 'spinning' : ''} />
              <span>Refresh Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE WARNING STATE (YELLOW / ORANGE / RED) */}
      {hasActiveWarning ? (
        <div className="active-warning-content">
          <div className="warning-top-row">
            <div className="warning-title-block">
              <span className="alert-section-kicker">⚠️ WEATHER ALERT</span>
              <h3 className="warning-main-title">{activeAlert.title}</h3>
            </div>
            <AlertBadge severity={activeAlert.severity} size="lg" />
          </div>

          <div className="warning-meta-pills">
            <span className="meta-pill">
              <MapPin size={13} className="icon-cyan" /> {activeAlert.location.name}, {activeAlert.location.district}
            </span>
            <span className="meta-pill">
              <Clock size={13} className="icon-amber" /> Valid: {activeAlert.validFrom} – {activeAlert.validUntil}
            </span>
          </div>

          <p className="warning-short-description">{activeAlert.description}</p>

          <div className="warning-action-block">
            <span className="action-kicker">Recommended Action:</span>
            <p className="action-text">{activeAlert.recommendedAction}</p>
          </div>

          <div className="warning-card-footer">
            <button
              type="button"
              className="btn btn-primary btn-view-details"
              onClick={() => setSelectedAlert(activeAlert)}
            >
              <span>View Alert Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      ) : hasGreenAdvisory ? (
        /* GREEN ADVISORY STATE — same structured layout, green styling */
        <div className="active-warning-content">
          <div className="warning-top-row">
            <div className="warning-title-block">
              <span className="alert-section-kicker green-kicker">🌤️ WEATHER STATUS</span>
              <h3 className="warning-main-title green-title">{activeAlert.title}</h3>
            </div>
            <AlertBadge severity="GREEN" size="lg" />
          </div>

          <div className="warning-meta-pills">
            <span className="meta-pill">
              <MapPin size={13} className="icon-cyan" /> {activeAlert.location.name}, {activeAlert.location.district}
            </span>
            <span className="meta-pill">
              <Clock size={13} className="icon-amber" /> Evaluated: {activeAlert.validFrom}
            </span>
          </div>

          <p className="warning-short-description green-description">{activeAlert.description}</p>

          <div className="warning-action-block green-action-block">
            <span className="action-kicker green-action-kicker">Conditions Summary:</span>
            <p className="action-text green-action-text">{activeAlert.recommendedAction}</p>
          </div>

          <div className="warning-card-footer">
            <button
              type="button"
              className="btn btn-green-details btn-view-details"
              onClick={() => setSelectedAlert(activeAlert)}
            >
              <ShieldCheck size={14} />
              <span>View Status Details</span>
            </button>
          </div>
        </div>

      ) : alertContext.hasFailed ? (
        /* ALERT API FAILURE STATE */
        <div className="no-warning-content" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="no-warning-icon-group">
            <AlertCircle size={32} className="icon-amber" />
            <div>
              <h3 className="no-warning-title" style={{ color: '#f87171' }}>Weather warning information is currently unavailable.</h3>
              <p className="no-warning-subtitle">
                Location: <strong>📍 {location.name}{location.admin1 ? `, ${location.admin1}` : ''}</strong>
              </p>
            </div>
          </div>
          <div className="no-warning-body-box">
            <p className="no-warning-message">
              We couldn't retrieve official warning telemetry from the alert provider at this moment. Please check again shortly.
            </p>
          </div>
        </div>

      ) : (
        /* BARE FALLBACK — no advisory data at all */
        <div className="no-warning-content">
          <div className="no-warning-icon-group">
            <ShieldCheck size={32} className="icon-emerald" />
            <div>
              <h3 className="no-warning-title">✓ No active weather warnings</h3>
              <p className="no-warning-subtitle">
                Location: <strong>📍 {location.name}{location.admin1 ? `, ${location.admin1}` : ''}</strong>
              </p>
            </div>
          </div>
          <div className="no-warning-body-box">
            <p className="no-warning-message">
              No active severe weather warning has been issued for {location.name}.
            </p>
            <div className="no-warning-disclaimer">
              <AlertCircle size={13} className="icon-cyan" />
              <span>Continue monitoring official meteorological advisories.</span>
            </div>
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </div>
  );
};
