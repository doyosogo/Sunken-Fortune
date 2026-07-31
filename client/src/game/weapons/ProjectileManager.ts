import Phaser from "phaser";
import { Cannonball } from "./Cannonball";
import { ImpactEffects } from "./ImpactEffects";
import { findProjectileHit, type ProjectileCollisionTarget } from "./ProjectileCollision";

export interface ProjectileDebugStats {
  totalShotsFired: number;
  successfulHits: number;
  waterImpacts: number;
  objectImpacts: number;
}

export class ProjectileManager {
  private readonly cannonballs: Cannonball[] = [];
  private readonly stats: ProjectileDebugStats = {
    totalShotsFired: 0,
    successfulHits: 0,
    waterImpacts: 0,
    objectImpacts: 0
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly getCollisionTargets: () => ProjectileCollisionTarget[]
  ) {}

  spawnCannonball(x: number, y: number, angle: number) {
    this.stats.totalShotsFired += 1;
    this.cannonballs.push(new Cannonball(this.scene, x, y, angle));
  }

  update(deltaMs: number) {
    const targets = this.getCollisionTargets();

    for (let index = this.cannonballs.length - 1; index >= 0; index -= 1) {
      const cannonball = this.cannonballs[index];
      const isAlive = cannonball.update(deltaMs);

      if (!isAlive) {
        ImpactEffects.createWaterSplash(this.scene, cannonball.x, cannonball.y);
        this.stats.waterImpacts += 1;
        this.removeCannonball(index);
        continue;
      }

      const hitTarget = findProjectileHit(cannonball.x, cannonball.y, targets);

      if (hitTarget) {
        ImpactEffects.createObjectImpact(this.scene, cannonball.x, cannonball.y);
        hitTarget.flash();
        this.stats.objectImpacts += 1;
        this.stats.successfulHits += 1;
        this.removeCannonball(index);
      }
    }
  }

  getDebugStats(): ProjectileDebugStats {
    return {
      ...this.stats
    };
  }

  private removeCannonball(index: number) {
    const cannonball = this.cannonballs[index];

    if (cannonball) {
      cannonball.destroy();
        this.cannonballs.splice(index, 1);
    }
  }

  get activeCount() {
    return this.cannonballs.length;
  }

  destroy() {
    this.cannonballs.forEach((cannonball) => cannonball.destroy());
    this.cannonballs.length = 0;
  }
}
