import api from './axiosConfig';
import type { Regional, CreateRegionalRequest, PaginatedResponse } from '../types/regional.types';

class RegionalService {
  async getRegionals(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc'): Promise<PaginatedResponse<Regional>> {
    const response = await api.get<PaginatedResponse<Regional>>('/v1/regional', {
      params: {
        page,
        size,
        sort: `${sortBy},${sortDir}`,
      },
    });
    return response.data;
  }

  async getRegionalById(id: number): Promise<Regional> {
    const response = await api.get<Regional>(`/v1/regional/${id}`);
    return response.data;
  }

  async createRegional(data: CreateRegionalRequest): Promise<Regional> {
    const response = await api.post<Regional>('/v1/regional/create', data);
    return response.data;
  }

  async updateRegional(id: number, data: CreateRegionalRequest): Promise<Regional> {
    const response = await api.put<Regional>(`/v1/regional/${id}`, data);
    return response.data;
  }

  async deleteRegional(id: number): Promise<void> {
    await api.delete(`/v1/regional/${id}`);
  }
}

export default new RegionalService();
