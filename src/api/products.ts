import apiClient from './client';
import type { ApiResponse, Product, CreateProductRequest, UpdateProductRequest } from '../types/api';

export const listProducts = async (params?: {
  type?: 'RAW_GRAIN' | 'FINISHED_FLOUR';
  is_active?: boolean;
}): Promise<ApiResponse<{ products: Product[]; total_count: number }>> => {
  const response = await apiClient.get<ApiResponse<{ products: Product[]; total_count: number }>>('/products', { params });
  return response.data;
};

export const createProduct = async (data: CreateProductRequest): Promise<ApiResponse<Product>> => {
  const response = await apiClient.post<ApiResponse<Product>>('/admin/products', data);
  return response.data;
};

export const updateProduct = async (productId: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> => {
  const response = await apiClient.put<ApiResponse<Product>>(`/admin/products/${productId}`, data);
  return response.data;
};

export const toggleProductStatus = async (productId: string, isActive: boolean): Promise<ApiResponse<Product>> => {
  const response = await apiClient.put<ApiResponse<Product>>(`/admin/products/${productId}`, { is_active: isActive });
  return response.data;
};
