import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from './App';


describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the application and healthy system status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'asyncops-api',
          database: 'connected',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'AsyncOps' }),
    ).toBeInTheDocument();

    expect(
      await screen.findByText('AsyncOps is online'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('API: healthy'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Database: connected'),
    ).toBeInTheDocument();
  });

  it('shows an error when the API is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 503,
      }),
    );

    render(<App />);

    expect(
      await screen.findByText(
        'Unable to connect to AsyncOps API.',
      ),
    ).toBeInTheDocument();
  });
});