import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;