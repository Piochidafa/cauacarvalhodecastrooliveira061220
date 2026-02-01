import { beforeEach, describe, expect, it, vi } from 'vitest';

const regionalServiceMocks = vi.hoisted(() => ({
  getRegionals: vi.fn(),
  getRegionalById: vi.fn(),
  createRegional: vi.fn(),
  updateRegional: vi.fn(),
  deleteRegional: vi.fn()
}));

vi.mock('../../api/regionalService', () => ({
  default: regionalServiceMocks
}));

import regionalFacade from '../regionalFacade';

const pageResponse = {
  content: [{ id: 1, nome: 'Norte' }],
  totalPages: 1,
  totalElements: 1
};

describe('regionalFacade', () => {
  beforeEach(() => {
    regionalServiceMocks.getRegionals.mockReset();
    regionalServiceMocks.getRegionalById.mockReset();
    regionalServiceMocks.createRegional.mockReset();
    regionalServiceMocks.updateRegional.mockReset();
    regionalServiceMocks.deleteRegional.mockReset();
  });

  it('loadRegionals updates list and pagination', async () => {
    regionalServiceMocks.getRegionals.mockResolvedValue(pageResponse);
    let list: any[] = [];
    let pagination: any = null;
    const listSub = regionalFacade.regionals$.subscribe((v) => (list = v));
    const paginationSub = regionalFacade.pagination$.subscribe((v) => (pagination = v));

    await regionalFacade.loadRegionals(0, 10, 'id', 'asc');

    expect(list.length).toBe(1);
    expect(pagination.totalElements).toBe(1);
    listSub.unsubscribe();
    paginationSub.unsubscribe();
  });

  it('getRegionalById returns regional', async () => {
    regionalServiceMocks.getRegionalById.mockResolvedValue({ id: 2, nome: 'Sul' });

    const result = await regionalFacade.getRegionalById(2);

    expect(result?.nome).toBe('Sul');
  });

  it('createRegional returns created and reloads list', async () => {
    regionalServiceMocks.createRegional.mockResolvedValue({ id: 3, nome: 'Leste' });
    regionalServiceMocks.getRegionals.mockResolvedValue(pageResponse);

    const result = await regionalFacade.createRegional({ nome: 'Leste' });

    expect(result?.id).toBe(3);
    expect(regionalServiceMocks.getRegionals).toHaveBeenCalled();
  });

  it('updateRegional returns updated and reloads list', async () => {
    regionalServiceMocks.updateRegional.mockResolvedValue({ id: 4, nome: 'Oeste' });
    regionalServiceMocks.getRegionals.mockResolvedValue(pageResponse);

    const result = await regionalFacade.updateRegional(4, { nome: 'Oeste' });

    expect(result?.nome).toBe('Oeste');
    expect(regionalServiceMocks.getRegionals).toHaveBeenCalled();
  });

  it('deleteRegional returns true and reloads list', async () => {
    regionalServiceMocks.deleteRegional.mockResolvedValue(undefined);
    regionalServiceMocks.getRegionals.mockResolvedValue(pageResponse);

    const result = await regionalFacade.deleteRegional(5);

    expect(result).toBe(true);
    expect(regionalServiceMocks.getRegionals).toHaveBeenCalled();
  });

  it('loadRegionals sets error on failure', async () => {
    regionalServiceMocks.getRegionals.mockRejectedValue(new Error('fail'));
    let error: string | null = null;
    const sub = regionalFacade.error$.subscribe((v) => (error = v));

    await regionalFacade.loadRegionals();

    expect(error).toBe('fail');
    sub.unsubscribe();
  });

  it('loading ends after loadRegionals', async () => {
    regionalServiceMocks.getRegionals.mockResolvedValue(pageResponse);
    let loading = true;
    const sub = regionalFacade.loading$.subscribe((v) => (loading = v));

    await regionalFacade.loadRegionals();

    expect(loading).toBe(false);
    sub.unsubscribe();
  });
});
