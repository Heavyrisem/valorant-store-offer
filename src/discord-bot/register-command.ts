import { REST, Routes, SlashCommandBuilder } from 'discord.js';

import { COMMAND, COMMAND_ARGS } from './resource/command.constrant';

const commands = [
  new SlashCommandBuilder().setName(COMMAND.PING).setDescription('핑을 표시합니다.'),
  new SlashCommandBuilder()
    .setName(COMMAND.AUTHENTICATION)
    .setDescription('라이엇 계정으로 로그인합니다.')
    .setDMPermission(true)
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
  new SlashCommandBuilder()
    .setName(COMMAND.MULTIFACTOR_AUTH)
    .setDescription('2단계 인증을 진행합니다')
    .setDMPermission(true)
    .addStringOption((option) =>
      option
        .setName(COMMAND_ARGS.AUTHENTICATION_CODE)
        .setDescription('라이엇 2단계 인증 코드')
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName(COMMAND.STOREFRONT)
    .setDescription('현재 상점에서 구매 가능한 아이템들을 가져옵니다.'),
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
