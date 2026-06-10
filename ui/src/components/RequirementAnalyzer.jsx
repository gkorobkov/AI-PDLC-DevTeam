import React, { useState } from 'react';
import axios from 'axios';

const MIN_ANALYSIS_SPINNER_MS = 2000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function TextList({ items, ordered = false, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  const ListTag = ordered ? 'ol' : 'ul';
  return (
    <ListTag>
      {items.map((item, idx) => (
        <li key={`${item}-${idx}`}>{item}</li>
      ))}
    </ListTag>
  );
}

function RequirementAnalyzer({
  labels,
  apiStatus = 'ok',
  onAnalysisStart,
  onAnalysisComplete,
  onRequirementConfirmed,
  onClear,
}) {
  const [businessIdea, setBusinessIdea] = useState('');
  const [productContext, setProductContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [requirementConfirmed, setRequirementConfirmed] = useState(false);
  const [developerConfirmed, setDeveloperConfirmed] = useState(false);
  const [developerOutput, setDeveloperOutput] = useState(null);
  const [testOutput, setTestOutput] = useState(null);
  const [showMockNotice, setShowMockNotice] = useState(false);

  const useCases = [
    {
      id: 1,
      title: 'Use Case 1',
      businessIdea: 'Автоматизировать обработку жалоб на ошибочные списания бонусов.',
      productContext: 'B2C loyalty platform, пользователи могут оспаривать транзакции через мобильное приложение.',
      constraints: 'Интеграция с платежной системой, GDPR-совместимость, релиз через 2 месяца.',
    },
    {
      id: 2,
      title: 'Use Case 2',
      businessIdea: 'Добавить управление скидками и бонусами в личном кабинете клиента.',
      productContext: 'Платежная система для розничной сети с накоплениями и промо-акциями.',
      constraints: 'Работа в offline-режиме, поддержка двух валют, строгие SLA на отклик.',
    },
    {
      id: 3,
      title: 'Use Case 3',
      businessIdea: 'Отслеживать риски транзакций и отправлять оповещения о подозрительной активности.',
      productContext: 'Финансовый сервис с рейтингами пользователей и динамическим скорингом.',
      constraints: 'Проверка AML, минимальная задержка, возможность быстро отключить правило.',
    },
  ];

  const mockAnalysisResponse = (input) => ({
    problem_statement: `Сформировать решение для: ${input.business_idea}`,
    user_story: `Как пользователь, я хочу ${input.business_idea.toLowerCase()} для улучшения опыта и снижения ошибок в системе.`,
    acceptance_criteria: [
      'Система принимает жалобы и подтверждает их получение.',
      'Пользователь видит статус обработки жалобы.',
      'Интеграция с внешней payment service работает в режиме реального времени.',
    ],
    suggested_tasks: [
      'Спроектировать модель данных для жалоб и транзакций.',
      'Разработать API для создания, просмотра и обновления статусов жалоб.',
      'Настроить мониторинг и алерты для сбойных интеграций.',
    ],
    risks: [
      'Задержка данных от платежного провайдера.',
      'Ошибочные статусы могут вести к неверной блокировке транзакций.',
      'Нарушение GDPR при обработке жалоб клиентов.',
    ],
    dependencies: [
      'Сервис платежной интеграции.',
      'Система уведомлений и email-оповещений.',
      'Компонент аутентификации и авторизации.',
    ],
    edge_cases: [
      'Клиент повторно отправляет одну и ту же жалобу.',
      'Платежная система временно недоступна.',
      'Жалоба не содержит достаточно данных для идентификации транзакции.',
    ],
    human_review_required: true,
  });

  const mockDeveloperResponse = (analysis) => `Developer Agent сформировал план реализации по требованию \"${analysis.problem_statement}\".\n\nОсновные действия:\n- Создать endpoint POST /complaints и модель жалобы.\n- Добавить в workflow проверку статуса транзакции и интеграцию с payment provider.\n- Обеспечить отображение статуса в личном кабинете.\n\nРезультат готов к тестированию.`;

  const mockTestResponse = (analysis) => `Test Agent сформировал список тестов для требования:\n- E2E сценарий обработки жалобы от клиента.\n- Тесты API на создание/чтение/обновление статуса жалобы.\n- Проверка поведения при недоступной payment service.`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingStartedAt = Date.now();
    let completedResult = null;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowMockNotice(false);
    setRequirementConfirmed(false);
    setDeveloperConfirmed(false);
    setDeveloperOutput(null);
    setTestOutput(null);
    onAnalysisStart?.();

    try {
      const response = await axios.post('/analyze-requirement', {
        business_idea: businessIdea,
        product_context: productContext,
        constraints,
      });

      if (response.data.success) {
        setResult(response.data.data);
        setShowMockNotice(false);
        completedResult = response.data.data;
      } else {
        const mockResult = mockAnalysisResponse({ business_idea: businessIdea, product_context: productContext, constraints });
        setError(response.data.error || labels.failed);
        setResult(mockResult);
        setShowMockNotice(true);
        completedResult = mockResult;
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : detail?.error || err.message || labels.error
      );
      const mockResult = mockAnalysisResponse({ business_idea: businessIdea, product_context: productContext, constraints });
      setResult(mockResult);
      setShowMockNotice(true);
      completedResult = mockResult;
    } finally {
      const elapsedMs = Date.now() - loadingStartedAt;
      if (elapsedMs < MIN_ANALYSIS_SPINNER_MS) {
        await wait(MIN_ANALYSIS_SPINNER_MS - elapsedMs);
      }
      setLoading(false);
      if (completedResult) {
        onAnalysisComplete?.(completedResult);
      }
    }
  };

  const handleUseCase = (useCase) => {
    setBusinessIdea(useCase.businessIdea);
    setProductContext(useCase.productContext);
    setConstraints(useCase.constraints);
    setResult(null);
    setError(null);
    setRequirementConfirmed(false);
    setDeveloperConfirmed(false);
    setDeveloperOutput(null);
    setTestOutput(null);
    setShowMockNotice(false);
  };

  const handleConfirmRequirement = () => {
    setRequirementConfirmed(true);
    setDeveloperOutput(mockDeveloperResponse(result));
    onRequirementConfirmed?.(result);
  };

  const handleConfirmDeveloper = () => {
    setDeveloperConfirmed(true);
    setTestOutput(mockTestResponse(result));
  };

  const handleClear = () => {
    setBusinessIdea('');
    setProductContext('');
    setConstraints('');
    setResult(null);
    setError(null);
    setRequirementConfirmed(false);
    setDeveloperConfirmed(false);
    setDeveloperOutput(null);
    setTestOutput(null);
    setShowMockNotice(false);
    onClear?.();
  };

  const artifact = result || {};
  const visibleArtifact = loading ? {} : artifact;
  const hasVisibleResult = !loading && Boolean(result);
  const artifactNoteText = loading
    ? labels.loading
    : error && !result
      ? error
      : result
        ? labels.artifactReadyNote
        : labels.emptyText;
  const artifactNoteTone = loading ? 'loading' : error && !result ? 'error' : result ? 'ready' : 'idle';

  return (
    <section className={`workspace requirement-analyzer ${loading || result ? 'is-artifact-focused' : ''}`}>
      <form className="input-panel" onSubmit={handleSubmit}>
        <div className="stage-agent-strip">
          <div className="stage-agent-copy">
            <strong>{labels.title}</strong>
            <span>{labels.emptyText}</span>
          </div>
          <span className={`stage-status ${businessIdea.trim() ? 'idle' : 'attention'}`}>
            {businessIdea.trim() ? labels.awaitingIdea : labels.emptyTitle}
          </span>
        </div>

        <div className="form-grid">
          <div className="use-case-group span-2">
            {useCases.map((item) => (
              <button
                key={item.id}
                type="button"
                className="btn btn-secondary btn-compact"
                onClick={() => handleUseCase(item)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="form-group span-2">
            <label htmlFor="business-idea">{labels.businessIdea}</label>
            <textarea
              id="business-idea"
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder={labels.businessPlaceholder}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-context">{labels.productContext}</label>
            <textarea
              id="product-context"
              value={productContext}
              onChange={(e) => setProductContext(e.target.value)}
              placeholder={labels.contextPlaceholder}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="constraints">{labels.constraints}</label>
            <textarea
              id="constraints"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder={labels.constraintsPlaceholder}
              rows={3}
            />
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading || !businessIdea.trim()}>
            {loading && <span className="btn-spinner" aria-hidden="true" />}
            <span>{loading ? labels.analyzing : labels.analyze}</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
            {labels.clear}
          </button>
        </div>
      </form>

      <aside className="output-panel">
        <div className="stage-agent-strip">
          <div className="stage-agent-copy">
            <strong>{labels.artifact}</strong>
            <span>{artifactNoteText}</span>
          </div>
          <div className="panel-heading-right">
            <span className={`stage-status ${hasVisibleResult ? 'idle' : 'attention'}`}>
              {hasVisibleResult ? labels.review : labels.awaitingIdea}
            </span>
            <span className={`api-unavailable ${showMockNotice ? '' : 'is-hidden'}`}>API недоступно</span>
          </div>
        </div>

        <div className={`artifact-note ${artifactNoteTone}`}>{artifactNoteText}</div>

          <div className="result">
            <div className="result-section span-2">
              <h3>{labels.sections.problem}</h3>
              <p className={!visibleArtifact.problem_statement ? 'muted' : undefined}>
                {visibleArtifact.problem_statement || labels.noProblem}
              </p>
            </div>

            <div className="result-section span-2">
              <h3>{labels.sections.story}</h3>
              <p className={!visibleArtifact.user_story ? 'muted' : undefined}>
                {visibleArtifact.user_story || labels.noStory}
              </p>
            </div>

            <div className="result-section">
              <h3>{labels.sections.criteria}</h3>
              <TextList items={visibleArtifact.acceptance_criteria} ordered emptyText={labels.noItems} />
            </div>

            <div className="result-section">
              <h3>{labels.sections.tasks}</h3>
              <TextList items={visibleArtifact.suggested_tasks} ordered emptyText={labels.noItems} />
            </div>

            <div className="result-section">
              <h3>{labels.sections.risks}</h3>
              <TextList items={visibleArtifact.risks} emptyText={labels.noItems} />
            </div>

            <div className="result-section">
              <h3>{labels.sections.dependencies}</h3>
              <TextList items={visibleArtifact.dependencies} emptyText={labels.noItems} />
            </div>

            <div className="result-section span-2">
              <h3>{labels.sections.edgeCases}</h3>
              <TextList items={visibleArtifact.edge_cases} emptyText={labels.noItems} />
            </div>
            {hasVisibleResult && (
              <div className="result-section span-2 agent-summary">
                <h3>{labels.agentPipelineTitle}</h3>
                <div className="agent-flow">
                  <div className="agent-card">
                    <strong>{labels.agentDeveloper}</strong>
                    <p>{labels.agentDeveloperHint}</p>
                    {!requirementConfirmed ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-compact"
                        onClick={handleConfirmRequirement}
                      >
                        {labels.agentConfirmRequirement}
                      </button>
                    ) : (
                      <pre>{developerOutput}</pre>
                    )}
                  </div>
                  <div className="agent-card">
                    <strong>{labels.agentTester}</strong>
                    <p>{labels.agentTesterHint}</p>
                    {requirementConfirmed && !developerConfirmed ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-compact"
                        onClick={handleConfirmDeveloper}
                      >
                        {labels.agentConfirmDeveloper}
                      </button>
                    ) : developerConfirmed ? (
                      <pre>{testOutput}</pre>
                    ) : (
                      <div className="muted">{labels.agentAwaitingDeveloper}</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
      </aside>
    </section>
  );
}

export default RequirementAnalyzer;
