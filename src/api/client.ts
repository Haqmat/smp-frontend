import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Types
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    message_am?: string;
    details?: Array<{ field: string; message: string }>;
    timestamp: string;
    request_id: string;
  };
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.haqmat.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Token setters
export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

// Request interceptor - add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response?.data?.error?.code;
      
      // Don't retry login requests or if token is invalid
      if (originalRequest.url?.includes('/auth/login') || errorCode === 'INVALID_REFRESH_TOKEN') {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        
        const { access_token, refresh_token } = response.data.data;
        setTokens(access_token, refresh_token);
        
        // Resolve queued requests
        refreshSubscribers.forEach((callback) => callback(access_token));
        refreshSubscribers = [];
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        refreshSubscribers = [];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Handle specific status codes
      switch (status) {
        case 400:
          // Validation errors - show field-specific messages
          if (data?.error?.details) {
            data.error.details.forEach((detail: { field: string; message: string }) => {
              toast.error(detail.message);
            });
          } else {
            toast.error(data?.error?.message || 'Validation error');
          }
          break;
        case 403:
          toast.error('Access Denied', {
            description: data?.error?.message || 'You do not have permission to perform this action.',
          });
          break;
        case 404:
          toast.error('Not Found', {
            description: data?.error?.message || 'The requested resource was not found.',
          });
          break;
        case 409:
          toast.error('Conflict', {
            description: data?.error?.message || 'This resource already exists.',
          });
          break;
        case 422:
          // Silent handling for idempotency key reuse
          if (data?.error?.code === 'IDEMPOTENCY_KEY_REUSED') {
            return Promise.resolve(error.response);
          }
          toast.error(data?.error?.message || 'Validation error');
          break;
        case 429:
          toast.error('Too Many Requests', {
            description: data?.error?.message || 'Please wait a moment before trying again.',
          });
          break;
        case 500:
        case 502:
        case 503:
          toast.error('Server Error', {
            description: data?.error?.request_id 
              ? `Error ID: ${data.error.request_id}. Please contact support.`
              : 'An unexpected error occurred. Please try again.',
          });
          break;
        default:
          toast.error(data?.error?.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network Error', {
        description: 'Unable to connect to the server. Please check your connection.',
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;