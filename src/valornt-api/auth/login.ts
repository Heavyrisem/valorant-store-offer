import { AxiosError, AxiosInstance } from 'axios';

import { mergeCookies } from '../util/cookie';
import { getEntitlementToken } from './entitlement';
import { setAuthorizationHeader, setEntitleMentHeader } from './set-authorization';

export interface UserInfo {
  username: string;
  password: string;
}

interface BaseLoginResponse {
  type: string;
  error?: 'auth_failure' | 'multifactor_attempt_failed' | string;
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

interface LoginOption {
  user?: UserInfo;
  code?: string;
}

export const login = async (
  axiosInstance: AxiosInstance,
  { user, code }: LoginOption,
): Promise<LoginResult> => {
  let sendData;
  if (user) {
    sendData = {
      type: 'auth',
      remember: true,
      language: 'ko_KR',
      ...user,
    };
  } else if (code) {
    sendData = {
      type: 'multifactor',
      rememberDevice: true,
      code,
    };
  }

  const response = await axiosInstance
    .request<LoginResponse>({
      method: 'PUT',
      url: 'https://auth.riotgames.com/api/v1/authorization',
      data: sendData,
    })
    .then((res) => {
      axiosInstance.defaults.headers.Cookie = res.headers['set-cookie']?.join('; ') ?? '';
      return res.data;
    });

  if (response.error) {
    if (response.error === 'auth_failure') throw new Error('로그인 실패');
    else if (response.error === 'multifactor_attempt_failed') throw new Error('2단계 인증 실패');
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

    throw new Error(`Multi-Factor ${multifactor.method} 로그인 방식은 지원되지 않습니다.`);
  }

  throw new Error(`로그인 실패, ${response}`);
};

export const refetchToken = async (axiosInstance: AxiosInstance) => {
  const token = await axiosInstance
    .get(
      'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1',
      { maxRedirects: 0 },
    )
    .catch((err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status !== 303) throw err;
        const cookie = err.response.headers['set-cookie']?.join('; ') ?? '';
        const prevCookie = String(axiosInstance.defaults.headers.Cookie) ?? cookie;
        // if (cookie) axiosInstance.defaults.headers.Cookie = mergeCookies(cookie, prevCookie);
        if (cookie) axiosInstance.defaults.headers.Cookie = cookie;

        // console.log('DEBUG:', axiosInstance.defaults.headers.Cookie);
        return parseTokenFromURLString(err.response?.headers?.location);
      }
      throw err;
    });
  if (typeof token !== 'string') throw new Error('Unexpected Token Value');
  setAuthorizationHeader(axiosInstance, token);

  const { entitlementToken } = await getEntitlementToken(axiosInstance);
  setEntitleMentHeader(axiosInstance, entitlementToken);

  console.log(token);

  return { token, entitlementToken };
};
