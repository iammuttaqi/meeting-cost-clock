import React from 'react';
import type { AttendeeRole, CurrencyCode } from '../types.ts';
import { CURRENCIES } from '../lib/currencies.ts';

interface AttendeeRolesProps {
  roles: AttendeeRole[];
  currency: CurrencyCode;
  onUpdateRoles: (newRoles: AttendeeRole[]) => void;
  disabled?: boolean;
}

export const AttendeeRoles: React.FC<AttendeeRolesProps> = ({
  roles,
  currency,
  onUpdateRoles,
  disabled = false,
}) => {
  const currentSymbol = CURRENCIES[currency]?.symbol || '$';

  const handleUpdate = (id: string, field: keyof AttendeeRole, value: string | number) => {
    const updated = roles.map((role) => {
      if (role.id !== id) return role;
      if (field === 'count') {
        const parsed = parseInt(String(value), 10);
        return { ...role, count: isNaN(parsed) ? 1 : Math.max(1, Math.min(9999, parsed)) };
      }
      if (field === 'rate') {
        const parsed = parseFloat(String(value));
        return { ...role, rate: isNaN(parsed) ? 0 : Math.max(0, Math.min(1000000, parsed)) };
      }
      if (field === 'name') {
        return { ...role, name: String(value).slice(0, 32) };
      }
      return role;
    });
    onUpdateRoles(updated);
  };

  const handleAddRole = () => {
    const newId = `role-${Date.now()}`;
    const newRole: AttendeeRole = {
      id: newId,
      name: 'Specialist',
      count: 1,
      rate: CURRENCIES[currency]?.defaultRate || 85,
    };
    onUpdateRoles([...roles, newRole]);
  };

  const handleRemoveRole = (id: string) => {
    if (roles.length <= 1) return; // keep at least one role
    onUpdateRoles(roles.filter((r) => r.id !== id));
  };

  const totalAttendees = roles.reduce((sum, r) => sum + r.count, 0);
  const totalHourlyBurn = roles.reduce((sum, r) => sum + r.count * r.rate, 0);
  const perSecondBurn = totalHourlyBurn / 3600;

  return (
    <div className="setup-card">
      <div className="section-heading">
        <span>Team & Attendance Roster</span>
      </div>

      <div className="roles-table" role="table" aria-label="Meeting attendee roles">
        <div className="roles-header-row" role="row">
          <span role="columnheader">Role</span>
          <span role="columnheader">Headcount</span>
          <span role="columnheader">Rate / hr</span>
          <span role="columnheader"><span className="sr-only">Actions</span></span>
        </div>

        {roles.map((role, idx) => (
          <div key={role.id} className="role-row" role="row">
            <div role="cell">
              <label htmlFor={`role-name-${role.id}`} className="sr-only">
                Role name {idx + 1}
              </label>
              <input
                id={`role-name-${role.id}`}
                type="text"
                value={role.name}
                disabled={disabled}
                onChange={(e) => handleUpdate(role.id, 'name', e.target.value)}
                placeholder="e.g. Engineering"
                aria-label={`Role name for row ${idx + 1}`}
              />
            </div>

            <div role="cell">
              <label htmlFor={`role-count-${role.id}`} className="sr-only">
                Count for {role.name}
              </label>
              <input
                id={`role-count-${role.id}`}
                type="number"
                min="1"
                max="9999"
                value={role.count}
                disabled={disabled}
                onChange={(e) => handleUpdate(role.id, 'count', e.target.value)}
                aria-label={`Attendee count for ${role.name}`}
              />
            </div>

            <div role="cell">
              <div className="rate-input-wrap">
                <span className="rate-currency-prefix" aria-hidden="true">
                  {currentSymbol}
                </span>
                <label htmlFor={`role-rate-${role.id}`} className="sr-only">
                  Hourly rate for {role.name}
                </label>
                <input
                  id={`role-rate-${role.id}`}
                  type="number"
                  min="0"
                  max="1000000"
                  step="5"
                  value={role.rate}
                  disabled={disabled}
                  onChange={(e) => handleUpdate(role.id, 'rate', e.target.value)}
                  aria-label={`Hourly rate for ${role.name}`}
                />
              </div>
            </div>

            <div role="cell">
              <button
                type="button"
                className="role-action-btn"
                disabled={disabled || roles.length <= 1}
                onClick={() => handleRemoveRole(role.id)}
                aria-label={`Remove role ${role.name}`}
                title="Remove role"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn-secondary add-role-btn"
          disabled={disabled || roles.length >= 20}
          onClick={handleAddRole}
        >
          + Add Role Group
        </button>
      </div>

      <div className="burn-summary-strip" aria-label="Live burn rate summary">
        <div className="burn-stat">
          <span style={{ color: 'var(--color-text-muted)' }}>Attendees:</span>
          <span className="burn-stat-val" data-testid="total-attendees">
            {totalAttendees}
          </span>
        </div>
        <div className="burn-stat">
          <span style={{ color: 'var(--color-text-muted)' }}>Hourly Burn:</span>
          <span className="burn-stat-val" data-testid="total-hourly-rate">
            {currentSymbol} {totalHourlyBurn.toLocaleString('en-US')}/hr
          </span>
        </div>
        <div className="burn-stat">
          <span style={{ color: 'var(--color-text-muted)' }}>Per Second:</span>
          <span className="burn-stat-val">
            {currentSymbol} {perSecondBurn.toFixed(2)}/s
          </span>
        </div>
      </div>
    </div>
  );
};
