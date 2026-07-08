# Design Decisions Log

This log records current product decisions and the reasoning behind them. Update it when major scope, economy, combat, legal, or technical decisions change.

## Decision 001: PvE-First MVP

### Current Decision

Sunken Fortune will start as a PvE-first pirate naval action RPG. PvP, guilds, global chat, co-op, and broader social systems are future expansions, not MVP requirements.

### Reasoning

Active combat, progression, economy, saving, and offline rewards must work before social systems add complexity. Building PvP or guilds too early would increase balance, moderation, backend, and live-ops requirements before the core game is validated.

## Decision 002: Active Combat Is The Primary Progression Path

### Current Decision

Active naval combat should be the best way to progress. Movement, positioning, broadside angles, reload timing, ship builds, and enemy AI should matter.

### Reasoning

The game's identity depends on combat being the main experience. If passive rewards or premium purchases outperform active play too strongly, the core action RPG loop loses value.

## Decision 003: Autonomous Voyage Is Capped At 14 Hours

### Current Decision

Autonomous Voyage rewards accumulate for a maximum of 14 hours. After 14 hours, rewards stop until the player opens the game again, saves, and exits or restarts the voyage cycle.

### Reasoning

The cap supports returning-player momentum without encouraging indefinite passive progression. It creates a clear login moment while protecting active combat as the main reward path.

## Decision 004: Active Combat Reward Target Versus Autonomous Voyage

### Current Decision

One focused hour of active combat should roughly equal the full 14-hour Autonomous Voyage reward window.

### Reasoning

This ratio makes Autonomous Voyage useful but clearly secondary. It gives busy players some continuity while preserving the value of skilled active play.

## Decision 005: Autonomous Voyage Reward Restrictions

### Current Decision

Autonomous Voyage may award gold, basic loot, character XP, crew XP, common materials, and small chances of minor premium currency. It must not award boss-exclusive drops, rare ship materials, event currency, first-time boss kills, major quest completion, or premium-tier rare loot.

### Reasoning

Restricted rewards protect combat, bosses, events, and milestone progression. High-prestige rewards should come from intentional play.

## Decision 006: Ships Are Major Milestones

### Current Decision

The game should have roughly 7-8 major ships over the long term rather than 15+ disposable ships.

### Reasoning

Fewer, more meaningful ships support emotional attachment, clearer balancing, and stronger progression identity. Each ship can have a distinct role and memorable unlock moment.

## Decision 007: Premium Currency Is Simulated Only

### Current Decision

The game includes a fake premium currency system using imaginary USD only. No real payment gateway or real-money checkout should be implemented.

### Reasoning

The system supports economy simulation and portfolio demonstration without legal, financial, compliance, tax, refund, fraud, or payment-processing obligations.

## Decision 008: Weekly Imaginary Spending Cap

### Current Decision

The premium currency simulator has a weekly imaginary spending cap of $100.

### Reasoning

The cap creates a realistic monetization constraint for simulation and balance analysis while avoiding designs that normalize unlimited spend pressure.

## Decision 009: Gold Is The Main Progression Currency

### Current Decision

Gold is the primary progression currency. Premium currency may accelerate progress and unlock premium options, but important progression should have a free path.

### Reasoning

The economy should remain playable and satisfying without premium currency. Premium options should add convenience or alternate routes without making standard gameplay feel useless.

## Decision 010: Save System Is A Core Design System

### Current Decision

The save system must include a visible Save Game / Save Now button, save status messages, autosave every 60 seconds, saves after major actions, logout saving, and future cloud save support.

### Reasoning

Progression and economy integrity depend on reliable saves. Premium currency simulation, offline rewards, purchases, boss kills, and upgrades require careful transaction boundaries to prevent loss or duplication.

## Decision 011: Legal Originality Is Required From The Start

### Current Decision

Sunken Fortune must not copy names, art, UI, lore, maps, quests, dialogue, music, or exact creative expression from existing games.

### Reasoning

Originality is easier and safer when enforced from the beginning. Waiting until later risks redesigning major systems, names, assets, or user interface patterns after they have already shaped the project.

