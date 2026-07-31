import Phaser from "phaser";
import { WEAPON_CONFIG } from "../worldConfig";
import type { WorldObjectType } from "../worldObjects";

export interface ProjectileCollisionTarget {
  id: string;
  displayName: string;
  objectType: Exclude<WorldObjectType, "shallow-water">;
  x: number;
  y: number;
  radius: number;
  flash: () => void;
}

export function findProjectileHit(
  projectileX: number,
  projectileY: number,
  targets: ProjectileCollisionTarget[]
) {
  return targets.find((target) => {
    const distance = Phaser.Math.Distance.Between(projectileX, projectileY, target.x, target.y);
    return distance <= target.radius + WEAPON_CONFIG.cannonballCollisionRadius;
  }) ?? null;
}

