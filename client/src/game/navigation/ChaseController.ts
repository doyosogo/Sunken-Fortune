import Phaser from "phaser";
import { NAVIGATION_CONFIG, SHIP_MOVEMENT } from "../worldConfig";
import type { SelectableTarget } from "../selection/SelectionManager";
import type { WorldPosition } from "../worldObjects";
import { Pathfinder } from "./Pathfinder";
import { PathFollower } from "./PathFollower";

export class ChaseController {
  private target: SelectableTarget | null = null;
  private lastRepathAt = 0;

  constructor(
    private readonly player: Phaser.GameObjects.Container,
    private readonly follower: PathFollower,
    private readonly pathfinder: Pathfinder
  ) {}

  start(target: SelectableTarget, time: number) {
    this.target = target;
    this.lastRepathAt = 0;
    this.update(time, true);
  }

  stop() {
    this.target = null;
  }

  update(time: number, force = false) {
    if (!this.target) return;
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.container.x, this.target.container.y);
    if (distance <= SHIP_MOVEMENT.engagementDistance) {
      this.follower.clear();
      return;
    }
    if (!force && time - this.lastRepathAt < NAVIGATION_CONFIG.chaseRepathMs) return;
    this.lastRepathAt = time;
    this.follower.setPath(this.pathfinder.findPath(this.player, this.getApproachPoint()));
  }

  isChasing() {
    return Boolean(this.target);
  }

  getTargetName() {
    return this.target?.displayName ?? null;
  }

  private getApproachPoint(): WorldPosition {
    const dx = this.player.x - this.target!.container.x;
    const dy = this.player.y - this.target!.container.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    return {
      x: this.target!.container.x + (dx / distance) * SHIP_MOVEMENT.engagementDistance,
      y: this.target!.container.y + (dy / distance) * SHIP_MOVEMENT.engagementDistance
    };
  }
}
