import React, { useState } from 'react';

interface ClockControlsProps {
  isRunning: boolean;
  elapsedSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onCopyShareLink: () => Promise<boolean>;
}

export const ClockControls: React.FC<ClockControlsProps> = ({
  isRunning,
  elapsedSeconds,
  onStart,
  onPause,
  onReset,
  onCopyShareLink,
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopy = async () => {
    const success = await onCopyShareLink();
    if (success) {
      setCopyFeedback('URL copied! Team can open this exact setup.');
    } else {
      setCopyFeedback('Unable to copy automatically. Check URL bar.');
    }
    setTimeout(() => {
      setCopyFeedback(null);
    }, 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div className="controls-bar" role="toolbar" aria-label="Clock controls">
        {!isRunning ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onStart}
            data-testid="start-btn"
          >
            <span>▶</span>
            <span>{elapsedSeconds > 0 ? 'Resume Clock' : 'Start Meeting Clock'}</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={onPause}
            data-testid="pause-btn"
          >
            <span>⏸</span>
            <span>Pause Clock</span>
          </button>
        )}

        <button
          type="button"
          className="btn-danger"
          disabled={isRunning || elapsedSeconds === 0}
          onClick={onReset}
          data-testid="reset-btn"
        >
          <span>↺</span>
          <span>Reset</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleCopy}
          data-testid="share-btn"
          title="Copy URL with attendee roles & currency"
        >
          <span>🔗</span>
          <span>Copy Team Link</span>
        </button>
      </div>

      {copyFeedback && (
        <div
          className="share-feedback"
          role="status"
          aria-live="polite"
          data-testid="share-feedback"
        >
          {copyFeedback}
        </div>
      )}
    </div>
  );
};
