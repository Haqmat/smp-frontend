import apiClient from './client';
import type { ApiResponse, LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, ChangePasswordRequest } from '../types/api';

export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data;
};

export const refreshToken = async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
  return response.data;
};

export const logout = async (data: { refresh_token: string }): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/logout', data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse<{ success: boolean }>> => {
  const response = await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/change-password', data);
  return response.data;
};
