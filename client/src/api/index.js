import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器 - 自动附加 token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 统一处理 401 的函数
const handleUnauthorized = () => {
  const path = window.location.pathname;
  if (path === '/admin/login' || path.startsWith('/api/wechat')) {
    return false;
  }
  const isWechatRoute = path.startsWith('/vote/');
  if (isWechatRoute) {
    window.location.href = '/api/wechat/auth?redirect_uri=' + encodeURIComponent(window.location.href);
  } else {
    window.location.href = '/admin/login';
  }
  return true;
};

// 响应拦截器
api.interceptors.response.use(
  response => {
    if (response.data?.code === 401) {
      handleUnauthorized();
      return Promise.reject(new Error('Unauthorized'));
    }
    return response.data;
  },
  error => {
    const isUnauthorized = error.response?.status === 401 ||
                          error.response?.data?.code === 401;
    if (isUnauthorized) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
