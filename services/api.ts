import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, REQUEST_TIMEOUT_MS, RETRY_ATTEMPTS, SECURE_KEYS } from '@/constants';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };

    if (!config) return Promise.reject(error);

    config._retryCount = config._retryCount ?? 0;

    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    const shouldRetry = (isNetworkError || isServerError) && config._retryCount < RETRY_ATTEMPTS;

    if (shouldRetry) {
      config._retryCount += 1;
      const delay = Math.pow(2, config._retryCount) * 500;
      await sleep(delay);
      return apiClient(config);
    }

    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.USER_DATA);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
