import { beforeEach, describe, expect, it, vi } from 'vitest';

const artistaServiceMocks = vi.hoisted(() => ({
  getArtistas: vi.fn(),
  searchArtistas: vi.fn(),
  getArtistaById: vi.fn(),
  createArtista: vi.fn(),
  updateArtista: vi.fn(),
  uploadArtistaImage: vi.fn(),
  removeArtistaImage: vi.fn(),
  deleteArtista: vi.fn()
}));

vi.mock('../../api/artistaService', () => ({
  default: artistaServiceMocks
}));

import artistaFacade from '../artistaFacade';

const pageResponse = {
  content: [{ id: 1, nome: 'A' }],
  totalPages: 1,
  totalElements: 1
};

describe('artistaFacade', () => {
  beforeEach(() => {
    artistaServiceMocks.getArtistas.mockReset();
    artistaServiceMocks.searchArtistas.mockReset();
    artistaServiceMocks.getArtistaById.mockReset();
    artistaServiceMocks.createArtista.mockReset();
    artistaServiceMocks.updateArtista.mockReset();
    artistaServiceMocks.uploadArtistaImage.mockReset();
    artistaServiceMocks.removeArtistaImage.mockReset();
    artistaServiceMocks.deleteArtista.mockReset();
  });

  it('loadArtistas updates list and pagination', async () => {
    artistaServiceMocks.getArtistas.mockResolvedValue(pageResponse);
    let list: any[] = [];
    let pagination: any = null;
    const listSub = artistaFacade.artistas$.subscribe((v) => (list = v));
    const paginationSub = artistaFacade.pagination$.subscribe((v) => (pagination = v));

    await artistaFacade.loadArtistas(0, 10, 'id', 'asc');

    expect(list.length).toBe(1);
    expect(pagination.totalElements).toBe(1);
    listSub.unsubscribe();
    paginationSub.unsubscribe();
  });

  it('searchArtistas updates list', async () => {
    artistaServiceMocks.searchArtistas.mockResolvedValue(pageResponse);
    let list: any[] = [];
    const sub = artistaFacade.artistas$.subscribe((v) => (list = v));

    await artistaFacade.searchArtistas('A');

    expect(list[0].nome).toBe('A');
    sub.unsubscribe();
  });

  it('getArtista returns artista', async () => {
    artistaServiceMocks.getArtistaById.mockResolvedValue({ id: 2, nome: 'B' });

    const result = await artistaFacade.getArtista(2);

    expect(result?.nome).toBe('B');
  });

  it('createArtista returns created and reloads list', async () => {
    artistaServiceMocks.createArtista.mockResolvedValue({ id: 3, nome: 'C' });
    artistaServiceMocks.getArtistas.mockResolvedValue(pageResponse);

    const result = await artistaFacade.createArtista({ nome: 'C' });

    expect(result?.id).toBe(3);
    expect(artistaServiceMocks.getArtistas).toHaveBeenCalled();
  });

  it('updateArtista returns updated and reloads list', async () => {
    artistaServiceMocks.updateArtista.mockResolvedValue({ id: 4, nome: 'D' });
    artistaServiceMocks.getArtistas.mockResolvedValue(pageResponse);

    const result = await artistaFacade.updateArtista(4, { nome: 'D' });

    expect(result?.nome).toBe('D');
    expect(artistaServiceMocks.getArtistas).toHaveBeenCalled();
  });

  it('uploadArtistaImage returns updated and reloads list', async () => {
    artistaServiceMocks.uploadArtistaImage.mockResolvedValue({ id: 5, nome: 'E', imageUrl: 'url' });
    artistaServiceMocks.getArtistas.mockResolvedValue(pageResponse);

    const result = await artistaFacade.uploadArtistaImage(5, new File(['a'], 'a.png'));

    expect(result?.imageUrl).toBe('url');
    expect(artistaServiceMocks.getArtistas).toHaveBeenCalled();
  });

  it('removeArtistaImage returns updated and reloads list', async () => {
    artistaServiceMocks.removeArtistaImage.mockResolvedValue({ id: 6, nome: 'F', imageUrl: null });
    artistaServiceMocks.getArtistas.mockResolvedValue(pageResponse);

    const result = await artistaFacade.removeArtistaImage(6);

    expect(result?.imageUrl).toBeNull();
    expect(artistaServiceMocks.getArtistas).toHaveBeenCalled();
  });

  it('deleteArtista returns true and reloads list', async () => {
    artistaServiceMocks.deleteArtista.mockResolvedValue(undefined);
    artistaServiceMocks.getArtistas.mockResolvedValue(pageResponse);

    const result = await artistaFacade.deleteArtista(7);

    expect(result).toBe(true);
    expect(artistaServiceMocks.getArtistas).toHaveBeenCalled();
  });

  it('clearError resets error state', async () => {
    artistaServiceMocks.getArtistas.mockRejectedValue(new Error('fail'));
    let error: string | null = null;
    const sub = artistaFacade.error$.subscribe((v) => (error = v));

    await artistaFacade.loadArtistas();
    artistaFacade.clearError();

    expect(error).toBeNull();
    sub.unsubscribe();
  });
});
