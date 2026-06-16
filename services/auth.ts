import apiClient from './api';
import { ApiResponse, AuthTokens, LoginCredentials, RegisterCredentials, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/api/v1/users/login',
      credentials
    );
    return response.data;
  },

  async register(credentials: RegisterCredentials) {
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/users/register', credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/users/current-user');
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/api/v1/users/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<ApiResponse<{}>>('/api/v1/users/logout');
    return response.data;
  },

  async updateAvatar(formData: FormData) {
    const response = await apiClient.patch<ApiResponse<User>>('/api/v1/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
