import apiClient from './api';
import { Instructor, Course, PaginatedResponse } from '@/types';

export const courseService = {
  async getProducts(page = 1, limit = 20) {
    const response = await apiClient.get<PaginatedResponse<Course>>(
      `/api/v1/public/randomproducts?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getProductById(id: number) {
    const response = await apiClient.get<{ data: Course; success: boolean }>(`/api/v1/public/randomproducts/${id}`);
    return response.data;
  },

  async getInstructors(page = 1, limit = 20) {
    const response = await apiClient.get<PaginatedResponse<Instructor>>(
      `/api/v1/public/randomusers?page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
