# Save System

## Purpose

The save system protects player progression, economy integrity, and trust. Because Sunken Fortune includes gold, materials, premium currency simulation, offline rewards, purchases, upgrades, and future cloud support, saving must be designed carefully from the beginning.

## Player-Facing Requirements

The game should include:

- A big visible **Save Game** / **Save Now** button at the top of the screen.
- Clear save status text.
- Manual save feedback.
- Autosave feedback.
- Major-action save behavior.

Example status messages:

- Saved 2 seconds ago.
- Saving...
- Unsaved changes.
- Save failed. Try again.

## Autosave Rules

| Trigger | Requirement |
| --- | --- |
| Timed autosave | Every 60 seconds while playing. |
| Manual save | Immediate save when player presses Save Game / Save Now. |
| Purchases | Save after purchases. |
| Upgrades | Save after upgrades. |
| Loot claims | Save after loot claims. |
| Boss kills | Save after boss kills. |
| Premium currency purchases | Save after fake premium purchases. |
| Logout | Save on logout or clean session exit. |

## Economy Integrity Requirements

The save system should be designed to avoid:

- Duplicate rewards.
- Lost purchases.
- Lost upgrade state.
- Premium currency mismatch.
- Offline reward double-claims.
- Boss reward double-claims.
- Desynchronization between inventory, currency, and progression records.

## Save Data Categories

Expected save data includes:

- Player profile.
- Captain XP and level.
- Crew XP and upgrades.
- Ship ownership and current ship.
- Ship upgrades.
- Cannon inventory and equipped cannons.
- Ammunition inventory.
- Modules.
- Talents.
- Gold balance.
- Premium currency balance.
- Premium currency history.
- Materials.
- Quest and boss state.
- Autonomous Voyage timestamps and claims.
- Save version.

## Future Cloud Save Support

The save system should be designed with future cloud saves in mind.

Future requirements may include:

- Account identity.
- Server-authoritative economy validation.
- Conflict resolution.
- Save migration.
- Device sync.
- Anti-tamper checks.
- Transaction logs for premium currency simulation.

## Save Versioning

Every save payload should include a version identifier once implementation begins. Versioning allows future migrations when progression systems, economy records, or inventory formats change.

## Implementation Guidance For Later

Do not treat save behavior as a final UI detail. It is a core system. Before implementation, define:

- Save schema.
- Transaction boundaries.
- Offline reward claim flow.
- Premium currency ledger structure.
- Migration strategy.
- Error states and recovery behavior.

