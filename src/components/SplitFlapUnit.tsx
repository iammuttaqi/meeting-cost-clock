import React, { memo } from 'react';

interface SplitFlapUnitProps {
  char: string;
  size?: 'normal' | 'sm';
}

export const SplitFlapUnit: React.FC<SplitFlapUnitProps> = memo(({ char, size = 'normal' }) => {
  const isSeparator = char === ',' || char === '.' || char === ':' || char === ' ';
  const sizeClass = size === 'sm' ? 'flap-unit-sm' : '';
  const sepSizeClass = size === 'sm' ? 'flap-separator-sm' : '';

  if (isSeparator) {
    return (
      <span
        className={`flap-separator ${sepSizeClass}`}
        aria-hidden="true"
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  }

  return (
    <div
      className={`flap-unit ${sizeClass}`}
      data-testid="flap-unit"
      aria-hidden="true"
    >
      <span className="flap-hinge flap-hinge-left" />
      <span className="flap-char">{char}</span>
      <span className="flap-hinge flap-hinge-right" />
    </div>
  );
});

SplitFlapUnit.displayName = 'SplitFlapUnit';
