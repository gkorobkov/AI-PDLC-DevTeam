import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 4,
});

const MOCK_LIMITS = {
  supported: true,
  demo: true,
  provider: 'OpenAI',
  model: 'gpt-4.1-mini',
  is_free_tier: false,
  limit: 250.0,
  limit_remaining: 181.73,
  usage: 68.27,
  usage_daily: 7.84,
  usage_weekly: 31.42,
  usage_monthly: 68.27,
  byok_usage: 14.62,
  byok_usage_daily: 2.19,
  byok_usage_weekly: 8.47,
  byok_usage_monthly: 14.62,
  limit_reset: '2026-07-01T00:00:00+03:00',
  expires_at: '2026-12-31T23:59:00+03:00',
  rate_limit: {
    rpm: 900,
    tpm: 240000,
    queue: 'normal',
  },
  timestamp: new Date().toISOString(),
};

function asDemoLimits(data = {}) {
  return {
    ...MOCK_LIMITS,
    provider: data.provider || MOCK_LIMITS.provider,
    model: data.model || MOCK_LIMITS.model,
    timestamp: new Date().toISOString(),
  };
}

function normalizeLimits(data) {
  if (!data || data.supported !== true || typeof data.limit !== 'number') {
    return asDemoLimits(data);
  }

  return data;
}

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
  const isRussian = /[А-Яа-я]/.test(labels.title || '');
  const demoTitle = labels.demoTitle || (isRussian ? 'Демо-данные' : 'Demo data');
  const demoMessage = labels.demoMessage || (
    isRussian
      ? 'Бэкенд лимитов пока не подключен. Для демо показан реалистичный срез лимитов провайдера.'
      : 'Backend limits endpoint is not ready yet. Showing realistic provider limits for the demo.'
  );

  const loadLimits = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('/llm-limits');
      setLimits(normalizeLimits(response.data));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || labels.failed);
      setLimits(asDemoLimits());
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

        {limits?.demo && (
          <div className="demo-notice">
            <strong>{demoTitle}</strong>
            <span>{demoMessage}</span>
          </div>
        )}
        {error && !limits?.demo && <div className="error">{error}</div>}
        {loading && !limits && <div className="state-message">{labels.loading}</div>}

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
