import { GamePanel } from "./GamePanel";

export function CaptainPanel() {
  return (
    <GamePanel title="Captain">
      <div className="captain-card">
        <div className="captain-portrait" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>Captain Marlow Vane</strong>
          <span>Level 8 Corsair</span>
          <small>Reputation: Rising Tide</small>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-row">
          <span>Zone</span>
          <strong>Emerald Coast</strong>
        </div>
        <div className="stat-row">
          <span>Crew</span>
          <strong>24 / 30</strong>
        </div>
      </div>
    </GamePanel>
  );
}
