import { AxiosInstance } from 'axios';

interface EntitlementResponse {
  entitlements_token: string;
}

export const getEntitlementToken = async (axiosInstance: AxiosInstance) => {
  const { entitlements_token: entitlementToken } = await axiosInstance
    .request<EntitlementResponse>({
      method: 'POST',
      url: 'https://entitlements.auth.riotgames.com/api/token/v1',
    })
    .then(({ data }) => data);
  if (!entitlementToken) throw new Error('Cannot get Entitlement Token');

  return { entitlementToken };
};
