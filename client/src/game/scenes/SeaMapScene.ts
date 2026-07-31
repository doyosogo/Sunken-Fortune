import Phaser from "phaser";
import { PlayerShipController } from "../PlayerShipController";
import { ChaseController } from "../navigation/ChaseController";
import { NavigationGraph } from "../navigation/NavigationGraph";
import { PatrolController } from "../navigation/PatrolController";
import { Pathfinder } from "../navigation/Pathfinder";
import { PathFollower } from "../navigation/PathFollower";
import { ShipNavigator } from "../navigation/ShipNavigator";
import { SelectionManager, type SelectableTarget } from "../selection/SelectionManager";
import {
  SEA_MAP_PLAYER_EVENT,
  SEA_WORLD,
  SHIP_MOVEMENT,
  NAVIGATION_CONFIG,
  WEAPON_CONFIG,
  type SeaMapPositionUpdate,
  type WaterType
} from "../worldConfig";
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
import { WeaponSystem } from "../weapons/WeaponSystem";

type NearbyObjectType = "port" | "island" | "enemy" | "monster";

interface NearbyObject {
  id: string;
  x: number;
  y: number;
  radius: number;
  label: string;
  type: NearbyObjectType;
}

interface MovingHostile {
  id: string;
  displayName: string;
  objectType: "enemy" | "monster";
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  navigator?: ShipNavigator;
  radius: number;
  patrol?: PatrolController;
}

