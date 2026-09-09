/**
 * Weather Alert Intelligence Service
 * Requirement 3: Separate service managing severe weather warnings and location matching.
 * Architecture: alertService -> alertProvider -> official / forecast-derived warning data.
 *
 * Provider priority:
 *   1. ImdAlertProvider  — when VITE_IMD_ALERT_API_URL is configured (official, India)
 *   2. ForecastAdvisoryProvider — global weather-derived advisory (default, any location)
 *
 * Cache: location-specific key (lat/lon) to prevent stale alerts from a previous city
 *        bleeding into a new selection.
 */

import { LocationSearchResult } from './weatherProviders/openMeteoProvider';
import { WeatherAlert, AlertContext, AlertSeverity } from '../types/alert';
import { AlertProvider } from './alertProviders/alertProviderInterface';
import { ForecastAdvisoryProvider } from './alertProviders/forecastAdvisoryProvider';
import { ImdAlertProvider } from './alertProviders/imdAlertProvider';
import { config } from '../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// Location-specific cache key — prevents stale alerts from a different city
// ─────────────────────────────────────────────────────────────────────────────
function getAlertCacheKey(location: LocationSearchResult): string {
  // Round to 3 decimal places (~111 m precision) as the cache identifier
  return `weathergpt_cached_alerts_${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider selection
// ─────────────────────────────────────────────────────────────────────────────
function getActiveAlertProvider(): AlertProvider {
  const providerType = (config.alertProvider || 'forecast').toLowerCase();
  if (providerType === 'imd' || config.imdAlertApiUrl) {
    return new ImdAlertProvider();
  }
  // Default: ForecastAdvisoryProvider — works globally, no hardcoded city list
  return new ForecastAdvisoryProvider();
}

let activeAlertContext: AlertContext | null = null;
const alertSubscribers: Array<(context: AlertContext) => void> = [];

export function getActiveAlertContext(): AlertContext | null {
  return activeAlertContext;
}

/**
 * Requirement 7 & 15: Retrieve & Prioritise Weather Warnings for Location
 *
 * Cache is location-specific so selecting Hyderabad never returns Chennai's cached alert.
 */
export async function getAlertsForLocation(location: LocationSearchResult): Promise<AlertContext> {
  const provider = getActiveAlertProvider();
  const cacheKey = getAlertCacheKey(location);

  try {
    const rawAlerts: WeatherAlert[] = await provider.getAlertsForLocation(location);

    // Prioritise by Severity (RED > ORANGE > YELLOW > GREEN) and status (ACTIVE > UPCOMING > EXPIRED)
    const sortedAlerts = sortAlertsByPriority(rawAlerts);

    const activeAlerts = sortedAlerts.filter((a) => a.severity !== 'GREEN' && (a.status === 'ACTIVE' || !a.status));
    const upcomingAlerts = sortedAlerts.filter((a) => a.status === 'UPCOMING');
    const expiredAlerts = sortedAlerts.filter((a) => a.status === 'EXPIRED');

    const highestSeverity: AlertSeverity = activeAlerts.length > 0
      ? activeAlerts[0].severity
      : (sortedAlerts[0]?.severity || 'GREEN');

    const alertContext: AlertContext = {
      location,
      activeAlerts: activeAlerts.length > 0 ? activeAlerts : (sortedAlerts.length > 0 ? sortedAlerts : []),
      upcomingAlerts,
      expiredAlerts,
      highestSeverity,
      provider: provider.name,
      isDemo: provider.isDemo,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Store in location-specific localStorage slot
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        alertContext,
        savedAt: new Date().toISOString()
      })
    );

    activeAlertContext = alertContext;
    notifySubscribers(alertContext);
    return alertContext;

  } catch (error) {
    console.warn('[AlertService] Failed to retrieve live alert telemetry. Checking location-specific cache...', error);

    // Read only THIS location's cache — never bleed another location's data
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        activeAlertContext = parsed.alertContext;
        return parsed.alertContext;
      } catch (e) {
        console.error('[AlertService] Failed to parse cached alerts:', e);
      }
    }

    // Safe fallback: GREEN with error indicator — no other location's data
    const errorContext: AlertContext = {
      location,
      activeAlerts: [],
      upcomingAlerts: [],
      expiredAlerts: [],
      highestSeverity: 'GREEN',
      provider: provider.name,
      isDemo: provider.isDemo,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasFailed: true,
      errorMessage: 'Weather warning information is currently unavailable for this location.'
    };
    activeAlertContext = errorContext;
    return errorContext;
  }
}

/**
 * Requirement 22: Refresh Alerts
 */
export async function refreshAlerts(location: LocationSearchResult): Promise<AlertContext> {
  return await getAlertsForLocation(location);
}

/**
 * Requirement 19: Alert Notification Preparation / Subscription
 */
export function subscribeToAlerts(location: LocationSearchResult, callback: (ctx: AlertContext) => void): () => void {
  alertSubscribers.push(callback);
  // Initial fire
  getAlertsForLocation(location).then(callback).catch(console.error);

  return () => {
    const idx = alertSubscribers.indexOf(callback);
    if (idx >= 0) alertSubscribers.splice(idx, 1);
  };
}

function notifySubscribers(context: AlertContext) {
  alertSubscribers.forEach((cb) => cb(context));
}

/**
 * Sort alerts by RED -> ORANGE -> YELLOW -> GREEN
 */
function sortAlertsByPriority(alerts: WeatherAlert[]): WeatherAlert[] {
  const severityRank: Record<AlertSeverity, number> = {
    RED: 1,
    ORANGE: 2,
    YELLOW: 3,
    GREEN: 4
  };

  return [...alerts].sort((a, b) => {
    const rankDiff = (severityRank[a.severity] || 5) - (severityRank[b.severity] || 5);
    if (rankDiff !== 0) return rankDiff;

    // Secondary sort: Active > Upcoming > Expired
    const statusRank: Record<string, number> = { ACTIVE: 1, UPCOMING: 2, EXPIRED: 3 };
    return (statusRank[a.status] || 2) - (statusRank[b.status] || 2);
  });
}

/**
 * Backward compatibility wrapper
 */
export async function fetchActiveAlerts(location?: LocationSearchResult): Promise<WeatherAlert[]> {
  const loc = location || {
    id: 1,
    name: 'Chennai',
    admin1: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata'
  };

  const context = await getAlertsForLocation(loc);
  return context.activeAlerts;
}
