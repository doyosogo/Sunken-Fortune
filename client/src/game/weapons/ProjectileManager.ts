import Phaser from "phaser";
import { Cannonball } from "./Cannonball";

export class ProjectileManager {
  private readonly cannonballs: Cannonball[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  spawnCannonball(x: number, y: number, angle: number) {
    this.cannonballs.push(new Cannonball(this.scene, x, y, angle));
  }

  update(deltaMs: number) {
    for (let index = this.cannonballs.length - 1; index >= 0; index -= 1) {
      const cannonball = this.cannonballs[index];

      if (!cannonball.update(deltaMs)) {
        cannonball.destroy();
        this.cannonballs.splice(index, 1);
      }
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

