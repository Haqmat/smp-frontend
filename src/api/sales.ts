import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Sale, CreateSaleRequest } from '../types/api';

export const createSale = async (
  data: CreateSaleRequest,
  idempotencyKey?: string
): Promise<ApiResponse<{ sale: Sale; stock_updates: any[] }>> => {
  const headers = idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined;
  const response = await apiClient.post<ApiResponse<{ sale: Sale; stock_updates: any[] }>>('/sales', data, { headers });
  return response.data;
};

export const listSales = async (params: {
  page?: number;
  limit?: number;
  customer_name?: string;
  customer_tin?: string;
  product_id?: string;
  start_date?: string;
  end_date?: string;
  receipt_number?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: string;
  sort_order?: string;
}): Promise<ApiResponse<PaginatedResponse<Sale> & { summary: { total_sales_count: number; total_revenue: number; total_vat_collected: number } }>> => {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Sale> & { summary: { total_sales_count: number; total_revenue: number; total_vat_collected: number } }>>('/sales', { params });
  return response.data;
};

export const getSaleByReceipt = async (receiptNumber: string): Promise<ApiResponse<Sale>> => {
  const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${receiptNumber}`);
  return response.data;
};

export const voidSale = async (
  receiptNumber: string,
  reason: string
): Promise<ApiResponse<{ manual_receipt_number: string; status: 'VOIDED'; void_reason: string; voided_at: string; voided_by: string; stock_reversal: any }>> => {
  const response = await apiClient.post<ApiResponse<{ manual_receipt_number: string; status: 'VOIDED'; void_reason: string; voided_at: string; voided_by: string; stock_reversal: any }>>(
    `/sales/${receiptNumber}/void`,
    { reason }
  );
  return response.data;
};
