import axios from "axios";

const auth = () => {
  const axiosInstance = axios.create({ withCredentials: true });
  const data = {
    client_id: "play-valorant-web-prod",
    nonce: "1",
    redirect_uri: "https://playvalorant.com/opt_in",
    response_type: "token id_token",
  };
};
