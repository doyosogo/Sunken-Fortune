import Phaser from "phaser";
import { WEAPON_CONFIG } from "../worldConfig";

export class ImpactEffects {
  static createObjectImpact(scene: Phaser.Scene, x: number, y: number) {
    const flash = scene.add.circle(x, y, 18, 0xffffff, 0.82);
    flash.setDepth(35);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.7,
      duration: WEAPON_CONFIG.impactFlashDurationMs,
      onComplete: () => flash.destroy()
    });

    const smoke = scene.add.circle(x, y, 24, 0x94a3b8, 0.36);
    smoke.setDepth(34);
    scene.tweens.add({
      targets: smoke,
      alpha: 0,
      scale: 2.2,
      duration: WEAPON_CONFIG.smokePuffDurationMs,
      onComplete: () => smoke.destroy()
    });
  }

  static createWaterSplash(scene: Phaser.Scene, x: number, y: number) {
    const ring = scene.add.circle(x, y, 14, 0x7dd3fc, 0.18).setStrokeStyle(3, 0xbfdbfe, 0.72);
    ring.setDepth(16);
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 2.4,
      duration: WEAPON_CONFIG.waterSplashDurationMs,
      onComplete: () => ring.destroy()
    });

    const foam = scene.add.ellipse(x, y, 30, 10, 0xe0f2fe, 0.58);
    foam.setDepth(17);
    scene.tweens.add({
      targets: foam,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.3,
      duration: WEAPON_CONFIG.waterSplashDurationMs,
      onComplete: () => foam.destroy()
    });
  }
}
