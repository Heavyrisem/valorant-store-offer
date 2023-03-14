import { createAxiosInstance } from "./valornt-api/axiosInstance";
import { user } from "./secret";
import { getImagesUrlFromItem } from "./valornt-api/util/store-front-parser";
import { login, getPlayerInfo } from "./valornt-api/auth";
import { getUserStoreFront } from "./valornt-api/store";
import { Client, DMChannel, GatewayIntentBits } from "discord.js";
import { COMMAND, registerCommands } from "./discord-bot/commands";
import prettyms from "pretty-print-ms";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DISCORD_TOKEN) throw new Error("Empty Discord Bot Token");
if (!process.env.CLIENT_ID) throw new Error("Client ID is Empty");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
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

client.on("ready", () => {
  console.log(`Logged in as ${client?.user?.tag}!`);

  setInterval(() => {
    client.uptime &&
      client.user?.setActivity(`${prettyms(client.uptime)} Online`);
  }, 5000);

  registerCommands(DISCORD_TOKEN, CLIENT_ID);
});

client.on("interactionCreate", async (interaction): Promise<any> => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case COMMAND.PING:
      interaction.reply(`\`${client.ws.ping} ms\``);
    case COMMAND.AUTHENTICATION:
      if (interaction.inGuild())
        return interaction.user.send("`인증은 개인 메세지에서 진행해 주세요.`");

      interaction.reply("asfd");
  }
});

client.login(DISCORD_TOKEN);
