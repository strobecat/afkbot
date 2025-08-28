import "mineflayer";
import { type BotOptions } from "mineflayer";

type BotCommandOutput = (arg1: string) => void;
type BotCommandHandler = (text: string, output: BotCommandOutput) => void;

interface BotCommand {
  commands: { [prefix: string]: BotCommandHandler };
  executeCommand: BotCommandHandler;
}

declare module "mineflayer" {
  interface Bot {
    botCommand: BotCommand;
  }
}

interface Config {
  login: BotOptions;
  server: string;
  authorizedUsernames: string[];
}
