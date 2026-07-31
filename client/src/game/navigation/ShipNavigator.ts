import Phaser from "phaser";
import { SEA_WORLD, SHIP_MOVEMENT } from "../worldConfig";
import type { WorldPosition } from "../worldObjects";

export class ShipNavigator {
  private readonly velocity = new Phaser.Math.Vector2(0, 0);
  private destination: WorldPosition | null = null;
  private speedMultiplier = 1;
  private accelerationMultiplier = 1;

  constructor(private readonly container: Phaser.GameObjects.Container) {}

  setDestination(destination: WorldPosition) {
    this.destination = destination;
  }

  clearDestination() {
    this.destination = null;
  }

  update(deltaMs: number) {
    const deltaSeconds = deltaMs / 1000;
    this.updateRotationAndVelocity(deltaSeconds);
    this.applyPosition(deltaSeconds);
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

  get speed() {
    return this.velocity.length();
  }

  get headingDegrees() {
    return Phaser.Math.RadToDeg(this.container.rotation);
  }

  get hasDestination() {
    return Boolean(this.destination);
  }

  private updateRotationAndVelocity(deltaSeconds: number) {
    if (!this.destination) {
      this.applyDrag(deltaSeconds);
      return;
    }

    const toDestination = new Phaser.Math.Vector2(
      this.destination.x - this.container.x,
      this.destination.y - this.container.y
    );
    const distance = toDestination.length();

    if (distance <= SHIP_MOVEMENT.arrivalRadius && this.speed < 18) {
      this.destination = null;
      this.velocity.set(0, 0);
      return;
    }

    const desiredAngle = Math.atan2(toDestination.y, toDestination.x);
    const angleDelta = Phaser.Math.Angle.Wrap(desiredAngle - this.container.rotation);
    const speedRatio = Phaser.Math.Clamp(this.speed / SHIP_MOVEMENT.maxForwardSpeed, 0, 1);
    const turnFactor = Phaser.Math.Linear(SHIP_MOVEMENT.minTurnSpeedFactor, 1, speedRatio);
    const maxTurn = SHIP_MOVEMENT.turnRate * turnFactor * deltaSeconds;
    this.container.rotation += Phaser.Math.Clamp(angleDelta, -maxTurn, maxTurn);

    const facing = new Phaser.Math.Vector2(Math.cos(this.container.rotation), Math.sin(this.container.rotation));
    const desiredDirection = toDestination.normalize();
    const alignment = facing.dot(desiredDirection);
    const arrivalSpeedFactor = Phaser.Math.Clamp(distance / SHIP_MOVEMENT.arrivalSlowRadius, 0.18, 1);
    const accelerationFactor = Phaser.Math.Clamp(
      (alignment - SHIP_MOVEMENT.headingAccelerationDot) / (1 - SHIP_MOVEMENT.headingAccelerationDot),
      0,
      1
    );

    if (accelerationFactor > 0) {
      this.velocity.add(
        facing.scale(
          SHIP_MOVEMENT.forwardAcceleration *
            this.accelerationMultiplier *
            accelerationFactor *
            arrivalSpeedFactor *
            deltaSeconds
        )
      );
    } else {
      this.applyDrag(deltaSeconds);
    }

    const maxSpeed = SHIP_MOVEMENT.maxForwardSpeed * this.speedMultiplier * arrivalSpeedFactor;
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

  private applyPosition(deltaSeconds: number) {
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
