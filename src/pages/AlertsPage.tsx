import React, { useEffect, useState } from 'react';
import { ShieldAlert, Filter, RefreshCw, MapPin, ShieldCheck, Clock, AlertTriangle, Database } from 'lucide-react';
import { LocationSearchInput } from '../components/weather/LocationSearchInput';
import { AlertBadge } from '../components/alerts/AlertBadge';
import { AlertDetailsModal } from '../components/alerts/AlertDetailsModal';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { getAlertsForLocation, refreshAlerts } from '../services/alertService';
import { fetchWeatherForCurrentLocation } from '../services/weatherService';
import { LocationSearchResult } from '../services/weatherProviders/openMeteoProvider';
import { WeatherAlert, AlertContext, AlertSeverity } from '../types/alert';
import './AlertsPage.css';

export const AlertsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const [activeLoc, setActiveLoc] = useState<LocationSearchResult>({
    id: 1,
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata'
  });

  const [alertContext, setAlertContext] = useState<AlertContext | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'UPCOMING' | 'EXPIRED'>('ACTIVE');
  const [selectedAlertModal, setSelectedAlertModal] = useState<WeatherAlert | null>(null);

  const loadAlertDashboard = async (location: LocationSearchResult) => {
    setLoading(true);
    setError(null);
    try {
      const ctx = await getAlertsForLocation(location);
      setAlertContext(ctx);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch warning telemetry for selected location.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertDashboard(activeLoc);
  }, [activeLoc]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    setActiveLoc(loc);
  };

  const handleUseMyLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWeatherForCurrentLocation();
      setActiveLoc(res.location);
    } catch (err: any) {
      setError(err?.message || 'Location access was denied. Please search for your city.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const ctx = await refreshAlerts(activeLoc);
      setAlertContext(ctx);
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setRefreshNotice(`Alerts updated just now (${timeNow}) for ${activeLoc.name}`);
      setTimeout(() => setRefreshNotice(null), 4000);
    } catch (err: any) {
      setError('Failed to refresh alert feeds.');
    } finally {
      setLoading(false);
    }
  };

  // Filter alerts based on active status tab & severity filter
  const getDisplayedAlerts = (): WeatherAlert[] => {
    if (!alertContext) return [];

    let targetList: WeatherAlert[] = [];
    if (statusTab === 'ACTIVE') targetList = alertContext.activeAlerts;
    else if (statusTab === 'UPCOMING') targetList = alertContext.upcomingAlerts;
    else if (statusTab === 'EXPIRED') targetList = alertContext.expiredAlerts;

    if (severityFilter === 'ALL') return targetList;
    return targetList.filter((a) => a.severity === severityFilter);
  };

  const displayedAlerts = getDisplayedAlerts();

  return (
    <div className="alerts-page-container">
      {/* Header & Location Controls */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert size={28} className="icon-amber" /> Severe Weather Warning & Alert Dashboard
          </h1>
          <p className="page-subtitle">
            IMD official warning feeds, location-matched advisories, and emergency action protocols.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary btn-refresh-alerts-page"
            onClick={handleRefreshClick}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Location Search Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <LocationSearchInput
          onSelectLocation={handleSelectLocation}
          onUseMyLocation={handleUseMyLocation}
          isLoading={loading}
        />
      </div>

      {/* Refresh Notice Banner */}
      {refreshNotice && (
        <div className="alert-refresh-success-banner">
          <ShieldCheck size={16} />
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* Status Bar: Selected Location & Data Provider */}
      {alertContext && (
        <div className="alerts-status-bar glass-card">
          <div className="status-location-chip">
            <MapPin size={15} className="icon-cyan" />
            <span>Location: <strong>📍 {activeLoc.name}{activeLoc.admin1 ? `, ${activeLoc.admin1}` : ''}</strong></span>
          </div>

          <div className="status-provider-chip">
            <Database size={14} className="icon-cyan" />
            <span>Data Source: <strong>{alertContext.provider}</strong></span>
            {alertContext.isDemo && <span className="demo-pill-badge">DEMO DATA</span>}
          </div>
        </div>
      )}

      {/* Filter Toolbar: Tabs & Severities */}
      <div className="alerts-toolbar glass-card">
        {/* Status Tabs */}
        <div className="tabs-group">
          {(['ACTIVE', 'UPCOMING', 'EXPIRED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`tab-btn ${statusTab === st ? 'active' : ''}`}
              onClick={() => setStatusTab(st)}
            >
              {st === 'ACTIVE' && 'Active Alerts'}
              {st === 'UPCOMING' && 'Upcoming Alerts'}
              {st === 'EXPIRED' && 'Expired History'}
            </button>
          ))}
        </div>

        {/* Severity Filters */}
        <div className="severity-filter-group">
          <Filter size={14} className="icon-dim" />
          <span className="filter-label-sm">Severity:</span>
          {['ALL', 'RED', 'ORANGE', 'YELLOW', 'GREEN'].map((sev) => (
            <button
              key={sev}
              type="button"
              className={`severity-filter-btn ${severityFilter === sev ? 'active' : ''}`}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingState message={`Checking severe weather warning polygons for ${activeLoc.name}...`} />}

      {/* Error State */}
      {error && <ErrorState title="Alert Feed Error" message={error} onRetry={() => loadAlertDashboard(activeLoc)} />}

      {/* Main Alert List */}
      {!loading && alertContext && (
        <div className="alerts-dashboard-list">
          {displayedAlerts.length === 0 ? (
            <div className="glass-card empty-alerts-dashboard">
              <ShieldCheck size={40} className="icon-emerald" />
              <h3>No {statusTab.toLowerCase()} warnings found for {severityFilter} severity</h3>
              <p>No active severe weather warnings match your selected location ({activeLoc.name}) and filter settings.</p>
              <span className="continue-note">Continue monitoring official updates for changes.</span>
            </div>
          ) : (
            displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-item-card glass-card alert-border-${alert.severity.toLowerCase()}`}
                onClick={() => setSelectedAlertModal(alert)}
              >
                <div className="alert-item-top">
                  <div className="alert-item-title-block">
                    <AlertBadge severity={alert.severity} size="md" />
                    <h3 className="alert-item-title">{alert.title}</h3>
                  </div>
                  <span className="alert-status-tag">{alert.status}</span>
                </div>

                <div className="alert-item-meta">
                  <span className="meta-item"><MapPin size={13} /> {alert.location.name}, {alert.location.district}</span>
                  <span className="meta-item"><Clock size={13} /> Valid: {alert.validFrom} – {alert.validUntil}</span>
                  <span className="meta-item"><Database size={13} /> Source: {alert.source}</span>
                </div>

                <p className="alert-item-desc">{alert.description}</p>

                <div className="alert-item-action-preview">
                  <span className="action-label">Action Protocol:</span>
                  <span className="action-text-preview">{alert.recommendedAction}</span>
                </div>

                <div className="alert-item-footer">
                  <button type="button" className="btn-link-details">
                    <span>Click for Full Alert Details & Rationale →</span>
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Architecture Transparency Card */}
          <div className="glass-card integration-card">
            <div className="section-header">
              <h4 className="section-title">
                <AlertTriangle size={18} className="icon-amber" /> Official Warning Provider Architecture
              </h4>
              <span className="badge badge-ai">
                {alertContext.isDemo ? 'Demo Provider Mode' : 'Live IMD Provider Active'}
              </span>
            </div>
            <p className="integration-text">
              Active alert provider is `ALERT_PROVIDER=${alertContext.provider || 'demo'}`. Official IMD / NDMA CAP warning feeds map onto `ImdAlertProvider` in `src/services/alertProviders/imdAlertProvider.ts`.
            </p>
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {selectedAlertModal && (
        <AlertDetailsModal
          alert={selectedAlertModal}
          onClose={() => setSelectedAlertModal(null)}
        />
      )}
    </div>
  );
};