const DEBUG_OVERLAY_ENABLED = true;
const COLLISION_DEBUG_PANEL_ENABLED = true;
const PLAYER_COLLISION_RADIUS = 44;
const DOUBLE_CLICK_MS = 320;
const INTERACTION_HINTS: Record<NearbyObjectType, string> = {
  port: "Harbour Approach",
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
  private destinationMarker?: Phaser.GameObjects.Arc;
  private pathDebugGraphics?: Phaser.GameObjects.Graphics;
  private weaponSystem?: WeaponSystem;
  private selectionManager?: SelectionManager;
  private navigationGraph?: NavigationGraph;
  private pathfinder?: Pathfinder;
  private playerPathFollower?: PathFollower;
  private chaseController?: ChaseController;
  private projectileTargets: ProjectileCollisionTarget[] = [];
  private nearbyObjects: NearbyObject[] = [];
  private movingHostiles: MovingHostile[] = [];
  private minimapEventTimer = 0;
  private currentWaterType: WaterType = "Open Sea";
  private currentNearbyLocationName: string | null = null;
  private statusMessageUntil = 0;
  private lastTargetClickId: string | null = null;
  private lastTargetClickAt = 0;

  constructor() {
    super("SeaMapScene");
  }

  create() {
    this.cameras.main.setBounds(0, 0, SEA_WORLD.width, SEA_WORLD.height);
    this.cameras.main.setZoom(SHIP_MOVEMENT.cameraZoom);
    this.physics.world.setBounds(0, 0, SEA_WORLD.width, SEA_WORLD.height);
    this.navigationGraph = new NavigationGraph();
    this.pathfinder = new Pathfinder(this.navigationGraph);

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

    this.player = new PlayerShipController(this, 420, 2860);
    this.playerLabel = this.addLabel(this.player.container.x, this.player.container.y - 72, "Dawn Skiff", "#fef3c7");
    this.playerLabel.setDepth(30);
    this.selectionManager = new SelectionManager(this);
    this.playerPathFollower = new PathFollower(this.player.navigator, this.player.container);
    this.chaseController = new ChaseController(this.player.container, this.playerPathFollower, this.pathfinder);
    this.projectileTargets = this.createProjectileTargets();
    this.weaponSystem = new WeaponSystem(this, this.player.container, () => this.projectileTargets);

    this.add.rectangle(SEA_WORLD.width / 2, SEA_WORLD.height / 2, SEA_WORLD.width, SEA_WORLD.height).setStrokeStyle(6, 0xd9a441, 0.7);
    this.cameras.main.startFollow(this.player.container, false, 0.07, 0.07);
    this.cameras.main.setDeadzone(180, 140);

    if (DEBUG_OVERLAY_ENABLED) {
      this.createDebugOverlay();
    }

    if (COLLISION_DEBUG_PANEL_ENABLED) {
      this.createCollisionDebugPanel();
    }
    if (NAVIGATION_CONFIG.debugEnabled) {
      this.createNavigationDebugGraphics();
    }

    this.createInteractionHint();
    this.createStatusText();
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.publishPlayerPosition();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.weaponSystem?.destroy();
    });
  }

  update(time: number, delta: number) {
    if (!this.player) {
      return;
    }

    this.updateWaterState(time);
    this.chaseController?.update(time);
    this.playerPathFollower?.update();
    this.player.update(delta);
    this.movingHostiles.forEach((hostile) => hostile.patrol?.update(delta));
    this.updateSeaMonsterDrift(time);
    this.resolveHostileTerrainCollision();
    this.updateMovingLabels();
    this.updateDestinationMarker();
    this.updateNavigationDebugGraphics();
    this.refreshProjectileTargets();
    this.weaponSystem?.update(time, delta);
    this.resolveIslandCollision();
    this.updatePlayerLabel();
    this.selectionManager?.update();
    const nearest = this.findNearestObject();
    this.updateInteractionHint(time, nearest);
    this.updateDebugOverlay();
    this.updateCollisionDebugPanel();
    this.updateMinimapEvent(delta);

    if (this.weaponSystem?.wasFireKeyPressed()) {
      this.attemptFireAtSelectedTarget(time);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
      return;
    }

    const worldPoint = { x: pointer.worldX, y: pointer.worldY };
    const target = this.findClickedHostile(worldPoint.x, worldPoint.y);

    if (target) {
      const isDoubleClick =
        this.lastTargetClickId === target.id && this.time.now - this.lastTargetClickAt <= DOUBLE_CLICK_MS;
      this.chaseController?.stop();
      this.selectionManager?.select(target);
      this.lastTargetClickId = target.id;
      this.lastTargetClickAt = this.time.now;

      if (isDoubleClick) {
        this.chaseController?.start(target, this.time.now);
        this.showStatusMessage(`Chasing ${target.displayName}`, this.time.now, 1300);
        this.attemptFireAtSelectedTarget(this.time.now);
      }

      this.publishPlayerPosition();
      return;
    }

    this.selectionManager?.clear();
    this.chaseController?.stop();
    this.lastTargetClickId = null;
    if (this.player && this.pathfinder && this.playerPathFollower) {
      this.playerPathFollower.setPath(this.pathfinder.findPath(this.player.container, worldPoint));
    }
    this.createDestinationMarker(worldPoint);
    this.publishPlayerPosition();
  }

  private attemptFireAtSelectedTarget(time: number) {
    if (!this.player || !this.weaponSystem || !this.selectionManager) {
      return;
    }

    const target = this.selectionManager.getSelectedTarget();

    if (!target) {
      this.showStatusMessage("No target selected", time, 1100);
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.container.x,
      this.player.container.y,
      target.container.x,
      target.container.y
    );

    if (distance > WEAPON_CONFIG.targetFireRange) {
      this.showStatusMessage("Target out of range", time, 1200);
      return;
    }

    const result = this.weaponSystem.attemptFireAtTarget(target.container.x, target.container.y, time);

    if (!result.fired && result.reason === "arc") {
      this.showStatusMessage("Target not in firing arc", time, 1200);
    }
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
    this.nearbyObjects.push({ id: island.id, x, y, radius: island.interactionRadius, label: island.displayName, type: "island" });
  }

  private createPort(port: PortDefinition) {
    const { x, y } = port.position;
    this.add.circle(x, y, port.harbourRadius, 0xf8c14a, 0.055).setStrokeStyle(4, 0xf8c14a, 0.32);
    this.add.rectangle(x, y, 130, 78, 0x6b3f1f).setStrokeStyle(4, 0xd9a441);
    this.add.rectangle(x, y - 52, 94, 24, 0xd9a441);
    this.add.rectangle(x + 84, y + 4, 88, 18, 0x5b341c).setStrokeStyle(2, 0x2b1a11);
    this.add.circle(x + 76, y - 58, 13, 0xfacc15, 0.9);
    this.addLabel(x, y - 96, port.displayName, "#fde68a");
    this.nearbyObjects.push({ id: port.id, x, y, radius: port.interactionRadius, label: port.displayName, type: "port" });
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
    const label = this.addLabel(x, y - 58, definition.displayName, "#fecaca");
    const navigator = new ShipNavigator(ship);
    navigator.setMovementModifiers(0.62, 0.55);
    this.movingHostiles.push({
      id: definition.id,
      displayName: definition.displayName,
      objectType: "enemy",
      container: ship,
      label,
      navigator,
      radius: definition.projectileCollisionRadius,
      patrol: new PatrolController(navigator, ship, definition.patrolPoints, this.pathfinder!)
    });
    this.nearbyObjects.push({ id: definition.id, x, y, radius: definition.interactionRadius, label: definition.displayName, type: "enemy" });
  }

  private createSeaMonster(monster: SeaMonsterDefinition) {
    const { x, y } = monster.position;
    const container = this.add.container(x, y);
    const body = this.add.circle(0, 0, 44, 0x7c3aed).setStrokeStyle(4, 0x2e1065);
    const left = this.add.circle(-36, 18, 18, 0x6d28d9);
    const right = this.add.circle(38, 15, 18, 0x6d28d9);
    const eyeA = this.add.circle(-12, -10, 5, 0xfef3c7);
    const eyeB = this.add.circle(12, -10, 5, 0xfef3c7);
    container.add([body, left, right, eyeA, eyeB]);
    const label = this.addLabel(x, y - 70, monster.displayName, "#ddd6fe");
    this.movingHostiles.push({
      id: monster.id,
      displayName: monster.displayName,
      objectType: "monster",
      container,
      label,
      radius: monster.projectileCollisionRadius
    });
    this.nearbyObjects.push({ id: monster.id, x, y, radius: monster.interactionRadius, label: monster.displayName, type: "monster" });
  }

  private updateSeaMonsterDrift(time: number) {
    this.movingHostiles
      .filter((hostile) => hostile.objectType === "monster")
      .forEach((monster, index) => {
        monster.container.x += Math.cos(time / 1300 + index) * 0.28;
        monster.container.y += Math.sin(time / 1500 + index * 0.6) * 0.24;
        monster.container.rotation += 0.0015;
      });
  }

  private updateMovingLabels() {
    this.movingHostiles.forEach((hostile) => {
      hostile.label.setPosition(hostile.container.x, hostile.container.y - hostile.radius - 18);
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
      flash: () => this.flashWorldObject(target.id, target.position.x, target.position.y, target.projectileCollisionRadius)
    }));
  }

  private refreshProjectileTargets() {
    this.projectileTargets.forEach((target) => {
      const moving = this.movingHostiles.find((hostile) => hostile.id === target.id);
      if (moving) {
        target.x = moving.container.x;
        target.y = moving.container.y;
      }
    });
  }

  private flashWorldObject(id: string, fallbackX: number, fallbackY: number, radius: number) {
    const moving = this.movingHostiles.find((hostile) => hostile.id === id);
    const x = moving?.container.x ?? fallbackX;
    const y = moving?.container.y ?? fallbackY;
    const flash = this.add.circle(x, y, radius, 0xffffff, 0.42);
    flash.setDepth(33);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.12, duration: 160, onComplete: () => flash.destroy() });
  }

  private drawRoute(points: WorldPosition[]) {
    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const steps = Math.max(1, Math.floor(distance / 42));
      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        this.add.circle(Phaser.Math.Linear(start.x, end.x, t), Phaser.Math.Linear(start.y, end.y, t), 5, 0xfde68a, 0.5);
      }
    }
  }

  private createDestinationMarker(destination: WorldPosition) {
    this.destinationMarker?.destroy();
    this.destinationMarker = this.add.circle(destination.x, destination.y, 34);
    this.destinationMarker.setStrokeStyle(4, 0xfacc15, 0.85);
    this.destinationMarker.setDepth(28);
    this.tweens.add({ targets: this.destinationMarker, scale: 1.35, alpha: 0.2, duration: 760, yoyo: true, repeat: -1 });
  }

  private createNavigationDebugGraphics() {
    this.pathDebugGraphics = this.add.graphics();
    this.pathDebugGraphics.setDepth(29);
  }

  private updateNavigationDebugGraphics() {
    if (!this.pathDebugGraphics || !this.navigationGraph) return;
    this.pathDebugGraphics.clear();
    this.pathDebugGraphics.lineStyle(2, 0x7dd3fc, 0.14);
    this.navigationGraph.nodes.forEach((node) => {
      this.navigationGraph!.edges.get(node.id)?.forEach((neighborId) => {
        const neighbor = this.navigationGraph!.nodes.find((candidate) => candidate.id === neighborId);
        if (neighbor) {
          this.pathDebugGraphics!.lineBetween(node.x, node.y, neighbor.x, neighbor.y);
        }
      });
    });
    this.pathDebugGraphics.fillStyle(0xfacc15, 0.65);
    this.navigationGraph.nodes.forEach((node) => this.pathDebugGraphics!.fillCircle(node.x, node.y, 8));
    const path = this.playerPathFollower?.getPath() ?? [];
    this.pathDebugGraphics.lineStyle(5, 0xfacc15, 0.75);
    for (let index = 0; index < path.length - 1; index += 1) {
      this.pathDebugGraphics.lineBetween(path[index].x, path[index].y, path[index + 1].x, path[index + 1].y);
    }
    const waypoint = path[0];
    if (waypoint) {
      this.pathDebugGraphics.fillStyle(0xffffff, 0.9);
      this.pathDebugGraphics.fillCircle(waypoint.x, waypoint.y, 12);
    }
  }

  private updateDestinationMarker() {
    if (!this.destinationMarker || !this.player) return;
    const distance = Phaser.Math.Distance.Between(
      this.player.container.x,
      this.player.container.y,
      this.destinationMarker.x,
      this.destinationMarker.y
    );
    if (distance < SHIP_MOVEMENT.arrivalRadius + 12 && this.player.speed < 24) {
      this.destinationMarker.destroy();
      this.destinationMarker = undefined;
    }
  }

  private findClickedHostile(x: number, y: number): SelectableTarget | null {
    let nearest: MovingHostile | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const hostile of this.movingHostiles) {
      const distance = Phaser.Math.Distance.Between(x, y, hostile.container.x, hostile.container.y);
      if (distance <= hostile.radius + 26 && distance < nearestDistance) {
        nearest = hostile;
        nearestDistance = distance;
      }
    }
    return nearest
      ? {
          id: nearest.id,
          displayName: nearest.displayName,
          objectType: nearest.objectType,
          container: nearest.container,
          radius: nearest.radius
        }
      : null;
  }

  private updateWaterState(time: number) {
    if (!this.player) return;
    const isShallow = SHALLOW_WATER_ZONES.some((zone) =>
      this.isWithinRadius(this.player!.container.x, this.player!.container.y, zone.position.x, zone.position.y, zone.radius)
    );
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

  private resolveIslandCollision() {
    if (!this.player) return;
    ISLANDS.forEach((island) => {
      this.player!.pushFromCircle(island.position.x, island.position.y, island.collisionRadius + PLAYER_COLLISION_RADIUS);
    });
    PORTS.forEach((port) => {
      this.player!.pushFromCircle(port.position.x, port.position.y, port.collisionRadius + PLAYER_COLLISION_RADIUS);
    });
  }

  private resolveHostileTerrainCollision() {
    this.movingHostiles.forEach((hostile) => {
      if (!hostile.navigator) return;
      ISLANDS.forEach((island) => {
        hostile.navigator!.pushFromCircle(island.position.x, island.position.y, island.collisionRadius + hostile.radius);
      });
      PORTS.forEach((port) => {
        hostile.navigator!.pushFromCircle(port.position.x, port.position.y, port.collisionRadius + hostile.radius);
      });
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
    if (!this.player || !this.playerLabel) return;
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
    if (!this.player || !this.interactionHint) return;
    this.currentNearbyLocationName = nearest && (nearest.type === "island" || nearest.type === "port") ? nearest.label : null;
    if (!nearest) {
      this.interactionHint.setVisible(false);
      this.updateStatusTextPosition(time);
      return;
    }
    this.interactionHint.setText(INTERACTION_HINTS[nearest.type]);
    this.interactionHint.setPosition(this.player.container.x, this.player.container.y - 116);
    this.interactionHint.setVisible(true);
    this.updateStatusTextPosition(time);
  }

  private showStatusMessage(message: string, time: number, duration: number) {
    if (!this.statusText || !this.player) return;
    this.statusText.setText(message);
    this.statusText.setPosition(this.player.container.x, this.player.container.y - 150);
    this.statusText.setVisible(true);
    this.statusMessageUntil = time + duration;
  }

  private updateStatusTextPosition(time: number) {
    if (!this.statusText || !this.player) return;
    if (time > this.statusMessageUntil) {
      this.statusText.setVisible(false);
      return;
    }
    this.statusText.setPosition(this.player.container.x, this.player.container.y - 150);
  }

  private findNearestObject() {
    if (!this.player) return null;
    let nearest: NearbyObject | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const object of this.nearbyObjects) {
      const moving = this.movingHostiles.find((hostile) => hostile.id === object.id);
      const x = moving?.container.x ?? object.x;
      const y = moving?.container.y ?? object.y;
      const distance = this.getDistanceToPlayer(x, y);
      if (distance <= object.radius && distance < nearestDistance) {
        nearest = { ...object, x, y };
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  private updateDebugOverlay() {
    if (!this.player || !this.debugText) return;
    const fps = Math.round(this.game.loop.actualFps);
    const heading = Phaser.Math.Angle.WrapDegrees(this.player.headingDegrees);
    const weaponState = this.weaponSystem?.getState(this.time.now);
    this.debugText.setText([
      `FPS: ${fps}`,
      `Player X: ${Math.round(this.player.container.x)}`,
      `Player Y: ${Math.round(this.player.container.y)}`,
      `Current Region: ${SEA_WORLD.regionName}`,
      `Water: ${this.currentWaterType}`,
      `Nearby: ${this.currentNearbyLocationName ?? "None"}`,
      `Speed: ${Math.round(this.player.speed)}`,
      `Heading: ${Math.round(heading)} deg`,
      `Current Target: ${this.selectionManager?.getSelectedTarget()?.displayName ?? "None"}`,
      `Chase: ${this.chaseController?.getTargetName() ?? "None"}`,
      `Port Ready: ${weaponState?.portReady ? "Yes" : "No"}`,
      `Starboard Ready: ${weaponState?.starboardReady ? "Yes" : "No"}`,
      `Active Cannonballs: ${this.weaponSystem?.activeCannonballCount ?? 0}`
    ]);
  }

  private updateCollisionDebugPanel() {
    if (!this.collisionDebugText || !this.weaponSystem) return;
    const state = this.weaponSystem.getState(this.time.now);
    this.collisionDebugText.setText([
      "Projectile Sandbox",
      `Total Shots Fired: ${state.totalShotsFired}`,
      `Successful Hits: ${state.successfulHits}`,
      `Water Impacts: ${state.waterImpacts}`,
      `Object Impacts: ${state.objectImpacts}`,
      `Active Projectiles: ${state.activeCannonballs}`
    ]);
    this.collisionDebugText.setPosition(this.scale.width - this.collisionDebugText.width - 12, this.scale.height - this.collisionDebugText.height - 12);
  }

  private updateMinimapEvent(delta: number) {
    this.minimapEventTimer += delta;
    if (this.minimapEventTimer < 80) return;
    this.minimapEventTimer = 0;
    this.publishPlayerPosition();
  }

  private publishPlayerPosition() {
    if (!this.player) return;
    const targetSnapshot = this.selectionManager?.getSnapshot(this.player.container.x, this.player.container.y) ?? null;
    const detail: SeaMapPositionUpdate = {
      x: this.player.container.x,
      y: this.player.container.y,
      heading: Phaser.Math.Angle.WrapDegrees(this.player.headingDegrees),
      speed: this.player.speed,
      worldWidth: SEA_WORLD.width,
      worldHeight: SEA_WORLD.height,
      regionName: SEA_WORLD.regionName,
      waterType: this.currentWaterType,
      nearbyLocationName: this.currentNearbyLocationName,
      selectedTargetId: targetSnapshot?.id ?? null,
      targetSnapshot,
      hostileMarkers: this.movingHostiles.map((hostile) => ({
        id: hostile.id,
        x: hostile.container.x,
        y: hostile.container.y,
        objectType: hostile.objectType
      })),
      path: this.playerPathFollower?.getPath() ?? [],
      destination: this.playerPathFollower?.getDestination() ?? null,
      isChasing: this.chaseController?.isChasing() ?? false
    };
    window.dispatchEvent(new CustomEvent<SeaMapPositionUpdate>(SEA_MAP_PLAYER_EVENT, { detail }));
  }

  private getDistanceToPlayer(x: number, y: number) {
    if (!this.player) return Number.POSITIVE_INFINITY;
    return Phaser.Math.Distance.Between(this.player.container.x, this.player.container.y, x, y);
  }

  private isWithinRadius(x: number, y: number, targetX: number, targetY: number, radius: number) {
    return Phaser.Math.Distance.Between(x, y, targetX, targetY) <= radius;
  }
}
