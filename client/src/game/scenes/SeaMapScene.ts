import Phaser from "phaser";

export class SeaMapScene extends Phaser.Scene {
  constructor() {
    super("SeaMapScene");
  }

  create() {
    const worldWidth = 1800;
    const worldHeight = 1200;

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    this.add.rectangle(0, 0, worldWidth, worldHeight, 0x082f49).setOrigin(0);

    for (let y = 80; y < worldHeight; y += 160) {
      for (let x = 80; x < worldWidth; x += 220) {
        this.add.ellipse(x, y, 90, 18, 0x0e7490, 0.28);
      }
    }

    const island = this.add.ellipse(780, 420, 210, 120, 0x8a6f38);
    this.add.ellipse(810, 390, 110, 70, 0x2f7d4f);
    this.add.text(island.x - 42, island.y + 78, "Island", {
      color: "#d9f99d",
      fontFamily: "monospace",
      fontSize: "16px"
    });

    const playerShip = this.add.rectangle(360, 560, 64, 28, 0xfacc15);
    playerShip.setStrokeStyle(3, 0x422006);
    this.add.text(playerShip.x - 48, playerShip.y + 28, "Player Ship", {
      color: "#fef3c7",
      fontFamily: "monospace",
      fontSize: "14px"
    });

    const enemyShip = this.add.rectangle(1040, 650, 70, 30, 0xdc2626);
    enemyShip.setStrokeStyle(3, 0x450a0a);
    this.add.text(enemyShip.x - 42, enemyShip.y + 30, "Enemy Ship", {
      color: "#fecaca",
      fontFamily: "monospace",
      fontSize: "14px"
    });

    const seaMonster = this.add.circle(1260, 300, 34, 0x7c3aed);
    seaMonster.setStrokeStyle(3, 0x2e1065);
    this.add.text(seaMonster.x - 48, seaMonster.y + 42, "Sea Monster", {
      color: "#ddd6fe",
      fontFamily: "monospace",
      fontSize: "14px"
    });

    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight).setStrokeStyle(4, 0x38bdf8, 0.5);
    this.cameras.main.centerOn(620, 480);
  }
}
