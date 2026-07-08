# Economy And Monetization

## Economy Direction

Gold is the main progression currency in Sunken Fortune. Premium currency may accelerate progression and unlock premium options, but most important progression must have a free path.

Active combat should strongly outperform Autonomous Voyage. Economy values should be tunable and should not be scattered as hardcoded magic numbers.

## Currency Types

| Currency | Role |
| --- | --- |
| Gold | Main progression currency for upgrades, repairs, crafting, and purchases. |
| Premium currency | Fake premium currency used for economy simulation and portfolio demonstration. |
| Materials | Crafting and upgrade inputs, separated by rarity and source. |
| XP | Captain and crew progression. |

## Gold

Gold should support:

- Ship upgrades.
- Cannon purchases.
- Repairs.
- Ammunition purchases.
- Crafting costs.
- Crew improvements.
- Port services.

Gold should be earned primarily through active combat, with smaller amounts from Autonomous Voyage and other secondary systems.

## Premium Currency Simulator

Sunken Fortune includes a fake premium currency system that simulates a real-money store but does not process real payments.

Rules:

- Use imaginary USD only.
- No real payment gateway.
- No payment processor integration.
- No credit card, wallet, banking, or checkout implementation.
- Weekly imaginary spending cap: $100.
- Purchase history must be recorded.

## Premium Currency Tracking

The system must track:

| Metric | Requirement |
| --- | --- |
| Lifetime imaginary spending | Total simulated USD spent over account lifetime. |
| Weekly imaginary spending | Simulated USD spent during the current weekly window. |
| Premium currency purchased | Total premium currency acquired through fake bundles. |
| Premium currency earned free | Total premium currency earned through gameplay. |
| Premium currency spent | Total premium currency consumed. |
| Current balance | Spendable premium currency remaining. |
| Purchase history | Bundle, amount, timestamp, and simulated USD value. |

## Fake Bundle Direction

Bundles should be documented and tunable. They may include different premium currency amounts and imaginary USD prices, but must obey the weekly $100 cap.

Example structure:

| Bundle | Imaginary USD | Premium Currency |
| --- | ---: | ---: |
| Small Cache | $4.99 | Tunable |
| Captain's Stash | $9.99 | Tunable |
| Admiral's Chest | $24.99 | Tunable |
| Fleet Treasury | $49.99 | Tunable |

These values are illustrative. Final values should be tuned, not embedded as permanent constants.

## Free Premium Currency Sources

Premium currency may also be earned through:

- Quests.
- Level rewards.
- Boss drops.
- Achievements.
- Rare drops.
- Small Autonomous Voyage chances.

Free premium currency should feel meaningful but controlled.

## Premium Spend Categories

Premium currency may be used for:

- Convenience accelerators.
- Premium ammunition.
- Premium upgrade options.
- Cosmetics.
- Additional crafting options.
- Limited rerolls or recovery mechanics.

Important progression should retain a free path. Premium ammo and premium upgrades can exist, but normal gameplay must not feel useless without them.

## Balance Principles

| Principle | Direction |
| --- | --- |
| Active-first | Active combat must be the best progression method. |
| Free path | Core progression must remain possible without premium currency. |
| Tunable values | Economy numbers should be centralized and easy to adjust. |
| Clear records | Premium purchases and spends must be auditable. |
| No real money | The MVP must not process real payments. |

