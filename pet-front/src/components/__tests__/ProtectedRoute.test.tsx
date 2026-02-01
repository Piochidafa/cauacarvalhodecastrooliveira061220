import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

const isAuthenticated = vi.fn();

vi.mock('../../services/facades/authFacade', () => ({
  authFacade: {
    isAuthenticated: () => isAuthenticated()
  }
}));

describe('ProtectedRoute', () => {
  it('renderiza o conteudo quando autenticado', () => {
    isAuthenticated.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <div>Conteudo protegido</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Conteudo protegido')).toBeInTheDocument();
  });
});
