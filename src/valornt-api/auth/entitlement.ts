import { AxiosInstance } from 'axios';

import { setEntitleMentHeader } from './set-authorization';

interface EntitlementResponse {
  entitlements_token: string;
}

export const getEntitlementToken = async (axiosInstance: AxiosInstance) => {
  const { entitlements_token } = await axiosInstance
    .request<EntitlementResponse>({
      method: 'POST',
      url: 'https://entitlements.auth.riotgames.com/api/token/v1',
    })
    .then(({ data }) => data);
  if (entitlements_token) setEntitleMentHeader(axiosInstance, entitlements_token);

  return { entitlements_token };
};
