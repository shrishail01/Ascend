import axios from 'axios';

let inMemoryToken: string | null = null;

export function getAccessToken() {
  return inMemoryToken;
}

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
}

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  withCredentials: true, // Send HTTP-Only refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer Token from memory
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration & automatic refresh
api.interceptors.response.use(
  (response) => response.data, // Unwraps response data standard structure
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth-expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
