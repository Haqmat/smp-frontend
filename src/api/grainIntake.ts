import apiClient from './client';
import type { ApiResponse, PaginatedResponse, GrainIntakeBatch, CreateGrainIntakeRequest } from '../types/api';

export const recordGrainIntake = async (
  data: CreateGrainIntakeRequest,
  idempotencyKey?: string
): Promise<ApiResponse<{ batch: GrainIntakeBatch; stock_update_summary: any }>> => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
  const response = await apiClient.post<ApiResponse<{ batch: GrainIntakeBatch; stock_update_summary: any }>>(
    '/inventory/grain-intake',
    data,
    { headers }
  );
  return response.data;
};

export const listGrainIntakes = async (params: {
  page?: number;
  limit?: number;
  supplier_name?: string;
  product_id?: string;
  start_date?: string;
  end_date?: string;
  receipt_number?: string;
}): Promise<ApiResponse<PaginatedResponse<GrainIntakeBatch>>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<GrainIntakeBatch>>>('/inventory/grain-intake', { params });
  return response.data;
};

export const getGrainIntakeDetails = async (batchId: string): Promise<ApiResponse<{ batch: GrainIntakeBatch }>> => {
  const response = await apiClient.get<ApiResponse<{ batch: GrainIntakeBatch }>>(`/inventory/grain-intake/${batchId}`);
  return response.data;
};
