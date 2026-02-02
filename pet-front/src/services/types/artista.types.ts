import type { Regional } from "./regional.types";

export interface Artista {
  id: number;
  nome: string;
  imageKey?: string;
  imageUrl?: string;
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

export interface AlbumSummary {
  id: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
  artista?: Pick<Artista, 'id' | 'nome'>;
  regional?: Regional;
  regionalId?: number;
  artistaId?: number;
  capas?: AlbumCover[];
}

export type AlbumLike = Album | AlbumSummary;

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

export interface ArtistaDetailPagedResponse {
  id: number;
  nome: string;
  imageKey?: string;
  imageUrl?: string;
  quantidadeAlbuns: number;
  createdAt: string;
  updatedAt: string;
  albuns: PaginatedResponse<AlbumSummary>;
}

export interface CreateArtistaRequest {
  nome: string;
  imageKey?: string;
  imageUrl?: string;
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
