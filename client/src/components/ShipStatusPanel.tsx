import { GamePanel } from "./GamePanel";

const shipStats = [
  { label: "Ship", value: "Dawn Skiff" },
  { label: "Level", value: "3" },
  { label: "Hull", value: "84%" },
  { label: "Sails", value: "91%" },
  { label: "Cargo", value: "18 / 40" },
  { label: "Speed", value: "12 knots" }
];

export function ShipStatusPanel() {
  return (
    <GamePanel title="Ship Status">
      <div className="ship-gauge">
        <div className="ship-silhouette" aria-hidden="true" />
        <strong>Dawn Skiff</strong>
      </div>
      <div className="stat-grid">
        {shipStats.map((stat) => (
          <div className="stat-row" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </GamePanel>
  );
}
