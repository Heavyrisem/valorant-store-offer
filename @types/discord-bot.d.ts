declare namespace NodeJS {
  interface Process {
    env: ProcessEnv;
  }
  interface ProcessEnv {
    DISCORD_TOKEN: string;
    CLIENT_ID: string;
  }
}
