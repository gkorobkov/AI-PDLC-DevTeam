import React from 'react';

function Navigation({ activeTab, setActiveTab, labels, variant = 'drawer' }) {
  const tabs = [
    { id: 'requirement', label: labels.requirement },
    { id: 'qa', label: labels.qa },
    { id: 'code-review', label: labels.review },
    { id: 'metrics', label: labels.metrics },
    { id: 'llm-limits', label: labels.llmLimits },
  ];

  return (
    <nav className={`nav nav-${variant}`} aria-label="Workspace sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.label}</span>
          {variant === 'drawer' && <span className="nav-arrow" aria-hidden="true">&gt;</span>}
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
