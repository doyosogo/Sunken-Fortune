import { SHIP_MOVEMENT } from "./worldConfig";

export interface WorldPosition {
  x: number;
  y: number;
}

export type WorldObjectType = "island" | "port" | "enemy" | "monster" | "shallow-water";

interface WorldObjectBase {
  id: string;
  displayName: string;
  position: WorldPosition;
  interactionRadius: number;
  objectType: WorldObjectType;
  projectileCollisionRadius: number;
}

export interface IslandDefinition extends WorldObjectBase {
  objectType: "island";
  renderRadius: number;
  collisionRadius: number;
  shallowWaterRadius?: number;
}

export interface PortDefinition extends WorldObjectBase {
  objectType: "port";
  collisionRadius: number;
  harbourRadius: number;
  shallowWaterRadius?: number;
}

export interface EnemyShipDefinition extends WorldObjectBase {
  objectType: "enemy";
  rotationDegrees: number;
  patrolPoints: WorldPosition[];
}

export interface SeaMonsterDefinition extends WorldObjectBase {
  objectType: "monster";
}

export interface ShallowWaterZoneDefinition extends WorldObjectBase {
  objectType: "shallow-water";
  radius: number;
}

export const ISLANDS: IslandDefinition[] = [
  {
    id: "driftwood-cay",
    displayName: "Driftwood Cay",
    position: { x: 720, y: 760 },
    renderRadius: 230,
    collisionRadius: 96,
    projectileCollisionRadius: 124,
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    shallowWaterRadius: 260,
    objectType: "island"
  },
  {
    id: "saltglass-reef",
    displayName: "Saltglass Reef",
    position: { x: 1620, y: 1380 },
    renderRadius: 250,
    collisionRadius: 106,
    projectileCollisionRadius: 136,
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    shallowWaterRadius: 300,
    objectType: "island"
  },
  {
    id: "old-lantern-isle",
    displayName: "Old Lantern Isle",
    position: { x: 2500, y: 520 },
    renderRadius: 235,
    collisionRadius: 98,
    projectileCollisionRadius: 126,
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    shallowWaterRadius: 275,
    objectType: "island"
  },
  {
    id: "coralhook-atoll",
    displayName: "Coralhook Atoll",
    position: { x: 3340, y: 2100 },
    renderRadius: 245,
    collisionRadius: 104,
    projectileCollisionRadius: 134,
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    shallowWaterRadius: 290,
    objectType: "island"
  },
  {
    id: "mistbarrel-key",
    displayName: "Mistbarrel Key",
    position: { x: 4480, y: 2960 },
    renderRadius: 230,
    collisionRadius: 96,
    projectileCollisionRadius: 124,
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    shallowWaterRadius: 265,
    objectType: "island"
  }
];

export const PORTS: PortDefinition[] = [
  {
    id: "tidefall-port",
    displayName: "Tidefall Port",
    position: { x: 520, y: 2920 },
    collisionRadius: 76,
    projectileCollisionRadius: 98,
    interactionRadius: SHIP_MOVEMENT.portInteractionDistance,
    harbourRadius: 230,
    shallowWaterRadius: 260,
    objectType: "port"
  },
  {
    id: "amberwake-harbor",
    displayName: "Amberwake Harbor",
    position: { x: 3040, y: 2760 },
    collisionRadius: 76,
    projectileCollisionRadius: 98,
    interactionRadius: SHIP_MOVEMENT.portInteractionDistance,
    harbourRadius: 230,
    shallowWaterRadius: 260,
    objectType: "port"
  }
];

export const ENEMY_SHIPS: EnemyShipDefinition[] = [
  {
    id: "raider-cutter",
    displayName: "Raider Cutter",
    position: { x: 1320, y: 2040 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 48,
    rotationDegrees: 44,
    patrolPoints: [
      { x: 1320, y: 2040 },
      { x: 1620, y: 1880 },
      { x: 1480, y: 2320 }
    ],
    objectType: "enemy"
  },
  {
    id: "rogue-sloop",
    displayName: "Rogue Sloop",
    position: { x: 2380, y: 1180 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 48,
    rotationDegrees: 118,
    patrolPoints: [
      { x: 2380, y: 1180 },
      { x: 2740, y: 960 },
      { x: 2580, y: 1460 }
    ],
    objectType: "enemy"
  },
  {
    id: "blackwake-brig",
    displayName: "Blackwake Brig",
    position: { x: 3920, y: 1460 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 54,
    rotationDegrees: 214,
    patrolPoints: [
      { x: 3920, y: 1460 },
      { x: 4200, y: 1280 },
      { x: 4320, y: 1700 },
      { x: 4020, y: 1880 }
    ],
    objectType: "enemy"
  },
  {
    id: "ashwake-raider",
    displayName: "Ashwake Raider",
    position: { x: 4480, y: 2480 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 48,
    rotationDegrees: 306,
    patrolPoints: [
      { x: 4480, y: 2480 },
      { x: 4760, y: 2260 },
      { x: 4860, y: 2720 }
    ],
    objectType: "enemy"
  }
];

export const SEA_MONSTERS: SeaMonsterDefinition[] = [
  {
    id: "reef-horror",
    displayName: "Reef Horror",
    position: { x: 1880, y: 620 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 58,
    objectType: "monster"
  },
  {
    id: "deepcoil",
    displayName: "Deepcoil",
    position: { x: 3560, y: 3180 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 58,
    objectType: "monster"
  },
  {
    id: "crownmaw",
    displayName: "Crownmaw",
    position: { x: 4680, y: 1040 },
    interactionRadius: SHIP_MOVEMENT.nearbyInteractionDistance,
    projectileCollisionRadius: 58,
    objectType: "monster"
  }
];

export const SHALLOW_WATER_ZONES: ShallowWaterZoneDefinition[] = [
  ...ISLANDS.filter((island) => island.shallowWaterRadius).map((island) => ({
    id: `${island.id}-shallows`,
    displayName: `${island.displayName} Shallows`,
    position: island.position,
    interactionRadius: 0,
    projectileCollisionRadius: 0,
    radius: island.shallowWaterRadius!,
    objectType: "shallow-water" as const
  })),
  ...PORTS.filter((port) => port.shallowWaterRadius).map((port) => ({
    id: `${port.id}-harbour-shallows`,
    displayName: `${port.displayName} Harbour Waters`,
    position: port.position,
    interactionRadius: 0,
    projectileCollisionRadius: 0,
    radius: port.shallowWaterRadius!,
    objectType: "shallow-water" as const
  }))
];

export type ProjectileTargetDefinition =
  | IslandDefinition
  | PortDefinition
  | EnemyShipDefinition
  | SeaMonsterDefinition;

export const PROJECTILE_TARGETS: ProjectileTargetDefinition[] = [
  ...ISLANDS,
  ...PORTS,
  ...ENEMY_SHIPS,
  ...SEA_MONSTERS
];
