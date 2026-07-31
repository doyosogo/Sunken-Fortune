import Phaser from "phaser";
import { PlayerShipController } from "../PlayerShipController";
import { SEA_MAP_PLAYER_EVENT, SEA_WORLD, SHIP_MOVEMENT, type SeaMapPositionUpdate, type WaterType } from "../worldConfig";
import { WeaponSystem } from "../weapons/WeaponSystem";
import {
  ENEMY_SHIPS,
  ISLANDS,
  PORTS,
  PROJECTILE_TARGETS,
  SEA_MONSTERS,
  SHALLOW_WATER_ZONES,
  type EnemyShipDefinition,
  type IslandDefinition,
  type PortDefinition,
  type SeaMonsterDefinition,
  type WorldPosition
} from "../worldObjects";
import type { ProjectileCollisionTarget } from "../weapons/ProjectileCollision";

type NearbyObjectType = "port" | "island" | "enemy" | "monster";

interface NearbyObject {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  type: NearbyObjectType;
}

const DEBUG_OVERLAY_ENABLED = true;
const COLLISION_DEBUG_PANEL_ENABLED = true;
const PLAYER_COLLISION_RADIUS = 44;
const INTERACTION_HINTS: Record<NearbyObjectType, string> = {
  port: "Press E to Dock",
  island: "Island Nearby",
  enemy: "Enemy Nearby",
  monster: "Sea Monster Nearby"
};

export class SeaMapScene extends Phaser.Scene {
  private player?: PlayerShipController;
  private playerLabel?: Phaser.GameObjects.Text;
  private debugText?: Phaser.GameObjects.Text;
  private collisionDebugText?: Phaser.GameObjects.Text;
  private interactionHint?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private weaponSystem?: WeaponSystem;
  private projectileTargets: ProjectileCollisionTarget[] = [];
  private nearbyObjects: NearbyObject[] = [];
  private minimapEventTimer = 0;
  private currentWaterType: WaterType = "Open Sea";
  private currentNearbyLocationName: string | null = null;
  private statusMessageUntil = 0;
  private lastDockMessageAt = -SHIP_MOVEMENT.interactionMessageCooldownMs;

  constructor() {
    super("SeaMapScene");
  }

