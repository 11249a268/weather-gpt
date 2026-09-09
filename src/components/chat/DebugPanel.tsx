import React, { useState } from 'react';
import { Cpu, ChevronDown, ChevronUp, Code } from 'lucide-react';
import './DebugPanel.css';

interface DebugPanelProps {
  debugInfo: any;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ debugInfo }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!debugInfo) return null;

  const { parsedQuery, locationName, riskScore, explanationSource, activityId, dateStr, timeInput } = debugInfo;

  return (
    <div className="debug-panel-wrapper">
      <button
        type="button"
        className="btn-toggle-debug"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Code size={13} className="icon-cyan" />
        <span>Developer Pipeline Inspector</span>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {isOpen && (
        <div className="debug-panel-content glass-card">
          <div className="debug-grid">
            <div className="debug-item">
              <strong>Query:</strong> <span>"{parsedQuery?.originalQuery}"</span>
            </div>
            <div className="debug-item">
              <strong>Detected Intent:</strong> <span className="intent-tag">{parsedQuery?.intent}</span>
            </div>
            <div className="debug-item">
              <strong>Location Entity:</strong> <span>{locationName}</span>
            </div>
            <div className="debug-item">
              <strong>Extracted Activity:</strong> <span>{activityId || parsedQuery?.activity || 'None'}</span>
            </div>
            <div className="debug-item">
              <strong>Target Date / Time:</strong> <span>{dateStr || parsedQuery?.dateReference} • {timeInput || parsedQuery?.timeReference}</span>
            </div>
            <div className="debug-item">
              <strong>Services Invoked:</strong> <span>queryUnderstanding → weatherService → alertService {riskScore !== undefined ? '→ decisionService' : ''} → llmService</span>
            </div>
            {riskScore !== undefined && (
              <div className="debug-item">
                <strong>Calculated Risk Score:</strong> <span className="score-tag">{riskScore}/100</span>
              </div>
            )}
            <div className="debug-item">
              <strong>Explanation Source:</strong> <span>{explanationSource || 'Grounded LLM Abstraction Engine'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
