import React from 'react';
import type { CurrencyCode } from '../types.ts';
import { formatCurrencyAmount, formatDuration, CURRENCIES } from '../lib/currencies.ts';
import { SplitFlapUnit } from './SplitFlapUnit.tsx';

interface MeetingBoardProps {
  cost: number;
  elapsedSeconds: number;
  currency: CurrencyCode;
  totalHourlyBurn: number;
  isRunning: boolean;
}

export const MeetingBoard: React.FC<MeetingBoardProps> = ({
  cost,
  elapsedSeconds,
  currency,
  totalHourlyBurn,
  isRunning,
}) => {
  const currencyInfo = CURRENCIES[currency];
  const { parts: costParts, formattedText: costFormatted } = formatCurrencyAmount(cost, currency);
  const { parts: durationParts, formattedText: durationFormatted } = formatDuration(elapsedSeconds);

  return (
    <section className="board-housing" aria-label="Meeting cost split-flap board">
      <div className="board-label-row">
        <div className="board-channel-label">
          BOARD: LIVE ACCRUAL
        </div>
        <div className="board-rate-subtext">
          Burn: {currencyInfo.symbol}{totalHourlyBurn.toLocaleString('en-US')}/hr
        </div>
      </div>

      {/* Primary Split-Flap Cost Row */}
      <div
        className="split-flap-display"
        role="region"
        aria-label={`Accrued meeting cost: ${costFormatted}`}
        data-testid="cost-board"
      >
        {costParts.map((char, index) => (
          <SplitFlapUnit key={`cost-char-${index}`} char={char} />
        ))}
      </div>

      {/* Screen reader live text announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Current meeting cost: {costFormatted}, Elapsed time: {durationFormatted}
      </div>

      {/* Bottom Bar: Elapsed Time & Status */}
      <div className="timer-bar">
        <div className="timer-section">
          <span className="timer-label">Elapsed Time:</span>
          <div
            className="timer-digits"
            role="timer"
            aria-label={`Elapsed time: ${durationFormatted}`}
            data-testid="timer-display"
          >
            {durationParts.map((char, idx) => (
              <SplitFlapUnit key={`time-${idx}`} char={char} size="sm" />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className="timer-label">Status:</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isRunning ? 'var(--color-amber)' : 'var(--color-text-muted)',
              fontWeight: 600,
            }}
            data-testid="clock-status-label"
          >
            {isRunning ? 'Ticking Live' : elapsedSeconds > 0 ? 'Paused' : 'Standby'}
          </span>
        </div>
      </div>
    </section>
  );
};
