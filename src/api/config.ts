import apiClient from './client';
import type { ApiResponse, SystemConfig, UpdateConfigRequest } from '../types/api';

export const getConfig = async (): Promise<ApiResponse<SystemConfig>> => {
  const response = await apiClient.get<ApiResponse<SystemConfig>>('/admin/config');
  return response.data;
};

export const updateConfig = async (data: UpdateConfigRequest): Promise<ApiResponse<{ updated_keys: string[] }>> => {
  const response = await apiClient.put<ApiResponse<{ updated_keys: string[] }>>('/admin/config', data);
  return response.data;
};
