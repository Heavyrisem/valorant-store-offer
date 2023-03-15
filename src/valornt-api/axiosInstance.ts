import axios, { AxiosInstance } from 'axios';
import { wrapper as axiosCookieSupport } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export const createAxiosInstance = (
  cookie?: string | CookieJar.Serialized,
  token?: string,
  entitlementToken?: string,
) => {
  return axiosCookieSupport(
    axios.create({
      withCredentials: true,
      jar: cookie ? CookieJar.deserializeSync(cookie) : new CookieJar(),
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://auth.riotgames.com',
        'User-Agent': '1',
        Authorization: token ? `Bearer ${token}` : undefined,
        'X-Riot-Entitlements-JWT': entitlementToken,
      },
    }),
  );
};

export interface AxiosCache {
  token: string;
  entitlementToken: string;
  cookie: string;
}

export const getCacheFromAxiosInstance = (axiosInstance: AxiosInstance) => {
  const token = String(axiosInstance.defaults.headers.authorization).replace('Bearer ', '');
  const entitlementToken = String(axiosInstance.defaults.headers['X-Riot-Entitlements-JWT']);
  const cookie = JSON.stringify(axiosInstance.defaults.jar?.serializeSync() ?? {});

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
