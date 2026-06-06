import React, { useState } from 'react';
import axios from 'axios';

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

function RequirementAnalyzer({ labels }) {
  const [businessIdea, setBusinessIdea] = useState('');
  const [productContext, setProductContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('/analyze-requirement', {
        business_idea: businessIdea,
        product_context: productContext,
        constraints,
      });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.error || labels.failed);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : detail?.error || err.message || labels.error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBusinessIdea('');
    setProductContext('');
    setConstraints('');
    setResult(null);
    setError(null);
  };

  return (
    <section className="workspace requirement-analyzer">
      <form className="input-panel" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h2>{labels.title}</h2>
          </div>
        </div>

        <div className="form-grid">
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
            {loading ? labels.analyzing : labels.analyze}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
            {labels.clear}
          </button>
        </div>
      </form>

      <aside className="output-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{labels.expectedOutput}</p>
            <h2>{labels.artifact}</h2>
          </div>
          {result?.human_review_required && <span className="panel-badge warning">{labels.review}</span>}
        </div>

        {loading && <div className="state-message">{labels.loading}</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && !result && (
          <div className="empty-state">
            <h3>{labels.emptyTitle}</h3>
            <p>{labels.emptyText}</p>
          </div>
        )}

        {result && (
          <div className="result">
            <div className="result-section span-2">
              <h3>{labels.sections.problem}</h3>
              <p>{result.problem_statement || labels.noProblem}</p>
            </div>

            <div className="result-section span-2">
              <h3>{labels.sections.story}</h3>
              <p>{result.user_story || labels.noStory}</p>
            </div>

            <div className="result-section">
              <h3>{labels.sections.criteria}</h3>
              <TextList items={result.acceptance_criteria} ordered emptyText={labels.noItems} />
            </div>

            <div className="result-section">
              <h3>{labels.sections.tasks}</h3>
              <TextList items={result.suggested_tasks} ordered emptyText={labels.noItems} />
            </div>

            <div className="result-section">
              <h3>{labels.sections.risks}</h3>
              <TextList items={result.risks} emptyText={labels.noItems} />
            </div>

            <div className="result-section">
              <h3>{labels.sections.dependencies}</h3>
              <TextList items={result.dependencies} emptyText={labels.noItems} />
            </div>

            <div className="result-section span-2">
              <h3>{labels.sections.edgeCases}</h3>
              <TextList items={result.edge_cases} emptyText={labels.noItems} />
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}

export default RequirementAnalyzer;
