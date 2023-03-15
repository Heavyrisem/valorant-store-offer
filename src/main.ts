import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import prettyms from 'pretty-print-ms';

import {
  handleAuthenticationInteraction,
  handleMultiFactorAuthInteraction,
} from './discord-bot/commands/authentication';
import { handleStoreFrontInteraction } from './discord-bot/commands/store';
import { registerCommands } from './discord-bot/register-command';
import { COMMAND } from './discord-bot/resource';

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

  try {
    switch (interaction.commandName) {
      case COMMAND.PING:
        interaction.reply(`\`${client.ws.ping} ms\``);
        break;
      case COMMAND.AUTHENTICATION:
        await handleAuthenticationInteraction(interaction);
        break;
      case COMMAND.MULTIFACTOR_AUTH:
        await handleMultiFactorAuthInteraction(interaction);
        break;
      case COMMAND.STOREFRONT:
        await handleStoreFrontInteraction(interaction);
        break;
      default:
        await interaction.reply(`\`명령어를 찾을 수 없습니다.\``);
    }
  } catch (err) {
    console.error(err);
    interaction.channel?.send(`\`오류가 발생했습니다, ${err}\``);
  }
});

client.login(DISCORD_TOKEN);
