import vdb_en from './valorant-data-en.json';
import vdb_ko from './valorant-data-kr.json';

interface Character {
  name: string;
  id: string;
  assetName: string;
}

interface Map {
  name: string;
  id: string;
  assetName: string;
  assetPath: string;
}

interface Chroma {
  name: string;
  id: string;
  assetName: string;
}

interface Skin {
  name: string;
  id: string;
  assetName: string;
}

interface SkinLevel {
  name: string;
  id: string;
  assetName: string;
}

interface Equip {
  name: string;
  id: string;
  assetName: string;
}

interface GameMode {
  name: string;
  id: string;
  assetName: string;
  assetPath: string;
}

interface Spray {
  name: string;
  id: string;
  assetName: string;
}

interface SprayLevel {
  name: string;
  id: string;
  assetName: string;
}

interface Charm {
  name: string;
  id: string;
  assetName: string;
}

interface CharmLevel {
  name: string;
  id: string;
  assetName: string;
}

interface PlayerCard {
  name: string;
  id: string;
  assetName: string;
}

interface PlayerTitle {
  name: string;
  id: string;
  assetName: string;
}

interface Act {
  id: string;
  parentId: string;
  type: string;
  name: string;
  isActive: boolean;
}

interface Ceremony {
  name: string;
  id: string;
  assetName: string;
}

export interface ValorantDataBaseType {
  version: string;
  characters: Character[];
  maps: Map[];
  chromas: Chroma[];
  skins: Skin[];
  skinLevels: SkinLevel[];
  equips: Equip[];
  gameModes: GameMode[];
  sprays: Spray[];
  sprayLevels: SprayLevel[];
  charms: Charm[];
  charmLevels: CharmLevel[];
  playerCards: PlayerCard[];
  playerTitles: PlayerTitle[];
  acts: Act[];
  ceremonies: Ceremony[];
}
const valorantDataBaseKo = vdb_ko as ValorantDataBaseType;
const valorantDataBaseEn = vdb_en as ValorantDataBaseType;

export type ValorantDataBaseLanguage = 'ko' | 'en';
export const findOneById = (id: string, lang: ValorantDataBaseLanguage = 'ko') => {
  const { version, ...db } = lang === 'ko' ? valorantDataBaseKo : valorantDataBaseEn;
  for (const key of Object.keys(db)) {
    for (const item of db[key as keyof typeof db]) {
      if (item.id.toUpperCase() === id.toUpperCase()) return item;
    }
  }
};
