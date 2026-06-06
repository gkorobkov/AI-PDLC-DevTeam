import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import RequirementAnalyzer from './components/RequirementAnalyzer';
import LLMLimits from './components/LLMLimits';
import Navigation from './components/Navigation';

const translations = {
  en: {
    subtitle: 'PDLC agent workspace',
    apiConnected: 'API online',
    apiError: 'API error',
    checking: 'Checking',
    menu: 'Menu',
    close: 'Close',
    navigation: 'Navigation',
    settings: 'Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    english: 'en',
    russian: 'ru',
    lightIcon: '☼',
    darkIcon: '☾',
    tabs: {
      requirement: 'Requirements',
      qa: 'QA',
      review: 'Review',
      metrics: 'Metrics',
      llmLimits: 'LLM Limits',
    },
    placeholders: {
      qa: 'QA Agent is planned for the next module.',
      review: 'Code Review Agent is planned for the next module.',
      metrics: 'Metrics Dashboard is planned for the next module.',
    },
    requirement: {
      eyebrow: 'Requirement Analyst',
      title: 'Turn an idea into delivery-ready requirements',
      businessIdea: 'Business Idea *',
      productContext: 'Product Context',
      constraints: 'Constraints',
      businessPlaceholder: 'Add ability for users to dispute bonus charges',
      contextPlaceholder: 'B2C loyalty program with bonus point system',
      constraintsPlaceholder: 'Integrates with payment service, target release Q2',
      analyze: 'Analyze Requirement',
      analyzing: 'Analyzing...',
      clear: 'Clear',
      expectedOutput: 'Expected output',
      artifact: 'Structured artifact',
      review: 'Review',
      loading: 'Analyzing requirement with the configured LLM...',
      emptyTitle: 'Ready for analysis',
      emptyText: 'Fill in the idea and run the analyst to generate problem statement, story, criteria, risks, and tasks.',
      noItems: 'No items returned.',
      noProblem: 'No problem statement returned.',
      noStory: 'No user story returned.',
      failed: 'Failed to analyze requirement',
      error: 'Error analyzing requirement',
      sections: {
        problem: 'Problem Statement',
        story: 'User Story',
        criteria: 'Acceptance Criteria',
        tasks: 'Suggested Tasks',
        risks: 'Risks',
        dependencies: 'Dependencies',
        edgeCases: 'Edge Cases',
      },
    },
    limits: {
      eyebrow: 'LLM Controls',
      title: 'Current provider limits',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',
      loading: 'Loading current LLM limit data...',
      failed: 'Failed to load LLM limits',
      connected: 'is connected',
      provider: 'Provider',
      model: 'Model',
      plan: 'Plan',
      freeTier: 'Free tier',
      paid: 'Paid / BYOK',
      updated: 'Updated',
      creditUsage: 'Credit usage',
      noHardLimit: 'No hard limit',
      used: 'used',
      spent: 'spent',
      notSet: 'Not set',
      now: 'Now',
      unknown: 'Unknown',
      default: 'Default',
      stats: {
        limit: 'Limit',
        remaining: 'Remaining',
        usage: 'Usage',
        usageToday: 'Usage today',
        usageWeek: 'Usage week',
        usageMonth: 'Usage month',
        byokUsage: 'BYOK usage',
        byokDaily: 'BYOK daily',
        byokWeek: 'BYOK week',
        byokMonth: 'BYOK month',
        limitReset: 'Limit reset',
        keyExpires: 'Key expires',
        rateLimit: 'Rate limit',
      },
    },
  },
  ru: {
    subtitle: 'Рабочее место PDLC-агентов',
    apiConnected: 'API онлайн',
    apiError: 'Ошибка API',
    checking: 'Проверка',
    menu: 'Меню',
    close: 'Закрыть',
    navigation: 'Навигация',
    settings: 'Настройки',
    theme: 'Тема',
    light: 'Светлая',
    dark: 'Темная',
    language: 'Язык',
    english: 'en',
    russian: 'ru',
    lightIcon: '☼',
    darkIcon: '☾',
    tabs: {
      requirement: 'Требования',
      qa: 'QA',
      review: 'Ревью',
      metrics: 'Метрики',
      llmLimits: 'Лимиты LLM',
    },
    placeholders: {
      qa: 'QA Agent запланирован для следующего модуля.',
      review: 'Code Review Agent запланирован для следующего модуля.',
      metrics: 'Metrics Dashboard запланирован для следующего модуля.',
    },
    requirement: {
      eyebrow: 'Аналитик требований',
      title: 'Преобразовать идею в требования для разработки',
      businessIdea: 'Бизнес-идея *',
      productContext: 'Контекст продукта',
      constraints: 'Ограничения',
      businessPlaceholder: 'Добавить возможность оспаривать списания бонусов',
      contextPlaceholder: 'B2C loyalty program with bonus point system',
      constraintsPlaceholder: 'Интеграция с payment service, целевой релиз Q2',
      analyze: 'Проанализировать',
      analyzing: 'Анализ...',
      clear: 'Очистить',
      expectedOutput: 'Ожидаемый результат',
      artifact: 'Структурированный артефакт',
      review: 'Проверка',
      loading: 'Анализируем требование через настроенную LLM...',
      emptyTitle: 'Готово к анализу',
      emptyText: 'Заполни идею и запусти аналитика, чтобы получить problem statement, user story, критерии, риски и задачи.',
      noItems: 'Нет данных.',
      noProblem: 'Problem statement не вернулся.',
      noStory: 'User story не вернулась.',
      failed: 'Не удалось проанализировать требование',
      error: 'Ошибка анализа требования',
      sections: {
        problem: 'Problem Statement',
        story: 'User Story',
        criteria: 'Acceptance Criteria',
        tasks: 'Suggested Tasks',
        risks: 'Risks',
        dependencies: 'Dependencies',
        edgeCases: 'Edge Cases',
      },
    },
    limits: {
      eyebrow: 'Контроль LLM',
      title: 'Актуальные лимиты провайдера',
      refresh: 'Обновить',
      refreshing: 'Обновление...',
      loading: 'Загружаем актуальные лимиты LLM...',
      failed: 'Не удалось загрузить лимиты LLM',
      connected: 'подключен',
      provider: 'Провайдер',
      model: 'Модель',
      plan: 'План',
      freeTier: 'Free tier',
      paid: 'Paid / BYOK',
      updated: 'Обновлено',
      creditUsage: 'Расход кредитов',
      noHardLimit: 'Без жесткого лимита',
      used: 'использовано',
      spent: 'потрачено',
      notSet: 'Не задано',
      now: 'Сейчас',
      unknown: 'Неизвестно',
      default: 'По умолчанию',
      stats: {
        limit: 'Лимит',
        remaining: 'Остаток',
        usage: 'Расход',
        usageToday: 'Расход сегодня',
        usageWeek: 'Расход за неделю',
        usageMonth: 'Расход за месяц',
        byokUsage: 'BYOK расход',
        byokDaily: 'BYOK сегодня',
        byokWeek: 'BYOK неделя',
        byokMonth: 'BYOK месяц',
        limitReset: 'Сброс лимита',
        keyExpires: 'Ключ истекает',
        rateLimit: 'Rate limit',
      },
    },
  },
};

