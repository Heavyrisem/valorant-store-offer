import { createAxiosInstance } from '../axiosInstance';

export const fetchAuthCookie = async () => {
  const axiosInstance = createAxiosInstance();
  const auth = {
    client_id: 'play-valorant-web-prod',
    nonce: '1',
    redirect_uri: 'https://playvalorant.com/opt_in',
    response_type: 'token id_token',
    scope: 'account openid',
  };

  const cookie = (
    await axiosInstance.post(`https://auth.riotgames.com/api/v1/authorization`, auth)
  ).headers['set-cookie']?.join('; ');

  if (cookie) axiosInstance.defaults.headers.Cookie = cookie;

  return cookie;
};
