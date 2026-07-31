import Phaser from "phaser";
import { NAVIGATION_CONFIG, SEA_WORLD } from "../worldConfig";
import { ISLANDS, PORTS, type WorldPosition } from "../worldObjects";

interface NavigationObstacle {
  id: string;
  position: WorldPosition;
  radius: number;
}

export interface NavigationNode extends WorldPosition {
  id: string;
}

export class NavigationGraph {
  readonly nodes: NavigationNode[];
  readonly edges = new Map<string, string[]>();
  readonly obstacles: NavigationObstacle[];

  constructor() {
    this.obstacles = [
      ...ISLANDS.map((island) => ({
        id: island.id,
        position: island.position,
        radius: island.collisionRadius + NAVIGATION_CONFIG.lineOfSightPadding
      })),
      ...PORTS.map((port) => ({
        id: port.id,
        position: port.position,
        radius: port.collisionRadius + NAVIGATION_CONFIG.lineOfSightPadding
      }))
    ];
    this.nodes = this.createNodes();
    this.connectNodes();
  }

  hasLineOfSight(start: WorldPosition, end: WorldPosition) {
    return this.obstacles.every((obstacle) => {
      const distance = distancePointToSegment(obstacle.position, start, end);
      return distance > obstacle.radius;
    });
  }

  private createNodes() {
    const nodes: NavigationNode[] = [];
    this.obstacles.forEach((obstacle) => {
      const radius = obstacle.radius + NAVIGATION_CONFIG.obstaclePadding;
      const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
      angles.forEach((angle, index) => {
        const node = {
          id: `${obstacle.id}-nav-${index}`,
          x: Phaser.Math.Clamp(obstacle.position.x + Math.cos(angle) * radius, 80, SEA_WORLD.width - 80),
          y: Phaser.Math.Clamp(obstacle.position.y + Math.sin(angle) * radius, 80, SEA_WORLD.height - 80)
        };
        if (!this.isInsideObstacle(node)) {
          nodes.push(node);
        }
      });
    });
    return nodes;
  }

  private connectNodes() {
    this.nodes.forEach((node) => this.edges.set(node.id, []));
    for (let i = 0; i < this.nodes.length; i += 1) {
      for (let j = i + 1; j < this.nodes.length; j += 1) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        if (this.hasLineOfSight(a, b)) {
          this.edges.get(a.id)!.push(b.id);
          this.edges.get(b.id)!.push(a.id);
        }
      }
    }
  }

  private isInsideObstacle(point: WorldPosition) {
    return this.obstacles.some((obstacle) => Phaser.Math.Distance.Between(point.x, point.y, obstacle.position.x, obstacle.position.y) <= obstacle.radius);
  }
}

function distancePointToSegment(point: WorldPosition, start: WorldPosition, end: WorldPosition) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Phaser.Math.Distance.Between(point.x, point.y, start.x, start.y);
  }
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Phaser.Math.Distance.Between(point.x, point.y, start.x + t * dx, start.y + t * dy);
}
