import { DecisionResult } from '../services/decisionService';

const HISTORY_KEY = 'weathergpt_decision_history_v1';
const MAX_HISTORY = 8;

export function getRecentDecisions(): DecisionResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DecisionResult[];
  } catch {
    return [];
  }
}

export function saveDecisionToHistory(decision: DecisionResult): void {
  try {
    const current = getRecentDecisions();
    // Filter out duplicates with same activity name & timeRange
    const filtered = current.filter(
      (item) => !(item.activity.id === decision.activity.id && item.location.name === decision.location.name && item.timeRange === decision.timeRange)
    );
    const updated = [decision, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save decision to localStorage', e);
  }
}

export function clearDecisionHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear decision history', e);
  }
}
