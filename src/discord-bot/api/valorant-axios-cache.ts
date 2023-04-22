import { AxiosInstance } from 'axios';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { scheduleJob } from 'node-schedule';

import { fetchAuthCookie, login, refetchToken, UserInfo } from '@src/valornt-api/auth';
import {
  AxiosCache,
  createAxiosInstance,
  getCacheFromAxiosInstance,
} from '@src/valornt-api/axiosInstance';
import { UnAuthorizedException } from '@src/valornt-api/exceptions/UnAuthorizedException';
import { SHARD } from '@src/valornt-api/constant/common.constant';

class ValorantAxiosCache {
  private readonly fileName = 'instance-save.json';

  private readonly cacheMap: Map<string, AxiosCache>;

  constructor() {
    this.cacheMap = new Map();
    if (existsSync(this.fileName)) {
      const jsonText = readFileSync(this.fileName, { encoding: 'utf-8' });
      const parsedJson = JSON.parse(jsonText);
      for (const [key, value] of Object.entries(parsedJson)) {
        console.log(key, value);
      }
    }

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

  async getAuthedInstanceByUserInfo(key: string, user: UserInfo, shard = SHARD.KR) {
    const serializedCookie = await fetchAuthCookie();
    const axiosInstance = createAxiosInstance(serializedCookie);

    const loginResult = await login(axiosInstance, { user });
    this.saveInstance(key, shard, axiosInstance);

    return loginResult;
  }

  async getAuthedInstanceByMultifactorCode(key: string, code: string, shard = SHARD.KR) {
    const axiosInstance = await this.getInstanceFromCache(key);

    const loginResult = await login(axiosInstance, { code });
    this.saveInstance(key, shard, axiosInstance);
    return loginResult;
  }

  saveInstance(key: string, shard: SHARD, axiosInstance: AxiosInstance) {
    // console.log('Saving Instnace for', key);
    const axiosCache = { ...getCacheFromAxiosInstance(axiosInstance), shard };
    this.cacheMap.set(key, axiosCache);

    writeFileSync(this.fileName, JSON.stringify(Object.fromEntries(this.cacheMap)));
  }

  private async refreshToken() {
    const keys = [...this.cacheMap.keys()];

    // keys.forEach(async (key) => {
    for (const key of keys) {
      try {
        const cache = this.cacheMap.get(key);
        if (!cache) throw new Error(`Empty Cache Data For ${key}`);
        const axiosInstance = this.getInstanceFromCache(key);
        // eslint-disable-next-line no-await-in-loop
        await refetchToken(axiosInstance);
        this.saveInstance(key, cache.shard, axiosInstance);
        console.log('Token refetched', key);
      } catch (err) {
        console.log(`Error while refreshing token for ${key}`, err);
        this.cacheMap.delete(key);
      }
    }
    // });
  }

  private getCacheKey(userId: string, shard: string) {
    return `${userId}#${shard}`;
  }

  //   getAuthedInstance(key: string) {
  //     const axiosCache = this.cacheMap.get(key);
  //     if (!axiosCache) throw new Error('인증정보가 없습니다.');
  //   }
}

export const ValorantAxiosInstanceMap = new ValorantAxiosCache();
