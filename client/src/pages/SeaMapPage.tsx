import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { ActionBar } from "../components/ActionBar";
import { CaptainPanel } from "../components/CaptainPanel";
import { MiniMapPanel } from "../components/MiniMapPanel";
import { ObjectivesPanel } from "../components/ObjectivesPanel";
import { ResourceBar } from "../components/ResourceBar";
import { SaveStatusBar } from "../components/SaveStatusBar";
import { ShipStatusPanel } from "../components/ShipStatusPanel";
import { TargetPanel } from "../components/TargetPanel";
import { VoyageLog } from "../components/VoyageLog";
import { createSeaMapGame } from "../game/createSeaMapGame";
import {
  SEA_MAP_PLAYER_EVENT,
  SEA_MAP_WEAPON_EVENT,
  SEA_WORLD,
  WEAPON_CONFIG,
  type SeaMapPositionUpdate,
  type WeaponStateUpdate
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
    regionName: SEA_WORLD.regionName,
    waterType: "Open Sea",
    nearbyLocationName: null,
    selectedTargetId: null,
    targetSnapshot: null,
    hostileMarkers: []
  });
  const [weaponState, setWeaponState] = useState<WeaponStateUpdate>({
    portReady: true,
    starboardReady: true,
    portCooldownRemainingMs: 0,
    starboardCooldownRemainingMs: 0,
    activeCannonballs: 0,
    totalShotsFired: 0,
    successfulHits: 0,
    waterImpacts: 0,
    objectImpacts: 0
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
    const handleWeaponUpdate = (event: Event) => {
      setWeaponState((event as CustomEvent<WeaponStateUpdate>).detail);
    };

    window.addEventListener(SEA_MAP_WEAPON_EVENT, handleWeaponUpdate);

    return () => {
      window.removeEventListener(SEA_MAP_WEAPON_EVENT, handleWeaponUpdate);
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
          <TargetPanel target={playerPosition.targetSnapshot} />
          <ShipStatusPanel />
        </aside>
      </div>

      <ActionBar cooldownDurationMs={WEAPON_CONFIG.broadsideCooldownMs} weaponState={weaponState} />
    </section>
  );
}
