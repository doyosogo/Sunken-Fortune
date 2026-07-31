import Phaser from "phaser";
import { SEA_MAP_WEAPON_EVENT, WEAPON_CONFIG, type WeaponStateUpdate } from "../worldConfig";
import {
  getBroadsideAngle,
  STARTER_SHIP_HARDPOINTS,
  type Broadside,
  type HardpointDefinition
} from "./Hardpoint";
import { ProjectileManager } from "./ProjectileManager";

interface WeaponKeys {
  Q: Phaser.Input.Keyboard.Key;
  E: Phaser.Input.Keyboard.Key;
}

export class WeaponSystem {
  private readonly hardpoints: HardpointDefinition[];
  private readonly keys: WeaponKeys;
  private readonly projectiles: ProjectileManager;
  private readonly pointerHandler: (pointer: Phaser.Input.Pointer) => void;
  private portCooldownUntil = 0;
  private starboardCooldownUntil = 0;
  private lastPublishedState = "";

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ship: Phaser.GameObjects.Container,
    hardpoints = STARTER_SHIP_HARDPOINTS
  ) {
    this.hardpoints = hardpoints;
    this.projectiles = new ProjectileManager(scene);
    this.keys = scene.input.keyboard!.addKeys("Q,E") as WeaponKeys;
    this.pointerHandler = (pointer) => this.handlePointer(pointer);
    scene.input.mouse?.disableContextMenu();
    scene.input.on("pointerdown", this.pointerHandler);
  }

  update(time: number, deltaMs: number, options: { blockStarboardKeyboard?: boolean } = {}) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
      this.fireBroadside("port", time);
    }

    if (!options.blockStarboardKeyboard && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      this.fireBroadside("starboard", time);
    }

    this.projectiles.update(deltaMs);
    this.publishState(time);
  }

  destroy() {
    this.scene.input.off("pointerdown", this.pointerHandler);
    this.projectiles.destroy();
  }

  get activeCannonballCount() {
    return this.projectiles.activeCount;
  }

  getState(time: number): WeaponStateUpdate {
    return {
      portReady: time >= this.portCooldownUntil,
      starboardReady: time >= this.starboardCooldownUntil,
      portCooldownRemainingMs: Math.max(0, this.portCooldownUntil - time),
      starboardCooldownRemainingMs: Math.max(0, this.starboardCooldownUntil - time),
      activeCannonballs: this.projectiles.activeCount
    };
  }

  private handlePointer(pointer: Phaser.Input.Pointer) {
    if (pointer.leftButtonDown()) {
      this.fireBroadside("port", this.scene.time.now);
    }

    if (pointer.rightButtonDown()) {
      this.fireBroadside("starboard", this.scene.time.now);
    }
  }

  private fireBroadside(side: Broadside, time: number) {
    if (!this.isReady(side, time)) {
      return;
    }

    const firingAngle = getBroadsideAngle(this.ship.rotation, side);
    const sideHardpoints = this.hardpoints.filter((hardpoint) => hardpoint.side === side);

    sideHardpoints.forEach((hardpoint) => {
      const spawn = this.toWorldPosition(hardpoint.localX, hardpoint.localY);
      this.projectiles.spawnCannonball(spawn.x, spawn.y, firingAngle);
      this.createMuzzleFlash(spawn.x, spawn.y, firingAngle);
    });

    this.applyCooldown(side, time);
    this.applyRecoil(side);
    this.playFireSoundPlaceholder(side);
    this.publishState(time, true);
  }

  private isReady(side: Broadside, time: number) {
    return side === "port" ? time >= this.portCooldownUntil : time >= this.starboardCooldownUntil;
  }

  private applyCooldown(side: Broadside, time: number) {
    if (side === "port") {
      this.portCooldownUntil = time + WEAPON_CONFIG.broadsideCooldownMs;
      return;
    }

    this.starboardCooldownUntil = time + WEAPON_CONFIG.broadsideCooldownMs;
  }

  private toWorldPosition(localX: number, localY: number) {
    const cos = Math.cos(this.ship.rotation);
    const sin = Math.sin(this.ship.rotation);

    return {
      x: this.ship.x + localX * cos - localY * sin,
      y: this.ship.y + localX * sin + localY * cos
    };
  }

  private createMuzzleFlash(x: number, y: number, angle: number) {
    const flash = this.scene.add.triangle(
      x,
      y,
      0,
      -10,
      26,
      0,
      0,
      10,
      0xfacc15,
      0.88
    );
    flash.setRotation(angle);
    flash.setDepth(22);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: WEAPON_CONFIG.muzzleFlashLifetimeMs,
      onComplete: () => flash.destroy()
    });
  }

  private applyRecoil(side: Broadside) {
    const recoilAngle = getBroadsideAngle(this.ship.rotation, side === "port" ? "starboard" : "port");
    const startX = this.ship.x;
    const startY = this.ship.y;

    this.scene.tweens.add({
      targets: this.ship,
      x: startX + Math.cos(recoilAngle) * WEAPON_CONFIG.recoilDistance,
      y: startY + Math.sin(recoilAngle) * WEAPON_CONFIG.recoilDistance,
      duration: WEAPON_CONFIG.recoilDurationMs,
      yoyo: true
    });
  }

  private playFireSoundPlaceholder(_side: Broadside) {
    // Future audio hook: route broadside firing through the sound system here.
  }

  private publishState(time: number, force = false) {
    const state = this.getState(time);
    const stateKey = [
      state.portReady,
      state.starboardReady,
      Math.ceil(state.portCooldownRemainingMs / 100),
      Math.ceil(state.starboardCooldownRemainingMs / 100),
      state.activeCannonballs
    ].join(":");

    if (!force && stateKey === this.lastPublishedState) {
      return;
    }

    this.lastPublishedState = stateKey;
    window.dispatchEvent(new CustomEvent<WeaponStateUpdate>(SEA_MAP_WEAPON_EVENT, { detail: state }));
  }
}
