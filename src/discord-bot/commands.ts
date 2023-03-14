import { GuildWidgetStyle, REST, Routes, SlashCommandBuilder } from 'discord.js';

export enum COMMAND {
  PING = '핑',
  AUTHENTICATION = '로그인',
}
export enum COMMAND_ARGS {
  AUTHENTICATION_ID = '아이디',
  AUTHENTICATION_PW = '패스워드',
}

const commands = [
  new SlashCommandBuilder().setName(COMMAND.PING).setDescription('핑을 표시합니다.'),
  new SlashCommandBuilder()
    .setName(COMMAND.AUTHENTICATION)
    .setDescription('라이엇 계정으로 로그인합니다.')
    .addStringOption((option) =>
      option
        .setName(COMMAND_ARGS.AUTHENTICATION_ID)
        .setDescription('라이엇 아이디')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName(COMMAND_ARGS.AUTHENTICATION_PW)
        .setDescription('라이엇 패스워드')
        .setRequired(true),
    ),
];

export const registerCommands = async (token: string, clientId: string) => {
  const rest = new REST().setToken(token);
  const GUILD_ID = '269848346422804501';
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  await rest.put(Routes.applicationGuildCommands(clientId, GUILD_ID), {
    body: commands,
  });
  console.log('Commands Register Complete');
};
