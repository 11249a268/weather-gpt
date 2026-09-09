import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Info } from 'lucide-react';
import { WhyFactor } from '../../services/aiService';
import './CollapsibleWhySection.css';

interface CollapsibleWhySectionProps {
  explanation: string;
  factors: WhyFactor[];
}

export const CollapsibleWhySection: React.FC<CollapsibleWhySectionProps> = ({ explanation, factors }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="collapsible-why-wrapper">
      <button
        type="button"
        className="collapsible-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <HelpCircle size={15} className="icon-cyan" />
        <span>🔍 Why this answer?</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="collapsible-content">
          <p className="explanation-text">{explanation}</p>

          <div className="why-factors-grid">
            {factors.map((factor, idx) => (
              <div key={idx} className={`why-factor-card factor-status-${factor.status}`}>
                <span className="factor-title-text">{factor.factorName}</span>
                <span className="factor-value-text">{factor.value}</span>
              </div>
            ))}
          </div>

          <div className="demo-data-note">
            <Info size={12} />
            <span>Data Source: Grounded Open-Meteo Telemetry &amp; Deterministic Decision Engine.</span>
          </div>
        </div>
      )}
    </div>
  );
};
