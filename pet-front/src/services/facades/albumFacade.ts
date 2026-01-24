import { BehaviorSubject } from 'rxjs';
import albumService from '../api/albumService';
import type { Album, CreateAlbumRequest, PaginatedResponse } from '../types/artista.types';

class AlbumFacade {
  private albunsSubject = new BehaviorSubject<Album[]>([]);
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

  albuns$ = this.albunsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  async loadAlbuns(page: number = 0, size: number = 10): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const response = await albumService.getAlbuns(page, size);
      this.albunsSubject.next(response.content);
      this.paginationSubject.next({
        currentPage: page,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar álbuns');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loadAlbunsByArtista(artistaId: number, page: number = 0, size: number = 10): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const response = await albumService.getAlbunsByArtista(artistaId, page, size);
      this.albunsSubject.next(response.content);
      this.paginationSubject.next({
        currentPage: page,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar álbuns do artista');
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async getAlbum(id: number): Promise<Album | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return await albumService.getAlbumById(id);
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao carregar álbum');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async createAlbum(data: CreateAlbumRequest): Promise<Album | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const album = await albumService.createAlbum(data);
      await this.loadAlbuns();
      return album;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao criar álbum');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async updateAlbum(id: number, data: CreateAlbumRequest): Promise<Album | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const album = await albumService.updateAlbum(id, data);
      await this.loadAlbuns();
      return album;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao atualizar álbum');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async deleteAlbum(id: number): Promise<boolean> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      await albumService.deleteAlbum(id);
      await this.loadAlbuns();
      return true;
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao deletar álbum');
      return false;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async adicionarArtista(albumId: number, artistaId: number): Promise<Album | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return await albumService.adicionarArtistaAlbum(albumId, artistaId);
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao adicionar artista ao álbum');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async removerArtista(albumId: number, artistaId: number): Promise<Album | null> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      return await albumService.removerArtistaAlbum(albumId, artistaId);
    } catch (error: any) {
      this.errorSubject.next(error.message || 'Erro ao remover artista do álbum');
      return null;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  clearError(): void {
    this.errorSubject.next(null);
  }
}

export default new AlbumFacade();
