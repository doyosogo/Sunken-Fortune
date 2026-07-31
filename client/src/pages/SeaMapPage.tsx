import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { ActionBar } from "../components/ActionBar";
import { CaptainPanel } from "../components/CaptainPanel";
import { MiniMapPanel } from "../components/MiniMapPanel";
import { ObjectivesPanel } from "../components/ObjectivesPanel";
import { ResourceBar } from "../components/ResourceBar";
import { SaveStatusBar } from "../components/SaveStatusBar";
import { ShipStatusPanel } from "../components/ShipStatusPanel";
import { VoyageLog } from "../components/VoyageLog";
import { createSeaMapGame } from "../game/createSeaMapGame";
import {
  SEA_MAP_PLAYER_EVENT,
  SEA_WORLD,
  type SeaMapPositionUpdate
} from "../game/worldConfig";

export function SeaMapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [playerPosition, setPlayerPosition] = useState<SeaMapPositionUpdate>({
    x: 420,
    y: 2860,
    heading: 0,
    speed: 0,
    worldWidth: SEA_WORLD.width,
    worldHeight: SEA_WORLD.height,
    regionName: SEA_WORLD.regionName
  });

  useEffect(() => {
    if (!containerRef.current || gameRef.current) {
      return;
    }

    gameRef.current = createSeaMapGame(containerRef.current);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handlePlayerUpdate = (event: Event) => {
      setPlayerPosition((event as CustomEvent<SeaMapPositionUpdate>).detail);
    };

    window.addEventListener(SEA_MAP_PLAYER_EVENT, handlePlayerUpdate);

    return () => {
      window.removeEventListener(SEA_MAP_PLAYER_EVENT, handlePlayerUpdate);
    };
  }, []);

  return (
    <section className="game-screen">
      <div className="hud-top">
        <ResourceBar />
        <SaveStatusBar />
      </div>

      <div className="hud-grid">
        <aside className="hud-column">
          <CaptainPanel />
          <ObjectivesPanel />
          <VoyageLog />
        </aside>

        <div className="sea-map-frame">
          <div className="sea-map-title">
            <div>
              <span className="eyebrow">Real-Time Sea Map</span>
              <h2>Emerald Coast Waters</h2>
            </div>
            <span>Placeholder world entities only</span>
          </div>
          <div className="phaser-host" ref={containerRef} />
        </div>

        <aside className="hud-column">
          <MiniMapPanel playerPosition={playerPosition} />
          <ShipStatusPanel />
        </aside>
      </div>

      <ActionBar />
    </section>
  );
}
