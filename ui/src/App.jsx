import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import RequirementAnalyzer from './components/RequirementAnalyzer';
import LLMLimits from './components/LLMLimits';
import Navigation from './components/Navigation';

const translations = {
  en: {
    subtitle: 'AI-Dev Team Platform',
    apiConnected: 'API online',
    apiError: 'API error',
    checking: 'Checking',
    menu: 'Menu',
    close: 'Close',
    navigation: 'Navigation',
    settings: 'Settings',
    theme: 'Theme',
    transitionSpeed: 'Slide speed',
    transitionFast: 'Fast',
    transitionNormal: 'Normal',
    transitionSlow: 'Slow',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    english: 'en',
    russian: 'ru',
    lightIcon: '☼',
    darkIcon: '☾',
    tabs: {
      businessIdea: 'Business idea',
      requirements: 'Requirements',
      architecture: 'Architecture',
      development: 'Development',
      codeReview: 'Code review',
      testing: 'Testing',
      release: 'Release',
      metrics: 'Metrics',
    },
    placeholders: {
      qa: 'QA Agent is planned for the next module.',
      review: 'Code Review Agent is planned for the next module.',
      metrics: 'Metrics Dashboard is planned for the next module.',
    },
    workflow: {
      captions: {
        businessIdea: 'Describe in plain words',
        requirements: 'Analyze into requirements',
        architecture: 'Architecture and specification',
        development: 'Implementation work',
        codeReview: 'Code quality gate',
        testing: 'QA validation',
        release: 'Deploy safely',
      },
      status: {
        needsInput: 'Needs input',
        awaitingAnalysis: 'Awaiting analysis',
        analyzing: 'Analyzing',
        ready: 'Ready',
        confirmed: 'Confirmed',
        waiting: 'Waiting',
        inProgress: 'In progress',
      },
      panels: {
        ideaTitle: 'Business Idea Intake Agent',
        ideaEyebrow: 'Business idea',
        ideaText: 'Describe the idea in plain language: what should change, for whom, and what constraints matter.',
        requirementsTitle: 'Requirement Analyst Agent',
        requirementsEyebrow: 'Requirements gate',
        requirementsText: 'Review or refine the generated problem statement, user story, acceptance criteria, risks, dependencies, and tasks.',
        requirementsInput: 'Requirement comments, priorities, or missing details',
        architectureTitle: 'Solution Architect Agent',
        architectureEyebrow: 'Architecture, specification',
        architectureText: 'Prepare architecture, technical specification, integration boundaries, data impact, security constraints, and tradeoffs.',
        architectureInput: 'Architecture notes, constraints, or target design',
        developmentTitle: 'Implementation Agent',
        developmentEyebrow: 'Development',
        buildText: 'Plan the implementation from the architecture artifact: APIs, components, data changes, task breakdown, code standards, and dependencies.',
        buildInput: 'Implementation notes, task plan, or code context',
        reviewTitle: 'Code Review Agent',
        reviewEyebrow: 'Code review',
        reviewText: 'Paste implementation notes or code diff. This step is highlighted until QA context or requirement output is available.',
        reviewInput: 'Code diff or implementation notes',
        testingTitle: 'QA / Test Agent',
        testingEyebrow: 'Testing',
        testingText: 'Generate and review functional, negative, edge-case, integration, and regression tests from the implementation artifact.',
        testingInput: 'Test notes, risks, or target coverage',
        releaseTitle: 'DevOps / Release Agent',
        releaseEyebrow: 'Release',
        releaseText: 'Check deployment readiness, rollback criteria, monitoring, operational risks, and Definition of Done before production rollout.',
        releaseInput: 'Release notes, deployment constraints, or rollback criteria',
        metricsTitle: 'Metrics',
        metricsEyebrow: 'Live metrics',
        metricsText: 'Track AI runs, acceptance rate, human review, risks, time savings, token usage, and provider limits as cross-cutting governance.',
        metricsInput: 'Management notes or metric focus',
      },
    },
    requirement: {
      eyebrow: 'Business Idea Intake Agent',
      title: 'Business idea',
      businessIdea: 'Business Idea *',
      productContext: 'Product Context',
      constraints: 'Constraints',
      businessPlaceholder: 'Add ability for users to dispute bonus charges',
      contextPlaceholder: 'B2C loyalty program with bonus point system',
      constraintsPlaceholder: 'Integrates with payment service, target release Q2',
      analyze: 'Analyze Requirement',
      analyzing: 'Analyzing...',
      clear: 'Clear',
      artifactEyebrow: 'PDLC artifact',
      artifact: 'Requirement artifact',
      review: 'Ready for review',
      awaitingIdea: 'Awaiting analysis',
      loading: 'Analyzing requirement with the configured LLM...',
      artifactReadyNote: 'Requirement artifact is ready. Review the sections before sending it to the next PDLC step.',
      emptyTitle: 'Ready for analysis',
      emptyText: 'Fill in the idea and run the analyst to generate problem statement, story, criteria, risks, and tasks.',
      noItems: 'No items returned.',
      noProblem: 'No problem statement returned.',
      noStory: 'No user story returned.',
      failed: 'Failed to analyze requirement',
      error: 'Error analyzing requirement',
      agentPipelineTitle: 'Agent workflow',
      agentDeveloper: 'Developer Agent',
      agentDeveloperHint: 'Creates a technical implementation plan from the requirement artifact.',
      agentConfirmRequirement: 'Confirm requirement',
      agentTester: 'Test Agent',
      agentTesterHint: 'Generates test cases after the implementation plan is confirmed.',
      agentConfirmDeveloper: 'Confirm implementation',
      agentAwaitingDeveloper: 'Waiting for developer plan...',
      sections: {
        problem: 'Problem statement',
        story: 'User story',
        criteria: 'Acceptance criteria',
        tasks: 'Development tasks',
        risks: 'Risks',
        dependencies: 'Dependencies',
        edgeCases: 'Edge cases',
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
    subtitle: 'AI-Dev Team Platform',
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
      businessIdea: 'Бизнес идея',
      requirements: 'Требования',
      architecture: 'Архитектура',
      development: 'Разработка',
      codeReview: 'Code review',
      testing: 'Тестирование',
      release: 'Релиз',
      metrics: 'Метрики',
    },
    placeholders: {
      qa: 'QA Agent запланирован для следующего модуля.',
      review: 'Code Review Agent запланирован для следующего модуля.',
      metrics: 'Metrics Dashboard запланирован для следующего модуля.',
    },
    workflow: {
      captions: {
        businessIdea: 'Описать простыми словами',
        requirements: 'Разобрать в требования',
        architecture: 'Архитектура и спецификация',
        development: 'Работа реализации',
        codeReview: 'Проверка кода',
        testing: 'QA-проверка',
        release: 'Безопасный выпуск',
      },
      status: {
        needsInput: 'Нужно заполнить',
        awaitingAnalysis: 'Ожидает анализа',
        analyzing: 'Анализ',
        ready: 'Готово',
        confirmed: 'Подтверждено',
        waiting: 'Ожидает входа',
        inProgress: 'В работе',
      },
      panels: {
        ideaTitle: 'Business Idea Intake Agent',
        ideaEyebrow: 'Бизнес идея',
        ideaText: 'Опиши идею простыми словами: что нужно изменить, для кого это делается и какие ограничения важны.',
        requirementsTitle: 'Requirement Analyst Agent',
        requirementsEyebrow: 'Требования',
        requirementsText: 'Проверь или уточни problem statement, user story, acceptance criteria, риски, зависимости и задачи.',
        requirementsInput: 'Комментарии к требованиям, приоритеты или недостающие детали',
        architectureTitle: 'Solution Architect Agent',
        architectureEyebrow: 'Архитектура, спецификация',
        architectureText: 'Подготовь архитектуру, техническую спецификацию, границы интеграций, влияние на данные, security constraints и tradeoffs.',
        architectureInput: 'Архитектурные заметки, ограничения или целевой дизайн',
        developmentTitle: 'Implementation Agent',
        developmentEyebrow: 'Разработка',
        buildText: 'Планирует реализацию по архитектурному артефакту: API, компоненты, изменения данных, декомпозиция задач, стандарты кода и зависимости.',
        buildInput: 'Заметки реализации, task plan или code context',
        reviewTitle: 'Code Review Agent',
        reviewEyebrow: 'Code review',
        reviewText: 'Вставь заметки по реализации или code diff. Шаг подсвечивается, пока нет входного артефакта требований или QA-контекста.',
        reviewInput: 'Code diff или заметки реализации',
        testingTitle: 'QA / Test Agent',
        testingEyebrow: 'Тестирование',
        testingText: 'Сформируй и проверь функциональные, негативные, пограничные, интеграционные и регрессионные тесты по артефакту реализации.',
        testingInput: 'Тестовые заметки, риски или целевое покрытие',
        releaseTitle: 'DevOps / Release Agent',
        releaseEyebrow: 'Релиз',
        releaseText: 'Проверяет deployment readiness, rollback criteria, monitoring, operational risks и Definition of Done перед выпуском в production.',
        releaseInput: 'Release notes, ограничения деплоя или rollback criteria',
        metricsTitle: 'Метрики',
        metricsEyebrow: 'Live metrics',
        metricsText: 'Отслеживай AI runs, acceptance rate, human review, риски, экономию времени, расход токенов и лимиты провайдера как сквозной governance.',
        metricsInput: 'Управленческие заметки или фокус метрик',
      },
    },
    requirement: {
      eyebrow: 'Агент бизнес-идеи',
      title: 'Бизнес идея',
      businessIdea: 'Бизнес-идея *',
      productContext: 'Контекст продукта',
      constraints: 'Ограничения',
      businessPlaceholder: 'Добавить возможность оспаривать списания бонусов',
      contextPlaceholder: 'B2C loyalty program with bonus point system',
      constraintsPlaceholder: 'Интеграция с payment service, целевой релиз Q2',
      analyze: 'Проанализировать',
      analyzing: 'Анализ...',
      clear: 'Очистить',
      artifactEyebrow: 'Артефакт PDLC',
      artifact: 'Артефакт требований',
      review: 'Готово к проверке',
      awaitingIdea: 'Ожидает анализа',
      loading: 'Анализируем требование через настроенную LLM...',
      artifactReadyNote: 'Артефакт сформирован. Проверь секции перед передачей на следующий PDLC-этап.',
      emptyTitle: 'Готово к анализу',
      emptyText: 'Заполни идею и запусти аналитика, чтобы получить problem statement, user story, критерии, риски и задачи.',
      noItems: 'Пока нет данных.',
      noProblem: 'Будет заполнено после анализа.',
      noStory: 'Будет заполнено после анализа.',
      failed: 'Не удалось проанализировать требование',
      error: 'Ошибка анализа требования',
      agentPipelineTitle: 'Рабочий процесс агентов',
      agentDeveloper: 'Агент-разработчик',
      agentDeveloperHint: 'Генерирует технический план по требованию.',
      agentConfirmRequirement: 'Подтвердить требование',
      agentTester: 'Агент тестирования',
      agentTesterHint: 'Готовит тесты на основе плана реализации.',
      agentConfirmDeveloper: 'Подтвердить реализацию',
      agentAwaitingDeveloper: 'Ожидание плана разработчика...',
      sections: {
        problem: 'Описание проблемы',
        story: 'Пользовательская история',
        criteria: 'Критерии приемки',
        tasks: 'Задачи разработки',
        risks: 'Риски',
        dependencies: 'Зависимости',
        edgeCases: 'Пограничные сценарии',
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

const APP_VERSION = '0.1.0';
const TRANSITION_SPEED_STEPS = [1.0, 1.5, 2.0, 2.5];

function getClosestTransitionSpeed(steps, value) {
  return steps.reduce((closest, step) => (
    Math.abs(step - value) < Math.abs(closest - value) ? step : closest
  ), steps[0]);
}

function readStoredTransitionSpeed() {
  const stored = Number(window.localStorage.getItem('ai-pdlc-transition-speed'));
  return TRANSITION_SPEED_STEPS.includes(stored) ? stored : getClosestTransitionSpeed(TRANSITION_SPEED_STEPS, 1.2);
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="segmented-control" aria-label={label} style={{ '--segment-count': options.length }}>
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

function StepSlider({ label, value, onChange, steps }) {
  const currentIndex = Math.max(0, steps.findIndex((step) => step === value));
  const displayValue = value.toFixed(1);

  return (
    <div
      className="step-slider"
      aria-label={label}
      style={{ '--slider-position': currentIndex / (steps.length - 1) }}
    >
      <output className="step-slider-value" htmlFor="transition-speed">
        {displayValue}s
      </output>
      <input
        id="transition-speed"
        type="range"
        min="0"
        max={steps.length - 1}
        step="1"
        value={currentIndex}
        onChange={(event) => onChange(steps[Number(event.target.value)])}
        aria-label={label}
        aria-valuetext={`${displayValue} seconds`}
      />
      <div className="step-slider-ticks" aria-hidden="true">
        {steps.map((step) => (
          <span key={step} />
        ))}
      </div>
    </div>
  );
}

function WorkflowStagePanel({
  title,
  description,
  inputLabel,
  value,
  onChange,
  statusText,
  needsAttention,
  upstreamSummary,
}) {
  return (
    <section className={`workspace workflow-stage-panel ${needsAttention ? 'needs-attention' : ''}`}>
      <div className="stage-card">
        <div className="stage-agent-strip">
          <div className="stage-agent-copy">
            <strong>{title}</strong>
            <span>{description}</span>
          </div>
        </div>

        <div className="stage-body">
          {upstreamSummary && (
            <div className="stage-upstream">
              <h3>Input artifact</h3>
              <p>{upstreamSummary}</p>
            </div>
          )}
          <div className="form-group stage-input">
            <label htmlFor={`${title}-input`}>{inputLabel}</label>
            <textarea
              id={`${title}-input`}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              rows={7}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function formatStepText(step, locale) {
  if (!step) {
    return '';
  }
  return locale === 'ru' ? step.label : step.label.toLowerCase();
}

function getArtifactTitle(step, locale) {
  if (!step) {
    return locale === 'ru' ? 'Финальный артефакт' : 'Final artifact';
  }
  const ruTitles = {
    requirements: 'Артефакт требований',
    architecture: 'Архитектурная спецификация',
    development: 'План разработки',
    'code-review': 'Артефакт code review',
    testing: 'План тестирования',
    release: 'Релизный пакет',
  };
  const enTitles = {
    requirements: 'Requirement artifact',
    architecture: 'Architecture specification',
    development: 'Development plan',
    'code-review': 'Code review artifact',
    testing: 'Test plan',
    release: 'Release package',
  };
  return (locale === 'ru' ? ruTitles : enTitles)[step.id] || step.label;
}

function createArtifact(step, source, locale) {
  const sourceText = source?.trim() || (locale === 'ru' ? 'Входной артефакт предыдущего этапа.' : 'Previous stage input artifact.');
  const ru = {
    requirements: [
      { title: 'Описание проблемы', body: `Сформировать решение для: ${sourceText}` },
      { title: 'Пользовательская история', body: `Как пользователь, я хочу получить изменение "${sourceText}", чтобы улучшить продуктовый опыт и снизить операционные ошибки.` },
      { title: 'Критерии приемки', items: ['Пользователь видит понятный сценарий работы.', 'Система сохраняет статус обработки.', 'Ошибки и спорные состояния логируются.'] },
      { title: 'Риски', items: ['Недостаточно бизнес-контекста.', 'Не подтверждены ограничения интеграций.', 'Нужна проверка юридических требований.'] },
    ],
    architecture: [
      { title: 'Целевая схема', body: 'Определить сервисы, API-контракты, модели данных и границы ответственности компонентов.' },
      { title: 'Интеграции', items: ['Проверить платежный контур.', 'Согласовать события уведомлений.', 'Зафиксировать требования к аудиту.'] },
      { title: 'Нефункциональные требования', items: ['SLA на обработку операций.', 'Трассировка запросов.', 'Контроль доступа и защита данных.'] },
    ],
    development: [
      { title: 'План реализации', items: ['Подготовить модели данных и миграции.', 'Реализовать API и бизнес-логику.', 'Добавить обработку ошибок и мониторинг.'] },
      { title: 'Definition of Done', items: ['Код покрыт тестами.', 'Контракты согласованы.', 'Фича готова к ревью.'] },
    ],
    'code-review': [
      { title: 'Фокус ревью', items: ['Корректность бизнес-логики.', 'Безопасность и обработка ошибок.', 'Поддерживаемость кода и границы модулей.'] },
      { title: 'Открытые вопросы', body: 'Проверить спорные решения до передачи в тестирование.' },
    ],
    testing: [
      { title: 'Тестовые сценарии', items: ['Happy path.', 'Ошибки интеграций.', 'Повторная отправка операции.', 'Права доступа и аудит.'] },
      { title: 'Регрессия', body: 'Проверить смежные сценарии, которые используют тот же платежный и уведомительный контур.' },
    ],
    release: [
      { title: 'План релиза', items: ['Фича-флаг включен.', 'Мониторинг настроен.', 'Rollback-критерии согласованы.'] },
      { title: 'Операционная готовность', body: 'Поддержка понимает сценарий, алерты и коммуникации с пользователями.' },
    ],
  };
  const en = {
    requirements: [
      { title: 'Problem statement', body: `Create a solution for: ${sourceText}` },
      { title: 'User story', body: `As a user, I want "${sourceText}" so the product experience improves and operational errors go down.` },
      { title: 'Acceptance criteria', items: ['The user has a clear workflow.', 'The system stores processing status.', 'Errors and disputed states are logged.'] },
      { title: 'Risks', items: ['Business context may be incomplete.', 'Integration constraints are not confirmed.', 'Legal requirements need review.'] },
    ],
    architecture: [
      { title: 'Target design', body: 'Define services, API contracts, data models, and component ownership boundaries.' },
      { title: 'Integrations', items: ['Validate payment flow.', 'Align notification events.', 'Document audit requirements.'] },
      { title: 'Non-functional requirements', items: ['Processing SLA.', 'Request tracing.', 'Access control and data protection.'] },
    ],
    development: [
      { title: 'Implementation plan', items: ['Prepare data models and migrations.', 'Build APIs and business logic.', 'Add error handling and monitoring.'] },
      { title: 'Definition of Done', items: ['Code is covered by tests.', 'Contracts are aligned.', 'Feature is ready for review.'] },
    ],
    'code-review': [
      { title: 'Review focus', items: ['Business logic correctness.', 'Security and error handling.', 'Code maintainability and module boundaries.'] },
      { title: 'Open questions', body: 'Resolve disputed implementation decisions before testing.' },
    ],
    testing: [
      { title: 'Test scenarios', items: ['Happy path.', 'Integration failures.', 'Repeated operation submission.', 'Access rights and audit.'] },
      { title: 'Regression', body: 'Check adjacent workflows that use the same payment and notification paths.' },
    ],
    release: [
      { title: 'Release plan', items: ['Feature flag is ready.', 'Monitoring is configured.', 'Rollback criteria are agreed.'] },
      { title: 'Operational readiness', body: 'Support understands the workflow, alerts, and user communication path.' },
    ],
  };
  return {
    title: getArtifactTitle(step, locale),
    generatedAt: new Date().toISOString(),
    sections: ((locale === 'ru' ? ru : en)[step.id] || [{ title: step.label, body: sourceText }]),
  };
}

function artifactToText(artifact) {
  if (!artifact) {
    return '';
  }
  return artifact.sections
    .map((section) => {
      const content = section.body || section.items?.join('\n') || '';
      return `${section.title}\n${content}`;
    })
    .join('\n\n');
}

function createManualArtifact(step, text, locale) {
  return {
    title: getArtifactTitle(step, locale),
    generatedAt: new Date().toISOString(),
    sections: [
      {
        title: locale === 'ru' ? 'Ручной ввод' : 'Manual input',
        body: text,
      },
    ],
  };
}

function clampArtifactField(text) {
  if (!text || text.length <= 160) {
    return text;
  }
  return `${text.slice(0, 157)}...`;
}

function createStageArtifact(step, source, locale, filled = true) {
  const sourceText = source?.trim() || (locale === 'ru' ? 'Контекст предыдущего этапа пока не заполнен.' : 'Previous stage context is not filled yet.');
  const blank = '';
  const value = (text) => (filled ? clampArtifactField(text) : blank);
  const list = (...items) => (filled ? items : ['']);
  const ru = {
    'business-idea': [
      { title: 'Бизнес-идея', body: value(sourceText) },
      { title: 'Контекст продукта', body: value('B2C loyalty platform: пользователи видят бонусы, транзакции и обращения в мобильном приложении.') },
      { title: 'Ограничения', body: value('Интеграция с платежным провайдером, аудит спорных операций, релиз без влияния на текущие начисления.') },
    ],
    requirements: [
      { title: 'Описание проблемы', body: value(`Нужно снизить ручную обработку и ошибки в процессе: ${sourceText}`) },
      { title: 'Пользовательская история', body: value(`Как клиент программы лояльности, я хочу подать и отслеживать спор по бонусной операции, чтобы быстро исправить ошибочное списание.`) },
      { title: 'Критерии приемки', items: list('Пользователь создает спор из истории операций.', 'Система показывает статус рассмотрения.', 'Все решения и ошибки логируются для аудита.') },
      { title: 'Риски', items: list('Недостаточный контекст платежной операции.', 'Несогласованные юридические сроки рассмотрения.', 'Ошибочная повторная обработка одного спора.') },
      { title: 'Зависимости', items: list('Платежный провайдер.', 'Сервис уведомлений.', 'Компонент истории бонусных операций.') },
      { title: 'Пограничные сценарии', items: list('Повторная отправка одного спора.', 'Недоступен платежный провайдер.', 'Операция уже была компенсирована вручную.') },
      { title: 'Задачи разработки', items: list('Спроектировать модель спора.', 'Добавить API создания и просмотра споров.', 'Добавить статусы, аудит и уведомления.') },
    ],
    architecture: [
      { title: 'Входной артефакт требований', body: value(sourceText) },
      { title: 'Целевая архитектура', body: value('Добавить dispute-service между UI, bonus-ledger и payment-adapter. Хранить состояние спора отдельно от транзакции.') },
      { title: 'API и контракты', items: list('POST /bonus-disputes', 'GET /bonus-disputes/{id}', 'GET /transactions/{id}/dispute-status') },
      { title: 'Данные', items: list('dispute_id, transaction_id, reason, status, audit_events.', 'Индексы по user_id и transaction_id.', 'Срок хранения аудита не меньше 24 месяцев.') },
      { title: 'Интеграции', items: list('payment-adapter для проверки операции.', 'notification-service для смены статуса.', 'admin console для ручного решения.') },
      { title: 'НФТ и безопасность', items: list('P95 ответа API до 400 мс.', 'PII маскируется в логах.', 'Все смены статуса трассируются.') },
    ],
    development: [
      { title: 'Входная спецификация', body: value(sourceText) },
      { title: 'План реализации', items: list('Создать миграции и модель dispute.', 'Реализовать REST API и проверки идемпотентности.', 'Добавить UI-состояния создания и просмотра спора.') },
      { title: 'Компоненты кода', items: list('dispute-service', 'mobile loyalty UI', 'admin console', 'payment-adapter client') },
      { title: 'Наблюдаемость', items: list('Метрики создания, решения и ошибок.', 'Correlation ID на весь workflow.', 'Алерт на рост отказов провайдера.') },
      { title: 'Definition of Done', items: list('Контракты покрыты тестами.', 'Feature flag настроен.', 'Документация API обновлена.') },
    ],
    'code-review': [
      { title: 'Входной артефакт разработки', body: value(sourceText) },
      { title: 'Фокус ревью', items: list('Корректность переходов статусов.', 'Идемпотентность создания спора.', 'Отсутствие PII в логах.') },
      { title: 'Критичные проверки', items: list('Нет возможности открыть два активных спора на одну операцию.', 'Ошибки провайдера не теряют пользовательский запрос.', 'Права доступа проверяются на каждом API.') },
      { title: 'Запросы на исправление', items: list('Добавить тест на повторный submit.', 'Уточнить обработку timeout payment-adapter.', 'Проверить миграцию индексов на больших таблицах.') },
    ],
    testing: [
      { title: 'Входной артефакт ревью', body: value(sourceText) },
      { title: 'Функциональные тесты', items: list('Создание спора по валидной операции.', 'Просмотр статуса спора.', 'Получение уведомления при смене статуса.') },
      { title: 'Негативные сценарии', items: list('Повторный спор по той же операции.', 'Недоступен платежный провайдер.', 'Операция принадлежит другому пользователю.') },
      { title: 'Регрессия', items: list('История операций.', 'Начисление и списание бонусов.', 'Уведомления личного кабинета.') },
      { title: 'Тестовые данные', body: value('Набор операций: успешная покупка, возврат, ручная корректировка, операция без бонусов.') },
    ],
    release: [
      { title: 'Входной тестовый артефакт', body: value(sourceText) },
      { title: 'План релиза', items: list('Включить feature flag для 5% пользователей.', 'Проверить метрики ошибок и SLA.', 'Расширить rollout после 24 часов стабильности.') },
      { title: 'Rollback', items: list('Отключить feature flag.', 'Оставить API read-only для существующих споров.', 'Сохранить аудит созданных обращений.') },
      { title: 'Мониторинг', items: list('dispute_create_error_rate', 'payment_adapter_timeout_rate', 'median_resolution_time') },
      { title: 'Коммуникации', body: value('Поддержка получает шаблоны ответов и инструкцию по ручной эскалации спорных операций.') },
    ],
  };
  const en = {
    'business-idea': [
      { title: 'Business idea', body: value(sourceText) },
      { title: 'Product context', body: value('B2C loyalty platform where customers view bonus balance, transactions, and support requests in a mobile app.') },
      { title: 'Constraints', body: value('Payment provider integration, disputed-operation audit trail, release without affecting current accruals.') },
    ],
    requirements: [
      { title: 'Problem statement', body: value(`Reduce manual handling and operational errors in: ${sourceText}`) },
      { title: 'User story', body: value('As a loyalty customer, I want to submit and track a bonus-operation dispute so an incorrect charge can be resolved quickly.') },
      { title: 'Acceptance criteria', items: list('The user creates a dispute from transaction history.', 'The system shows processing status.', 'All decisions and errors are logged for audit.') },
      { title: 'Risks', items: list('Payment-operation context is incomplete.', 'Legal response windows are not aligned.', 'The same dispute can be processed twice.') },
      { title: 'Dependencies', items: list('Payment provider.', 'Notification service.', 'Bonus transaction history component.') },
      { title: 'Edge cases', items: list('Duplicate dispute submission.', 'Payment provider unavailable.', 'Operation was already compensated manually.') },
      { title: 'Development tasks', items: list('Design dispute data model.', 'Add create/view dispute APIs.', 'Add statuses, audit trail, and notifications.') },
    ],
    architecture: [
      { title: 'Requirements input', body: value(sourceText) },
      { title: 'Target architecture', body: value('Add dispute-service between UI, bonus-ledger, and payment-adapter. Store dispute state separately from transaction state.') },
      { title: 'API contracts', items: list('POST /bonus-disputes', 'GET /bonus-disputes/{id}', 'GET /transactions/{id}/dispute-status') },
      { title: 'Data model', items: list('dispute_id, transaction_id, reason, status, audit_events.', 'Indexes by user_id and transaction_id.', 'Audit retention at least 24 months.') },
      { title: 'Integrations', items: list('payment-adapter for transaction verification.', 'notification-service for status updates.', 'admin console for manual resolution.') },
      { title: 'NFR and security', items: list('API P95 under 400 ms.', 'PII masked in logs.', 'Every status change is traceable.') },
    ],
    development: [
      { title: 'Architecture input', body: value(sourceText) },
      { title: 'Implementation plan', items: list('Create migrations and dispute model.', 'Implement REST API and idempotency checks.', 'Add UI states for create and view flows.') },
      { title: 'Code areas', items: list('dispute-service', 'mobile loyalty UI', 'admin console', 'payment-adapter client') },
      { title: 'Observability', items: list('Metrics for creation, resolution, and errors.', 'Correlation ID across the workflow.', 'Alert on provider error spike.') },
      { title: 'Definition of Done', items: list('Contracts covered by tests.', 'Feature flag configured.', 'API documentation updated.') },
    ],
    'code-review': [
      { title: 'Development input', body: value(sourceText) },
      { title: 'Review focus', items: list('Status transition correctness.', 'Dispute creation idempotency.', 'No PII leakage in logs.') },
      { title: 'Critical checks', items: list('No two active disputes for one transaction.', 'Provider errors do not lose user request.', 'Access control is enforced on every API.') },
      { title: 'Required changes', items: list('Add duplicate-submit test.', 'Clarify payment-adapter timeout handling.', 'Check index migration on large tables.') },
    ],
    testing: [
      { title: 'Review input', body: value(sourceText) },
      { title: 'Functional tests', items: list('Create dispute for valid transaction.', 'View dispute status.', 'Receive notification after status change.') },
      { title: 'Negative tests', items: list('Duplicate dispute for the same transaction.', 'Payment provider unavailable.', 'Operation belongs to another user.') },
      { title: 'Regression', items: list('Transaction history.', 'Bonus accrual and charge flows.', 'Customer account notifications.') },
      { title: 'Test data', body: value('Transactions: successful purchase, refund, manual adjustment, operation without bonus points.') },
    ],
    release: [
      { title: 'Testing input', body: value(sourceText) },
      { title: 'Release plan', items: list('Enable feature flag for 5% of users.', 'Watch error and SLA metrics.', 'Expand rollout after 24 stable hours.') },
      { title: 'Rollback', items: list('Disable feature flag.', 'Keep API read-only for existing disputes.', 'Preserve audit for created requests.') },
      { title: 'Monitoring', items: list('dispute_create_error_rate', 'payment_adapter_timeout_rate', 'median_resolution_time') },
      { title: 'Comms', body: value('Support receives response templates and manual escalation instructions for disputed operations.') },
    ],
  };
  return {
    title: getArtifactTitle(step, locale),
    generatedAt: new Date().toISOString(),
    sections: ((locale === 'ru' ? ru : en)[step.id] || [{ title: step.label, body: value(sourceText) }]),
  };
}

function createBusinessIdeaArtifact(source, locale, useCaseIndex = 0) {
  const ruUseCases = [
    {
      idea: 'Автоматизировать обработку жалоб на ошибочные списания бонусов.',
      context: 'B2C loyalty platform: пользователи видят баланс бонусов, историю транзакций и обращения в мобильном приложении.',
      constraints: 'Интеграция с платежной системой, GDPR-совместимость, релиз через 2 месяца, обязательный аудит спорных операций.',
    },
    {
      idea: 'Добавить управление скидками и бонусами в личном кабинете клиента.',
      context: 'Клиенты хотят видеть активные скидки, доступные бонусы, сроки действия и историю изменений без обращения в поддержку.',
      constraints: 'Нужно синхронизироваться с CRM и promo engine, сохранить текущие правила лояльности и не ломать checkout.',
    },
    {
      idea: 'Отслеживать риски транзакций и отправлять уведомления о подозрительной активности.',
      context: 'Финансовые операции проходят через мобильное приложение, а пользователю важно быстро понимать, почему операция помечена как рискованная.',
      constraints: 'Требуется низкая задержка уведомлений, интеграция с risk scoring, журналирование причин и ручная эскалация.',
    },
  ];
  const enUseCases = [
    {
      idea: 'Automate handling complaints about incorrect bonus charges.',
      context: 'B2C loyalty platform where customers view bonus balance, transactions, and support requests in a mobile app.',
      constraints: 'Payment provider integration, GDPR compatibility, release in 2 months, disputed-operation audit trail.',
    },
    {
      idea: 'Add discount and bonus management to the customer account.',
      context: 'Customers need to see active discounts, available bonuses, expiration dates, and change history without contacting support.',
      constraints: 'Synchronize with CRM and promo engine, preserve current loyalty rules, and avoid checkout regressions.',
    },
    {
      idea: 'Track transaction risks and notify users about suspicious activity.',
      context: 'Financial operations happen in the mobile app, and users need clear reasons when an operation is marked risky.',
      constraints: 'Low notification latency, risk scoring integration, reason audit trail, and manual escalation path.',
    },
  ];
  const selected = (locale === 'ru' ? ruUseCases : enUseCases)[useCaseIndex] || (locale === 'ru' ? ruUseCases[0] : enUseCases[0]);
  const idea = source?.trim() || selected.idea;
  return {
    title: getArtifactTitle({ id: 'business-idea', label: locale === 'ru' ? 'Бизнес идея' : 'Business idea' }, locale),
    generatedAt: new Date().toISOString(),
    sections: locale === 'ru'
      ? [
          { title: 'Бизнес-идея', body: idea },
          { title: 'Контекст продукта', body: selected.context },
          { title: 'Ограничения', body: selected.constraints },
        ]
      : [
          { title: 'Business idea', body: idea },
          { title: 'Product context', body: selected.context },
          { title: 'Constraints', body: selected.constraints },
        ],
  };
}

function getSectionEditorRows(section) {
  const text = section.items ? section.items.join('\n') : section.body || '';
  if (!text.trim()) {
    return 3;
  }
  const visualLines = text
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / 64)), 0);
  return Math.min(10, Math.max(2, visualLines + 1));
}

function ArtifactPreview({ artifact, emptyText, onChange }) {
  if (!artifact) {
    return <div className="artifact-empty">{emptyText}</div>;
  }
  const handleSectionChange = (index, value, field) => {
    const sections = artifact.sections.map((section, sectionIndex) => {
      if (sectionIndex !== index) {
        return section;
      }
      if (field === 'items') {
        return {
          ...section,
          items: value.split('\n'),
        };
      }
      return {
        ...section,
        body: value,
      };
    });
    onChange?.({ ...artifact, sections });
  };
  return (
    <div className={`artifact-preview sections-${artifact.sections.length}`}>
      {artifact.sections.map((section, index) => (
        <div className="result-section" key={section.title}>
          <h3>{section.title}</h3>
          <textarea
            className="artifact-editor"
            placeholder={emptyText}
            value={section.items ? section.items.join('\n') : section.body || ''}
            onChange={(event) => handleSectionChange(index, event.target.value, section.items ? 'items' : 'body')}
            rows={getSectionEditorRows(section)}
          />
        </div>
      ))}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('business-idea');
  const [apiStatus, setApiStatus] = useState('checking');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [locale, setLocale] = useState(() => readStoredValue('ai-pdlc-locale', 'en', ['en', 'ru']));
  const [theme, setTheme] = useState(() => readStoredValue('ai-pdlc-theme', 'dark', ['light', 'dark']));
  const [transitionSpeed, setTransitionSpeed] = useState(readStoredTransitionSpeed);
  const [requirementArtifact, setRequirementArtifact] = useState(null);
  const [requirementConfirmed, setRequirementConfirmed] = useState(false);
  const [requirementAnalyzing, setRequirementAnalyzing] = useState(false);
  const [requirementsNotes, setRequirementsNotes] = useState('');
  const [architectureNotes, setArchitectureNotes] = useState('');
  const [buildNotes, setBuildNotes] = useState('');
  const [testingNotes, setTestingNotes] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [metricsNotes, setMetricsNotes] = useState('');
  const [stageInputs, setStageInputs] = useState({});
  const [stageArtifacts, setStageArtifacts] = useState({});
  const [stageAnalysis, setStageAnalysis] = useState({});
  const [stageWorking, setStageWorking] = useState(null);
  const [expandedArtifact, setExpandedArtifact] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const touchStartRef = useRef(null);

  const t = useMemo(() => translations[locale], [locale]);
  const workflowSteps = useMemo(() => [
    { id: 'business-idea', label: t.tabs.businessIdea, caption: t.workflow.captions.businessIdea },
    { id: 'requirements', label: t.tabs.requirements, caption: t.workflow.captions.requirements },
    { id: 'architecture', label: t.tabs.architecture, caption: t.workflow.captions.architecture },
    { id: 'development', label: t.tabs.development, caption: t.workflow.captions.development },
    { id: 'code-review', label: t.tabs.codeReview, caption: t.workflow.captions.codeReview },
    { id: 'testing', label: t.tabs.testing, caption: t.workflow.captions.testing },
    { id: 'release', label: t.tabs.release, caption: t.workflow.captions.release },
  ], [t]);

  const activeStepIndex = Math.max(0, workflowSteps.findIndex((step) => step.id === activeTab));
  const activeStep = workflowSteps[activeStepIndex] || workflowSteps[0];
  const nextStep = workflowSteps[activeStepIndex + 1] || null;
  const activeInput = stageInputs[activeStep?.id] || '';
  const activeArtifact = stageArtifacts[activeStep?.id];
  const nextArtifact = nextStep ? stageArtifacts[nextStep.id] : null;
  const nextInput = nextStep ? stageInputs[nextStep.id] || '' : '';
  const isWorkingCurrent = stageWorking === activeStep?.id;
  const canGenerateNext = Boolean(nextStep && (activeInput.trim() || activeArtifact));
  const canConfirmNext = Boolean(nextStep && (nextArtifact || nextInput.trim()));
  const requirementSummary = requirementArtifact?.problem_statement || requirementArtifact?.user_story || '';
  const metricsStatus = metricsNotes.trim() || releaseNotes.trim() ? t.workflow.status.ready : t.workflow.status.waiting;
  const activeSource = activeInput || activeArtifact?.sections?.map((section) => section.body || section.items?.join(' ')).filter(Boolean).join(' ') || requirementSummary;
  const uiText = locale === 'ru'
    ? {
        analysisTitle: 'Что проверить перед следующим этапом',
        analyze: 'Проанализировать',
        analyzing: 'Анализ...',
        analyzeHelp: 'Агент подскажет, чего не хватает для следующего этапа и какие риски стоит закрыть до формирования артефакта.',
        generate: `Сформировать ${formatStepText(nextStep, locale)}`,
        generating: 'Формирование...',
        generateHelp: nextStep ? `Сформировать артефакт для этапа «${nextStep.label}» и раскрыть правую панель для проверки.` : 'Следующего этапа нет.',
        confirm: `Подтвердить ${formatStepText(nextStep, locale)}`,
        nextReady: 'Готово к проверке',
        nextWaiting: 'Ожидает формирования',
        emptyArtifact: nextStep ? `Нажми «Сформировать ${nextStep.label}», чтобы получить артефакт следующего этапа.` : 'PDLC-цепочка завершена.',
        inputLabel: activeStep?.id === 'business-idea' ? 'Бизнес-идея, контекст и ограничения' : 'Входные данные, уточнения или замечания',
        inputPlaceholder: activeStep?.id === 'business-idea'
          ? 'Опиши идею простыми словами: что меняем, для кого, какие ограничения важны.'
          : 'Добавь уточнения к текущему этапу перед анализом или формированием следующего артефакта.',
        currentReady: 'Активный этап',
        finalTitle: 'PDLC завершен',
        finalDescription: 'Все этапы сформированы. Проверь метрики и релизные сигналы.',
      }
    : {
        analysisTitle: 'What to check before the next stage',
        analyze: 'Analyze',
        analyzing: 'Analyzing...',
        analyzeHelp: 'The agent will point out what is missing for the next stage and which risks should be closed before generating the artifact.',
        generate: `Generate ${formatStepText(nextStep, locale)}`,
        generating: 'Generating...',
        generateHelp: nextStep ? `Generate the artifact for "${nextStep.label}" and expand the right panel for review.` : 'There is no next stage.',
        confirm: `Confirm ${formatStepText(nextStep, locale)}`,
        nextReady: 'Ready for review',
        nextWaiting: 'Awaiting generation',
        emptyArtifact: nextStep ? `Click "Generate ${nextStep.label}" to create the next-stage artifact.` : 'The PDLC chain is complete.',
        inputLabel: activeStep?.id === 'business-idea' ? 'Business idea, context, and constraints' : 'Input data, refinements, or notes',
        inputPlaceholder: activeStep?.id === 'business-idea'
          ? 'Describe the idea in plain words: what changes, for whom, and which constraints matter.'
          : 'Add refinements for the current stage before analysis or next artifact generation.',
        currentReady: 'Active stage',
        finalTitle: 'PDLC complete',
        finalDescription: 'All stages are generated. Check metrics and release signals.',
      };

  useEffect(() => {
    window.localStorage.setItem('ai-pdlc-locale', locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem('ai-pdlc-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('ai-pdlc-transition-speed', String(transitionSpeed));
  }, [transitionSpeed]);

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

  useEffect(() => {
    if (!window.matchMedia) {
      setIsNarrowScreen(window.innerWidth <= 640);
      return undefined;
    }
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsNarrowScreen(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const iconSrc = theme === 'dark' ? '/ai_pdlc_team_icon.svg' : '/ai_pdlc_icon_light.svg';
  const headerBotIconSrc = '/favicon.svg';
  const statusText = apiStatus === 'ok' ? t.apiConnected : apiStatus === 'error' ? t.apiError : t.checking;
  const handleRequirementAnalysisStart = () => {
    setRequirementAnalyzing(true);
    setRequirementConfirmed(false);
    setActiveTab('requirements');
  };
  const handleRequirementAnalysisComplete = (artifact) => {
    setRequirementArtifact(artifact);
    setRequirementAnalyzing(false);
    setActiveTab('requirements');
  };
  const handleRequirementConfirm = (artifact) => {
    setRequirementArtifact(artifact);
    setRequirementConfirmed(true);
    setActiveTab('requirements');
  };
  const handleTabSelect = (stepId) => {
    setActiveTab(stepId);
    setExpandedArtifact(false);
    setIsAdvancing(false);
  };
  const goToStepIndex = (index) => {
    const target = workflowSteps[index];
    if (!target) {
      return;
    }
    setActiveTab(target.id);
    setExpandedArtifact(Boolean(stageArtifacts[workflowSteps[index + 1]?.id]));
    setIsAdvancing(false);
  };
  const goPrev = () => goToStepIndex(Math.max(0, activeStepIndex - 1));
  const goNext = () => goToStepIndex(Math.min(workflowSteps.length - 1, activeStepIndex + 1));
  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event) => {
    if (!touchStartRef.current) {
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const delta = isNarrowScreen ? dy : dx;
    if (Math.abs(delta) > 56) {
      if (delta < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    touchStartRef.current = null;
  };
  const handleStageInput = (value) => {
    setStageInputs((current) => ({ ...current, [activeStep.id]: value }));
  };
  const handleNextInput = (value) => {
    if (!nextStep) {
      return;
    }
    setStageInputs((current) => ({ ...current, [nextStep.id]: value }));
  };
  const handleNextArtifactChange = (artifact) => {
    if (!nextStep) {
      return;
    }
    setStageArtifacts((current) => ({ ...current, [nextStep.id]: artifact }));
  };
  const setInputForStep = (stepId, value) => {
    setStageInputs((current) => ({ ...current, [stepId]: value }));
  };
  const setArtifactForStep = (stepId, artifact) => {
    setStageArtifacts((current) => ({ ...current, [stepId]: artifact }));
  };
  const analyzeStep = (step, followingStep) => {
    if (!step) {
      return;
    }
    setStageWorking(step.id);
    window.setTimeout(() => {
      setStageAnalysis((current) => ({
        ...current,
        [step.id]: locale === 'ru'
          ? [
              followingStep ? `Для этапа «${followingStep.label}» нужен проверяемый входной артефакт.` : 'Следующего этапа нет.',
              'Проверь ограничения, зависимости и критерии приемки до формирования.',
              'Если контекст неполный, добавь уточнение в левую панель.',
            ]
          : [
              followingStep ? `The "${followingStep.label}" stage needs a reviewable input artifact.` : 'There is no next stage.',
              'Check constraints, dependencies, and acceptance criteria before generation.',
              'If the context is incomplete, add a refinement in the left panel.',
            ],
      }));
      setStageWorking(null);
    }, 650);
  };
  const generateNextForStep = (step, followingStep) => {
    if (!step || !followingStep) {
      return;
    }
    const source = stageInputs[step.id]
      || stageArtifacts[step.id]?.sections?.map((section) => section.body || section.items?.join(' ')).filter(Boolean).join(' ')
      || requirementSummary;
    if (!source.trim() && !stageArtifacts[step.id]) {
      return;
    }
    setStageWorking(step.id);
    setExpandedArtifact(true);
    window.setTimeout(() => {
      setStageArtifacts((current) => ({
        ...current,
        [followingStep.id]: createStageArtifact(followingStep, source, locale),
      }));
      setStageWorking(null);
    }, 750);
  };
  const confirmNextForStep = (index) => {
    const followingStep = workflowSteps[index + 1];
    if (!followingStep) {
      return;
    }
    const artifact = stageArtifacts[followingStep.id]
      || createManualArtifact(followingStep, stageInputs[followingStep.id] || '', locale);
    if (!artifact && !(stageInputs[followingStep.id] || '').trim()) {
      return;
    }
    setStageArtifacts((current) => ({ ...current, [followingStep.id]: artifact }));
    setStageInputs((current) => ({ ...current, [followingStep.id]: artifactToText(artifact) }));
    setExpandedArtifact(false);
    goToStepIndex(index + 1);
  };
  const handleAnalyzeStage = () => {
    if (!activeStep) {
      return;
    }
    setStageWorking(activeStep.id);
    window.setTimeout(() => {
      setStageAnalysis((current) => ({
        ...current,
        [activeStep.id]: locale === 'ru'
          ? [
              nextStep ? `Для этапа «${nextStep.label}» нужен проверяемый входной артефакт.` : 'Следующего этапа нет.',
              'Проверь ограничения, зависимости и критерии приемки до формирования.',
              'Если контекст неполный, добавь уточнение в левую панель.',
            ]
          : [
              nextStep ? `The "${nextStep.label}" stage needs a reviewable input artifact.` : 'There is no next stage.',
              'Check constraints, dependencies, and acceptance criteria before generation.',
              'If the context is incomplete, add a refinement in the left panel.',
            ],
      }));
      setStageWorking(null);
    }, 650);
  };
  const handleGenerateNext = () => {
    if (!nextStep || !canGenerateNext) {
      return;
    }
    setStageWorking(activeStep.id);
    setExpandedArtifact(true);
    window.setTimeout(() => {
      setStageArtifacts((current) => ({
        ...current,
        [nextStep.id]: createStageArtifact(nextStep, activeSource, locale),
      }));
      setStageWorking(null);
    }, 750);
  };
  const handleConfirmNext = () => {
    if (!nextStep || !canConfirmNext || isAdvancing) {
      return;
    }
    const artifactToConfirm = nextArtifact || createManualArtifact(nextStep, nextInput, locale);
    setStageArtifacts((current) => ({
      ...current,
      [nextStep.id]: artifactToConfirm,
    }));
    setStageInputs((current) => ({
      ...current,
      [nextStep.id]: artifactToText(artifactToConfirm),
    }));
    setIsAdvancing(true);
    window.setTimeout(() => {
      setActiveTab(nextStep.id);
      setExpandedArtifact(false);
      setIsAdvancing(false);
    }, 1050);
  };

  const renderStagePair = (step, index) => {
    const followingStep = workflowSteps[index + 1] || null;
    const stepInput = stageInputs[step.id] || '';
    const stepArtifact = stageArtifacts[step.id];
    const followingArtifact = followingStep ? stageArtifacts[followingStep.id] : null;
    const followingInput = followingStep ? stageInputs[followingStep.id] || '' : '';
    const working = stageWorking === step.id;
    const canGenerate = Boolean(followingStep && (stepInput.trim() || stepArtifact));
    const canGoForward = Boolean(followingStep && (followingArtifact || followingInput.trim()));
    const slideText = locale === 'ru'
      ? {
          inputLabel: step.id === 'business-idea' ? 'Бизнес-идея, контекст и ограничения' : 'Входные данные, уточнения или замечания',
          inputPlaceholder: step.id === 'business-idea'
            ? 'Опиши идею простыми словами: что меняем, для кого, какие ограничения важны.'
            : 'Добавь уточнения к текущему этапу перед анализом или формированием следующего артефакта.',
          analyze: 'Проанализировать',
          analyzing: 'Анализ...',
          analyzeHelp: 'Агент подскажет, чего не хватает для следующего этапа.',
          generate: `Сформировать ${formatStepText(followingStep, locale)}`,
          generating: 'Формирование...',
          generateHelp: followingStep ? `Сформировать артефакт для этапа «${followingStep.label}».` : 'Следующего этапа нет.',
          back: 'Назад',
          next: 'Далее',
          active: 'Активный этап',
          nextReady: 'Готово к проверке',
          nextWaiting: 'Ожидает формирования',
          emptyArtifact: followingStep ? `Можно ввести данные вручную или нажать «Сформировать ${followingStep.label}».` : 'PDLC-цепочка завершена.',
          finalTitle: 'PDLC завершен',
          finalDescription: 'Все этапы сформированы.',
        }
      : {
          inputLabel: step.id === 'business-idea' ? 'Business idea, context, and constraints' : 'Input data, refinements, or notes',
          inputPlaceholder: step.id === 'business-idea'
            ? 'Describe the idea in plain words: what changes, for whom, and which constraints matter.'
            : 'Add refinements for the current stage before analysis or next artifact generation.',
          analyze: 'Analyze',
          analyzing: 'Analyzing...',
          analyzeHelp: 'The agent will point out what is missing for the next stage.',
          generate: `Generate ${formatStepText(followingStep, locale)}`,
          generating: 'Generating...',
          generateHelp: followingStep ? `Generate the artifact for "${followingStep.label}".` : 'There is no next stage.',
          back: 'Back',
          next: 'Next',
          active: 'Active stage',
          nextReady: 'Ready for review',
          nextWaiting: 'Awaiting generation',
          emptyArtifact: followingStep ? `Enter data manually or click "Generate ${followingStep.label}".` : 'The PDLC chain is complete.',
          finalTitle: 'PDLC complete',
          finalDescription: 'All stages are generated.',
        };

    return (
      <section
        className={`stage-pair ${followingArtifact ? 'artifact-expanded' : 'awaiting-next-artifact'}`}
        aria-label={step.label}
      >
        <div className="stage-card current-stage-card">
          <div className="stage-agent-strip">
            <div className="stage-agent-copy">
              <strong>{step.label}</strong>
              <span>{step.caption}</span>
            </div>
          </div>

          {step.id === 'business-idea' && (
            <div className="use-case-group span-2">
              {[
                locale === 'ru'
                  ? 'Автоматизировать обработку жалоб на ошибочные списания бонусов.'
                  : 'Automate handling complaints about incorrect bonus charges.',
                locale === 'ru'
                  ? 'Добавить управление скидками и бонусами в личном кабинете клиента.'
                  : 'Add discount and bonus management to the customer account.',
                locale === 'ru'
                  ? 'Отслеживать риски транзакций и отправлять уведомления о подозрительной активности.'
                  : 'Track transaction risks and notify about suspicious activity.',
              ].map((text, useCaseIndex) => (
                <button
                  key={text}
                  type="button"
                  className="btn btn-secondary btn-compact"
                  onClick={() => setInputForStep(step.id, text)}
                >
                  Use Case {useCaseIndex + 1}
                </button>
              ))}
            </div>
          )}

          <div className="form-group stage-main-input">
            <label htmlFor={`${step.id}-input`}>{slideText.inputLabel}</label>
            <textarea
              id={`${step.id}-input`}
              value={stepInput}
              onChange={(event) => setInputForStep(step.id, event.target.value)}
              placeholder={slideText.inputPlaceholder}
              rows={8}
            />
          </div>

          {stageAnalysis[step.id] && (
            <div className="stage-analysis-note">
              <h3>{locale === 'ru' ? 'Что проверить перед следующим этапом' : 'What to check before the next stage'}</h3>
              <ul>
                {stageAnalysis[step.id].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}

        </div>

        <div className={`stage-card next-stage-card ${followingArtifact ? 'is-ready' : 'is-awaiting'}`}>
          <div className="stage-agent-strip">
            <div className="stage-agent-copy">
              <strong>{followingStep ? followingStep.label : slideText.finalTitle}</strong>
              <span>{followingStep ? followingStep.caption : slideText.finalDescription}</span>
            </div>
          </div>

          {followingArtifact ? (
            <ArtifactPreview
              artifact={followingArtifact}
              emptyText={slideText.emptyArtifact}
              onChange={(artifact) => followingStep && setArtifactForStep(followingStep.id, artifact)}
            />
          ) : (
            <div className="form-group next-draft-input">
              <label htmlFor={`${followingStep?.id || 'final'}-draft`}>
                {followingStep ? followingStep.label : slideText.finalTitle}
              </label>
              <textarea
                id={`${followingStep?.id || 'final'}-draft`}
                value={followingInput}
                onChange={(event) => followingStep && setInputForStep(followingStep.id, event.target.value)}
                placeholder={slideText.emptyArtifact}
                rows={10}
              />
            </div>
          )}
        </div>

        <div className="stage-flow-footer">
          <button type="button" className="btn btn-secondary flow-back" onClick={goPrev} disabled={index === 0}>
            {slideText.back}
          </button>
          <button
            type="button"
            className="btn btn-secondary action-with-help flow-analyze"
            onClick={() => analyzeStep(step, followingStep)}
            disabled={working}
          >
            {working ? <span className="btn-spinner" aria-hidden="true" /> : null}
            <span>{working ? slideText.analyzing : slideText.analyze}</span>
            <small>{slideText.analyzeHelp}</small>
          </button>
          <button
            type="button"
            className="btn btn-primary action-with-help flow-generate"
            onClick={() => generateNextForStep(step, followingStep)}
            disabled={!canGenerate || working}
          >
            {working ? <span className="btn-spinner" aria-hidden="true" /> : null}
            <span>{working ? slideText.generating : slideText.generate}</span>
            <small>{slideText.generateHelp}</small>
          </button>
          <button
            type="button"
            className="btn btn-primary flow-next"
            onClick={() => confirmNextForStep(index)}
            disabled={!canGoForward}
          >
            {slideText.next}
          </button>
        </div>
      </section>
    );
  };

  const renderStagePanel = (step, index) => {
    const followingStep = workflowSteps[index + 1] || null;
    const stepInput = stageInputs[step.id] || '';
    const stepArtifact = stageArtifacts[step.id];
    const displayedArtifact = stepArtifact || createStageArtifact(step, stepInput, locale, false);
    const working = stageWorking === step.id;
    const canGenerate = Boolean(followingStep && (stepInput.trim() || stepArtifact));
    const canMoveToThisStep = index === 0 || Boolean(stepArtifact || stepInput.trim());
    const inputLabel = step.id === 'business-idea'
      ? (locale === 'ru' ? 'Бизнес-идея, контекст и ограничения' : 'Business idea, context, and constraints')
      : (locale === 'ru' ? 'Входные данные, уточнения или замечания' : 'Input data, refinements, or notes');
    const inputPlaceholder = step.id === 'business-idea'
      ? (locale === 'ru'
        ? 'Опиши идею простыми словами: что меняем, для кого, какие ограничения важны.'
        : 'Describe the idea in plain words: what changes, for whom, and which constraints matter.')
      : (locale === 'ru'
        ? 'Добавь уточнения к текущему этапу перед анализом или формированием следующего артефакта.'
        : 'Add refinements for the current stage before analysis or next artifact generation.');
    const actionText = locale === 'ru'
      ? {
          analyze: 'Проанализировать',
          analyzing: 'Анализ...',
          generate: `Сформировать ${formatStepText(followingStep, locale)}`,
          generating: 'Формирование...',
          back: 'Назад',
          next: 'Далее',
          active: 'Активный этап',
          ready: 'Готово к переходу',
          waiting: 'Ожидает входа',
          complete: 'Финальный этап',
        }
      : {
          analyze: 'Analyze',
          analyzing: 'Analyzing...',
          generate: `Generate ${formatStepText(followingStep, locale)}`,
          generating: 'Generating...',
          back: 'Back',
          next: 'Next',
          active: 'Active stage',
          ready: 'Ready to enter',
          waiting: 'Awaiting input',
          complete: 'Final stage',
        };
    const statusText = index === activeStepIndex
      ? actionText.active
      : canMoveToThisStep ? actionText.ready : actionText.waiting;
    const contextButtonText = locale === 'ru' ? 'Контекст' : 'Context';
    const useCaseOptions = [
      locale === 'ru'
        ? 'Автоматизировать обработку жалоб на ошибочные списания бонусов.'
        : 'Automate handling complaints about incorrect bonus charges.',
      locale === 'ru'
        ? 'Добавить управление скидками и бонусами в личном кабинете клиента.'
        : 'Add discount and bonus management to the customer account.',
      locale === 'ru'
        ? 'Отслеживать риски транзакций и отправлять уведомления о подозрительной активности.'
        : 'Track transaction risks and notify about suspicious activity.',
    ];

    return (
      <section className="stage-card stage-panel-card" aria-label={step.label}>
        <div className="stage-agent-strip">
          <div className="stage-agent-copy">
            <strong>{step.label}</strong>
          </div>
          {step.id === 'business-idea' ? (
            <div className="panel-context-actions use-case-group">
              {useCaseOptions.map((text, useCaseIndex) => (
                <button
                  key={text}
                  type="button"
                  className="btn btn-secondary btn-compact context-action"
                  onClick={() => {
                    const artifact = createBusinessIdeaArtifact(text, locale, useCaseIndex);
                    setInputForStep(step.id, artifactToText(artifact));
                    setArtifactForStep(step.id, artifact);
                  }}
                >
                  Use Case {useCaseIndex + 1}
                </button>
              ))}
            </div>
          ) : (
            <div className="panel-context-actions">
              <button type="button" className="btn btn-secondary btn-compact context-action">
                {contextButtonText}
              </button>
            </div>
          )}
        </div>

        <div className="stage-panel-body">
          <ArtifactPreview
            artifact={displayedArtifact}
            emptyText={inputPlaceholder}
            onChange={(artifact) => setArtifactForStep(step.id, artifact)}
          />

          {stageAnalysis[step.id] && (
            <div className="stage-analysis-note">
              <h3>{locale === 'ru' ? 'Что проверить перед следующим этапом' : 'What to check before the next stage'}</h3>
              <ul>
                {stageAnalysis[step.id].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className={`stage-panel-footer ${index === 0 ? 'no-back' : ''} ${index === workflowSteps.length - 1 ? 'no-forward' : ''}`}>
          {index > 0 && (
            <button type="button" className="btn btn-transition flow-back" onClick={goPrev}>
              {actionText.back}
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary action-with-help flow-analyze"
            onClick={() => analyzeStep(step, followingStep)}
          >
            {working ? <span className="btn-spinner" aria-hidden="true" /> : null}
            <span>{working ? actionText.analyzing : actionText.analyze}</span>
          </button>
          {followingStep && (
            <button
              type="button"
              className="btn btn-primary action-with-help flow-generate"
              onClick={() => generateNextForStep(step, followingStep)}
            >
              {working ? <span className="btn-spinner" aria-hidden="true" /> : null}
              <span>{working ? actionText.generating : actionText.generate}</span>
            </button>
          )}
          {index < workflowSteps.length - 1 && (
            <button
              type="button"
              className="btn btn-transition flow-next"
              onClick={goNext}
            >
              {actionText.next}
            </button>
          )}
        </div>
      </section>
    );
  };

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

        <img src={headerBotIconSrc} alt="" className="app-brand-icon" aria-hidden="true" />

        <div className="app-brand-copy">
          <h1>AI PDLC Development Team</h1>
          <p>
            <span>{t.subtitle}</span>
            <span>v{APP_VERSION}</span>
          </p>
        </div>

        <img src={iconSrc} alt="" className="app-brand-icon app-brand-team-icon" aria-hidden="true" />

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

      <Navigation
        activeTab={activeTab}
        setActiveTab={handleTabSelect}
        labels={t.tabs}
        variant="top"
        steps={workflowSteps}
        metricsLabel={t.tabs.metrics}
        metricsOpen={metricsOpen}
        onToggleMetrics={() => setMetricsOpen((value) => !value)}
      />

      <div
        className={`drawer-overlay ${drawerOpen ? 'visible' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className={`drawer ${drawerOpen ? 'open' : ''}`} aria-label={t.menu}>
        <div className="drawer-header">
          <button type="button" className="drawer-close" aria-label={t.close} onClick={() => setDrawerOpen(false)}>
            &times;
          </button>
          <div className="drawer-logo">
            <img src={iconSrc} alt="" className="drawer-logo-icon" aria-hidden="true" />
            <div>
              <strong>AI PDLC</strong>
              <span>v{APP_VERSION}</span>
            </div>
          </div>
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
          <div className="drawer-setting-row">
            <span>{t.transitionSpeed || (locale === 'ru' ? '\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0441\u043b\u0430\u0439\u0434\u0430' : 'Slide speed')}</span>
            <StepSlider
              label={t.transitionSpeed || (locale === 'ru' ? '\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0441\u043b\u0430\u0439\u0434\u0430' : 'Slide speed')}
              value={transitionSpeed}
              onChange={setTransitionSpeed}
              steps={TRANSITION_SPEED_STEPS}
            />
          </div>
        </section>
      </aside>

      <main className="app-content">
        <div
          className="stage-carousel"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="stage-train"
            style={{
              '--stage-count': workflowSteps.length,
              '--stage-index': activeStepIndex,
              '--stage-visible': isNarrowScreen ? 1 : 2,
              '--stage-transition': `${transitionSpeed}s`,
            }}
          >
            {workflowSteps.map((step, index) => (
              <div
                className={`stage-slide ${index === activeStepIndex ? 'active stage-current' : ''} ${index === activeStepIndex + 1 ? 'stage-next' : ''}`}
                key={step.id}
                aria-hidden={index < activeStepIndex || index > activeStepIndex + 1}
              >
                {renderStagePanel(step, index)}
              </div>
            ))}
          </div>
        </div>
      </main>

      <aside className={`metrics-drawer ${metricsOpen ? 'open' : ''}`} aria-label={t.tabs.metrics}>
        <WorkflowStagePanel
          title={t.workflow.panels.metricsTitle}
          description={t.workflow.panels.metricsText}
          inputLabel={t.workflow.panels.metricsInput}
          value={metricsNotes}
          onChange={setMetricsNotes}
          statusText={metricsStatus}
          needsAttention={!metricsNotes.trim()}
          upstreamSummary={releaseNotes || testingNotes || reviewNotes || buildNotes || requirementSummary}
        />
        <div className="stage-governance-panel">
          <LLMLimits labels={t.limits} />
        </div>
      </aside>

      <footer className="app-footer">
        <p>AI PDLC v{APP_VERSION}</p>
      </footer>
    </div>
  );
}

export default App;
