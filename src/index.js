import { createBot } from "mineflayer";
import config from "./config.js";
import botCommandPlugin from "./plugins/bot_command.js";
import commandsPlugin from "./plugins/commands.js";
import cliPlugin from "./plugins/cli.js";

if (!config.server.match(/[a-zA-Z_]+/)) {
  console.error("Invalid server");
}
import(`./servers/${config.server}.js`).then(
  (server) => {
    createBot({ ...config.login, ...server.connectInfo }).loadPlugins([
      botCommandPlugin,
      commandsPlugin,
      cliPlugin,
      server.default,
    ]);
  },
  (reason) => {
    throw new Error(`Cannot load server ${config.server}`, { cause: reason });
  },
);
