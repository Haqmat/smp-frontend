import apiClient from './client';
import type { ApiResponse, PaginatedResponse, User, CreateUserRequest, UpdateUserRequest } from '../types/api';

export const createUser = async (data: CreateUserRequest): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
  return response.data;
};

export const listUsers = async (params?: {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
  search?: string;
}): Promise<ApiResponse<PaginatedResponse<User>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params });
  return response.data;
};

export const getUserDetails = async (userId: string): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}`, data);
  return response.data;
};

export const toggleUserStatus = async (userId: string, isActive: boolean): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${userId}`, { is_active: isActive });
  return response.data;
};

export const resetUserPassword = async (userId: string, password: string): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await apiClient.put<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}/reset-password`, { password });
  return response.data;
};

export const deactivateUser = async (userId: string): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/users/${userId}`);
  return response.data;
};
