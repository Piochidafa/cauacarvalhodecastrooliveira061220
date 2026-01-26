import { BehaviorSubject, Observable } from 'rxjs';
import artistaService from '../api/artistaService';
import type { Artista, CreateArtistaRequest, PaginatedResponse } from '../types/artista.types';

class ArtistFacade {
  private artistasSubject = new BehaviorSubject<Artista[]>([]);
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

  artistas$ = this.artistasSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  async loadArtistas(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'asc'
  ): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const response = await artistaService.getArtistas(page, size, sortBy, sortDir);
      this.artistasSubject.next(response.content);
      this.paginationSubject.next({
        currentPage: page,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar artistas');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async searchArtistas(
    nome: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'nome',
    sortDir: string = 'asc'
  ): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const response = await artistaService.searchArtistas(nome, page, size, sortBy, sortDir);
      this.artistasSubject.next(response.content);
      this.paginationSubject.next({
        currentPage: page,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao buscar artistas');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getArtista(id: number): Promise<Artista | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return await artistaService.getArtistaById(id);
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar artista');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createArtista(data: CreateArtistaRequest): Promise<Artista | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const artista = await artistaService.createArtista(data);
      // Recarregar lista
      await this.loadArtistas();
      return artista;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao criar artista');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateArtista(id: number, data: CreateArtistaRequest): Promise<Artista | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const artista = await artistaService.updateArtista(id, data);
      // Recarregar lista
      await this.loadArtistas();
      return artista;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao atualizar artista');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteArtista(id: number): Promise<boolean> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      await artistaService.deleteArtista(id);
      // Recarregar lista
      await this.loadArtistas();
      return true;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao deletar artista');
      return false;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}

export default new ArtistFacade();
