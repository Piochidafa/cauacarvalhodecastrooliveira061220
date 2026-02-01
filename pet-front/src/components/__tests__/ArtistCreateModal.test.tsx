import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ArtistCreateModal from '../ArtistCreateModal';

describe('ArtistCreateModal', () => {
  it('renderiza o formulário no happy path', () => {
    render(
      <ArtistCreateModal
        visible
        value="Artista Teste"
        loading={false}
        onChange={() => {}}
        onCancel={() => {}}
        onSave={() => {}}
        title="Novo Artista:"
        saveLabel="Salvar"
      />
    );

    expect(screen.getByText('Novo Artista:')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome do artista:')).toBeInTheDocument();
    expect(screen.getByLabelText('Imagem (opcional):')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
  });
});
