import React from 'react';

function Navigation({
  activeTab,
  setActiveTab,
  labels,
  variant = 'drawer',
  steps,
  stepMeta = {},
  metricsLabel,
  metricsStatus,
  metricsOpen = false,
  onToggleMetrics,
}) {
  const tabs = steps || [
    { id: 'business-idea', label: labels.businessIdea },
    { id: 'requirements', label: labels.requirements },
    { id: 'architecture', label: labels.architecture },
    { id: 'development', label: labels.development },
    { id: 'code-review', label: labels.codeReview },
    { id: 'testing', label: labels.testing },
    { id: 'release', label: labels.release },
  ];

  return (
    <nav className={`nav nav-${variant}`} aria-label="PDLC workflow steps">
      {tabs.map((tab, index) => {
        const meta = stepMeta[tab.id] || {};
        const status = meta.status || 'idle';
        const isActive = activeTab === tab.id;
        const isWorking = status === 'analyzing' || status === 'in-progress';
        return (
        <button
          key={tab.id}
          type="button"
          className={`nav-item ${isActive ? 'active' : ''} status-${status}`}
          onClick={() => setActiveTab(tab.id)}
          aria-current={isActive ? 'step' : undefined}
        >
          <span className="nav-step-index">{index + 1}</span>
          <span className="nav-step-copy">
            <span>{tab.label}</span>
            {meta.caption && <small>{meta.caption}</small>}
          </span>
          <span className={`nav-progress ${isWorking ? 'visible' : ''}`} aria-hidden="true" />
          {variant === 'drawer' && <span className="nav-arrow" aria-hidden="true">&gt;</span>}
        </button>
        );
      })}
      {metricsLabel && (
        <button
          type="button"
          className={`nav-item nav-metrics ${metricsOpen ? 'active' : ''}`}
          onClick={onToggleMetrics}
          aria-pressed={metricsOpen}
        >
          <span className="nav-metrics-icon" aria-hidden="true">M</span>
          <span className="nav-step-copy">
            <span>{metricsLabel}</span>
            {metricsStatus && <small>{metricsStatus}</small>}
          </span>
          <span className="nav-progress" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}

export default Navigation;
