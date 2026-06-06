import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ status: 'healthy' }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the app header', async () => {
    render(<App />);
    const header = await screen.findByText('AI PDLC Development Team');
    expect(header).toBeTruthy();
  });
});
