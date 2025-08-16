# afkbot

Yet another minecraft bot.

## Install
`pnpm install` then fill in `src/config.js`, then choose a server-dependency by `ln -sf src/<server_type>.js src/server.js`.  
Currently `<server_type>` can be one of `("cagan")`.

## Start
```sh
while true; do node src/index.js; done
```
which helps you to restart bot after `/bye` automatically.

## Usage
CLI or say `/m <bot_name> <command>` from one of `authorizedUsernames` in `src/config.js`. The bot will repeat `<command>` except these special commands:  

#### Generic
`/bye`: disconnect from the server.  
`/ls <i: integer>`: List things in slot from `i*9` to `i*9 + 8` in the inventory.  
`/mv <a: integer> <b: integer>`: Exchange items in slot `a` and `b` in the inventory.  
`/hotbar`: Print the thing on your right hand.  
`/hotbar <i: 0-8>`: Switch selected slot of the hotbar aka. quick bar  
`/drop <slot: integer>`: Drop the item in the specified slot in the inventory.  
`/lookat <x: number> <y: number> <z: number>`: Look at one block. Currently broken when used before `/fish`.  
`/fish`: Start/stop auto fishing.

#### `cagan`
`/server <subserver: sdf or slime>`: Join one of the subservers.  
`/players`: List players and the position in the "sdf" subserver, using public map api.

## FAQ
> Public messages were shown as blank  
Open `node_modules/.pnpm/prismarine-chat@1.11.0/node_modules/prismarine-chat/index.js`, modify `MAX_CHAT_DEPTH` to a bigger value
