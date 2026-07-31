import Phaser from "phaser";
import { WEAPON_CONFIG } from "../worldConfig";

export class Cannonball {
  readonly sprite: Phaser.GameObjects.Arc;

  private ageMs = 0;
  private readonly velocity: Phaser.Math.Vector2;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    this.sprite = scene.add.circle(x, y, 7, 0x1f2937).setStrokeStyle(2, 0xf8c14a);
    this.sprite.setDepth(18);
    this.velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(WEAPON_CONFIG.cannonballSpeed);
  }

  update(deltaMs: number) {
    const deltaSeconds = deltaMs / 1000;
    this.ageMs += deltaMs;
    this.sprite.x += this.velocity.x * deltaSeconds;
    this.sprite.y += this.velocity.y * deltaSeconds;
    return this.ageMs < WEAPON_CONFIG.cannonballLifetimeMs;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  destroy() {
    this.sprite.destroy();
  }
}
