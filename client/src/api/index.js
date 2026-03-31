import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 统一处理 401 的函数
const handleUnauthorized = () => {
  const path = window.location.pathname;

  // 已经是登录页或微信授权页，不跳转
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
    console.log('API Response:', response.data);
    // 检查业务 code
    if (response.data?.code === 401) {
      console.log('Received 401 in response, redirecting...');
      handleUnauthorized();
      return Promise.reject(new Error('Unauthorized'));
    }
    return response.data;
  },
  error => {
    console.log('API Error:', error.response?.data);
    // 检查 HTTP 状态码或响应体中的 code
    const isUnauthorized = error.response?.status === 401 ||
                          error.response?.data?.code === 401;

    if (isUnauthorized) {
      console.log('Received 401 in error, redirecting...');
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
