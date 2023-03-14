import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper as axiosCookieSupport } from "axios-cookiejar-support";

export const createAxiosInstance = () => {
  return axiosCookieSupport(
    axios.create({
      withCredentials: true,
      jar: new CookieJar(),
      headers: {
        "Content-Type": "application/json",
        Referer: "https://auth.riotgames.com",
        "User-Agent": "1",
      },
    })
  );
};
