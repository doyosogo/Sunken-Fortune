import type { CSSProperties } from "react";
import type { WeaponStateUpdate } from "../game/worldConfig";

interface ActionItem {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  sideCooldowns?: {
    port: number;
    starboard: number;
  };
  meta?: string;
}

interface ActionBarProps {
  weaponState: WeaponStateUpdate;
  cooldownDurationMs: number;
}

export function ActionBar({ cooldownDurationMs, weaponState }: ActionBarProps) {
  const actions: ActionItem[] = [
    {
      label: "Cannon",
      selected: true,
      sideCooldowns: {
        port: getCooldownPercent(weaponState.portCooldownRemainingMs, cooldownDurationMs),
        starboard: getCooldownPercent(weaponState.starboardCooldownRemainingMs, cooldownDurationMs)
      },
      meta: `P ${formatReady(weaponState.portReady)} / S ${formatReady(weaponState.starboardReady)}`
    },
    { label: "Harpoon", disabled: true },
    { label: "Repair" },
    { label: "Loot" },
    { label: "Map" },
    { label: "Inventory" },
    { label: "Autonomous Voyage" },
    { label: "Settings" }
  ];

  return (
    <div className="action-bar" aria-label="Action bar">
      {actions.map((action) => (
        <button
          aria-pressed={action.selected || undefined}
          className={action.selected ? "action-button selected" : "action-button"}
          disabled={action.disabled}
          key={action.label}
          type="button"
        >
          <span className="action-icon" aria-hidden="true" />
          {action.label}
          {action.sideCooldowns && (
            <span className="cooldown-pair" aria-hidden="true">
              <span
                className="cooldown-meter port"
                style={{ "--cooldown-percent": `${action.sideCooldowns.port}%` } as CSSProperties}
              />
              <span
                className="cooldown-meter starboard"
                style={{ "--cooldown-percent": `${action.sideCooldowns.starboard}%` } as CSSProperties}
              />
            </span>
          )}
          {action.meta && <small>{action.meta}</small>}
        </button>
      ))}
    </div>
  );
}

function formatReady(isReady: boolean) {
  return isReady ? "Ready" : "Load";
}

function getCooldownPercent(remainingMs: number, cooldownDurationMs: number) {
  const remaining = Math.max(0, remainingMs);
  return Math.min(100, Math.max(0, (remaining / cooldownDurationMs) * 100));
}
