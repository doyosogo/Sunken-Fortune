export const SEA_WORLD = {
  width: 5200,
  height: 3600,
  regionName: "Emerald Coast"
} as const;

// Movement values are intentionally conservative so the prototype feels like a ship,
// with momentum and a wide turning radius instead of instant arcade movement.
export const SHIP_MOVEMENT = {
  forwardAcceleration: 170,
  reverseAcceleration: 70,
  maxForwardSpeed: 300,
  maxReverseSpeed: 95,
  linearDrag: 72,
  turnRate: 2.05,
  minTurnSpeedFactor: 0.28,
  boundsPadding: 42
} as const;

export interface SeaMapPositionUpdate {
  x: number;
  y: number;
  heading: number;
  speed: number;
  worldWidth: number;
  worldHeight: number;
  regionName: string;
}

export const SEA_MAP_PLAYER_EVENT = "sunken-fortune:sea-map-player-update";
