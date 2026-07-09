interface ActionItem {
  label: string;
  selected?: boolean;
  disabled?: boolean;
}

const actions: ActionItem[] = [
  { label: "Cannon", selected: true },
  { label: "Harpoon", disabled: true },
  { label: "Repair" },
  { label: "Loot" },
  { label: "Map" },
  { label: "Inventory" },
  { label: "Autonomous Voyage" },
  { label: "Settings" }
];

export function ActionBar() {
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
        </button>
      ))}
    </div>
  );
}
