import Phaser from "phaser";
import { ShipNavigator } from "./ShipNavigator";
import type { WorldPosition } from "../worldObjects";

export class PatrolController {
  private pointIndex = 0;

  constructor(
    private readonly navigator: ShipNavigator,
    private readonly container: Phaser.GameObjects.Container,
    private readonly points: WorldPosition[]
  ) {
    this.navigator.setDestination(this.points[0]);
  }

  update(deltaMs: number) {
    this.navigator.update(deltaMs);

    const target = this.points[this.pointIndex];
    const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, target.x, target.y);

    if (distance < 72) {
      this.pointIndex = (this.pointIndex + 1) % this.points.length;
      this.navigator.setDestination(this.points[this.pointIndex]);
    }
  }
}
