import { AxiosInstance } from "axios";

export const fetchAuthCookie = async (axiosInstance: AxiosInstance) => {
  const auth = {
    client_id: "play-valorant-web-prod",
    nonce: "1",
    redirect_uri: "https://playvalorant.com/opt_in",
    response_type: "token id_token",
    scope: "account openid",
  };

  await axiosInstance.request({
    method: "POST",
    url: "https://auth.riotgames.com/api/v1/authorization",
    data: auth,
  });
};
