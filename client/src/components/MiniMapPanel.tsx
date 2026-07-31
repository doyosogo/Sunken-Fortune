import { GamePanel } from "./GamePanel";
import type { SeaMapPositionUpdate } from "../game/worldConfig";

interface MiniMapPanelProps {
  playerPosition: SeaMapPositionUpdate;
}

export function MiniMapPanel({ playerPosition }: MiniMapPanelProps) {
  const playerLeft = `${clampPercent((playerPosition.x / playerPosition.worldWidth) * 100)}%`;
  const playerTop = `${clampPercent((playerPosition.y / playerPosition.worldHeight) * 100)}%`;

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
        {playerPosition.hostileMarkers.map((marker) => (
          <span
            className={
              marker.id === playerPosition.selectedTargetId
                ? "map-marker live-hostile selected"
                : "map-marker live-hostile"
            }
            key={marker.id}
            style={{
              left: `${clampPercent((marker.x / playerPosition.worldWidth) * 100)}%`,
              top: `${clampPercent((marker.y / playerPosition.worldHeight) * 100)}%`
            }}
          />
        ))}
        <span className="map-marker locked north">Locked</span>
        <span className="map-marker locked south">Locked</span>
      </div>
      <div className="minimap-legend">
        <span><i className="legend-player" /> Player</span>
        <span><i className="legend-enemy" /> Threat</span>
        <span><i className="legend-locked" /> Future Region</span>
      </div>
      <div className="navigation-readout">
        <div>
          <span>Water</span>
          <strong>{playerPosition.waterType}</strong>
        </div>
        <div>
          <span>Nearby</span>
          <strong>{playerPosition.nearbyLocationName ?? "None"}</strong>
        </div>
        <div>
          <span>Speed</span>
          <strong>{Math.round(playerPosition.speed)}</strong>
        </div>
        <div>
          <span>Heading</span>
          <strong>{Math.round(playerPosition.heading)} deg</strong>
        </div>
      </div>
    </GamePanel>
  );
}

function clampPercent(value: number) {
  return Math.min(96, Math.max(4, value));
}
