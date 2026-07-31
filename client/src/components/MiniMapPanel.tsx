import { GamePanel } from "./GamePanel";
import type { SeaMapPositionUpdate } from "../game/worldConfig";

interface MiniMapPanelProps {
  playerPosition: SeaMapPositionUpdate;
}

export function MiniMapPanel({ playerPosition }: MiniMapPanelProps) {
  const playerLeft = `${(playerPosition.x / playerPosition.worldWidth) * 100}%`;
  const playerTop = `${(playerPosition.y / playerPosition.worldHeight) * 100}%`;

  return (
    <GamePanel title={playerPosition.regionName}>
      <div className="minimap" aria-label="Emerald Coast minimap placeholder">
        <span
          className="map-marker player"
          style={{
            left: playerLeft,
            top: playerTop,
            transform: `translate(-50%, -50%) rotate(${playerPosition.heading}deg)`
          }}
        />
        <span className="map-marker enemy one" />
        <span className="map-marker enemy two" />
        <span className="map-marker locked north">Locked</span>
        <span className="map-marker locked south">Locked</span>
      </div>
      <div className="minimap-legend">
        <span><i className="legend-player" /> Player</span>
        <span><i className="legend-enemy" /> Threat</span>
        <span><i className="legend-locked" /> Future Region</span>
      </div>
    </GamePanel>
  );
}
