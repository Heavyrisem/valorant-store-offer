import { AxiosError, AxiosInstance, AxiosInterceptorOptions } from 'axios';

import { AxiosCache, createAxiosInstance, getCacheFromAxiosInstance } from '../axiosInstance';
import { getEntitlementToken } from './entitlement';
import { setAuthorizationHeader, setEntitleMentHeader } from './set-authorization';
import { fetchAuthCookie } from './set-cookie';

export interface UserInfo {
  username: string;
  password: string;
}

interface BaseLoginResponse {
  type: string;
  error?: 'auth_failure' | string;
  country: string;
}

type LoginResponse_Response = BaseLoginResponse & {
  type: 'response';
  response: {
    parameters: {
      uri: string;
    };
  };
};

type MultifactorAuthType = 'email';
type LoginResponse_MultiFactor = BaseLoginResponse & {
  type: 'multifactor';
  multifactor: {
    email?: string;
    method: MultifactorAuthType;
    methods: MultifactorAuthType[];
    multiFactorCodeLength: number;
    mfaVersion: string;
  };
};

export type LoginResponse = LoginResponse_Response | LoginResponse_MultiFactor;

export interface LoginResult {
  axiosInstance: AxiosInstance;
  type: LoginResponse['type'] | string;
  multifactor?: {
    email?: string;
    method: MultifactorAuthType;
    multiFactorCodeLength: number;
  };
  token?: {
    authorization: string;
    entitlement: string;
  };
  loggedIn: boolean;
}

const parseTokenFromURLString = (url: string) => {
  const [_, tokenString] = url.split('access_token=');
  const [token] = tokenString.split('&');
  if (!token) throw new Error('토큰 정보를 가져올 수 없습니다.');
  return token;
};

const fetchTokens = async (axiosInstance: AxiosInstance, user?: UserInfo): Promise<LoginResult> => {
  const userInfo = {
    type: 'auth',
    remember: false,
    language: 'ko_KR',
    ...user,
  };

  const response = await axiosInstance
    .request<LoginResponse>({
      method: 'PUT',
      url: 'https://auth.riotgames.com/api/v1/authorization',
      data: userInfo,
    })
    .then(({ data }) => data);

  if (response.error) {
    if (response.error === 'auth_failure') throw new Error('로그인 실패');
    else throw new Error(response.error);
  }

  if (response.type === 'response') {
    const token = parseTokenFromURLString(response.response.parameters.uri);
    setAuthorizationHeader(axiosInstance, token);

    const { entitlementToken } = await getEntitlementToken(axiosInstance);
    setEntitleMentHeader(axiosInstance, entitlementToken);

    return {
      axiosInstance,
      type: 'response',
      loggedIn: true,
      token: { authorization: token, entitlement: entitlementToken },
    };
  }

  if (response.type === 'multifactor') {
    const { multifactor } = response;
    if (multifactor.method === 'email') {
      return {
        axiosInstance,
        type: 'multifactor',
        multifactor: {
          email: multifactor.email,
          method: multifactor.method,
          multiFactorCodeLength: multifactor.multiFactorCodeLength,
        },
        loggedIn: false,
      };
    }

    throw new Error(`\`Multi-Factor ${multifactor.method} 로그인 방식은 지원되지 않습니다.\``);
  }

  throw new Error('Login Fail');
};

const refetchToken = async (axiosInstance: AxiosInstance) => {
  const token = await axiosInstance
    .get(
      'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1',
      { maxRedirects: 0 },
    )
    .catch((err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status !== 303) throw err;
        return parseTokenFromURLString(err.response?.headers?.location);
      }
      throw err;
    });
  if (typeof token !== 'string') throw new Error('Unexpected Token Value');
  setAuthorizationHeader(axiosInstance, token);

  const { entitlementToken } = await getEntitlementToken(axiosInstance);
  setEntitleMentHeader(axiosInstance, entitlementToken);

  return { token, entitlementToken };
};

export const getLoggedInAxiosInstanceByUserInfo = async (user: UserInfo): Promise<LoginResult> => {
  const serializedCookie = await fetchAuthCookie();
  const axiosInstance = createAxiosInstance(serializedCookie);

  return fetchTokens(axiosInstance, user);
  // const tmp = await fetchTokens(axiosInstance, user);
  // await refetchToken(axiosInstance);
  // return tmp;
};

export const getLoggedInAxiosInstanceByCachedData = async (cachedData: AxiosCache) => {
  const axiosInstance = createAxiosInstance(
    cachedData.cookie,
    cachedData.token,
    cachedData.entitlementToken,
  );
  await refetchToken(axiosInstance);

  return axiosInstance;
};
