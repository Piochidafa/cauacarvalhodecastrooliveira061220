import { BehaviorSubject, Observable } from 'rxjs';
import regionalService from '../api/regionalService';
import type { Regional, CreateRegionalRequest, PaginatedResponse } from '../types/regional.types';

class RegionalFacade {
  private regionalsSubject = new BehaviorSubject<Regional[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private paginationSubject = new BehaviorSubject<{
    currentPage: number;
    totalPages: number;
    totalElements: number;
  }>({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });

  regionals$ = this.regionalsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  async loadRegionals(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const response = await regionalService.getRegionals(page, size, sortBy, sortDir);
      this.regionalsSubject.next(response.content);
      this.paginationSubject.next({
        currentPage: page,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar regionais');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getRegionalById(id: number): Promise<Regional | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return await regionalService.getRegionalById(id);
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar regional');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createRegional(data: CreateRegionalRequest): Promise<Regional | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const regional = await regionalService.createRegional(data);
      // Recarregar lista
      await this.loadRegionals();
      return regional;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao criar regional');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateRegional(id: number, data: CreateRegionalRequest): Promise<Regional | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const regional = await regionalService.updateRegional(id, data);
      // Recarregar lista
      await this.loadRegionals();
      return regional;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao atualizar regional');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteRegional(id: number): Promise<boolean> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      await regionalService.deleteRegional(id);
      // Recarregar lista
      await this.loadRegionals();
      return true;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao deletar regional');
      return false;
    } finally {
      this.loadingSubject.next(false);
    }
  }
}

export default new RegionalFacade();
