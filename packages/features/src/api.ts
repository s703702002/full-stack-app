import type { AxiosInstance } from 'axios';

let axiosApi: AxiosInstance | null = null;

/**
 * 初始化管理後台套件的 API 實例
 * @param instance 母專案內建的 privateApi 實例
 */
export const initApi = (instance: AxiosInstance) => {
  axiosApi = instance;
};

export const getApi = (): AxiosInstance => {
  if (!axiosApi) {
    throw new Error(
      '❌ [@full-stack-app/features]: 請先呼叫 initApi(privateApi) 初始化管理套件。',
    );
  }
  return axiosApi;
};
