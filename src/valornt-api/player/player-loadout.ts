import { AxiosInstance } from 'axios';

interface PlayerLoadoutResponse {
  /** Player UUID */
  Subject: string;
  Version: number;
  Guns: {
    /** UUID */
    ID: string;
    /** UUID */
    CharmInstanceID: string;
    /** UUID */
    CharmID: string;
    /** UUID */
    CharmLevelID: string;
    /** UUID */
    SkinID: string;
    /** UUID */
    SkinLevelID: string;
    /** UUID */
    ChromaID: string;
    Attachments: unknown[];
  }[];
  Sprays: {
    /** UUID */
    EquipSlotID: string;
    /** UUID */
    SprayID: string;
    SprayLevelID: null;
  }[];
  Identity: {
    /** UUID */
    PlayerCardID: string;
    /** UUID */
    PlayerTitleID: string;
    AccountLevel: number;
    /** UUID */
    PreferredLevelBorderID: string;
    HideAccountLevel: boolean;
  };
  Incognito: boolean;
}

export const getPlayerLoadout = async (
  axiosInstance: AxiosInstance,
  puuid: string,
  shard = 'kr',
) => {
  return axiosInstance
    .get<PlayerLoadoutResponse>(
      `https://pd.${shard}.a.pvp.net/personalization/v2/players/${puuid}/playerloadout`,
    )
    .then(({ data }) => data);
};
