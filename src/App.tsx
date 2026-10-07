import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { AttendeeRole, CurrencyCode } from './types.ts';
import { parseUrlState, syncUrlState, serializeUrlState } from './lib/urlState.ts';
import { CURRENCIES, DEFAULT_CURRENCY } from './lib/currencies.ts';
import { MeetingBoard } from './components/MeetingBoard.tsx';
import { ClockControls } from './components/ClockControls.tsx';
import { LiveComparisons } from './components/LiveComparisons.tsx';
import { CurrencyPicker } from './components/CurrencyPicker.tsx';
import { AttendeeRoles } from './components/AttendeeRoles.tsx';

function getInitialState() {
  if (typeof window !== 'undefined') {
    return parseUrlState(window.location.search);
  }
  return { currency: DEFAULT_CURRENCY, roles: [] };
}

export const App: React.FC = () => {
  // 1. Initial State from URL via lazy initializers
  const [currency, setCurrency] = useState<CurrencyCode>(() => getInitialState().currency);
  const [roles, setRoles] = useState<AttendeeRole[]>(() => getInitialState().roles);

  // 2. Timer & Cost State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const accumulatedTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 3. Compute Burn Rate & Cost
  const totalHourlyBurn = roles.reduce((sum, r) => sum + r.count * r.rate, 0);
  const currentCost = elapsedSeconds * (totalHourlyBurn / 3600);

  // Sync state to URL whenever roles or currency changes
  const handleCurrencyChange = useCallback((newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setRoles((prevRoles) => {
      const updated = prevRoles.map((r) => {
        const oldDefault = CURRENCIES[currency]?.defaultRate;
        const newDefault = CURRENCIES[newCurrency]?.defaultRate;
        if (oldDefault && newDefault && r.rate === oldDefault) {
          return { ...r, rate: newDefault };
        }
        return r;
      });
      syncUrlState(newCurrency, updated);
      return updated;
    });
  }, [currency]);

  const handleRolesChange = useCallback((newRoles: AttendeeRole[]) => {
    setRoles(newRoles);
    syncUrlState(currency, newRoles);
  }, [currency]);

  // 4. Timer Animation Loop
  useEffect(() => {
    if (!isRunning) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (startTimeRef.current !== null) {
        const now = performance.now();
        const sessionSeconds = (now - startTimeRef.current) / 1000;
        setElapsedSeconds(accumulatedTimeRef.current + sessionSeconds);
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning]);

  // Clock Actions
  const handleStart = () => {
    startTimeRef.current = performance.now();
    setIsRunning(true);
  };

  const handlePause = () => {
    if (startTimeRef.current !== null) {
      const sessionSeconds = (performance.now() - startTimeRef.current) / 1000;
      accumulatedTimeRef.current += sessionSeconds;
    }
    startTimeRef.current = null;
    setIsRunning(false);
  };

  const handleReset = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const handleCopyShareLink = async (): Promise<boolean> => {
    try {
      const query = serializeUrlState(currency, roles);
      const url = `${window.location.origin}${window.location.pathname}${query}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  };

  return (
    <div className="app-container">
      <main>
        <header className="terminal-header">
          <div className="terminal-meta-row">
            <div className="terminal-badge">
              <span className={`terminal-badge-pulse ${isRunning ? 'active' : ''}`} />
              <span>TERMINAL MONITOR // FLIGHT DECK</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              CLIENT-SIDE COMPUTATION · ZERO SERVER STORAGE
            </div>
          </div>
          <h1 className="terminal-title">Meeting Cost Clock</h1>
          <p className="terminal-pitch">
            Start it when the meeting starts. Watch the financial cost tick up live on an airport split-flap mechanical board.
          </p>
        </header>

        {/* Primary Split-Flap Board */}
        <MeetingBoard
          cost={currentCost}
          elapsedSeconds={elapsedSeconds}
          currency={currency}
          totalHourlyBurn={totalHourlyBurn}
          isRunning={isRunning}
        />

        {/* Controls */}
        <ClockControls
          isRunning={isRunning}
          elapsedSeconds={elapsedSeconds}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onCopyShareLink={handleCopyShareLink}
        />

        {/* Opportunity Cost Live Comparisons */}
        <LiveComparisons
          cost={currentCost}
          currency={currency}
        />

        {/* Attendees & Currency Setup */}
        <section className="setup-section" aria-label="Meeting configuration">
          <CurrencyPicker
            currentCurrency={currency}
            onSelectCurrency={handleCurrencyChange}
          />

          <AttendeeRoles
            roles={roles}
            currency={currency}
            onUpdateRoles={handleRolesChange}
          />
        </section>
      </main>

      <footer>
        <div>Meeting Cost Clock · All configuration lives purely in your URL link.</div>
        <div>
          Open source at{' '}
          <a
            href="https://github.com/muttaqi-builds/meeting-cost-clock"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/muttaqi-builds/meeting-cost-clock
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
