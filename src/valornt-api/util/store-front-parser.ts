import { findOneById } from '../resource';
import { SKIN_TIER, VALORANT_POINT } from '../resource/item-id.constrant';
import { StorefrontResponse } from '../store/store-front';

export interface StoreFrontItemInfo {
  tierID: SKIN_TIER;
  itemID: string;
  itemName: {
    ko: string;
    en: string;
  };
  vp: number;
  images: {
    itemURL: string;
    tierURL: string;
  };
}

export const getInfoFromStoreFrontItem = (
  singleItemStoreOffers: StorefrontResponse['SkinsPanelLayout']['SingleItemStoreOffers'],
): StoreFrontItemInfo[] => {
  return singleItemStoreOffers.map((item) => {
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

    const skinInfoKo = findOneById(firstItem.ItemID, 'ko');
    const skinInfoEn = findOneById(firstItem.ItemID, 'en');
    if (!skinInfoKo || !skinInfoEn)
      throw new Error(`${firstItem.ItemID} 에 대한 크로마 정보가 없습니다.`);

    return {
      itemID: firstItem.ItemID,
      tierID,
      vp: item.Cost[VALORANT_POINT],
      itemName: {
        ko: skinInfoKo.name,
        en: skinInfoEn.name,
      },
      images: {
        itemURL: `https://media.valorant-api.com/weaponskinlevels/${firstItem.ItemID}/displayicon.png`,
        tierURL: `https://media.valorant-api.com/contenttiers/${tierID}/displayicon.png`,
      },
    };
  });
};
