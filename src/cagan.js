import http from "node:http";
import { minecraft, handleCommand } from "./index.js";
import config from "./config.js";

/** Check if outer.extra([0].extra)*count exists. */
const ensureExtra = (outer, count) => {
  let obj = outer;
  for (let i = 0; i < count + 1; i++) {
    if (!obj || !obj.extra) {
      return undefined;
    }
    obj = obj.extra[0];
  }
  return obj;
};

/** Get players online by map api. */
const getPlayers = () =>
  new Promise((resolve, reject) => {
    const req = http
      .request("http://mc.nubec.cn:25564/tiles/settings.json", (res) => {
        let json = "";
        res.on("data", (chunk) => {
          json += chunk;
        });
        res.on("end", () => {
          resolve(JSON.parse(json).players);
        });
      })
      .on("error", reject)
      .on("timeout", () => {
        req.destroy();
        reject("timeout");
      })
      .end();
  });

// handle /queryres
const residenceQueryCommand = (text, output) => {
  const key = text.slice(10);
  const req = http
    .request(
      "http://mc.nubec.cn:25564/tiles/world/markers/Residence.json",
      (res) => {
        let json = "";
        res.on("data", (chunk) => {
          json += chunk;
        });
        res.on("end", () => {
          let result = JSON.parse(json)
            .filter((rect) => rect.data.key.includes(key))
            .map((rect) => {
              const from = rect.data["point1"];
              const dest = rect.data["point2"];
              return `${rect.data.key}: from (${from.x}, ~, ${from.z}) to (${dest.x}, ~, ${dest.z})`;
            });
          if (result.length == 0) {
            output("Nothing");
          } else {
            output(result.join("; "));
          }
        });
      },
    )
    .on("timeout", () => {
      req.destroy();
    })
    .end();
};

// handle /server
const serverCommand = (text) => {
  const createWindowHandler = (dest) => (window) => {
    window.containerItems().forEach((item) => {
      if (item.name === dest) {
        setTimeout(() => minecraft.simpleClick.leftMouse(item.slot), 300);
      }
    });
  };
  if (text === "/server sdf") {
    minecraft.once("windowOpen", createWindowHandler("grass_block"));
  } else if (text === "/server slime") {
    minecraft.once("windowOpen", createWindowHandler("slime_block"));
  } else {
    return;
  }
  minecraft.setQuickBarSlot(4);
  setTimeout(() => minecraft.activateItem(), 200);
};

// handle /players
const playersCommand = (_, output) => {
  getPlayers().then(
    (players) => {
      if (players.length == 0) {
        output("Nobody");
        return;
      }
      output(
        players
          .map(
            (info) =>
              `${info.name} at (${info.position.x}, ~, ${info.position.z}) in ${info.world}`,
          )
          .join(", "),
      );
    },
    () => {},
  );
};

// handle whisper
const handlePrivateMessage = (root) => {
  const senderRoot = root[0].extra[0].extra[0].extra[0].extra[0].extra;
  const msgRoot =
    root[1].extra[0].extra[0].extra[0].extra[0].extra[0].extra[0].extra[0]
      .extra[0].extra[0].extra[0].extra;
  if (senderRoot.length != 5 || msgRoot.length != 1) {
    return;
  }
  const sender = senderRoot[1].text;
  const text = msgRoot[0].text;
  if (!config.authorizedUsernames.includes(sender.slice(0, -1)) || !text) {
    return;
  }
  handleCommand(text, (reply) => {
    for (let i = 0; i < reply.length; i += 100) {
      setTimeout(
        () => minecraft.chat(`/m ${sender} ` + reply.slice(i, i + 100)),
        i * 21, // 2.1sec
      );
    }
  });
};

// handle all messages
const handleMessage = (msg, position) => {
  if (position !== "system") return;
  if (!ensureExtra(msg.json, 4)) {
    return;
  }
  const root = msg.json.extra[0].extra[0].extra[0].extra[0].extra;
  if (root.length !== 2 || !ensureExtra(root[0], 4)) {
    return;
  }
  if (ensureExtra(root[1], 10)) {
    // TODO: at-only public message (@Nubec967) is treated as private message
    handlePrivateMessage(root);
  }
};

const connectInfo = { host: "mc.nubec.cn", port: 25565, version: "1.19.4" };
const commands = {
  "/server": serverCommand,
  "/players": playersCommand,
  "/queryres": residenceQueryCommand,
};
const init = () => minecraft.on("message", handleMessage);
export { connectInfo, commands as customCommands, init };
