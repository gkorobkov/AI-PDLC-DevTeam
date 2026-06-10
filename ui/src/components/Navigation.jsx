import React from 'react';

function Navigation({
  activeTab,
  setActiveTab,
  labels,
  variant = 'drawer',
  steps,
  metricsLabel,
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
        const isActive = activeTab === tab.id;
        return (
        <button
          key={tab.id}
          type="button"
          className={`nav-item ${isActive ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          aria-current={isActive ? 'step' : undefined}
        >
          <span className="nav-step-index">{index + 1}</span>
          <span className="nav-step-copy">
            <span>{tab.label}</span>
          </span>
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
          </span>
        </button>
      )}
    </nav>
  );
}

export default Navigation;
