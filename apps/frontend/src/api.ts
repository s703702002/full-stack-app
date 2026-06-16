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
