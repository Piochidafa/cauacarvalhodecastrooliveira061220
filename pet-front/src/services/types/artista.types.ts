import type { Regional } from "./regional.types";

export interface Artista {
  id: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
  quantidadeAlbuns: number;
  albuns?: Album[];
}

export interface Album {
  id: number;
  nome: string;
  artista: Artista;
  regional: Regional;
  createdAt: string;
  updatedAt: string;
  capas?: AlbumCover[];
}

export interface AlbumCover {
  id: number;
  objectKey: string;
  albumId: number;
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateArtistaRequest {
  nome: string;
}

export interface CreateAlbumRequest {
  nome: string;
  artistaId?: number;
  regionalId?: number;
}

export interface UploadCoverRequest {
  file: File;
  albumId: number;
}
