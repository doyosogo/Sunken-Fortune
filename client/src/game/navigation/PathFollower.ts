import Phaser from "phaser";
import { NAVIGATION_CONFIG } from "../worldConfig";
import type { WorldPosition } from "../worldObjects";
import { ShipNavigator } from "./ShipNavigator";

export class PathFollower {
  private path: WorldPosition[] = [];
  private waypointIndex = 0;

  constructor(
    private readonly navigator: ShipNavigator,
    private readonly container: Phaser.GameObjects.Container
  ) {}

  setPath(path: WorldPosition[]) {
    this.path = path;
    this.waypointIndex = 0;
    this.applyCurrentWaypoint();
  }

  clear() {
    this.path = [];
    this.waypointIndex = 0;
    this.navigator.clearDestination();
  }

  update() {
    const waypoint = this.path[this.waypointIndex];
    if (!waypoint) return;
    const distance = Phaser.Math.Distance.Between(this.container.x, this.container.y, waypoint.x, waypoint.y);
    if (distance <= NAVIGATION_CONFIG.waypointArrivalRadius) {
      this.waypointIndex += 1;
      this.applyCurrentWaypoint();
    }
  }

  getPath() {
    return this.path.slice(this.waypointIndex);
  }

  getDestination() {
    return this.path[this.path.length - 1] ?? null;
  }

  private applyCurrentWaypoint() {
    const waypoint = this.path[this.waypointIndex];
    if (waypoint) {
      this.navigator.setDestination(waypoint);
    } else {
      this.navigator.clearDestination();
    }
  }
}
