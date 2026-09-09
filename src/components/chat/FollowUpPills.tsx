import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import './FollowUpPills.css';

interface FollowUpPillsProps {
  suggestions: string[];
  onSelectFollowUp: (question: string) => void;
}

export const FollowUpPills: React.FC<FollowUpPillsProps> = ({ suggestions, onSelectFollowUp }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="followup-container">
      <div className="followup-header">
        <MessageSquarePlus size={14} className="icon-cyan" />
        <span className="followup-title">Ask a follow-up question:</span>
      </div>

      <div className="followup-chips">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            className="followup-chip"
            onClick={() => onSelectFollowUp(item)}
          >
            <span>"{item}"</span>
          </button>
        ))}
      </div>
    </div>
  );
};
