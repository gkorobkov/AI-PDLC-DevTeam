import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import axios from 'axios';
import App from './App';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the app header', async () => {
    render(<App />);
    const header = await screen.findByText('AI PDLC Development Team');
    expect(header).toBeTruthy();
  });

  it('generates the next-stage artifact and confirms it into the active tab', async () => {
    render(<App />);

    fireEvent.click(screen.getByText('Use Case 1'));
    fireEvent.click(screen.getByRole('button', { name: /Generate requirements/i }));

    await screen.findByText('Problem statement');
    const activeNextButton = document.querySelector('.stage-slide.stage-current .stage-panel-footer .flow-next');
    expect(activeNextButton).toBeTruthy();
    expect(activeNextButton.disabled).toBe(false);
    fireEvent.click(activeNextButton);

    await waitFor(() => {
      const requirementsTab = screen
        .getAllByRole('button', { name: /Requirements/i })
        .find((button) => button.className.includes('nav-item'));
      expect(requirementsTab?.getAttribute('aria-current')).toBe('step');
      expect(document.querySelector('.stage-train')?.getAttribute('style')).toContain('--stage-index: 1');
    }, { timeout: 2500 });
  }, 10000);

  it('opens metrics as a separate right-side drawer', async () => {
    render(<App />);
    await screen.findByText('API online');

    const metricsButton = screen.getByRole('button', { name: /Metrics/i });
    fireEvent.click(metricsButton);

    expect(metricsButton.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('Metrics').className).toContain('open');
  });

  it('moves carousel by exactly one panel from any visible next or back button', async () => {
    render(<App />);

    const train = document.querySelector('.stage-train');
    const rightPanelNext = document.querySelector('.stage-slide.stage-next .flow-next');
    expect(rightPanelNext).toBeTruthy();

    fireEvent.click(rightPanelNext);
    await waitFor(() => {
      expect(train?.getAttribute('style')).toContain('--stage-index: 1');
    });

    const rightPanelBack = document.querySelector('.stage-slide.stage-next .flow-back');
    expect(rightPanelBack).toBeTruthy();
    fireEvent.click(rightPanelBack);
    await waitFor(() => {
      expect(train?.getAttribute('style')).toContain('--stage-index: 0');
    });
  });
});
