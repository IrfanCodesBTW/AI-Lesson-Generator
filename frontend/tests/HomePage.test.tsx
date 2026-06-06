import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HomePage } from '../src/pages/HomePage';
import { vi } from 'vitest';

vi.mock('../src/lib/api', () => ({
  fetchHealth: vi.fn().mockResolvedValue({ ok: true, service: 'test', gemini: 'fallback' }),
}));

describe('HomePage', () => {
  it('renders welcome heading and shows backend status', async () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });
  });
});
