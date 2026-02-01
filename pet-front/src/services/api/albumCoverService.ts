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

  async uploadCovers(files: File[], albumId: number): Promise<AlbumCover[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('albumId', albumId.toString());

    try {
      const response = await api.post<AlbumCover[]>('/v1/album-cover/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      // Fallback para o endpoint antigo caso o múltiplo não esteja disponível
      const uploaded = await Promise.all(files.map((file) => this.uploadCover(file, albumId)));
      return uploaded;
    }
  }

  async getCoversByAlbumId(albumId: number): Promise<AlbumCover[]> {
    const response = await api.get<AlbumCover[]>(`/v1/album-cover/album/${albumId}`);
    return response.data;
  }

  async getCoverByAlbumId(albumId: number): Promise<AlbumCover | null> {
    try {
      const covers = await this.getCoversByAlbumId(albumId);
      return covers.length > 0 ? covers[0] : null;
    } catch (error) {
      return null;
    }
  }

  async getCoverUrl(coverId: number): Promise<string> {
    try {
      const response = await api.get<string>(`/v1/album-cover/${coverId}/url`);
      return response.data;
    } catch (error) {
      return '';
    }
  }

  async updateCover(coverId: number, albumId: number, objectKey: string): Promise<AlbumCover> {
    const response = await api.put<AlbumCover>(`/v1/album-cover/${coverId}`, {
      albumId,
      objectKey,
    });
    return response.data;
  }

  async deleteCover(coverId: number): Promise<void> {
    await api.delete(`/v1/album-cover/${coverId}`);
  }
}

export default new AlbumCoverService();
