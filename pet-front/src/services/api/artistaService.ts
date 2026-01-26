import api from '../api/axiosConfig';
import type { Artista, CreateArtistaRequest, PaginatedResponse } from '../types/artista.types';

class ArtistaService {
  async getArtistas(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc'): Promise<PaginatedResponse<Artista>> {
    const response = await api.get<PaginatedResponse<Artista>>('/v1/artista', {
      params: {
        page,
        size,
        sort: `${sortBy},${sortDir}`,
      },
    });
    return response.data;
  }

  async searchArtistas(
    nome: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'nome',
    sortDir: string = 'asc'
  ): Promise<PaginatedResponse<Artista>> {
    const response = await api.get<PaginatedResponse<Artista>>('/v1/artista/buscar', {
      params: {
        nome,
        page,
        size,
        sort: `${sortBy},${sortDir}`,
      },
    });
    return response.data;
  }

  async getArtistaById(id: number): Promise<Artista> {
    const response = await api.get<Artista>(`/v1/artista/${id}`);
    return response.data;
  }

  async createArtista(data: CreateArtistaRequest): Promise<Artista> {
    const response = await api.post<Artista>('/v1/artista/create', data);
    return response.data;
  }

  async updateArtista(id: number, data: CreateArtistaRequest): Promise<Artista> {
    const response = await api.put<Artista>(`/v1/artista/${id}`, data);
    return response.data;
  }

  async deleteArtista(id: number): Promise<void> {
    await api.delete(`/v1/artista/${id}`);
  }
}

export default new ArtistaService();
