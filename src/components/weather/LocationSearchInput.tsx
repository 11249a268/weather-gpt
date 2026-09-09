import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { searchLocations } from '../../services/weatherService';
import { LocationSearchResult } from '../../services/weatherProviders/openMeteoProvider';
import './LocationSearchInput.css';

interface LocationSearchInputProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  onUseMyLocation: () => void;
  isLoading?: boolean;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelectLocation,
  onUseMyLocation,
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks the query that triggered the most recent search to prevent stale updates
  const latestQueryRef = useRef<string>('');

  // Debounced Location Search with race-condition protection
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const currentQuery = query;

    const timer = setTimeout(async () => {
      // Register this as the latest active query
      latestQueryRef.current = currentQuery;
      setSearching(true);

      try {
        const results = await searchLocations(currentQuery);

        // Discard result if a newer query has already been issued
        if (latestQueryRef.current !== currentQuery) return;

        // Deduplicate by rounded lat/lon to prevent identical locations appearing twice
        const seen = new Set<string>();
        const deduped = results.filter((loc) => {
          const key = `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setSuggestions(deduped);
        setShowDropdown(deduped.length > 0);
      } catch (err) {
        if (latestQueryRef.current === currentQuery) {
          console.error('Location search error:', err);
        }
      } finally {
        if (latestQueryRef.current === currentQuery) {
          setSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationSearchResult) => {
    // Build a clear label: "Name, Admin1, Country" or "Name, Country"
    const parts = [loc.name];
    if (loc.admin1 && loc.admin1 !== loc.name) parts.push(loc.admin1);
    if (loc.country) parts.push(loc.country);
    setQuery(parts.join(', '));
    setShowDropdown(false);
    onSelectLocation(loc);
  };

  /**
   * Builds a clean secondary label (State/Region, Country) with no undefined/empty segments.
   */
  const buildSecondaryLabel = (loc: LocationSearchResult): string => {
    const parts: string[] = [];
    if (loc.admin1 && loc.admin1.trim() && loc.admin1 !== loc.name) {
      parts.push(loc.admin1.trim());
    }
    if (loc.country && loc.country.trim()) {
      parts.push(loc.country.trim());
    }
    return parts.join(', ');
  };

  return (
    <div className="location-search-wrapper" ref={containerRef}>
      <div className="search-controls-bar">
        {/* Search Input Box */}
        <div className="search-input-container">
          <input
            type="text"
            className="input-field location-input-field"
            placeholder="Search city, state or country e.g. Kerala, California, London..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          />
          {searching && <Loader2 size={16} className="search-spinner" />}
        </div>

        {/* Use My Location Button */}
        <button
          type="button"
          className="btn btn-secondary btn-my-location"
          onClick={onUseMyLocation}
          disabled={isLoading}
          title="Detect my current location using browser GPS"
        >
          <Navigation size={16} className="icon-cyan" />
          <span>Use My Location</span>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className="suggestions-dropdown">
          <span className="dropdown-label">Select Location</span>
          {suggestions.map((loc) => {
            const secondary = buildSecondaryLabel(loc);
            return (
              <button
                key={`${loc.id}-${loc.latitude.toFixed(3)}-${loc.longitude.toFixed(3)}`}
                type="button"
                className="suggestion-item"
                onClick={() => handleSelect(loc)}
              >
                <MapPin size={15} className="suggestion-icon" />
                <div className="suggestion-text">
                  <span className="suggestion-name">{loc.name}</span>
                  {secondary && (
                    <span className="suggestion-details">{secondary}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
