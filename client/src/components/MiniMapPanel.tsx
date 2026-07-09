import { GamePanel } from "./GamePanel";

export function MiniMapPanel() {
  return (
    <GamePanel title="Emerald Coast">
      <div className="minimap" aria-label="Emerald Coast minimap placeholder">
        <span className="map-marker player" />
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
