import { ChatInputCommandInteraction, CacheType } from 'discord.js';

import { COMMAND_ARGS } from '@src/discord-bot/resource';
import { getPlayerInfo, getLoggedInAxiosInstanceByUserInfo } from '@src/valornt-api/auth';
import { AxiosCache } from '@src/valornt-api/axiosInstance';

const axiosCache: Map<string, AxiosCache> = new Map();

export const handleAuthenticationInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<any> => {
  if (interaction.inGuild())
    return interaction.user.send('`인증은 개인 메세지에서 진행해 주세요.`');

  const username = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_ID, true).value;
  const password = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_PW, true).value;

  if (typeof username !== 'string' || typeof password !== 'string')
    throw new Error('잘못된 입력값 입니다.');

  const { axiosInstance, ...loginResult } = await getLoggedInAxiosInstanceByUserInfo({
    username,
    password,
  });

  if (!loginResult.loggedIn) {
    if (loginResult.type === 'multifactor' && loginResult.multifactor) {
      const { multifactor } = loginResult;

      switch (multifactor.method) {
        case 'email':
          return interaction.reply(
            `\`이메일 로그인을 요청하였습니다.\n${multifactor.email} 에 전송된 ${multifactor.multiFactorCodeLength} 자리의 코드를 입력해 주세요.\``,
          );
        default:
      }
    }

    return interaction.reply(`\`로그인에 실패했습니다. 로그인 유형: ${loginResult.type}\``);
  }

  const playerInfo = await getPlayerInfo(axiosInstance);
  return interaction.reply(`\`${playerInfo.acct.game_name}\` 로그인 되었습니다.`);
};

export const handleMultiFactorAuthInteraction = async (
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  if (interaction.inGuild())
    return interaction.user.send('`인증은 개인 메세지에서 진행해 주세요.`');

  const code = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_CODE, true).value;
  if (typeof code !== 'string') throw new Error('잘못된 입력값 입니다.');

  //   const;
};
