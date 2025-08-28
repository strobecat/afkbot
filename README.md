# afkbot

Yet another minecraft bot.

## Install
`pnpm install` then fill in `src/config.js`. 

## Start
```sh
while true; do node src/index.js; done
```
which helps you to restart bot after `/bye` automatically.

## Usage
CLI or say `/m <bot_name> <command>` from one of `authorizedUsernames` in `src/config.js`. The bot will repeat `<command>` except these special commands:  

#### Generic
`/autocmd`: Cancel previous `/autocmd`.
`/autocmd <interval: number> <command>`: Cancel previous `/autocmd` and execute `<command>` each `<interval>` seconds.
`/bye`: Disconnect from the server.  
`/drop <slot: integer>`: Drop the item in the specified slot in the inventory.  
`/fish`: Start/stop auto fishing.
`/hotbar <i: 0-8>`: Switch selected slot of the hotbar aka. quick bar  
`/lookat <x: number> <y: number> <z: number>`: Look at one block.  
`/ls`: Print the thing on your right hand.
`/ls <i: integer>`: List things in slot from `i*9` to `i*9 + 8` in the inventory.  
`/mv <a: integer> <b: integer>`: Exchange items in slot `a` and `b` in the inventory.  

#### `cagan`
`/players`: List players and the position in the "sdf" subserver, using public map api.
`/queryres <substring>`: Search for residences and return their position.
`/server <subserver: sdf or slime>`: Join one of the subservers.  

## FAQ
> Public messages were shown as blank  

Open `node_modules/.pnpm/prismarine-chat@1.11.0/node_modules/prismarine-chat/index.js`, modify `MAX_CHAT_DEPTH` to a bigger value
