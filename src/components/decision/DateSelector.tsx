import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import './DateSelector.css';

interface DateSelectorProps {
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDateStr,
  onSelectDate
}) => {
  const [customDate, setCustomDate] = useState<string>('');
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSelectTab = (tab: 'Today' | 'Tomorrow' | 'Custom') => {
    setValidationError(null);
    if (tab === 'Today' || tab === 'Tomorrow') {
      setIsCustomDate(false);
      onSelectDate(tab);
    } else {
      setIsCustomDate(true);
    }
  };

  const handleCustomDateChange = (val: string) => {
    setCustomDate(val);
    if (!val) return;

    const chosen = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((chosen.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      setValidationError('Cannot analyze past dates.');
    } else if (diffDays > 7) {
      setValidationError('Detailed weather forecast is not currently available for this date (max 7 days).');
    } else {
      setValidationError(null);
      const dateFormatted = chosen.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      onSelectDate(dateFormatted);
    }
  };

  return (
    <div className="date-selector-container">
      <label className="selector-title-label">
        2. Select Target Date
      </label>

      <div className="date-tabs-group">
        {(['Today', 'Tomorrow', 'Custom'] as const).map((tab) => {
          const isActive = (tab === 'Today' && selectedDateStr === 'Today' && !isCustomDate) ||
                           (tab === 'Tomorrow' && selectedDateStr === 'Tomorrow' && !isCustomDate) ||
                           (tab === 'Custom' && isCustomDate);
          return (
            <button
              key={tab}
              type="button"
              className={`date-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectTab(tab)}
            >
              <Calendar size={14} />
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {isCustomDate && (
        <div className="custom-date-picker-box glass-card">
          <input
            type="date"
            className="input-field date-picker-input"
            value={customDate}
            onChange={(e) => handleCustomDateChange(e.target.value)}
          />
          {validationError && (
            <div className="date-validation-error">
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
