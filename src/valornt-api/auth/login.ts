import { AxiosInstance } from 'axios';

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
      remember: false,
      language: 'ko_KR',
      ...user,
    };
  } else if (code) {
    sendData = {
      type: 'multifactor',
      rememberDevice: false,
      code,
    };
  }

  const response = await axiosInstance
    .request<LoginResponse>({
      method: 'PUT',
      url: 'https://auth.riotgames.com/api/v1/authorization',
      data: sendData,
    })
    .then(({ data }) => data);

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

interface TokenRefreshResponse {
  type: string;
  response: {
    mode: string;
    parameters: {
      uri: string;
    };
  };
  country: string;
}

export const refetchToken = async (axiosInstance: AxiosInstance) => {
  const token = await axiosInstance
    .post<TokenRefreshResponse>(
      'https://auth.riotgames.com/api/v1/authorization',
      {
        client_id: 'play-valorant-web-prod',
        nonce: '1',
        redirect_uri: 'https://playvalorant.com/opt_in',
        response_type: 'token id_token',
        scope: 'account openid',
      },
      { maxRedirects: 0 },
    )
    .then(({ data }) => parseTokenFromURLString(data.response.parameters.uri));

  if (typeof token !== 'string') throw new Error('Unexpected Token Value');
  setAuthorizationHeader(axiosInstance, token);

  const { entitlementToken } = await getEntitlementToken(axiosInstance);
  setEntitleMentHeader(axiosInstance, entitlementToken);

  return { token, entitlementToken };
};

// export const multifactorLogin = async (axiosInstance: AxiosInstance, code: string) => {
//   const data = {
//     type: 'multifactor',
//     rememberDevice: false,
//     code,
//   };
//   const response = await axiosInstance.put('https://auth.riotgames.com/api/v1/authorization', data);
//   console.log(response.data, response.headers);
// };

// export const getLoggedInAxiosInstanceByUserInfo = async (user: UserInfo): Promise<LoginResult> => {
//   const serializedCookie = await fetchAuthCookie();
//   const axiosInstance = createAxiosInstance(serializedCookie);

//   return fetchTokens(axiosInstance, user);
//   // const tmp = await fetchTokens(axiosInstance, user);
//   // await refetchToken(axiosInstance);
//   // return tmp;
// };

// export const getLoggedInAxiosInstanceByCachedData = async (cachedData: AxiosCache) => {
//   const axiosInstance = createAxiosInstance(
//     cachedData.cookie,
//     cachedData.token,
//     cachedData.entitlementToken,
//   );
//   await refetchToken(axiosInstance);

//   return axiosInstance;
// };
