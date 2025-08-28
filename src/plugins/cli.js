import { createInterface } from "node:readline";
import { inspect } from "node:util";

/** @param {import("mineflayer").Bot} minecraft */
export default function init(minecraft) {
  /** @param {string} text */
  const output = (text) => {
    console.log(text);
    rl.prompt(true);
  };

  /** @type {import("node:readline").AsyncCompleter} */
  const completer = (line, callback) => {
    if (line.length == 0) {
      callback(null, [[], ""]);
      return;
    }
    const text = line.split(" ").slice(-1)[0] || "";
    const isCommand = text == line && text.startsWith("/");

    const localMatches = Object.keys(minecraft.botCommand.commands).filter(
      (c) => c.startsWith(text),
    );

    try {
      minecraft.tabComplete(line, false, true, 500).then(
        (result) =>
          callback(null, [
            result
              .map((match) => {
                if (isCommand) {
                  return "/" + match.match;
                }
                return match.match;
              })
              .concat(localMatches),
            text,
          ]),
        () => callback(null, [localMatches, text]),
      );
    } catch (_) {
      callback(null, [localMatches, text]);
    }
  };

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
    completer,
  }).on("line", (text) => {
    minecraft.botCommand.executeCommand(text, output);
    rl.prompt();
  });

  minecraft
    .on("message", (msg) => output(msg.toAnsi()))
    .once("spawn", () => rl.prompt())
    .once("kicked", (reason, loggedIn) =>
      console.error(
        `!!KICKED with loggedIn=${loggedIn}, err=${inspect(reason)}`,
      ),
    )
    .once("end", () => rl.close())
    .on("error", console.error);
  rl.on("SIGINT", minecraft.quit);
}
