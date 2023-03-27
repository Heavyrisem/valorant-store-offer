import { ChatInputCommandInteraction, CacheType, EmbedBuilder } from 'discord.js';
import nodeHtmlToImage from 'node-html-to-image';

import { getPlayerInfo, getPlayerLoadout } from '@src/valornt-api/player';
import { getUserStoreFront } from '@src/valornt-api/store';
import { getInfoFromStoreFrontItem } from '@src/valornt-api/util/store-front-parser';

import { ValorantAxiosInstanceMap } from '../api/valorant-axios-cache';
import { createHtmlWithStoreFrontItems } from '../resource/store-embed.template';

export const handleStoreFrontInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  const userId = interaction.user.id;
  if (!ValorantAxiosInstanceMap.hasInstnace(userId)) {
    return interaction.reply(`\`로그인을 먼저 진행해 주세요.\``);
  }

  const axiosInstnace = ValorantAxiosInstanceMap.getInstanceFromCache(userId);

  await interaction.reply(`\`상점 정보를 불러오는 중입니다...\``);

  const playerInfo = await getPlayerInfo(axiosInstnace);
  const playerLoadout = await getPlayerLoadout(axiosInstnace, playerInfo.sub);
  const storeFront = await getUserStoreFront(axiosInstnace, playerInfo.sub);

  const storeFrontIteemInfos = getInfoFromStoreFrontItem(
    storeFront.SkinsPanelLayout.SingleItemStoreOffers,
  );
  const htmlData = createHtmlWithStoreFrontItems(storeFrontIteemInfos);
  const image = (await nodeHtmlToImage({
    html: htmlData,
    puppeteerArgs: {
      args: ['--no-sandbox'],
    },
    encoding: 'binary',
    transparent: true,
  })) as Buffer;

  const imageEmbed = new EmbedBuilder()
    .setTitle(`${interaction.user.username}의 상점`)
    .setDescription(
      `> **인게임 이름:** ${playerInfo.acct.game_name}#${playerInfo.acct.tag_line}
      > **지역:** ${playerInfo.country.toUpperCase()}`,
    )
    .setThumbnail(
      `https://media.valorant-api.com/playercards/${playerLoadout.Identity.PlayerCardID}/smallart.png`,
    )
    .setImage('attachment://image.png')
    .setTimestamp(new Date())
    .setFooter({
      text: `Bot by ${interaction.client.user.tag}`,
    })
    .toJSON();

  await interaction.editReply({
    content: '',
    embeds: [imageEmbed],
    files: [{ name: 'image.png', attachment: image }],
  });
};
