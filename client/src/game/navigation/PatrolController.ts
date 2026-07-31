import Phaser from "phaser";
import { ShipNavigator } from "./ShipNavigator";
import { Pathfinder } from "./Pathfinder";
import type { WorldPosition } from "../worldObjects";
import { PathFollower } from "./PathFollower";

export class PatrolController {
  private pointIndex = 0;
  private readonly follower: PathFollower;

  constructor(
    private readonly navigator: ShipNavigator,
    private readonly container: Phaser.GameObjects.Container,
    private readonly points: WorldPosition[],
    private readonly pathfinder: Pathfinder
  ) {
    this.follower = new PathFollower(navigator, container);
    this.setPathToCurrentPoint();
  }

  update(deltaMs: number) {
    this.navigator.update(deltaMs);
    this.follower.update();

    const target = this.points[this.pointIndex];
    const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, target.x, target.y);

    if (distance < 72) {
      this.pointIndex = (this.pointIndex + 1) % this.points.length;
      this.setPathToCurrentPoint();
    }
  }

  getPath() {
    return this.follower.getPath();
  }

  private setPathToCurrentPoint() {
    this.follower.setPath(this.pathfinder.findPath(this.container, this.points[this.pointIndex]));
  }
}
