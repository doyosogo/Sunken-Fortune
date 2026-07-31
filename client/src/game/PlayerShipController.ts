import Phaser from "phaser";
import { SEA_WORLD, SHIP_MOVEMENT } from "./worldConfig";

interface MovementKeys {
  W: Phaser.Input.Keyboard.Key;
  A: Phaser.Input.Keyboard.Key;
  S: Phaser.Input.Keyboard.Key;
  D: Phaser.Input.Keyboard.Key;
  E: Phaser.Input.Keyboard.Key;
}

export class PlayerShipController {
  readonly container: Phaser.GameObjects.Container;

  private readonly keys: MovementKeys;
  private velocity = new Phaser.Math.Vector2(0, 0);
  private speedMultiplier = 1;
  private accelerationMultiplier = 1;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y);
    this.container.setDepth(20);
    this.keys = scene.input.keyboard!.addKeys("W,A,S,D,E") as MovementKeys;
    this.buildShipGraphic();
  }

  update(deltaMs: number) {
    const deltaSeconds = deltaMs / 1000;
    this.updateRotation(deltaSeconds);
    this.updateVelocity(deltaSeconds);
    this.updatePosition(deltaSeconds);
  }

  get speed() {
    return this.velocity.length();
  }

  get headingDegrees() {
    return Phaser.Math.RadToDeg(this.container.rotation);
  }

  setMovementModifiers(speedMultiplier: number, accelerationMultiplier: number) {
    this.speedMultiplier = speedMultiplier;
    this.accelerationMultiplier = accelerationMultiplier;
  }

  pushFromCircle(centerX: number, centerY: number, radius: number) {
    const offset = new Phaser.Math.Vector2(this.container.x - centerX, this.container.y - centerY);
    const distance = Math.max(offset.length(), 0.001);

    if (distance >= radius) {
      return false;
    }

    const pushDirection = offset.scale(1 / distance);
    const penetration = radius - distance;
    this.container.x += pushDirection.x * penetration * SHIP_MOVEMENT.collisionResponseStrength;
    this.container.y += pushDirection.y * penetration * SHIP_MOVEMENT.collisionResponseStrength;

    const inwardVelocity = this.velocity.dot(pushDirection);

    if (inwardVelocity < 0) {
      this.velocity.subtract(pushDirection.scale(inwardVelocity));
    }

    this.velocity.scale(SHIP_MOVEMENT.collisionVelocityDamping);
    this.clampToWorld();
    return true;
  }

  wasDockKeyPressed() {
    return Phaser.Input.Keyboard.JustDown(this.keys.E);
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

  private updateRotation(deltaSeconds: number) {
    const turnInput = Number(this.keys.D.isDown) - Number(this.keys.A.isDown);

    if (turnInput === 0) {
      return;
    }

    const speedRatio = Phaser.Math.Clamp(this.speed / SHIP_MOVEMENT.maxForwardSpeed, 0, 1);
    const turnFactor = Phaser.Math.Linear(SHIP_MOVEMENT.minTurnSpeedFactor, 1, speedRatio);
    this.container.rotation += turnInput * SHIP_MOVEMENT.turnRate * turnFactor * deltaSeconds;
  }

  private updateVelocity(deltaSeconds: number) {
    const direction = new Phaser.Math.Vector2(Math.cos(this.container.rotation), Math.sin(this.container.rotation));

    if (this.keys.W.isDown) {
      this.velocity.add(
        direction.clone().scale(SHIP_MOVEMENT.forwardAcceleration * this.accelerationMultiplier * deltaSeconds)
      );
    }

    if (this.keys.S.isDown) {
      this.velocity.subtract(
        direction.clone().scale(SHIP_MOVEMENT.reverseAcceleration * this.accelerationMultiplier * deltaSeconds)
      );
    }

    if (!this.keys.W.isDown && !this.keys.S.isDown) {
      this.applyDrag(deltaSeconds);
    }

    const forwardSpeed = this.velocity.dot(new Phaser.Math.Vector2(Math.cos(this.container.rotation), Math.sin(this.container.rotation)));
    const maxSpeed =
      (forwardSpeed >= 0 ? SHIP_MOVEMENT.maxForwardSpeed : SHIP_MOVEMENT.maxReverseSpeed) * this.speedMultiplier;

    if (this.velocity.length() > maxSpeed) {
      this.velocity.setLength(maxSpeed);
    }
  }

  private applyDrag(deltaSeconds: number) {
    const currentSpeed = this.velocity.length();

    if (currentSpeed <= 0) {
      return;
    }

    const nextSpeed = Math.max(0, currentSpeed - SHIP_MOVEMENT.linearDrag * deltaSeconds);
    this.velocity.setLength(nextSpeed);
  }

  private updatePosition(deltaSeconds: number) {
    this.container.x += this.velocity.x * deltaSeconds;
    this.container.y += this.velocity.y * deltaSeconds;

    this.clampToWorld();
  }

  private clampToWorld() {
    const min = SHIP_MOVEMENT.boundsPadding;
    const maxX = SEA_WORLD.width - SHIP_MOVEMENT.boundsPadding;
    const maxY = SEA_WORLD.height - SHIP_MOVEMENT.boundsPadding;
    const clampedX = Phaser.Math.Clamp(this.container.x, min, maxX);
    const clampedY = Phaser.Math.Clamp(this.container.y, min, maxY);

    if (clampedX !== this.container.x) {
      this.velocity.x = 0;
      this.container.x = clampedX;
    }

    if (clampedY !== this.container.y) {
      this.velocity.y = 0;
      this.container.y = clampedY;
    }
  }
}
