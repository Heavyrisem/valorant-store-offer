import { AxiosInstance } from "axios";
import { getEntitlementToken } from "./entitlement";
import { setAuthorizationHeader } from "./set-authorization";
import { fetchAuthCookie } from "./set-cookie";

export interface UserInfo {
  username: string;
  password: string;
}

interface BaseLoginResponse {
  type: string;
  country: string;
}

interface LoginResponse_Response extends BaseLoginResponse {
  type: "response";
  response: {
    parameters: {
      uri: string;
    };
  };
}

export type LoginResponse = LoginResponse_Response;

export interface LoginResult {
  type: LoginResponse["type"];
  token?: string;
}

export const login = async (
  axiosInstance: AxiosInstance,
  user: UserInfo
): Promise<LoginResult> => {
  await fetchAuthCookie(axiosInstance);

  const userInfo = {
    type: "auth",
    remember: false,
    language: "ko_KR",
    ...user,
  };

  const response = await axiosInstance
    .request<LoginResponse>({
      method: "PUT",
      url: "https://auth.riotgames.com/api/v1/authorization",
      data: userInfo,
    })
    .then(({ data }) => data);

  if (response.type === "response") {
    const [_, tokenString] =
      response.response?.parameters.uri.split("access_token=");
    const [token] = tokenString.split("&");

    if (!token) throw new Error("Login Fail");

    setAuthorizationHeader(axiosInstance, token);
    await getEntitlementToken(axiosInstance);

    return { type: "response", token };
  }

  console.log(response);
  throw new Error("Login Fail");
};
