import { SKIN_TIER, VALORANT_POINT } from "../resource/item-id.constrant";
import { StorefrontResponse } from "../store/store-front";

export interface SkinImageInfo {
  tierID: SKIN_TIER;
  itemID: string;
}

export const getImagesUrlFromItem = (
  storeFrontResponse: StorefrontResponse
): SkinImageInfo[] => {
  return storeFrontResponse.SkinsPanelLayout.SingleItemStoreOffers.map(
    (item) => {
      const [firstItem] = item.Rewards;
      let tierID;

      switch (item.Cost[VALORANT_POINT]) {
        case 875:
          tierID = SKIN_TIER.SELECT_EDITION;
          break;
        case 1275:
          tierID = SKIN_TIER.DELUXE_EDITION;
          break;
        case 1775:
          tierID = SKIN_TIER.PREMIUM_EDITION;
          break;
        case 2175:
          tierID = SKIN_TIER.PREMIUM_EDITION;
          break;
        case 2475:
          tierID = SKIN_TIER.ULTRA_EDITION;
          break;
        default:
          tierID = SKIN_TIER.EXCLUSIVE_EDITION;
          break;
      }

      return { itemID: firstItem.ItemID, tierID };
    }
  );
};
