import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { LoginPage } from '../src/pages/LoginPage';

vi.mock('../src/lib/api', async () => {
  const actual = await vi.importActual<typeof import('../src/lib/api')>('../src/lib/api');
  return {
    ...actual,
    loginUser: vi.fn(),
  };
});

import { loginUser } from '../src/lib/api';

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(loginUser).mockReset();
  });

  it('submits credentials and navigates to /dashboard on success', async () => {
    vi.mocked(loginUser).mockResolvedValue({
      user: { id: 'u1', name: 'Teacher', email: 'teacher@example.com' },
      token: 'jwt',
    });
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'teacher@example.com');
    await user.type(screen.getByLabelText(/password/i), 'passw0rd-strong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(loginUser).toHaveBeenCalledWith({
      email: 'teacher@example.com',
      password: 'passw0rd-strong',
    });
  });

  it('shows error message on failed login', async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'badpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Invalid credentials');
  });
});
