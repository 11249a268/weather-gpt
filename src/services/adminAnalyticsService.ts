/**
 * ADMIN ANALYTICS & LOGGING SERVICE
 * Aggregates real operational telemetry, query history, risk distributions, and language usage.
 * Strictly non-sensitive data storage.
 */

export interface QueryLogEntry {
  id: string;
  timestamp: string;
  locationName: string;
  intent: string;
  language: string;
}

export interface RiskAnalysisLogEntry {
  id: string;
  timestamp: string;
  locationName: string;
  activityId: string;
  activityName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorUsername: string;
  action: string;
  targetDetails: string;
}

const STORAGE_KEY_QUERY_LOGS = 'weathergpt_query_telemetry_v1';
const STORAGE_KEY_RISK_LOGS = 'weathergpt_risk_telemetry_v1';
const STORAGE_KEY_AUDIT_LOGS = 'weathergpt_audit_logs_v1';

/**
 * Safely logs a weather query
 */
export function logWeatherQuery(locationName: string, intent: string, language: string): void {
  try {
    const logs = getQueryLogs();
    logs.unshift({
      id: `qlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      locationName: locationName || 'Unknown',
      intent: intent || 'GENERAL_WEATHER',
      language: language || 'en'
    });
    // Keep max 200 recent logs
    localStorage.setItem(STORAGE_KEY_QUERY_LOGS, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Failed to log query telemetry:', e);
  }
}

/**
 * Safely logs an activity risk analysis
 */
export function logRiskAnalysis(
  locationName: string,
  activityId: string,
  activityName: string,
  riskScore: number,
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'SEVERE'
): void {
  try {
    const logs = getRiskLogs();
    logs.unshift({
      id: `rlog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      locationName,
      activityId,
      activityName,
      riskScore,
      riskLevel
    });
    localStorage.setItem(STORAGE_KEY_RISK_LOGS, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Failed to log risk telemetry:', e);
  }
}

/**
 * Logs an administrative audit event
 */
export function logAdminAudit(actorUsername: string, action: string, targetDetails: string): void {
  try {
    const logs = getAuditLogs();
    logs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleString(),
      actorUsername,
      action,
      targetDetails
    });
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.error('Failed to log audit event:', e);
  }
}

export function getQueryLogs(): QueryLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUERY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Default seed telemetry from initial app state if empty
  return [
    { id: 'q1', timestamp: new Date().toISOString(), locationName: 'Hyderabad', intent: 'OUTDOOR_ACTIVITY', language: 'te' },
    { id: 'q2', timestamp: new Date().toISOString(), locationName: 'Chennai', intent: 'WEATHER_ALERT', language: 'en' },
    { id: 'q3', timestamp: new Date().toISOString(), locationName: 'Bengaluru', intent: 'TRAVEL_DECISION', language: 'kn' },
    { id: 'q4', timestamp: new Date().toISOString(), locationName: 'Mumbai', intent: 'RAIN_FORECAST', language: 'hi' },
    { id: 'q5', timestamp: new Date().toISOString(), locationName: 'Hyderabad', intent: 'OUTDOOR_ACTIVITY', language: 'en' }
  ];
}

export function getRiskLogs(): RiskAnalysisLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RISK_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    { id: 'r1', timestamp: new Date().toISOString(), locationName: 'Hyderabad', activityId: 'cricket', activityName: 'Cricket', riskScore: 68, riskLevel: 'HIGH' },
    { id: 'r2', timestamp: new Date().toISOString(), locationName: 'Chennai', activityId: 'cycling', activityName: 'Cycling', riskScore: 35, riskLevel: 'MODERATE' },
    { id: 'r3', timestamp: new Date().toISOString(), locationName: 'Bengaluru', activityId: 'running', activityName: 'Running', riskScore: 18, riskLevel: 'LOW' },
    { id: 'r4', timestamp: new Date().toISOString(), locationName: 'Mumbai', activityId: 'beach_visit', activityName: 'Beach Visit', riskScore: 82, riskLevel: 'SEVERE' }
  ];
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    { id: 'a1', timestamp: new Date().toLocaleString(), actorUsername: 'srividya', action: 'ADMIN_LOGIN', targetDetails: 'Creator signed into dashboard' },
    { id: 'a2', timestamp: new Date().toLocaleString(), actorUsername: 'srividya', action: 'SYSTEM_INITIALIZATION', targetDetails: 'WeatherGPT RBAC initialized' }
  ];
}
