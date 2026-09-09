import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '../../config/languageConfig';
import './LanguageSelector.css';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = SUPPORTED_LANGUAGES[currentLanguage];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="btn-lang-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Select Interface & Response Language"
      >
        <Globe size={15} className="icon-cyan" />
        <span className="lang-native-name">{activeConfig.nativeName}</span>
        <ChevronDown size={13} className={`arrow-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown-menu glass-card">
          <div className="dropdown-header-label">🌐 Select Language</div>
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setLanguage(lang.code as SupportedLanguageCode);
                  setIsOpen(false);
                }}
              >
                <span className="lang-option-native">{lang.nativeName}</span>
                <span className="lang-option-english">({lang.displayName})</span>
                {isSelected && <Check size={14} className="icon-emerald check-icon" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
