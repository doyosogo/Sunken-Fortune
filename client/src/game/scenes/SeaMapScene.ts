import Phaser from "phaser";
import { PlayerShipController } from "../PlayerShipController";
import { SEA_MAP_PLAYER_EVENT, SEA_WORLD, type SeaMapPositionUpdate } from "../worldConfig";

type NearbyObjectType = "port" | "island" | "enemy" | "monster";

interface NearbyObject {
  x: number;
  y: number;
  radius: number;
  label: string;
  type: NearbyObjectType;
}

const INTERACTION_HINTS: Record<NearbyObjectType, string> = {
  port: "Press E to Dock",
  island: "Island Nearby",
  enemy: "Enemy Nearby",
  monster: "Sea Monster Nearby"
};

const DEBUG_OVERLAY_ENABLED = true;

export class SeaMapScene extends Phaser.Scene {
  private player?: PlayerShipController;
  private playerLabel?: Phaser.GameObjects.Text;
  private debugText?: Phaser.GameObjects.Text;
  private interactionHint?: Phaser.GameObjects.Text;
  private nearbyObjects: NearbyObject[] = [];
  private minimapEventTimer = 0;

  constructor() {
    super("SeaMapScene");
  }

  create() {
    this.cameras.main.setBounds(0, 0, SEA_WORLD.width, SEA_WORLD.height);
    this.physics.world.setBounds(0, 0, SEA_WORLD.width, SEA_WORLD.height);

    this.createOcean();
    this.drawRoute([
      { x: 420, y: 2860 },
      { x: 820, y: 2440 },
      { x: 1360, y: 2140 },
      { x: 2060, y: 1660 },
      { x: 2920, y: 1160 },
      { x: 3840, y: 880 }
    ]);

    this.createIsland(720, 760, "Driftwood Cay", 230);
    this.createIsland(1620, 1380, "Saltglass Reef", 250);
    this.createIsland(2500, 520, "Old Lantern Isle", 235);
    this.createIsland(3340, 2100, "Coralhook Atoll", 245);
    this.createIsland(4480, 2960, "Mistbarrel Key", 230);

    this.createPort(520, 2920, "Tidefall Port");
    this.createPort(3040, 2760, "Amberwake Harbor");

    this.createNpcShip(1320, 2040, 0xdc2626, 0x450a0a, "Raider Cutter");
    this.createNpcShip(2380, 1180, 0xdc2626, 0x450a0a, "Rogue Sloop");
    this.createNpcShip(3920, 1460, 0xb91c1c, 0x450a0a, "Blackwake Brig");
    this.createNpcShip(4480, 2480, 0xdc2626, 0x450a0a, "Ashwake Raider");

    this.createSeaMonster(1880, 620, "Reef Horror");
    this.createSeaMonster(3560, 3180, "Deepcoil");
    this.createSeaMonster(4680, 1040, "Crownmaw");

    this.player = new PlayerShipController(this, 420, 2860);
    this.playerLabel = this.addLabel(this.player.container.x, this.player.container.y - 72, "Dawn Skiff", "#fef3c7");
    this.playerLabel.setDepth(30);

    this.add.rectangle(SEA_WORLD.width / 2, SEA_WORLD.height / 2, SEA_WORLD.width, SEA_WORLD.height).setStrokeStyle(6, 0xd9a441, 0.7);

    this.cameras.main.startFollow(this.player.container, false, 0.08, 0.08);
    this.cameras.main.setDeadzone(120, 90);
    if (DEBUG_OVERLAY_ENABLED) {
      this.createDebugOverlay();
    }
    this.createInteractionHint();
    this.publishPlayerPosition();
  }

