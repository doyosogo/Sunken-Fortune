import Phaser from "phaser";

export class SeaMapScene extends Phaser.Scene {
  constructor() {
    super("SeaMapScene");
  }

  create() {
    const worldWidth = 2400;
    const worldHeight = 1600;

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.rectangle(0, 0, worldWidth, worldHeight, 0x06243d).setOrigin(0);
    this.add.rectangle(0, 0, worldWidth, worldHeight, 0x0b3a5c, 0.42).setOrigin(0);

    for (let y = 70; y < worldHeight; y += 130) {
      for (let x = 80; x < worldWidth; x += 190) {
        const wave = this.add.ellipse(x, y, 92, 14, 0x38bdf8, 0.16);
        wave.setAngle((x + y) % 12);
        this.tweens.add({
          targets: wave,
          x: x + 18,
          alpha: 0.28,
          duration: 1800 + ((x + y) % 900),
          yoyo: true,
          repeat: -1
        });
      }
    }

    this.drawRoute([
      { x: 360, y: 920 },
      { x: 620, y: 760 },
      { x: 980, y: 650 },
      { x: 1320, y: 500 },
      { x: 1600, y: 420 }
    ]);

    this.createIsland(720, 430, "Driftwood Cay");
    this.createIsland(1580, 900, "Saltglass Reef");
    this.createIsland(1880, 360, "Old Lantern Isle");

    this.createPort(520, 1040, "Tidefall Port");
    this.createShip(360, 920, 0xfacc15, 0x422006, "Dawn Skiff", true);
    this.createShip(1040, 650, 0xdc2626, 0x450a0a, "Raider Cutter");
    this.createShip(1350, 1120, 0xdc2626, 0x450a0a, "Rogue Sloop");
    this.createShip(1780, 610, 0xb91c1c, 0x450a0a, "Blackwake Brig");
    this.createSeaMonster(1280, 330, "Reef Horror");
    this.createSeaMonster(2000, 1100, "Deepcoil");

    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight).setStrokeStyle(6, 0xd9a441, 0.7);
    this.cameras.main.centerOn(900, 760);
  }

  private createIsland(x: number, y: number, label: string) {
    this.add.ellipse(x, y, 210, 124, 0x9a7638);
    this.add.ellipse(x + 28, y - 24, 118, 72, 0x2f7d4f);
    this.add.circle(x - 46, y + 8, 22, 0x6b4f2a);
    this.add.circle(x + 68, y + 20, 18, 0x6b4f2a);
    this.addLabel(x, y - 92, label, "#fef3c7");
  }

  private createPort(x: number, y: number, label: string) {
    this.add.rectangle(x, y, 120, 74, 0x6b3f1f).setStrokeStyle(4, 0xd9a441);
    this.add.rectangle(x, y - 48, 88, 22, 0xd9a441);
    this.add.circle(x + 70, y - 52, 13, 0xfacc15, 0.9);
    this.addLabel(x, y - 92, label, "#fde68a");
  }

  private createShip(x: number, y: number, color: number, stroke: number, label: string, isPlayer = false) {
    const hull = this.add.rectangle(x, y, isPlayer ? 82 : 74, isPlayer ? 34 : 30, color);
    hull.setStrokeStyle(4, stroke);
    this.add.triangle(x + 10, y - 30, 0, 34, 22, 0, 44, 34, 0xf8fafc);
    this.add.rectangle(x, y + 22, 96, 8, 0x5b341c);
    this.addLabel(x, y - 64, label, isPlayer ? "#fef3c7" : "#fecaca");
  }

  private createSeaMonster(x: number, y: number, label: string) {
    this.add.circle(x, y, 42, 0x7c3aed).setStrokeStyle(4, 0x2e1065);
    this.add.circle(x - 34, y + 18, 18, 0x6d28d9);
    this.add.circle(x + 36, y + 15, 18, 0x6d28d9);
    this.add.circle(x - 12, y - 10, 5, 0xfef3c7);
    this.add.circle(x + 12, y - 10, 5, 0xfef3c7);
    this.addLabel(x, y - 68, label, "#ddd6fe");
  }

  private drawRoute(points: Array<{ x: number; y: number }>) {
    for (let index = 0; index < points.length - 1; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const steps = Math.floor(distance / 38);

      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        this.add.circle(
          Phaser.Math.Linear(start.x, end.x, t),
          Phaser.Math.Linear(start.y, end.y, t),
          5,
          0xfde68a,
          0.55
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
  }
}
