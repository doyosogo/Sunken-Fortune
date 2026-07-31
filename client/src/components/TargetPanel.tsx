import { GamePanel } from "./GamePanel";
import type { SeaMapPositionUpdate } from "../game/worldConfig";

interface TargetPanelProps {
  isChasing: boolean;
  target: SeaMapPositionUpdate["targetSnapshot"];
}

export function TargetPanel({ isChasing, target }: TargetPanelProps) {
  return (
    <GamePanel title="Current Target">
      {target ? (
        <div className="target-readout">
          <strong>{target.displayName}</strong>
          {isChasing && (
            <div className="pursuit-status">
              <span className="pursuit-icon" aria-hidden="true" />
              Chasing {target.displayName}
            </div>
          )}
          <div className="target-health">
            <span />
          </div>
          <div className="stat-grid">
            <div className="stat-row">
              <span>Type</span>
              <strong>{target.objectType === "enemy" ? "Enemy Ship" : "Sea Monster"}</strong>
            </div>
            <div className="stat-row">
              <span>Distance</span>
              <strong>{Math.round(target.distance)}</strong>
            </div>
            <div className="stat-row">
              <span>Health</span>
              <strong>{target.healthLabel}</strong>
            </div>
            <div className="stat-row">
              <span>Status</span>
              <strong>{target.status}</strong>
            </div>
          </div>
        </div>
      ) : (
        <p className="empty-target">No hostile target selected.</p>
      )}
    </GamePanel>
  );
}
