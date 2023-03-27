import { AxiosInstance } from 'axios';
import { scheduleJob } from 'node-schedule';

import { fetchAuthCookie, login, refetchToken, UserInfo } from '@src/valornt-api/auth';
import {
  AxiosCache,
  createAxiosInstance,
  getCacheFromAxiosInstance,
} from '@src/valornt-api/axiosInstance';
import { UnAuthorizedException } from '@src/valornt-api/exceptions/UnAuthorizedException';

class ValorantAxiosCache {
  private readonly cacheMap: Map<string, AxiosCache>;

  constructor() {
    this.cacheMap = new Map();
    scheduleJob('0 0/30 * * * *', this.refreshToken.bind(this));
  }

  hasInstnace(key: string): boolean {
    return this.cacheMap.has(key);
  }

  //   getInstance(key: string) {
  //     const axiosCache = this.cacheMap.get(key);
  //     if (!axiosCache) return null;

  //     return getLoggedInAxiosInstanceByCachedData(axiosCache);
  //   }

  getInstanceFromCache(key: string) {
    const axiosCache = this.cacheMap.get(key);
    if (!axiosCache) throw new UnAuthorizedException('인증정보가 없습니다.');

    const axiosInstance = createAxiosInstance(
      axiosCache.cookie,
      axiosCache.token,
      axiosCache.entitlementToken,
    );

    // await refetchToken(axiosInstance);
    return axiosInstance;
  }

  async getAuthedInstanceByUserInfo(key: string, user: UserInfo) {
    const serializedCookie = await fetchAuthCookie();
    const axiosInstance = createAxiosInstance(serializedCookie);

    const loginResult = await login(axiosInstance, { user });
    this.saveInstance(key, axiosInstance);

    return loginResult;
  }

  async getAuthedInstanceByMultifactorCode(key: string, code: string) {
    const axiosInstance = await this.getInstanceFromCache(key);

    const loginResult = await login(axiosInstance, { code });
    this.saveInstance(key, axiosInstance);
    return loginResult;
  }

  saveInstance(key: string, axiosInstance: AxiosInstance) {
    console.log('Saving Instnace for', key);
    const axiosCache = getCacheFromAxiosInstance(axiosInstance);
    this.cacheMap.set(key, axiosCache);
  }

  private async refreshToken() {
    const keys = [...this.cacheMap.keys()];

    keys.forEach(async (key) => {
      try {
        const axiosInstance = this.getInstanceFromCache(key);
        await refetchToken(axiosInstance);
        this.saveInstance(key, axiosInstance);
        console.log('Token refetched', key);
      } catch (err) {
        console.log(`Error while refreshing token for ${key}`, err);
        this.cacheMap.delete(key);
      }
    });
  }

  //   getAuthedInstance(key: string) {
  //     const axiosCache = this.cacheMap.get(key);
  //     if (!axiosCache) throw new Error('인증정보가 없습니다.');
  //   }
}

export const ValorantAxiosInstanceMap = new ValorantAxiosCache();
