const actions = ["Cannon", "Harpoon", "Repair", "Loot", "Map", "Inventory", "Autonomous Voyage", "Settings"];

export function ActionBar() {
  return (
    <div className="action-bar" aria-label="Action bar">
      {actions.map((action) => (
        <button className="action-button" key={action} type="button">
          <span className="action-icon" aria-hidden="true" />
          {action}
        </button>
      ))}
    </div>
  );
}
