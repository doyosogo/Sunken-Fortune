import Phaser from "phaser";
import { ShipNavigator } from "./navigation/ShipNavigator";
import type { WorldPosition } from "./worldObjects";

export class PlayerShipController {
  readonly container: Phaser.GameObjects.Container;
  readonly navigator: ShipNavigator;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y);
    this.container.setDepth(20);
    this.navigator = new ShipNavigator(this.container);
    this.buildShipGraphic();
  }

  update(deltaMs: number) {
    this.navigator.update(deltaMs);
  }

  setDestination(destination: WorldPosition) {
    this.navigator.setDestination(destination);
  }

  clearDestination() {
    this.navigator.clearDestination();
  }

  setMovementModifiers(speedMultiplier: number, accelerationMultiplier: number) {
    this.navigator.setMovementModifiers(speedMultiplier, accelerationMultiplier);
  }

  pushFromCircle(centerX: number, centerY: number, radius: number) {
    return this.navigator.pushFromCircle(centerX, centerY, radius);
  }

  get speed() {
    return this.navigator.speed;
  }

  get headingDegrees() {
    return this.navigator.headingDegrees;
  }

  private buildShipGraphic() {
    const hull = this.scene.add.polygon(0, 0, [44, 0, 20, -18, -36, -15, -46, 0, -36, 15, 20, 18], 0xd9a441);
    hull.setStrokeStyle(4, 0x3a2115);

    const stern = this.scene.add.rectangle(-34, 0, 18, 26, 0x6b3f1f);
    stern.setStrokeStyle(2, 0x2b1a11);

    const bow = this.scene.add.triangle(38, 0, 0, -14, 28, 0, 0, 14, 0xf8c14a);
    bow.setStrokeStyle(2, 0x3a2115);

    const mast = this.scene.add.rectangle(0, 0, 6, 42, 0x5b341c);
    mast.setStrokeStyle(1, 0x2b1a11);

    const sail = this.scene.add.triangle(8, -10, 0, -28, 0, 22, 30, 12, 0xf6e6bf);
    sail.setStrokeStyle(2, 0x7a4b29);

    const wake = this.scene.add.ellipse(-52, 0, 34, 12, 0x7dd3fc, 0.28);

    this.container.add([wake, hull, stern, bow, mast, sail]);
  }
}
