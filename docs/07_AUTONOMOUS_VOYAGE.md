# Autonomous Voyage

## Player-Facing Name

The offline progression system is called **Autonomous Voyage**.

Do not call this system "AFK farming" in player-facing UI or narrative.

## Concept

When the player is offline, their crew continues sailing under standing orders. On return, the player receives a themed Captain's Log / Voyage Report summarizing what happened while they were away.

Autonomous Voyage is intended to support retention and provide light background progress. It must not replace active gameplay.

## Reward Window

| Rule | Value |
| --- | --- |
| Maximum reward window | 14 hours |
| Rewards after cap | Stop accumulating |
| Restart condition | Player opens the game again, saves, and exits/restarts the voyage cycle |
| Design target | 1 focused hour of active combat roughly equals a full 14-hour Autonomous Voyage reward window |

## Reward Philosophy

Autonomous Voyage gives reduced and capped rewards. Active combat should remain the best way to earn progression.

Allowed rewards:

- Gold.
- Basic loot.
- Character XP.
- Crew XP.
- Common materials.
- Small chances of minor premium currency.

Forbidden rewards:

- Boss-exclusive drops.
- Rare ship materials.
- Event currency.
- First-time boss kills.
- Major quest completion.
- Premium-tier rare loot.

## Captain's Log / Voyage Report

On login, the player should see a themed report with:

| Field | Description |
| --- | --- |
| Time away | Actual offline duration and capped duration if applicable. |
| Enemies defeated | Estimated or simulated enemies defeated by the crew. |
| Gold earned | Gold added from the voyage. |
| XP earned | Captain and crew XP earned. |
| Loot found | Basic loot and common materials. |
| Ammo used | Ammunition consumed during the voyage. |
| Hull damage | Damage taken while away. |
| Repairs needed | Gold or material cost implications. |
| Capped reward status | Whether the 14-hour cap was reached. |

## Design Constraints

Autonomous Voyage should:

- Use capped reward calculations.
- Respect save-system integrity.
- Avoid granting restricted rewards.
- Consume or account for ammunition where appropriate.
- Report hull damage and repair needs.
- Be transparent enough that players understand what happened.

## Balance Notes

The 14-hour cap creates a natural return cadence without requiring constant logins. The reward target is intentionally conservative: one good hour of active combat should roughly match the full capped voyage window.

This protects the central identity of Sunken Fortune as an active naval combat RPG.

