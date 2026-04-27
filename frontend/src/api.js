import axios from 'axios';

export const getServerHost = () => {
  return 'http://localhost:3000';
};

const baseConfig = {
  baseURL: getServerHost(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
};

export const publicApi = axios.create(baseConfig);

export const privateApi = axios.create(baseConfig);

privateApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (
      statusCode === 401 &&
      errorCode === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // 換 Token 這個動作本身是公開行為，所以用 publicApi 去打！
        await publicApi.post('/api/auth/refresh');

        // 換成功後，用 privateApi 重新發送原本失敗的請求
        return privateApi(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
