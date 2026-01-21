import api from '../api/axiosConfig';
import type { LoginRequest, LoginResponse } from '../types/auth.types';
import { cookieUtils } from '../../utils/cookies';

export const authFacade = {

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/v1/auth/login', credentials);
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      
      if (response.data.refreshToken) {
        cookieUtils.set('refreshToken', response.data.refreshToken, 7);
      }
      
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Erro ao realizar login',
        statusCode: error.response?.status,
      };
    }
  },


  logout: async (): Promise<void> => {
    try {
      await api.post('/v1/auth/logout');
    } catch (error) {
      console.error('Erro ao realizar logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      cookieUtils.remove('refreshToken');
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return cookieUtils.get('refreshToken');
  },

  refreshToken: async (): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/v1/auth/refresh');
      
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      
      if (response.data.refreshToken) {
        cookieUtils.set('refreshToken', response.data.refreshToken, 7);
      }
      
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Erro ao renovar token',
        statusCode: error.response?.status,
      };
    }
  },
};
