/** @typedef {import("../global.js").BotCommandHandler} BotCommandHandler */
import vec3 from "vec3";

let autoFishing = false;
/** @type {NodeJS.Timeout} */
let autocmdInterval;

/** @param {import("mineflayer").Bot} minecraft */
export default function init(minecraft) {
  /** @param {import("../global.js").BotCommandOutput} output */
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

  Object.assign(minecraft.botCommand.commands, {
    "/bye": minecraft.quit,
    /** @type {BotCommandHandler} */
    "/ls": (text, output) => {
      const slotBarNumber = parseInt(text[4] || "");
      if (isNaN(slotBarNumber)) {
        const item = minecraft.heldItem;
        if (item) {
          output(
            `${item.customName || item.displayName}*${item.count} (${item.slot})`,
          );
        }
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
    /** @type {BotCommandHandler} */
    "/mv": (text) => {
      const parts = text.split(" ", 4);
      const [a, b] = [parseInt(parts[1] || ""), parseInt(parts[2] || "")];
      if (isNaN(a) || isNaN(b)) {
        return;
      }
      minecraft.moveSlotItem(a, b);
    },
    /** @type {BotCommandHandler} */
    "/hotbar": (text) => {
      const slotNumber = parseInt(text[8] || "");
      if (!isNaN(slotNumber)) {
        minecraft.setQuickBarSlot(slotNumber);
      }
    },
    /** @type {BotCommandHandler} */
    "/drop": (text) => {
      const item =
        minecraft.inventory.slots[parseInt(text.split(" ", 3)[1] || "")];
      if (item) {
        minecraft.tossStack(item);
      }
    },
    /** @type {BotCommandHandler} */
    "/lookat": (text) => {
      try {
        minecraft.lookAt(vec3(...text.split(" ", 4).slice(1, 4)), true);
      } catch (_) {}
    },
    /** @type {BotCommandHandler} */
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
    /** @type {BotCommandHandler} */
    "/autocmd": (text, output) => {
      const [intervalStr, ...command] = text.slice(9).split(" ");
      if (autocmdInterval) {
        autocmdInterval.close();
      }
      const interval = parseInt(intervalStr || "");
      if (isNaN(interval)) {
        return;
      }
      autocmdInterval = setInterval(
        () => minecraft.botCommand.executeCommand(command.join(" "), output),
        1000 * interval,
      );
    },
  });
}
