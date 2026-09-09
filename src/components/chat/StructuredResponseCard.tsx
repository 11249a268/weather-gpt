import React, { useEffect, useState } from 'react';
import {
  Bot,
  Clock,
  CloudRain,
  CheckCircle2,
  MapPin,
  Database,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { StructuredAIResponse, WhyFactor } from '../../services/aiService';
import { RiskIndicator } from './RiskIndicator';
import { CollapsibleWhySection } from './CollapsibleWhySection';
import { FollowUpPills } from './FollowUpPills';

import { useLanguage } from '../../context/LanguageContext';
import { translateExplanationText } from '../../services/translationService';

import './StructuredResponseCard.css';

interface StructuredResponseCardProps {
  response: StructuredAIResponse;
  onSelectFollowUp: (question: string) => void;
}

export const StructuredResponseCard: React.FC<
  StructuredResponseCardProps
> = ({ response, onSelectFollowUp }) => {
  const { selectedLanguage } = useLanguage();

  const [translatedTitle, setTranslatedTitle] = useState(response.title || '');
  const [translatedWeatherSummary, setTranslatedWeatherSummary] = useState(
    response.weatherSummary || ''
  );
  const [translatedTimeWindow, setTranslatedTimeWindow] = useState(
    response.timeWindow || ''
  );
  const [translatedRecommendation, setTranslatedRecommendation] = useState(
    response.recommendation || ''
  );
  const [translatedWhyExplanation, setTranslatedWhyExplanation] = useState(
    response.whyExplanation || ''
  );
  const [translatedFactors, setTranslatedFactors] = useState<WhyFactor[]>(
    response.whyFactors || []
  );

  const [isTranslating, setIsTranslating] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  /*
   * ============================================================
   * IMPORTANT
   * ============================================================
   *
   * The response already exists.
   *
   * When the user changes:
   *
   * English → Hindi
   * Hindi → Tamil
   * Tamil → Telugu
   * Telugu → Kannada
   * Kannada → Malayalam
   *
   * we translate the EXISTING response again.
   *
   * No new question is required.
   */

  useEffect(() => {
    let cancelled = false;

    const translateExistingResponse = async () => {
      /*
       * English:
       * show original response.
       */
      if (selectedLanguage === 'en') {
        setTranslatedTitle(response.title || '');
        setTranslatedWeatherSummary(response.weatherSummary || '');
        setTranslatedTimeWindow(response.timeWindow || '');
        setTranslatedRecommendation(response.recommendation || '');
        setTranslatedWhyExplanation(response.whyExplanation || '');
        setTranslatedFactors(response.whyFactors || []);
        setIsTranslating(false);

        return;
      }

      setIsTranslating(true);

      try {
        const [
          title,
          weatherSummary,
          timeWindow,
          recommendation,
          whyExplanation,
          factors,
        ] = await Promise.all([
          translateExplanationText(
            response.title || '',
            selectedLanguage
          ),

          translateExplanationText(
            response.weatherSummary || '',
            selectedLanguage
          ),

          translateExplanationText(
            response.timeWindow || '',
            selectedLanguage
          ),

          translateExplanationText(
            response.recommendation || '',
            selectedLanguage
          ),

          translateExplanationText(
            response.whyExplanation || '',
            selectedLanguage
          ),

          Promise.all(
            (response.whyFactors || []).map(async (factor) => ({
              ...factor,
              factorName: await translateExplanationText(
                factor.factorName,
                selectedLanguage
              ),
              value: await translateExplanationText(
                factor.value,
                selectedLanguage
              ),
            }))
          ),
        ]);

        if (cancelled) {
          return;
        }

        setTranslatedTitle(title);
        setTranslatedWeatherSummary(weatherSummary);
        setTranslatedTimeWindow(timeWindow);
        setTranslatedRecommendation(recommendation);
        setTranslatedWhyExplanation(whyExplanation);
        setTranslatedFactors(factors);
      } catch (error) {
        console.error(
          'Existing response translation failed:',
          error
        );

        /*
         * If translation fails, keep the original response
         * instead of making the card empty.
         */
        if (!cancelled) {
          setTranslatedTitle(response.title || '');
          setTranslatedWeatherSummary(
            response.weatherSummary || ''
          );
          setTranslatedTimeWindow(response.timeWindow || '');
          setTranslatedRecommendation(
            response.recommendation || ''
          );
          setTranslatedWhyExplanation(
            response.whyExplanation || ''
          );
          setTranslatedFactors(response.whyFactors || []);
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
      }
    };

    translateExistingResponse();

    return () => {
      cancelled = true;
    };
  }, [
    response.id,
    response.title,
    response.weatherSummary,
    response.timeWindow,
    response.recommendation,
    response.whyExplanation,
    response.whyFactors,
    selectedLanguage,
  ]);

  return (
    <div className="structured-response-card glass-card">

      {/* ======================================================
          RESPONSE CARD HEADER
          ====================================================== */}

      <div className="card-top-header">
        <div className="bot-title-group">
          <div className="bot-avatar">
            <Bot size={18} className="bot-icon" />
          </div>

          <div>
            <span className="bot-name">
              WeatherGPT
            </span>

            <span className="bot-time">
              {response.timestamp}
            </span>
          </div>
        </div>

        <div className="location-context-chip">
          <MapPin size={12} className="icon-cyan" />

          <span>
            {response.locationName || 'Active Location'}
          </span>
        </div>
      </div>


      {/* ======================================================
          ASSESSMENT TITLE + RISK
          ====================================================== */}

      <div className="assessment-header-row">

        <h4 className="assessment-title">
          {isTranslating ? 'Translating...' : translatedTitle}
        </h4>

        <RiskIndicator
          level={response.riskLevel}
          score={response.riskScore}
        />

      </div>


      {/* ======================================================
          WEATHER SUMMARY + TIME
          ====================================================== */}

      <div className="summary-time-grid">

        <div className="summary-box">

          <div className="box-label">
            <CloudRain
              size={14}
              className="icon-cyan"
            />

            {selectedLanguage === 'hi'
              ? 'लाइव मौसम जानकारी'
              : selectedLanguage === 'ta'
              ? 'நேரடி வானிலை தகவல்'
              : selectedLanguage === 'te'
              ? 'లైవ్ వాతావరణ సమాచారం'
              : selectedLanguage === 'kn'
              ? 'ನೇರ ಹವಾಮಾನ ಮಾಹಿತಿ'
              : selectedLanguage === 'ml'
              ? 'തത്സമയ കാലാവസ്ഥാ വിവരം'
              : 'Live Telemetry'}
          </div>

          <span className="box-val">
            {isTranslating
              ? 'Translating...'
              : translatedWeatherSummary}
          </span>

        </div>


        <div className="time-box">

          <div className="box-label">
            <Clock
              size={14}
              className="icon-amber"
            />

            {selectedLanguage === 'hi'
              ? 'पूर्वानुमान अवधि'
              : selectedLanguage === 'ta'
              ? 'முன்னறிவிப்பு நேரம்'
              : selectedLanguage === 'te'
              ? 'వాతావరణ అంచనా సమయం'
              : selectedLanguage === 'kn'
              ? 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಅವಧಿ'
              : selectedLanguage === 'ml'
              ? 'കാലാവസ്ഥാ പ്രവചന സമയം'
              : 'Forecast Period'}
          </div>

          <span className="box-val">
            {isTranslating
              ? 'Translating...'
              : translatedTimeWindow}
          </span>

        </div>

      </div>


      {/* ======================================================
          RECOMMENDATION
          ====================================================== */}

      <div className="rec-box">

        <div className="rec-label">

          <CheckCircle2
            size={16}
            className="icon-emerald"
          />

          {selectedLanguage === 'hi'
            ? 'मौसम संबंधी AI सिफारिश'
            : selectedLanguage === 'ta'
            ? 'AI வானிலை பரிந்துரை'
            : selectedLanguage === 'te'
            ? 'AI వాతావరణ సిఫార్సు'
            : selectedLanguage === 'kn'
            ? 'AI ಹವಾಮಾನ ಶಿಫಾರಸು'
            : selectedLanguage === 'ml'
            ? 'AI കാലാവസ്ഥാ ശുപാർശ'
            : 'AI Weather Recommendation'}

        </div>

        <p className="rec-text">

          "{isTranslating
            ? 'Translating...'
            : translatedRecommendation}"

        </p>

      </div>


      {/* ======================================================
          DATA SOURCE
          ====================================================== */}

      <div className="telemetry-source-footer">

        <Database
          size={12}
          className="icon-cyan"
        />

        <span>
          {selectedLanguage === 'hi'
            ? 'स्रोत'
            : selectedLanguage === 'ta'
            ? 'ஆதாரம்'
            : selectedLanguage === 'te'
            ? 'మూలం'
            : selectedLanguage === 'kn'
            ? 'ಮೂಲ'
            : selectedLanguage === 'ml'
            ? 'ഉറവിടം'
            : 'Source'}
          :{' '}
          <strong>
            {response.debugInfo?.provider ||
              'Open-Meteo API'}
          </strong>{' '}
          •{' '}
          {selectedLanguage === 'hi'
            ? 'मौसम इंजन सक्रिय'
            : selectedLanguage === 'ta'
            ? 'வானிலை இயந்திரம் செயலில் உள்ளது'
            : selectedLanguage === 'te'
            ? 'వాతావరణ ఇంజిన్ యాక్టివ్'
            : selectedLanguage === 'kn'
            ? 'ಹವಾಮಾನ ಎಂಜಿನ್ ಸಕ್ರಿಯವಾಗಿದೆ'
            : selectedLanguage === 'ml'
            ? 'കാലാവസ്ഥാ എഞ്ചിൻ സജീവമാണ്'
            : 'Weather-Aware Engine Active'}
        </span>

      </div>


      {/* ======================================================
          WHY THIS RISK
          ====================================================== */}

      <CollapsibleWhySection
        explanation={
          isTranslating
            ? 'Translating...'
            : translatedWhyExplanation
        }
        factors={translatedFactors}
      />


      {/* ======================================================
          DEBUG
          ====================================================== */}

      {response.debugInfo && (

        <div className="developer-debug-wrapper">

          <button
            type="button"
            className="debug-trigger-btn"
            onClick={() =>
              setShowDebug(!showDebug)
            }
          >

            <Terminal
              size={14}
              className="icon-violet"
            />

            <span>
              Developer Debug Info (
              {response.debugInfo.intent}
              )
            </span>

            {showDebug ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}

          </button>


          {showDebug && (

            <div className="debug-content-box">

              <div className="debug-item">
                <span className="debug-key">
                  Selected Location:
                </span>

                <span className="debug-val">
                  {response.debugInfo.locationName}
                </span>
              </div>


              <div className="debug-item">
                <span className="debug-key">
                  Coordinates (Lat, Lon):
                </span>

                <span className="debug-val">
                  {response.debugInfo.coordinates}
                </span>
              </div>


              <div className="debug-item">
                <span className="debug-key">
                  Detected Intent:
                </span>

                <span className="debug-val intent-pill">
                  {response.debugInfo.intent}
                </span>
              </div>


              <div className="debug-item">
                <span className="debug-key">
                  Requested Period / Time:
                </span>

                <span className="debug-val">
                  {response.debugInfo.timePeriod}
                </span>
              </div>


              <div className="debug-item">
                <span className="debug-key">
                  Weather Data Timestamp:
                </span>

                <span className="debug-val">
                  {response.debugInfo.retrievedAt}
                </span>
              </div>


              <div className="debug-item">
                <span className="debug-key">
                  Weather Provider:
                </span>

                <span className="debug-val">
                  {response.debugInfo.provider}
                </span>
              </div>


              <div className="debug-item">
                <span className="debug-key">
                  Data Source Mode:
                </span>

                <span className="debug-val">

                  {response.debugInfo.isCached
                    ? `Cached Data (${
                        response.debugInfo.cachedAt ||
                        'saved'
                      })`
                    : 'Live Telemetry'}

                </span>

              </div>

            </div>

          )}

        </div>

      )}


      {/* ======================================================
          FOLLOW UP QUESTIONS
          ====================================================== */}

      <FollowUpPills
        suggestions={response.followUpSuggestions}
        onSelectFollowUp={onSelectFollowUp}
      />

    </div>
  );
};
