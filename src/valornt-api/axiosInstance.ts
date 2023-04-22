import axios, { AxiosInstance } from 'axios';
import { HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

import { SHARD } from './constant/common.constant';

export const getCookieFromInstance = (axiosInstance: AxiosInstance) => {
  const key = Object.getOwnPropertySymbols(axiosInstance.defaults.httpsAgent).find(
    (s) => s.description === 'cookieOptions',
  );

  if (!key) throw new Error('key is not found');

  return axiosInstance.defaults.httpsAgent[key].jar as CookieJar;
};

export const createAxiosInstance = (
  cookie?: string | CookieJar.Serialized,
  token?: string,
  entitlementToken?: string,
) => {
  // return axiosCookieSupport(
  return axios.create({
    httpsAgent: new HttpsCookieAgent({
      ciphers: [
        'TLS_CHACHA20_POLY1305_SHA256',
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
      ].join(':'),
      honorCipherOrder: true,
      minVersion: 'TLSv1.2',
      // cookies: cookie ? CookieJar.deserializeSync(cookie) : new CookieJar(),
      cookies: {
        jar: cookie ? CookieJar.deserializeSync(cookie) : new CookieJar(),
      },
    }),
    withCredentials: true,
    // jar: cookie ? CookieJar.deserializeSync(cookie) : new CookieJar(),
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://auth.riotgames.com',
      'User-Agent': '1',
      Authorization: token ? `Bearer ${token}` : undefined,
      'X-Riot-Entitlements-JWT': entitlementToken,
    },
  });
  // );
};

export interface AxiosCache {
  token: string;
  entitlementToken: string;
  cookie: string;
  shard: SHARD;
}

export const getCacheFromAxiosInstance = (axiosInstance: AxiosInstance) => {
  const token = String(axiosInstance.defaults.headers.authorization).replace('Bearer ', '');
  const entitlementToken = String(axiosInstance.defaults.headers['X-Riot-Entitlements-JWT']);
  const cookie = JSON.stringify(getCookieFromInstance(axiosInstance).serializeSync() ?? {});

  return { token, entitlementToken, cookie };
};

// const cookieMap = new Map<string, AxiosCache>();

// export const createAxiosInstanceWithKey = async (key: string) => {
//   const axiosCache = cookieMap.get(key);
//   const cookie = axiosCache?.cookie ? CookieJar.fromJSON(axiosCache?.cookie) : new CookieJar();

//   const axiosInstance = axiosCookieSupport(
//     axios.create({
//       withCredentials: true,
//       jar: cookie,
//       headers: {
//         Authorization: axiosCache?.token && `Bearer ${axiosCache.token}`,
//         'X-Riot-Entitlements-JWT': axiosCache?.entitlementToken,
//       },
//     }),
//   );

//   return axiosInstance;
// };

// export class AxiosClientCache {
//   axiosCache: Map<string, AxiosCache>;

//   constructor() {
//     this.axiosCache = new Map();
//   }

//   async getAuthedAxiosInstance(key: string) {
//     const axiosCache = cookieMap.get(key);
//     if (!axiosCache) return this.createAxiosInstance();

//     const axiosInstance = createAxiosInstance(
//       axiosCache.token,
//       axiosCache.entitlementToken,
//       axiosCache.cookie,
//     );
//     await this.fetchAuthCookie(axiosInstance);

//     return axiosInstance;
//   }

//   private createAxiosInstance(token?: string, entitlementToken?: string, cookie = new CookieJar()) {
//     return axiosCookieSupport(
//       axios.create({
//         withCredentials: true,
//         jar: cookie,
//         headers: {
//           'Content-Type': 'application/json',
//           Referer: 'https://auth.riotgames.com',
//           'User-Agent': '1',
//           Authorization: token && `Bearer ${token}`,
//           'X-Riot-Entitlements-JWT': entitlementToken,
//         },
//       }),
//     );
//   }

//   private async fetchAuthCookie(axiosInstance: AxiosInstance) {
//     await axiosInstance.request({
//       method: 'POST',
//       url: 'https://auth.riotgames.com/api/v1/authorization',
//       data: {
//         client_id: 'play-valorant-web-prod',
//         nonce: '1',
//         redirect_uri: 'https://playvalorant.com/opt_in',
//         response_type: 'token id_token',
//         scope: 'account openid',
//       },
//     });
//   }
// }
