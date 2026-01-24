export interface Regional {
  id: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegionalRequest {
  nome: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}
