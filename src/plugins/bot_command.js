/** @param {import("mineflayer").Bot} minecraft */
export default function init(minecraft) {
  /** @type {import("../global.js").BotCommandHandler} */
  const executeCommand = (text, output) => {
    for (const [prefix, handler] of Object.entries(
      minecraft.botCommand.commands,
    )) {
      if (text.startsWith(prefix)) {
        handler(text, output);
        return;
      }
    }
    minecraft.chat(text);
  };
  minecraft.botCommand = { commands: {}, executeCommand };
}
