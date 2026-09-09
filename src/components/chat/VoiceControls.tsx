import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Edit3, X, Send, AlertCircle, RefreshCw, Square } from 'lucide-react';
import { speechService, SpeechState } from '../../services/speechService';
import { textToSpeechService } from '../../services/textToSpeechService';
import { useLanguage } from '../../context/LanguageContext';
import './VoiceControls.css';

interface VoiceInputButtonProps {
  onTranscriptConfirmed: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscriptConfirmed,
  disabled
}) => {
  const { currentLanguage } = useLanguage();
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMicClick = () => {
    if (speechState === 'listening') {
      speechService.stopListening();
      setSpeechState('idle');
      return;
    }

    setErrorMessage(null);
    setTranscript('');

    speechService.startListening(
      currentLanguage,
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          setShowReviewModal(true);
        }
      },
      (err) => {
        setErrorMessage(err);
        setSpeechState('error');
        setTimeout(() => setSpeechState('idle'), 4000);
      },
      (state) => setSpeechState(state)
    );
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onTranscriptConfirmed(transcript.trim());
      setShowReviewModal(false);
      setTranscript('');
    }
  };

  return (
    <div className="voice-input-wrapper">
      <button
        type="button"
        className={`btn-mic-trigger ${speechState}`}
        onClick={handleMicClick}
        disabled={disabled}
        aria-label="Start voice input"
        title="Speak to WeatherGPT"
      >
        {speechState === 'listening' ? (
          <span className="listening-pulse">
            <span className="red-dot"></span>
            <span className="mic-text">Listening...</span>
          </span>
        ) : speechState === 'processing' ? (
          <RefreshCw size={18} className="spinning" />
        ) : (
          <Mic size={18} />
        )}
      </button>

      {errorMessage && (
        <div className="voice-error-toast glass-card">
          <AlertCircle size={14} className="icon-amber" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Requirement 8.5: Transcript Review Modal */}
      {showReviewModal && (
        <div className="transcript-modal-overlay">
          <div className="transcript-modal glass-card">
            <div className="modal-header-row">
              <div className="modal-title">
                <Mic size={16} className="icon-cyan" />
                <span>🎙️ You Said:</span>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setShowReviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <textarea
              className="input-field transcript-edit-textarea"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Review or edit recognized speech..."
            />

            <div className="modal-actions-row">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSendTranscript}>
                <Send size={14} />
                <span>Send to WeatherGPT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface VoiceSpeakerButtonProps {
  textToRead: string;
}

export const VoiceSpeakerButton: React.FC<VoiceSpeakerButtonProps> = ({ textToRead }) => {
  const { currentLanguage, voiceGender } = useLanguage();
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState<string | null>(null);

  const handleSpeakClick = () => {
    if (speaking && !paused) {
      textToSpeechService.pause();
      setPaused(true);
      return;
    }

    if (speaking && paused) {
      textToSpeechService.resume();
      setPaused(false);
      return;
    }

    setFallbackWarning(null);
    setSpeaking(true);
    setPaused(false);

    textToSpeechService.speak(
      textToRead,
      currentLanguage,
      voiceGender,
      () => {
        setSpeaking(false);
        setPaused(false);
      },
      (err) => {
        setSpeaking(false);
        setPaused(false);
      },
      (unavailLang) => {
        setSpeaking(false);
        setPaused(false);
        const langName = currentLanguage.toUpperCase();
        setFallbackWarning(
          `${langName} text response ready. (${langName} voice playback is not available on this device).`
        );
      }
    );
  };

  const handleStopClick = () => {
    textToSpeechService.stop();
    setSpeaking(false);
    setPaused(false);
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          type="button"
          className={`btn-tts-speaker ${speaking ? 'speaking' : ''}`}
          onClick={handleSpeakClick}
          aria-label="Read response aloud"
          title="Read response aloud"
        >
          {speaking && !paused ? (
            <>
              <VolumeX size={15} className="icon-amber" />
              <span className="tts-label">⏸ Pause</span>
            </>
          ) : speaking && paused ? (
            <>
              <Volume2 size={15} className="icon-emerald" />
              <span className="tts-label">▶ Resume</span>
            </>
          ) : (
            <>
              <Volume2 size={15} className="icon-cyan" />
              <span className="tts-label">🔊 Listen</span>
            </>
          )}
        </button>

        {speaking && (
          <button
            type="button"
            className="btn-tts-speaker"
            onClick={handleStopClick}
            aria-label="Stop reading"
            title="Stop reading"
            style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            <Square size={13} />
            <span className="tts-label">⏹ Stop</span>
          </button>
        )}
      </div>

      {fallbackWarning && (
        <div style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
          <AlertCircle size={12} />
          <span>{fallbackWarning}</span>
        </div>
      )}
    </div>
  );
};