  create() {
    this.cameras.main.setBounds(0, 0, SEA_WORLD.width, SEA_WORLD.height);
    this.physics.world.setBounds(0, 0, SEA_WORLD.width, SEA_WORLD.height);

    this.createOcean();
    this.createShallowWaterZones();
    this.drawRoute([
      { x: 420, y: 2860 },
      { x: 820, y: 2440 },
      { x: 1360, y: 2140 },
      { x: 2060, y: 1660 },
      { x: 2920, y: 1160 },
      { x: 3840, y: 880 }
    ]);

    ISLANDS.forEach((island) => this.createIsland(island));
    PORTS.forEach((port) => this.createPort(port));
    ENEMY_SHIPS.forEach((ship) => this.createNpcShip(ship));
    SEA_MONSTERS.forEach((monster) => this.createSeaMonster(monster));
    this.projectileTargets = this.createProjectileTargets();

    this.player = new PlayerShipController(this, 420, 2860);
    this.playerLabel = this.addLabel(this.player.container.x, this.player.container.y - 72, "Dawn Skiff", "#fef3c7");
    this.playerLabel.setDepth(30);
    this.weaponSystem = new WeaponSystem(this, this.player.container, () => this.projectileTargets);

    this.add.rectangle(SEA_WORLD.width / 2, SEA_WORLD.height / 2, SEA_WORLD.width, SEA_WORLD.height).setStrokeStyle(6, 0xd9a441, 0.7);

    this.cameras.main.startFollow(this.player.container, false, 0.08, 0.08);
    this.cameras.main.setDeadzone(120, 90);

    if (DEBUG_OVERLAY_ENABLED) {
      this.createDebugOverlay();
    }

    if (COLLISION_DEBUG_PANEL_ENABLED) {
      this.createCollisionDebugPanel();
    }

    this.createInteractionHint();
    this.createStatusText();
    this.publishPlayerPosition();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.weaponSystem?.destroy();
    });
  }

  update(time: number, delta: number) {
    if (!this.player) {
      return;
    }

    this.updateWaterState(time);
    const nearest = this.findNearestObject();
    this.player.update(delta);
    this.weaponSystem?.update(time, delta, { blockStarboardKeyboard: nearest?.type === "port" });
    this.resolveIslandCollision();
    this.updatePlayerLabel();
    this.updateInteractionHint(time, nearest);
    this.updateDebugOverlay();
    this.updateCollisionDebugPanel();
    this.updateMinimapEvent(delta);
  }

  private createOcean() {
    this.add.rectangle(0, 0, SEA_WORLD.width, SEA_WORLD.height, 0x06243d).setOrigin(0);
    this.add.rectangle(0, 0, SEA_WORLD.width, SEA_WORLD.height, 0x0b3a5c, 0.38).setOrigin(0);

    for (let y = 70; y < SEA_WORLD.height; y += 140) {
      for (let x = 80; x < SEA_WORLD.width; x += 210) {
        const wave = this.add.ellipse(x, y, 96, 14, 0x38bdf8, 0.13);
        wave.setAngle((x + y) % 12);
        this.tweens.add({
          targets: wave,
          x: x + 22,
          alpha: 0.25,
          duration: 1900 + ((x + y) % 1000),
          yoyo: true,
          repeat: -1
        });
      }
    }
  }

  private createShallowWaterZones() {
    SHALLOW_WATER_ZONES.forEach((zone) => {
      this.add.circle(zone.position.x, zone.position.y, zone.radius, 0x7dd3fc, 0.08).setStrokeStyle(3, 0x9beafe, 0.18);
      this.add.circle(zone.position.x, zone.position.y, zone.radius * 0.72, 0xfde68a, 0.045);
    });
  }

  private createIsland(island: IslandDefinition) {
    const { x, y } = island.position;
    const radius = island.renderRadius;
    this.add.ellipse(x, y, radius, radius * 0.56, 0x9a7638);
    this.add.ellipse(x + 30, y - 24, radius * 0.52, radius * 0.32, 0x2f7d4f);
    this.add.circle(x - 52, y + 12, 22, 0x6b4f2a);
    this.add.circle(x + 74, y + 22, 18, 0x6b4f2a);
    this.add.circle(x, y, island.collisionRadius, 0x3f2a18, 0.12).setStrokeStyle(2, 0xfde68a, 0.18);
    this.addLabel(x, y - radius * 0.42, island.displayName, "#fef3c7");
    this.nearbyObjects.push({
      id: island.id,
      x,
      y,
      radius: island.interactionRadius,
      label: island.displayName,
      type: "island"
    });
  }

  private createPort(port: PortDefinition) {
    const { x, y } = port.position;
    this.add.circle(x, y, port.harbourRadius, 0xf8c14a, 0.055).setStrokeStyle(4, 0xf8c14a, 0.32);
    this.add.rectangle(x, y, 130, 78, 0x6b3f1f).setStrokeStyle(4, 0xd9a441);
    this.add.rectangle(x, y - 52, 94, 24, 0xd9a441);
    this.add.rectangle(x + 84, y + 4, 88, 18, 0x5b341c).setStrokeStyle(2, 0x2b1a11);
    this.add.circle(x + 76, y - 58, 13, 0xfacc15, 0.9);
    this.addLabel(x, y - 96, port.displayName, "#fde68a");
    this.nearbyObjects.push({
      id: port.id,
      x,
      y,
      radius: port.interactionRadius,
      label: port.displayName,
      type: "port"
    });
  }

  private createNpcShip(definition: EnemyShipDefinition) {
    const { x, y } = definition.position;
    const ship = this.add.container(x, y);
    ship.setRotation(Phaser.Math.DegToRad(definition.rotationDegrees));
    const hull = this.add.polygon(0, 0, [38, 0, 16, -15, -34, -12, -42, 0, -34, 12, 16, 15], 0xdc2626);
    hull.setStrokeStyle(4, 0x450a0a);
    const mast = this.add.rectangle(0, 0, 5, 34, 0x5b341c);
    const sail = this.add.triangle(8, -8, 0, -22, 0, 20, 25, 10, 0xf8fafc);
    sail.setStrokeStyle(2, 0x7a4b29);
    ship.add([hull, mast, sail]);
    this.addLabel(x, y - 58, definition.displayName, "#fecaca");
    this.nearbyObjects.push({
      id: definition.id,
      x,
      y,
      radius: definition.interactionRadius,
      label: definition.displayName,
      type: "enemy"
    });
  }

  private createSeaMonster(monster: SeaMonsterDefinition) {
    const { x, y } = monster.position;
    this.add.circle(x, y, 44, 0x7c3aed).setStrokeStyle(4, 0x2e1065);
    this.add.circle(x - 36, y + 18, 18, 0x6d28d9);
    this.add.circle(x + 38, y + 15, 18, 0x6d28d9);
    this.add.circle(x - 12, y - 10, 5, 0xfef3c7);
    this.add.circle(x + 12, y - 10, 5, 0xfef3c7);
    this.addLabel(x, y - 70, monster.displayName, "#ddd6fe");
    this.nearbyObjects.push({
      id: monster.id,
      x,
      y,
      radius: monster.interactionRadius,
      label: monster.displayName,
      type: "monster"
    });
  }

  private createProjectileTargets(): ProjectileCollisionTarget[] {
    return PROJECTILE_TARGETS.map((target) => ({
      id: target.id,
      displayName: target.displayName,
      objectType: target.objectType,
      x: target.position.x,
      y: target.position.y,
      radius: target.projectileCollisionRadius,
      flash: () => this.flashWorldObject(target.position.x, target.position.y, target.projectileCollisionRadius)
    }));
  }

  private flashWorldObject(x: number, y: number, radius: number) {
    const flash = this.add.circle(x, y, radius, 0xffffff, 0.42);
    flash.setDepth(33);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.12,
      duration: 160,
      onComplete: () => flash.destroy()
    });
  }

  private drawRoute(points: WorldPosition[]) {
    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const steps = Math.max(1, Math.floor(distance / 42));

      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        this.add.circle(
          Phaser.Math.Linear(start.x, end.x, t),
          Phaser.Math.Linear(start.y, end.y, t),
          5,
          0xfde68a,
          0.5
        );
      }
    }
  }

  private updateWaterState(time: number) {
    if (!this.player) {
      return;
    }

    const isShallow = this.isPlayerInsideAnyShallowWaterZone();
    const nextWaterType: WaterType = isShallow ? "Shallow Waters" : "Open Sea";

    if (nextWaterType !== this.currentWaterType && nextWaterType === "Shallow Waters") {
      this.showStatusMessage("Shallow Waters", time, 1300);
    }

    this.currentWaterType = nextWaterType;
    this.player.setMovementModifiers(
      isShallow ? SHIP_MOVEMENT.shallowWaterSpeedMultiplier : 1,
      isShallow ? SHIP_MOVEMENT.shallowWaterAccelerationMultiplier : 1
    );
  }

  private isPlayerInsideAnyShallowWaterZone() {
    if (!this.player) {
      return false;
    }

    return SHALLOW_WATER_ZONES.some((zone) =>
      this.isWithinRadius(this.player!.container.x, this.player!.container.y, zone.position.x, zone.position.y, zone.radius)
    );
  }

  private resolveIslandCollision() {
    if (!this.player) {
      return;
    }

    ISLANDS.forEach((island) => {
      this.player!.pushFromCircle(
        island.position.x,
        island.position.y,
        island.collisionRadius + PLAYER_COLLISION_RADIUS
      );
    });

    PORTS.forEach((port) => {
      this.player!.pushFromCircle(port.position.x, port.position.y, port.collisionRadius + PLAYER_COLLISION_RADIUS);
    });
  }

  private addLabel(x: number, y: number, text: string, color: string) {
    const label = this.add.text(x, y, text, {
      backgroundColor: "rgba(8, 17, 31, 0.72)",
      color,
      fontFamily: "monospace",
      fontSize: "15px",
      padding: { x: 8, y: 4 }
    });
    label.setOrigin(0.5);

    return label;
  }

  private updatePlayerLabel() {
    if (!this.player || !this.playerLabel) {
      return;
    }

    this.playerLabel.setPosition(this.player.container.x, this.player.container.y - 72);
  }

  private createDebugOverlay() {
    this.debugText = this.add.text(12, 12, "", {
      backgroundColor: "rgba(7, 13, 20, 0.78)",
      color: "#d9f99d",
      fontFamily: "monospace",
      fontSize: "14px",
      padding: { x: 8, y: 6 }
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(100);
  }

  private createCollisionDebugPanel() {
    this.collisionDebugText = this.add.text(0, 0, "", {
      backgroundColor: "rgba(7, 13, 20, 0.82)",
      color: "#fde68a",
      fontFamily: "monospace",
      fontSize: "14px",
      padding: { x: 8, y: 6 }
    });
    this.collisionDebugText.setScrollFactor(0);
    this.collisionDebugText.setDepth(100);
  }

  private createInteractionHint() {
    this.interactionHint = this.add.text(0, 0, "", {
      backgroundColor: "rgba(7, 13, 20, 0.82)",
      color: "#ffe2a1",
      fontFamily: "monospace",
      fontSize: "16px",
      padding: { x: 10, y: 6 }
    });
    this.interactionHint.setOrigin(0.5);
    this.interactionHint.setDepth(100);
    this.interactionHint.setVisible(false);
  }

  private createStatusText() {
    this.statusText = this.add.text(0, 0, "", {
      backgroundColor: "rgba(7, 13, 20, 0.82)",
      color: "#9df6b1",
      fontFamily: "monospace",
      fontSize: "16px",
      padding: { x: 10, y: 6 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setDepth(101);
    this.statusText.setVisible(false);
  }

  private updateInteractionHint(time: number, nearest: NearbyObject | null) {
    if (!this.player || !this.interactionHint) {
      return;
    }

    this.currentNearbyLocationName =
      nearest && (nearest.type === "island" || nearest.type === "port") ? nearest.label : null;

    if (!nearest) {
      this.interactionHint.setVisible(false);
      this.updateStatusTextPosition(time);
      return;
    }

    this.interactionHint.setText(INTERACTION_HINTS[nearest.type]);
    this.interactionHint.setPosition(this.player.container.x, this.player.container.y - 116);
    this.interactionHint.setVisible(true);

    if (nearest.type === "port" && this.player.wasDockKeyPressed()) {
      this.showDockUnavailableMessage(time);
    }

    this.updateStatusTextPosition(time);
  }

  private showDockUnavailableMessage(time: number) {
    if (time - this.lastDockMessageAt < SHIP_MOVEMENT.interactionMessageCooldownMs) {
      return;
    }

    this.lastDockMessageAt = time;
    this.showStatusMessage("Docking system not yet available", time, 1600);
  }

  private showStatusMessage(message: string, time: number, duration: number) {
    if (!this.statusText || !this.player) {
      return;
    }

    this.statusText.setText(message);
    this.statusText.setPosition(this.player.container.x, this.player.container.y - 150);
    this.statusText.setVisible(true);
    this.statusMessageUntil = time + duration;
  }

  private updateStatusTextPosition(time: number) {
    if (!this.statusText || !this.player) {
      return;
    }

    if (time > this.statusMessageUntil) {
      this.statusText.setVisible(false);
      return;
    }

    this.statusText.setPosition(this.player.container.x, this.player.container.y - 150);
  }

  private findNearestObject() {
    if (!this.player) {
      return null;
    }

    let nearest: NearbyObject | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const object of this.nearbyObjects) {
      const distance = this.getDistanceToPlayer(object.x, object.y);

      if (distance <= object.radius && distance < nearestDistance) {
        nearest = object;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  private updateDebugOverlay() {
    if (!this.player || !this.debugText) {
      return;
    }

    const fps = Math.round(this.game.loop.actualFps);
    const heading = Phaser.Math.Angle.WrapDegrees(this.player.headingDegrees);

    this.debugText.setText([
      `FPS: ${fps}`,
      `Player X: ${Math.round(this.player.container.x)}`,
      `Player Y: ${Math.round(this.player.container.y)}`,
      `Current Region: ${SEA_WORLD.regionName}`,
      `Water: ${this.currentWaterType}`,
      `Nearby: ${this.currentNearbyLocationName ?? "None"}`,
      `Speed: ${Math.round(this.player.speed)}`,
      `Heading: ${Math.round(heading)} deg`,
      `Port Ready: ${this.weaponSystem?.getState(this.time.now).portReady ? "Yes" : "No"}`,
      `Starboard Ready: ${this.weaponSystem?.getState(this.time.now).starboardReady ? "Yes" : "No"}`,
      `Active Cannonballs: ${this.weaponSystem?.activeCannonballCount ?? 0}`
    ]);
  }

  private updateCollisionDebugPanel() {
    if (!this.collisionDebugText || !this.weaponSystem) {
      return;
    }

    const state = this.weaponSystem.getState(this.time.now);
    this.collisionDebugText.setText([
      "Projectile Sandbox",
      `Total Shots Fired: ${state.totalShotsFired}`,
      `Successful Hits: ${state.successfulHits}`,
      `Water Impacts: ${state.waterImpacts}`,
      `Object Impacts: ${state.objectImpacts}`,
      `Active Projectiles: ${state.activeCannonballs}`
    ]);
    this.collisionDebugText.setPosition(
      this.scale.width - this.collisionDebugText.width - 12,
      this.scale.height - this.collisionDebugText.height - 12
    );
  }

  private updateMinimapEvent(delta: number) {
    this.minimapEventTimer += delta;

    if (this.minimapEventTimer < 100) {
      return;
    }

    this.minimapEventTimer = 0;
    this.publishPlayerPosition();
  }

  private publishPlayerPosition() {
    if (!this.player) {
      return;
    }

    const detail: SeaMapPositionUpdate = {
      x: this.player.container.x,
      y: this.player.container.y,
      heading: Phaser.Math.Angle.WrapDegrees(this.player.headingDegrees),
      speed: this.player.speed,
      worldWidth: SEA_WORLD.width,
      worldHeight: SEA_WORLD.height,
      regionName: SEA_WORLD.regionName,
      waterType: this.currentWaterType,
      nearbyLocationName: this.currentNearbyLocationName
    };

    window.dispatchEvent(new CustomEvent<SeaMapPositionUpdate>(SEA_MAP_PLAYER_EVENT, { detail }));
  }

  private getDistanceToPlayer(x: number, y: number) {
    if (!this.player) {
      return Number.POSITIVE_INFINITY;
    }

    return Phaser.Math.Distance.Between(this.player.container.x, this.player.container.y, x, y);
  }

  private isWithinRadius(x: number, y: number, targetX: number, targetY: number, radius: number) {
    return Phaser.Math.Distance.Between(x, y, targetX, targetY) <= radius;
  }
}
