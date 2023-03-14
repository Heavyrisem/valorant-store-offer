import { AxiosInstance } from "axios";

export interface PricesResponse {
  Offers: {
    OfferID: string;
    IsDirectPurchase: boolean;
    /** Date in ISO 8601 format */
    StartDate: string;
    Cost: {
      [x: string]: number;
    };
    Rewards: {
      /** Item Type ID */
      ItemTypeID: string;
      /** Item ID */
      ItemID: string;
      Quantity: number;
    }[];
  }[];
}

export const getUserPrices = async (
  axiosInstance: AxiosInstance,
  shard = "kr"
) => {
  return axiosInstance
    .get<PricesResponse>(`https://pd.${shard}.a.pvp.net/store/v1/offers`)
    .then(({ data }) => data);
};
