import { AxiosInstance } from 'axios';

export const setAuthorizationHeader = (axiosInstance: AxiosInstance, token: string) => {
  const safeToken = token.replace('Bearer ', '');
  axiosInstance.defaults.headers.authorization = `Bearer ${safeToken}`;
};

export const setEntitleMentHeader = (axiosInstance: AxiosInstance, token: string) => {
  axiosInstance.defaults.headers['X-Riot-Entitlements-JWT'] = token;
};
