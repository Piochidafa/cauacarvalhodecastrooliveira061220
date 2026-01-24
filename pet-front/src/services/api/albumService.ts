import api from '../api/axiosConfig';
import type { Album, CreateAlbumRequest, PaginatedResponse } from '../types/artista.types';

class AlbumService {
  async getAlbuns(page: number = 0, size: number = 10): Promise<PaginatedResponse<Album>> {
    const response = await api.get<PaginatedResponse<Album>>('/v1/album', {
      params: { page, size },
    });
    return response.data;
  }

  async getAlbumById(id: number): Promise<Album> {
    const response = await api.get<Album>(`/v1/album/${id}`);
    return response.data;
  }

  async getAlbunsByArtista(artistaId: number, page: number = 0, size: number = 10): Promise<PaginatedResponse<Album>> {
    const response = await api.get<PaginatedResponse<Album>>(`/v1/album/artista/${artistaId}`, {
      params: { page, size },
    });
    return response.data;
  }

  async createAlbum(data: CreateAlbumRequest): Promise<Album> {
    const response = await api.post<Album>('/v1/album/create', data);
    return response.data;
  }

  async updateAlbum(id: number, data: CreateAlbumRequest): Promise<Album> {
    const response = await api.put<Album>(`/v1/album/${id}`, data);
    return response.data;
  }

  async deleteAlbum(id: number): Promise<void> {
    await api.delete(`/v1/album/${id}`);
  }

  async adicionarArtistaAlbum(albumId: number, artistaId: number): Promise<Album> {
    const response = await api.post<Album>(`/v1/album/${albumId}/artistas/${artistaId}`);
    return response.data;
  }

  async removerArtistaAlbum(albumId: number, artistaId: number): Promise<Album> {
    const response = await api.delete<Album>(`/v1/album/${albumId}/artistas/${artistaId}`);
    return response.data;
  }
}

export default new AlbumService();
