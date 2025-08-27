import { createBot } from "mineflayer";
import { createInterface } from "node:readline";
import { inspect } from "node:util";
import vec3 from "vec3";
import { connectInfo, customCommands, init } from "./server.js";
import config from "./config.js";

const minecraft = createBot({
  ...connectInfo,
  ...config.login,
})
  .once("end", () => process.exit(0))
  .once("kicked", (reason, loggedIn) => {
    console.error(`!!KICKED with loggedIn=${loggedIn}, err=${inspect(reason)}`);
  })
  .on("error", console.error)
  .on("message", (msg) => console.log(msg.toAnsi()));

let autoFishing = false;
/** Check and fish. */
const maybeFish = (output) => {
  if (
    !autoFishing ||
    !minecraft.heldItem ||
    minecraft.heldItem.name !== "fishing_rod" ||
    minecraft.heldItem.durabilityUsed > 56
  ) {
    output("Fishing stopped");
    autoFishing = false;
    return;
  }
  minecraft.fish().then(
    () => {
      setTimeout(() => maybeFish(output), 500);
    },
    () => {
      if (minecraft.usingHeldItem) {
        setTimeout(minecraft.activateItem, 200);
      }
      setTimeout(() => maybeFish(output), 500);
    },
  );
};

let autocmdInterval = null;
const commands = {
  "/bye": () => stop(),
  "/ls": (text, output) => {
    const slotBarNumber = parseInt(text[4]);
    if (isNaN(slotBarNumber)) {
      return;
    }

    let result = `${9 * slotBarNumber}-${9 * slotBarNumber + 8}: `;
    Array(9)
      .keys()
      .forEach((i) => {
        const slot = 9 * slotBarNumber + i;
        const item = minecraft.inventory.slots[slot];
        if (item) {
          result += `${item.customName || item.displayName}*${item.count} (${slot}), `;
        }
      });
    if (result.endsWith(": ")) {
      result += "Nothing, ";
    }
    output(result.slice(0, -2));
  },
  "/mv": (text) => {
    const parts = text.split(" ", 4);
    const [a, b] = [parseInt(parts[1]), parseInt(parts[2])];
    if (isNaN(a) || isNaN(b)) {
      return;
    }
    minecraft.moveSlotItem(a, b);
  },
  "/hotbar": (text, output) => {
    const slotNumber = parseInt(text[8]);
    if (!isNaN(slotNumber)) {
      minecraft.setQuickBarSlot(slotNumber);
    } else {
      const slot = 4 * 9 + minecraft.quickBarSlot;
      const item = minecraft.inventory.slots[slot];
      output(`${item.customName || item.displayName}*${item.count} (${slot})`);
    }
  },
  "/drop": (text) => {
    const item = minecraft.inventory.slots[parseInt(text.split(" ", 3)[1])];
    if (item) {
      minecraft.tossStack(item);
    }
  },
  "/lookat": (text) => {
    try {
      minecraft.lookAt(vec3(...text.split(" ", 4).slice(1, 4)), true);
    } catch (err) {
      err;
    }
  },
  "/fish": (_, output) => {
    if (autoFishing) {
      autoFishing = false;
      if (minecraft.usingHeldItem) {
        minecraft.activateItem();
      }
    } else {
      autoFishing = true;
      maybeFish(output);
    }
  },
  "/autocmd": (text, output) => {
    const [intervalStr, ...command] = text.slice(9).split(" ");
    if (autocmdInterval) {
      autocmdInterval.close();
    }
    const interval = parseInt(intervalStr);
    if (isNaN(interval)) {
      return;
    }
    autocmdInterval = setInterval(
      () => handleCommand(command.join(" "), output),
      1000 * interval,
    );
  },
  ...customCommands,
};

const completer = (line, callback) => {
  if (line.length == 0) {
    callback(null, [[], ""]);
    return;
  }
  const text = line.split(" ").slice(-1)[0];
  const isCommand = text == line && text.startsWith("/");

  // try match our commands first
  if (isCommand) {
    let matches = Object.keys(commands).filter((c) => c.startsWith(text));
    if (matches.length > 0) {
      callback(null, [matches, text]);
      return;
    }
  }

  // then try minecraft
  try {
    minecraft.tabComplete(line, false, true, 500).then(
      (result) =>
        callback(null, [
          result.map((match) => {
            if (isCommand) {
              return "/" + match.match;
            }
            return match.match;
          }),
          text,
        ]),
      () => callback(null, [[], text]),
    );
  } catch (err) {
    err;
    callback(null, [[], text]);
  }
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
  completer,
});

minecraft.once("spawn", () => {
  rl.on("line", (text) => {
    handleCommand(text, console.log);
    rl.prompt();
  });
  rl.prompt();
});

const stop = () => {
  minecraft.quit();
  rl.close();
};

rl.on("SIGINT", stop);

const handleCommand = (text, output) => {
  const isBotCommand = Object.keys(commands).some((command) => {
    if (text.startsWith(command)) {
      commands[command](text, output);
      return true;
    }
  });
  if (!isBotCommand) {
    minecraft.chat(text);
  }
};

init();

export { minecraft, handleCommand };
