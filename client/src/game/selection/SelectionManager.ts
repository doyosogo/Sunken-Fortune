import Phaser from "phaser";
import { WEAPON_CONFIG } from "../worldConfig";
import type { WorldObjectType } from "../worldObjects";

export interface SelectableTarget {
  id: string;
  displayName: string;
  objectType: Extract<WorldObjectType, "enemy" | "monster">;
  container: Phaser.GameObjects.Container;
  radius: number;
}

export interface SelectionSnapshot {
  id: string;
  displayName: string;
  objectType: "enemy" | "monster";
  x: number;
  y: number;
  distance: number;
  healthLabel: string;
  status: string;
}

export class SelectionManager {
  private selectedTarget: SelectableTarget | null = null;
  private selectionRing?: Phaser.GameObjects.Arc;
  private healthBar?: Phaser.GameObjects.Container;
  private nameLabel?: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {}

  select(target: SelectableTarget) {
    this.clear();
    this.selectedTarget = target;
    this.selectionRing = this.scene.add.circle(target.container.x, target.container.y, target.radius + 18);
    this.selectionRing.setStrokeStyle(4, 0xfacc15, 0.9);
    this.selectionRing.setDepth(32);

    const barBack = this.scene.add.rectangle(0, 0, 88, 9, 0x1f2937).setStrokeStyle(2, 0xf8c14a);
    const barFill = this.scene.add.rectangle(-42, 0, 84, 5, 0x9df6b1).setOrigin(0, 0.5);
    this.healthBar = this.scene.add.container(target.container.x, target.container.y - target.radius - 34, [barBack, barFill]);
    this.healthBar.setDepth(32);
    this.nameLabel = this.scene.add.text(target.container.x, target.container.y - target.radius - 58, target.displayName, {
      backgroundColor: "rgba(8, 17, 31, 0.78)",
      color: "#facc15",
      fontFamily: "monospace",
      fontSize: "15px",
      padding: { x: 8, y: 4 }
    });
    this.nameLabel.setOrigin(0.5);
    this.nameLabel.setDepth(33);

    this.scene.tweens.add({
      targets: this.selectionRing,
      alpha: 0.45,
      scale: 1.08,
      duration: 760,
      yoyo: true,
      repeat: -1
    });
  }

  clear() {
    this.selectionRing?.destroy();
    this.healthBar?.destroy();
    this.nameLabel?.destroy();
    this.selectionRing = undefined;
    this.healthBar = undefined;
    this.nameLabel = undefined;
    this.selectedTarget = null;
  }

  update() {
    if (!this.selectedTarget) {
      return;
    }

    const { container, radius } = this.selectedTarget;
    this.selectionRing?.setPosition(container.x, container.y);
    this.healthBar?.setPosition(container.x, container.y - radius - 34);
    this.nameLabel?.setPosition(container.x, container.y - radius - 58);
  }

  getSelectedTarget() {
    return this.selectedTarget;
  }

  getSnapshot(playerX: number, playerY: number): SelectionSnapshot | null {
    if (!this.selectedTarget) {
      return null;
    }

    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      this.selectedTarget.container.x,
      this.selectedTarget.container.y
    );

    return {
      id: this.selectedTarget.id,
      displayName: this.selectedTarget.displayName,
      objectType: this.selectedTarget.objectType,
      x: this.selectedTarget.container.x,
      y: this.selectedTarget.container.y,
      distance,
      healthLabel: "100% placeholder",
      status: distance <= WEAPON_CONFIG.targetFireRange ? "In range" : "Out of range"
    };
  }
}