  update(_time: number, delta: number) {
    if (!this.player) {
      return;
    }

    this.player.update(delta);
    this.updatePlayerLabel();
    this.updateInteractionHint();
    this.updateDebugOverlay();
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

  private createIsland(x: number, y: number, label: string, radius: number) {
    this.add.ellipse(x, y, radius, radius * 0.56, 0x9a7638);
    this.add.ellipse(x + 30, y - 24, radius * 0.52, radius * 0.32, 0x2f7d4f);
    this.add.circle(x - 52, y + 12, 22, 0x6b4f2a);
    this.add.circle(x + 74, y + 22, 18, 0x6b4f2a);
    this.addLabel(x, y - radius * 0.42, label, "#fef3c7");
    this.nearbyObjects.push({ x, y, radius: radius * 0.56 + 110, label, type: "island" });
  }

  private createPort(x: number, y: number, label: string) {
    this.add.rectangle(x, y, 130, 78, 0x6b3f1f).setStrokeStyle(4, 0xd9a441);
    this.add.rectangle(x, y - 52, 94, 24, 0xd9a441);
    this.add.rectangle(x + 84, y + 4, 88, 18, 0x5b341c).setStrokeStyle(2, 0x2b1a11);
    this.add.circle(x + 76, y - 58, 13, 0xfacc15, 0.9);
    this.addLabel(x, y - 96, label, "#fde68a");
    this.nearbyObjects.push({ x, y, radius: 190, label, type: "port" });
  }

  private createNpcShip(x: number, y: number, color: number, stroke: number, label: string) {
    const ship = this.add.container(x, y);
    ship.setRotation(Phaser.Math.DegToRad((x + y) % 360));
    const hull = this.add.polygon(0, 0, [38, 0, 16, -15, -34, -12, -42, 0, -34, 12, 16, 15], color);
    hull.setStrokeStyle(4, stroke);
    const mast = this.add.rectangle(0, 0, 5, 34, 0x5b341c);
    const sail = this.add.triangle(8, -8, 0, -22, 0, 20, 25, 10, 0xf8fafc);
    sail.setStrokeStyle(2, 0x7a4b29);
    ship.add([hull, mast, sail]);
    this.addLabel(x, y - 58, label, "#fecaca");
    this.nearbyObjects.push({ x, y, radius: 210, label, type: "enemy" });
  }

  private createSeaMonster(x: number, y: number, label: string) {
    this.add.circle(x, y, 44, 0x7c3aed).setStrokeStyle(4, 0x2e1065);
    this.add.circle(x - 36, y + 18, 18, 0x6d28d9);
    this.add.circle(x + 38, y + 15, 18, 0x6d28d9);
    this.add.circle(x - 12, y - 10, 5, 0xfef3c7);
    this.add.circle(x + 12, y - 10, 5, 0xfef3c7);
    this.addLabel(x, y - 70, label, "#ddd6fe");
    this.nearbyObjects.push({ x, y, radius: 225, label, type: "monster" });
  }

  private drawRoute(points: Array<{ x: number; y: number }>) {
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

  private updateInteractionHint() {
    if (!this.player || !this.interactionHint) {
      return;
    }

    const nearest = this.findNearestObject();

    if (!nearest) {
      this.interactionHint.setVisible(false);
      return;
    }

    this.interactionHint.setText(INTERACTION_HINTS[nearest.type]);
    this.interactionHint.setPosition(this.player.container.x, this.player.container.y - 116);
    this.interactionHint.setVisible(true);
  }

  private findNearestObject() {
    if (!this.player) {
      return null;
    }

    let nearest: NearbyObject | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const object of this.nearbyObjects) {
      const distance = Phaser.Math.Distance.Between(this.player.container.x, this.player.container.y, object.x, object.y);

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
      `Speed: ${Math.round(this.player.speed)}`,
      `Heading: ${Math.round(heading)} deg`
    ]);
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
      regionName: SEA_WORLD.regionName
    };

    window.dispatchEvent(new CustomEvent<SeaMapPositionUpdate>(SEA_MAP_PLAYER_EVENT, { detail }));
  }
}
