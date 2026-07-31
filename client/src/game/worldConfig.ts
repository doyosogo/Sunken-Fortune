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
  interactionMessageCooldownMs: 1400,
  // Distance from click destination where the ship begins its final stop.
  arrivalRadius: 36,
  // Distance from destination where speed starts tapering down.
  arrivalSlowRadius: 260,
  // Minimum angle alignment before full acceleration is applied.
  headingAccelerationDot: 0.35,
  // Approximate camera zoom for command-view navigation.
  cameraZoom: 0.55
} as const;

export const WEAPON_CONFIG = {
  // Cooldown per broadside in milliseconds. Tuned long enough to make readiness visible.
  broadsideCooldownMs: 1200,
  // Projectile travel speed in world pixels per second.
  cannonballSpeed: 620,
  // Projectile lifetime before auto-destroy.
  cannonballLifetimeMs: 1450,
  // Distance from the ship side where cannonballs start.
  hardpointSideOffset: 32,
  // Small forward/back spread between cannons on the same side.
  hardpointForwardSpacing: 24,
  // Flash lifetime for generated muzzle flare placeholders.
  muzzleFlashLifetimeMs: 110,
  // Visual recoil distance opposite the firing side.
  recoilDistance: 8,
  // Recoil animation duration.
  recoilDurationMs: 90,
  // Radius used for placeholder cannonball overlap tests.
  cannonballCollisionRadius: 7,
  // Short impact flash duration for non-damaging collision validation.
  impactFlashDurationMs: 140,
  // Short smoke puff duration after object impacts.
  smokePuffDurationMs: 360,
  // Short splash duration when cannonballs expire over water.
  waterSplashDurationMs: 300,
  // Broadside firing arc on either side of the ship, in degrees.
  broadsideArcDegrees: 72,
  // Maximum current placeholder target firing distance.
  targetFireRange: 760
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
  selectedTargetId: string | null;
  targetSnapshot: {
    id: string;
    displayName: string;
    objectType: "enemy" | "monster";
    x: number;
    y: number;
    distance: number;
    healthLabel: string;
    status: string;
  } | null;
  hostileMarkers: Array<{
    id: string;
    x: number;
    y: number;
    objectType: "enemy" | "monster";
  }>;
}

export interface WeaponStateUpdate {
  portReady: boolean;
  starboardReady: boolean;
  portCooldownRemainingMs: number;
  starboardCooldownRemainingMs: number;
  activeCannonballs: number;
  totalShotsFired: number;
  successfulHits: number;
  waterImpacts: number;
  objectImpacts: number;
}

export const SEA_MAP_PLAYER_EVENT = "sunken-fortune:sea-map-player-update";
export const SEA_MAP_WEAPON_EVENT = "sunken-fortune:sea-map-weapon-update";
