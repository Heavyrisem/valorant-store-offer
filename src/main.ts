import { Client, DMChannel, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import prettyms from 'pretty-print-ms';

import { COMMAND, COMMAND_ARGS, registerCommands } from './discord-bot/commands';
import { user } from './secret';
import { login, getPlayerInfo } from './valornt-api/auth';
import { createAxiosInstance } from './valornt-api/axiosInstance';
import { getUserStoreFront } from './valornt-api/store';
import { getImagesUrlFromItem } from './valornt-api/util/store-front-parser';

dotenv.config();

if (!process.env.DISCORD_TOKEN) throw new Error('Empty Discord Bot Token');
if (!process.env.CLIENT_ID) throw new Error('Client ID is Empty');

const { DISCORD_TOKEN } = process.env;
const { CLIENT_ID } = process.env;
// const axiosInstance = createAxiosInstance();

// (async () => {
//   await login(axiosInstance, user);

//   const userInfo = await getPlayerInfo(axiosInstance);
//   console.log(userInfo);

//   const storeFront = await getUserStoreFront(axiosInstance, userInfo.sub);
//   console.log(getImagesUrlFromItem(storeFront));
// })();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);

  setInterval(() => {
    client.uptime && client.user?.setActivity(`${prettyms(client.uptime)} Online`);
  }, 5000);

  registerCommands(DISCORD_TOKEN, CLIENT_ID);
});

client.on('interactionCreate', async (interaction): Promise<any> => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case COMMAND.PING:
      interaction.reply(`\`${client.ws.ping} ms\``);
      break;
    case COMMAND.AUTHENTICATION:
      if (interaction.inGuild())
        return interaction.user.send('`인증은 개인 메세지에서 진행해 주세요.`');

      const userId = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_ID, true);
      const userPw = interaction.options.get(COMMAND_ARGS.AUTHENTICATION_PW, true);

      interaction.reply('asfd');
      break;
    default:
  }
});

client.login(DISCORD_TOKEN);
