import React from 'react';
import { History, Trash2, MapPin, Clock } from 'lucide-react';
import { DecisionResult } from '../../services/decisionService';
import './DecisionHistoryView.css';

interface DecisionHistoryViewProps {
  history: DecisionResult[];
  onSelectHistoryItem: (item: DecisionResult) => void;
  onClearHistory: () => void;
}

export const DecisionHistoryView: React.FC<DecisionHistoryViewProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory
}) => {
  if (history.length === 0) return null;

  return (
    <div className="decision-history-container glass-card">
      <div className="history-header">
        <div className="history-title-group">
          <History size={18} className="icon-cyan" />
          <h4>Recent Decision Assessments</h4>
        </div>
        <button
          type="button"
          className="btn-clear-history"
          onClick={onClearHistory}
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      <div className="history-grid">
        {history.map((item) => (
          <div
            key={item.id}
            className="history-item-chip"
            onClick={() => onSelectHistoryItem(item)}
          >
            <span className="hist-icon">{item.activity.icon}</span>
            <div className="hist-info">
              <span className="hist-act">{item.activity.name}</span>
              <span className="hist-meta"><MapPin size={11} /> {item.location.name} • <Clock size={11} /> {item.timeRange}</span>
            </div>
            <span className={`hist-score score-${item.riskLevel.toLowerCase().replace(' ', '-')}`}>
              {item.riskScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
