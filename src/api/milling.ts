import apiClient from './client';
import type { ApiResponse, PaginatedResponse, MillingSession, CreateMillingRequest } from '../types/api';

export const recordMillingSession = async (
  data: CreateMillingRequest
): Promise<ApiResponse<{ milling_session: MillingSession }>> => {
  const response = await apiClient.post<ApiResponse<{ milling_session: MillingSession }>>('/inventory/milling', data);
  return response.data;
};

export const listMillingSessions = async (params: {
  page?: number;
  limit?: number;
  input_product_id?: string;
  output_product_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<PaginatedResponse<MillingSession>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<MillingSession>>>('/inventory/milling', { params });
  return response.data;
};
