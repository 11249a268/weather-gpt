import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import './LoadingState.css';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Processing weather vectors...' }) => {
  return (
    <div className="loading-container glass-card">
      <div className="loader-glow-box">
        <Loader2 size={36} className="spinner-icon" />
        <Sparkles size={16} className="sparkle-icon" />
      </div>
      <p className="loading-text">{message}</p>
      <span className="loading-sub">WeatherGPT Decision Pipeline Active</span>
    </div>
  );
};
