import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
import { Agent } from 'https';

export const createAxiosInstance = (cookie?: string, token?: string, entitlementToken?: string) => {
  const headers: CreateAxiosDefaults['headers'] = {
    'Content-Type': 'application/json',
    Referer: 'https://auth.riotgames.com',
    'User-Agent': 'Hello World',
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (entitlementToken) headers['X-Riot-Entitlements-JWT'] = entitlementToken;
  if (cookie) headers.Cookie = cookie;

  const agent = new Agent({
    ciphers: [
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'TLS_AES_256_GCM_SHA384',
      'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
    ].join(':'),
    honorCipherOrder: true,
    minVersion: 'TLSv1.2',
  });

  return axios.create({
    httpsAgent: agent,
    withCredentials: true,
    headers,
  });
};

export interface AxiosCache {
  token: string;
  entitlementToken: string;
  cookie: string;
}

export const getCacheFromAxiosInstance = (axiosInstance: AxiosInstance): AxiosCache => {
  const token = String(axiosInstance.defaults.headers.authorization).replace('Bearer ', '');
  const entitlementToken = String(axiosInstance.defaults.headers['X-Riot-Entitlements-JWT']);
  const cookie = String(axiosInstance.defaults.headers.Cookie) ?? '';

  return { token, entitlementToken, cookie };
};
