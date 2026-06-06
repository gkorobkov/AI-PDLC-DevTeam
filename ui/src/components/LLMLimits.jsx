import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 4,
});

function formatValue(value, labels) {
  if (value === null || value === undefined || value === '') {
    return labels.notSet;
  }

  if (typeof value === 'number') {
    return moneyFormatter.format(value);
  }

  return String(value);
}

function Stat({ label, value, tone = 'default' }) {
  return (
    <div className={`limit-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDate(value, labels) {
  if (!value) {
    return labels.notSet;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString();
}

function LLMLimits({ labels }) {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLimits = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/llm-limits');
      setLimits(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || labels.failed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLimits();
  }, []);

  const usagePercent = useMemo(() => {
    if (!limits?.supported || typeof limits.limit !== 'number' || limits.limit <= 0) {
      return null;
    }

    if (typeof limits.limit_remaining === 'number') {
      return Math.min(100, Math.max(0, ((limits.limit - limits.limit_remaining) / limits.limit) * 100));
    }

    if (typeof limits.usage === 'number') {
      return Math.min(100, Math.max(0, (limits.usage / limits.limit) * 100));
    }

    return null;
  }, [limits]);

  return (
    <section className="workspace limits-workspace">
      <div className="limits-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h2>{labels.title}</h2>
          </div>
          <button type="button" className="btn btn-secondary compact" onClick={loadLimits} disabled={loading}>
            {loading ? labels.refreshing : labels.refresh}
          </button>
        </div>

        {error && <div className="error">{error}</div>}
        {loading && !limits && <div className="state-message">{labels.loading}</div>}

        {limits && !limits.supported && (
          <div className="empty-state aligned-left">
            <h3>{limits.provider || labels.provider} {labels.connected}</h3>
            <p>{limits.message}</p>
          </div>
        )}

        {limits?.supported && (
          <>
            <div className="limits-summary">
              <Stat label={labels.provider} value={limits.provider || labels.unknown} />
              <Stat label={labels.model} value={limits.model || labels.unknown} />
              <Stat label={labels.plan} value={limits.is_free_tier ? labels.freeTier : labels.paid} tone="accent" />
              <Stat label={labels.updated} value={limits.timestamp ? new Date(limits.timestamp).toLocaleTimeString() : labels.now} />
            </div>

            <div className="usage-card">
              <div className="usage-header">
                <div>
                  <span>{labels.creditUsage}</span>
                  <strong>{usagePercent === null ? labels.noHardLimit : `${usagePercent.toFixed(1)}% ${labels.used}`}</strong>
                </div>
                <span>{formatValue(limits.usage, labels)} {labels.spent}</span>
              </div>
              <div className="usage-bar" aria-hidden="true">
                <span style={{ width: `${usagePercent ?? 0}%` }} />
              </div>
            </div>

            <div className="limits-grid">
              <Stat label={labels.stats.limit} value={formatValue(limits.limit, labels)} />
              <Stat label={labels.stats.remaining} value={formatValue(limits.limit_remaining, labels)} tone="positive" />
              <Stat label={labels.stats.usage} value={formatValue(limits.usage, labels)} />
              <Stat label={labels.stats.usageToday} value={formatValue(limits.usage_daily, labels)} />
              <Stat label={labels.stats.usageWeek} value={formatValue(limits.usage_weekly, labels)} />
              <Stat label={labels.stats.usageMonth} value={formatValue(limits.usage_monthly, labels)} />
              <Stat label={labels.stats.byokUsage} value={formatValue(limits.byok_usage, labels)} />
              <Stat label={labels.stats.byokDaily} value={formatValue(limits.byok_usage_daily, labels)} />
              <Stat label={labels.stats.byokWeek} value={formatValue(limits.byok_usage_weekly, labels)} />
              <Stat label={labels.stats.byokMonth} value={formatValue(limits.byok_usage_monthly, labels)} />
              <Stat label={labels.stats.limitReset} value={formatDate(limits.limit_reset, labels)} />
              <Stat label={labels.stats.keyExpires} value={formatDate(limits.expires_at, labels)} />
              <Stat label={labels.stats.rateLimit} value={limits.rate_limit ? JSON.stringify(limits.rate_limit) : labels.default} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default LLMLimits;
