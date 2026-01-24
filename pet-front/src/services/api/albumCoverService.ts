import api from '../api/axiosConfig';
import type { AlbumCover } from '../types/artista.types';

class AlbumCoverService {
  async uploadCover(file: File, albumId: number): Promise<AlbumCover> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('albumId', albumId.toString());

    const response = await api.post<AlbumCover>('/v1/album-cover/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getCoverUrl(coverId: number): Promise<string> {
    const response = await api.get<string>(`/v1/album-cover/${coverId}/url`);
    return response.data;
  }

  async deleteCover(coverId: number): Promise<void> {
    await api.delete(`/v1/album-cover/${coverId}`);
  }
}

export default new AlbumCoverService();
