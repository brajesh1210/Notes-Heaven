import axios from 'axios';
import { demoApi } from './demoApi.js';

/**
 * Ek hi API client.
 *  - DEMO_MODE=true  -> uses demoApi (in-memory), no backend required
 *  - otherwise        -> axios -> Vite proxy (/api) or VITE_API_URL (production)
 */

const RAW_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = `${RAW_URL.replace(/\/$/, '')}/api`;

export const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE) === 'true';

export class ApiClientError extends Error {
  constructor(message, status = 500, errors = []) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// every request also sends the Bearer token (cross-domain backup)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('nh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// response: { success, message, data } -> data unwrap, error normalize
http.interceptors.response.use(
  (res) => ({ ...res, payload: res.data?.data ?? {}, message: res.data?.message }),
  (error) => {
    if (!error.response) {
      const msg =
        error.code === 'ECONNABORTED'
          ? 'The request timed out - is the backend running?'
          : 'Cannot reach the backend. Make sure it is running (npm run dev) and VITE_API_URL is correct.';
      return Promise.reject(new ApiClientError(msg, 0));
    }
    const { status, data } = error.response;
    return Promise.reject(new ApiClientError(data?.message || 'Something went wrong', status, data?.errors || []));
  }
);

/** internal: same signature for demo and axios */
const request = async (method, url, { params, data } = {}) => {
  if (DEMO_MODE) {
    return demoApi(method, url, { params, data });
  }
  const res = await http.request({ method, url, params, data });
  return { data: res.payload, message: res.message };
};

export const api = {
  get: (url, params) => request('get', url, { params }),
  post: (url, data) => request('post', url, { data }),
  put: (url, data) => request('put', url, { data }),
  patch: (url, data) => request('patch', url, { data }),
  delete: (url, params) => request('delete', url, { params }),

  /** image upload (multipart) */
  upload: async (file, onProgress) => {
    if (DEMO_MODE) {
      const url = URL.createObjectURL(file);
      return { data: { image: { url, publicId: `demo/${file.name}`, width: 0, height: 0 } }, message: 'Demo upload' };
    }
    const form = new FormData();
    form.append('image', file);
    const res = await http.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    });
    return { data: res.payload, message: res.message };
  },
};

export default api;
