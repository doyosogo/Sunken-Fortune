import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { createSeaMapGame } from "../game/createSeaMapGame";

export function SeaMapPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

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

  return (
    <section className="sea-map-page">
      <div className="map-header">
        <h2>Sea Map Placeholder</h2>
        <span>Generated shapes only. No combat or real assets.</span>
      </div>
      <div className="phaser-host" ref={containerRef} />
    </section>
  );
}
