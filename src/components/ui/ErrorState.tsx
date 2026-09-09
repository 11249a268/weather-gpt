import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Disruption Encountered',
  message = 'Failed to process weather observation data payload.',
  onRetry
}) => {
  return (
    <div className="error-container glass-card">
      <div className="error-icon-box">
        <AlertOctagon size={32} className="error-icon" />
      </div>
      <h4 className="error-title">{title}</h4>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-retry" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