function readStoredValue(key, fallback, allowed) {
  const value = window.localStorage.getItem(key);
  return allowed.includes(value) ? value : fallback;
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="segmented-control" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? 'active' : ''}
          onClick={() => onChange(option.value)}
          title={option.title || option.label}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('requirement');
  const [apiStatus, setApiStatus] = useState('checking');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locale, setLocale] = useState(() => readStoredValue('ai-pdlc-locale', 'en', ['en', 'ru']));
  const [theme, setTheme] = useState(() => readStoredValue('ai-pdlc-theme', 'dark', ['light', 'dark']));

  const t = useMemo(() => translations[locale], [locale]);

  useEffect(() => {
    window.localStorage.setItem('ai-pdlc-locale', locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem('ai-pdlc-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error('API health check failed');
        }
        return res.json();
      })
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'));
  }, []);

  const iconSrc = theme === 'dark' ? '/ai_pdlc_team_icon.svg' : '/ai_pdlc_icon_light.svg';
  const statusText = apiStatus === 'ok' ? t.apiConnected : apiStatus === 'error' ? t.apiError : t.checking;

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <button
          type="button"
          className={`menu-button ${drawerOpen ? 'active' : ''}`}
          aria-label={t.menu}
          onClick={() => setDrawerOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>

        <img src={iconSrc} alt="" className="app-brand-icon" aria-hidden="true" />

        <div className="app-brand-copy">
          <h1>AI PDLC Development Team</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="header-spacer" />

        <div className={`api-status ${apiStatus}`} title={statusText}>
          <span className="status-dot" aria-hidden="true" />
          <span>{statusText}</span>
        </div>

        <SegmentedControl
          label={t.language}
          value={locale}
          onChange={setLocale}
          options={[
            { value: 'ru', label: t.russian },
            { value: 'en', label: t.english },
          ]}
        />

        <SegmentedControl
          label={t.theme}
          value={theme}
          onChange={setTheme}
          options={[
            { value: 'light', label: t.lightIcon, title: t.light },
            { value: 'dark', label: t.darkIcon, title: t.dark },
          ]}
        />
      </header>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} labels={t.tabs} variant="top" />

      <div
        className={`drawer-overlay ${drawerOpen ? 'visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-label={t.menu}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <img src={iconSrc} alt="" className="drawer-logo-icon" aria-hidden="true" />
            <div>
              <strong>AI PDLC</strong>
              <span>v0.1.0</span>
            </div>
          </div>
          <button type="button" className="drawer-close" aria-label={t.close} onClick={() => setDrawerOpen(false)}>
            ×
          </button>
        </div>

        <section className="drawer-section">
          <p className="drawer-section-title">{t.settings}</p>
          <div className="drawer-setting-row">
            <span>{t.language}</span>
            <SegmentedControl
              label={t.language}
              value={locale}
              onChange={setLocale}
              options={[
                { value: 'ru', label: t.russian },
                { value: 'en', label: t.english },
              ]}
            />
          </div>
          <div className="drawer-setting-row">
            <span>{t.theme}</span>
            <SegmentedControl
              label={t.theme}
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'light', label: t.lightIcon, title: t.light },
                { value: 'dark', label: t.darkIcon, title: t.dark },
              ]}
            />
          </div>
        </section>
      </aside>

      <main className="app-content">
        {activeTab === 'requirement' && <RequirementAnalyzer labels={t.requirement} />}
        {activeTab === 'qa' && <div className="placeholder">{t.placeholders.qa}</div>}
        {activeTab === 'code-review' && <div className="placeholder">{t.placeholders.review}</div>}
        {activeTab === 'metrics' && <div className="placeholder">{t.placeholders.metrics}</div>}
        {activeTab === 'llm-limits' && <LLMLimits labels={t.limits} />}
      </main>

      <footer className="app-footer">
        <p>AI PDLC v0.1.0</p>
      </footer>
    </div>
  );
}

export default App;
