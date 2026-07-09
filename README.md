# Sunken Fortune

Sunken Fortune is a PvE-first pirate naval action RPG / MMORPG-lite with high-quality pixel-art direction. The long-term vision is real-time open sea exploration where monsters, enemy ships, islands, bosses, and progression systems exist on an explorable sea map.

The project is legally original. It is inspired by broad pirate MMO and naval RPG genre patterns, but it must not copy names, art, UI, lore, maps, quests, dialogue, music, or exact creative expression from existing games. Current visuals are placeholder/generated shapes only.

## Current Status

This repository is in the UI foundation polish phase. The client now has an early game-facing pirate HUD shell with placeholder generated visuals only.

Implemented now:

- Monorepo structure.
- React + TypeScript + Vite client scaffold.
- Phaser 3 prepared with a placeholder real-time sea map scene.
- Lazy-loaded Sea Map route so the Phaser bundle is split away from the initial app bundle.
- Pirate pixel-art inspired UI foundation using CSS variables, generated shapes, and placeholder HUD panels.
- NestJS + TypeScript server scaffold.
- Shared TypeScript type package.
- Documentation foundation.

Not implemented yet:

- Gameplay systems.
- Authentication.
- Backend business logic.
- Database or Prisma.
- Real assets.
- Real payments.

## Tech Stack

| Area | Technology |
| --- | --- |
| Monorepo | npm workspaces |
| Client | React, TypeScript, Vite |
| Game engine | Phaser 3 |
| Server | NestJS, TypeScript |
| Shared contracts | TypeScript |
| Future database | PostgreSQL, Prisma |
| Styling | Clean global CSS |

## Install

```bash
npm install
```

## Run Client

```bash
npm run dev:client
```

Default Vite URL:

```text
http://localhost:5173
```

## Run Server

```bash
npm run dev:server
```

Default NestJS URL:

```text
http://localhost:3000
```

Health check:

```text
GET http://localhost:3000/health
```

## Development Phase

Current phase:

- Game shell and UI foundation.
- Placeholder Sea Map visualization.
- Client-side structure for future gameplay screens.

Deferred:

- Combat.
- Real save logic.
- Backend integration.
- Economy logic.
- Authentication.
- Real assets.

## Phaser Loading

The Sea Map page is loaded with `React.lazy` and `Suspense`. This keeps Phaser out of the initial application bundle where possible, while still allowing the Sea Map to load as the primary game screen. The loading state uses the themed message:

```text
Charting the waters...
```

## Project Layout

```text
client/   React, Vite, TypeScript, Phaser placeholder scene
server/   NestJS modules and health endpoint
shared/   Shared TypeScript types
docs/     Product, design, economy, save, and originality documentation
assets/   Future original or licensed assets
tools/    Future development tools and scripts
```
