export const SEA_WORLD = {
  width: 5200,
  height: 3600,
  regionName: "Emerald Coast"
} as const;

export const SHIP_MOVEMENT = {
  // Forward acceleration in world pixels per second squared.
  forwardAcceleration: 170,
  // Reverse acceleration is lower so backing up feels deliberate.
  reverseAcceleration: 70,
  // Open-sea forward speed cap in world pixels per second.
  maxForwardSpeed: 300,
  // Open-sea reverse speed cap in world pixels per second.
  maxReverseSpeed: 95,
  // Passive deceleration when the player is not applying thrust.
  linearDrag: 72,
  // Radians per second before speed-based turn scaling.
  turnRate: 2.05,
  // Minimum steering authority while nearly stopped.
  minTurnSpeedFactor: 0.28,
  // Keeps the ship silhouette inside the invisible world bounds.
  boundsPadding: 42,
  // Maximum speed multiplier while inside shallow water.
  shallowWaterSpeedMultiplier: 0.58,
  // Acceleration multiplier while inside shallow water.
  shallowWaterAccelerationMultiplier: 0.62,
  // How strongly island collision pushes the ship out each frame.
  collisionResponseStrength: 0.42,
  // Velocity reduction after contacting land, preventing harsh rebounds.
  collisionVelocityDamping: 0.45,
  // Default detection radius for non-port nearby hazards.
  nearbyInteractionDistance: 220,
  // Default harbour approach distance for future docking.
  portInteractionDistance: 190,
  // Cooldown for placeholder E-key responses.
  interactionMessageCooldownMs: 1400
} as const;

export type WaterType = "Open Sea" | "Shallow Waters";

export interface SeaMapPositionUpdate {
  x: number;
  y: number;
  heading: number;
  speed: number;
  worldWidth: number;
  worldHeight: number;
  regionName: string;
  waterType: WaterType;
  nearbyLocationName: string | null;
}

export const SEA_MAP_PLAYER_EVENT = "sunken-fortune:sea-map-player-update";
