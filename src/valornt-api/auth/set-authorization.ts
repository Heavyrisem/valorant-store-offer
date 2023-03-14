import { AxiosInstance } from 'axios';

export const setAuthorizationHeader = (axiosInstance: AxiosInstance, token: string) => {
  axiosInstance.defaults.headers.authorization = `Bearer ${token}`;
};

export const setEntitleMentHeader = (axiosInstance: AxiosInstance, token: string) => {
  axiosInstance.defaults.headers['X-Riot-Entitlements-JWT'] = token;
};
