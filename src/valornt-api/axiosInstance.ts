import axios from 'axios';
import { wrapper as axiosCookieSupport } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

export const createAxiosInstance = () => {
  return axiosCookieSupport(
    axios.create({
      withCredentials: true,
      jar: new CookieJar(),
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://auth.riotgames.com',
        'User-Agent': '1',
      },
    }),
  );
};
