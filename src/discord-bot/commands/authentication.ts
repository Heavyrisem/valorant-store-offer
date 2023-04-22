import { ChatInputCommandInteraction, CacheType } from 'discord.js';

import { COMMAND_ARGS } from '@src/discord-bot/resource';
import { refetchToken } from '@src/valornt-api/auth';
import { SHARD } from '@src/valornt-api/constant/common.constant';
import { UnAuthorizedException } from '@src/valornt-api/exceptions/UnAuthorizedException';
import { getPlayerInfo } from '@src/valornt-api/player';

import { ValorantAxiosInstanceMap } from '../api/valorant-axios-cache';

export const handleAuthenticationInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<any> => {
  if (interaction.inGuild())
    return interaction.user.send('`인증은 개인 메세지에서 진행해 주세요.`');

  await interaction.reply(`\`로그인 중입니다...\``);
  await interaction.deleteReply();
  await interaction.user.send(`\`로그인 중입니다...\``);
  const userId = interaction.user.id;
  const username = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_ID, true).value;
  const password = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_PW, true).value;
  const shard =
    interaction.options.get(COMMAND_ARGS.AUTHENTICATION_SHARD, false)?.value ?? SHARD.KR;

  if (typeof username !== 'string' || typeof password !== 'string' || typeof shard !== 'string')
    throw new Error('잘못된 입력값 입니다.');

  const { axiosInstance, ...loginResult } =
    await ValorantAxiosInstanceMap.getAuthedInstanceByUserInfo(userId, {
      username,
      password,
    });

  if (!loginResult.loggedIn) {
    if (loginResult.type === 'multifactor' && loginResult.multifactor) {
      const { multifactor } = loginResult;

      switch (multifactor.method) {
        case 'email':
          return interaction.user.send(
            `\`이메일 로그인을 요청하였습니다.\n${multifactor.email} 에 전송된 ${multifactor.multiFactorCodeLength} 자리의 코드를 입력해 주세요.\``,
          );
        default:
      }
    }

    return interaction.user.send(`\`로그인에 실패했습니다. 로그인 유형: ${loginResult.type}\``);
  }

  const playerInfo = await getPlayerInfo(axiosInstance);

  console.log(
    `Logged in For User: ${interaction.user.username} with ${playerInfo.acct.game_name}#${playerInfo.acct.tag_line}`,
  );
  return interaction.user.send(
    `\`${playerInfo.acct.game_name}#${playerInfo.acct.tag_line}\` 로그인 되었습니다.`,
  );
};

export const handleMultiFactorAuthInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  if (interaction.inGuild())
    return interaction.user.send('`인증은 개인 메세지에서 진행해 주세요.`');

  const userId = interaction.user.id;

  const code = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_CODE, true).value;
  if (typeof code !== 'string') throw new Error('잘못된 입력값 입니다.');

  if (!ValorantAxiosInstanceMap.hasInstnace(userId))
    return interaction.reply('`로그인을 먼저 진행해 주세요`');

  const { axiosInstance, ...loginResult } =
    await ValorantAxiosInstanceMap.getAuthedInstanceByMultifactorCode(userId, code);

  if (!loginResult.loggedIn) throw new UnAuthorizedException('2단계 인증에 실패했습니다.');

  const playerInfo = await getPlayerInfo(axiosInstance);
  return interaction.reply(`\`${playerInfo.acct.game_name}\` 로그인 되었습니다.`);
};

export const handleRefreshAuthInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  const userId = interaction.user.id;

  const axiosInstance = ValorantAxiosInstanceMap.getInstanceFromCache(userId);

  await refetchToken(axiosInstance);

  const playerInfo = await getPlayerInfo(axiosInstance);
  return interaction.reply(`\`${playerInfo.acct.game_name}\` 인증 토큰 재발급이 완료되었습니다.`);
};
