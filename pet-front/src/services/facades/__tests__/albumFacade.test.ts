import { beforeEach, describe, expect, it, vi } from 'vitest';

const albumServiceMocks = vi.hoisted(() => ({
  getAlbuns: vi.fn(),
  getAlbunsByArtista: vi.fn(),
  getAlbumById: vi.fn(),
  createAlbum: vi.fn(),
  updateAlbum: vi.fn(),
  deleteAlbum: vi.fn(),
  adicionarArtistaAlbum: vi.fn(),
  removerArtistaAlbum: vi.fn()
}));

vi.mock('../../api/albumService', () => ({
  default: albumServiceMocks
}));

import albumFacade from '../albumFacade';

const pageResponse = {
  content: [{ id: 1, nome: 'A' }],
  totalPages: 1,
  totalElements: 1
};

describe('albumFacade', () => {
  beforeEach(() => {
    albumServiceMocks.getAlbuns.mockReset();
    albumServiceMocks.getAlbunsByArtista.mockReset();
    albumServiceMocks.getAlbumById.mockReset();
    albumServiceMocks.createAlbum.mockReset();
    albumServiceMocks.updateAlbum.mockReset();
    albumServiceMocks.deleteAlbum.mockReset();
    albumServiceMocks.adicionarArtistaAlbum.mockReset();
    albumServiceMocks.removerArtistaAlbum.mockReset();
  });

  it('loadAlbuns updates list and pagination', async () => {
    albumServiceMocks.getAlbuns.mockResolvedValue(pageResponse);
    let list: any[] = [];
    let pagination: any = null;
    const listSub = albumFacade.albuns$.subscribe((v) => (list = v));
    const paginationSub = albumFacade.pagination$.subscribe((v) => (pagination = v));

    await albumFacade.loadAlbuns(0, 10);

    expect(list.length).toBe(1);
    expect(pagination.totalElements).toBe(1);
    listSub.unsubscribe();
    paginationSub.unsubscribe();
  });

  it('loadAlbunsByArtista updates list', async () => {
    albumServiceMocks.getAlbunsByArtista.mockResolvedValue(pageResponse);
    let list: any[] = [];
    const sub = albumFacade.albuns$.subscribe((v) => (list = v));

    await albumFacade.loadAlbunsByArtista(1, 0, 10);

    expect(list[0].nome).toBe('A');
    sub.unsubscribe();
  });

  it('getAlbum returns album', async () => {
    albumServiceMocks.getAlbumById.mockResolvedValue({ id: 2, nome: 'B' });

    const result = await albumFacade.getAlbum(2);

    expect(result?.nome).toBe('B');
  });

  it('createAlbum returns created and reloads list', async () => {
    albumServiceMocks.createAlbum.mockResolvedValue({ id: 3, nome: 'C' });
    albumServiceMocks.getAlbuns.mockResolvedValue(pageResponse);

    const result = await albumFacade.createAlbum({ nome: 'C', artistaId: 1, regionalId: 1 });

    expect(result?.id).toBe(3);
    expect(albumServiceMocks.getAlbuns).toHaveBeenCalled();
  });

  it('updateAlbum returns updated and reloads list', async () => {
    albumServiceMocks.updateAlbum.mockResolvedValue({ id: 4, nome: 'D' });
    albumServiceMocks.getAlbuns.mockResolvedValue(pageResponse);

    const result = await albumFacade.updateAlbum(4, { nome: 'D', artistaId: 1, regionalId: 1 });

    expect(result?.nome).toBe('D');
    expect(albumServiceMocks.getAlbuns).toHaveBeenCalled();
  });

  it('deleteAlbum returns true and reloads list', async () => {
    albumServiceMocks.deleteAlbum.mockResolvedValue(undefined);
    albumServiceMocks.getAlbuns.mockResolvedValue(pageResponse);

    const result = await albumFacade.deleteAlbum(5);

    expect(result).toBe(true);
    expect(albumServiceMocks.getAlbuns).toHaveBeenCalled();
  });

  it('adicionarArtista returns album', async () => {
    albumServiceMocks.adicionarArtistaAlbum.mockResolvedValue({ id: 6, nome: 'E' });

    const result = await albumFacade.adicionarArtista(6, 2);

    expect(result?.nome).toBe('E');
  });

  it('removerArtista returns album', async () => {
    albumServiceMocks.removerArtistaAlbum.mockResolvedValue({ id: 7, nome: 'F' });

    const result = await albumFacade.removerArtista(7, 3);

    expect(result?.nome).toBe('F');
  });

  it('clearError resets error state', async () => {
    albumServiceMocks.getAlbuns.mockRejectedValue(new Error('fail'));
    let error: string | null = null;
    const sub = albumFacade.error$.subscribe((v) => (error = v));

    await albumFacade.loadAlbuns();
    albumFacade.clearError();

    expect(error).toBeNull();
    sub.unsubscribe();
  });
});
