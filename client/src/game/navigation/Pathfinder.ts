import Phaser from "phaser";
import { NavigationGraph, type NavigationNode } from "./NavigationGraph";
import type { WorldPosition } from "../worldObjects";

export class Pathfinder {
  constructor(private readonly graph: NavigationGraph) {}

  findPath(start: WorldPosition, goal: WorldPosition) {
    if (this.graph.hasLineOfSight(start, goal)) {
      return [goal];
    }

    const startNode: NavigationNode = { id: "__start", ...start };
    const goalNode: NavigationNode = { id: "__goal", ...goal };
    const nodes = [startNode, goalNode, ...this.graph.nodes];
    const edges = new Map<string, string[]>();
    nodes.forEach((node) => edges.set(node.id, []));

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        if (this.graph.hasLineOfSight(a, b)) {
          edges.get(a.id)!.push(b.id);
          edges.get(b.id)!.push(a.id);
        }
      }
    }

    const previous = new Map<string, string | null>();
    const distances = new Map<string, number>();
    const unvisited = new Set(nodes.map((node) => node.id));
    nodes.forEach((node) => {
      previous.set(node.id, null);
      distances.set(node.id, node.id === startNode.id ? 0 : Number.POSITIVE_INFINITY);
    });

    while (unvisited.size > 0) {
      const currentId = [...unvisited].sort((a, b) => distances.get(a)! - distances.get(b)!)[0];
      if (!currentId || currentId === goalNode.id) break;
      unvisited.delete(currentId);
      const current = nodes.find((node) => node.id === currentId)!;

      edges.get(currentId)!.forEach((neighborId) => {
        if (!unvisited.has(neighborId)) return;
        const neighbor = nodes.find((node) => node.id === neighborId)!;
        const candidate = distances.get(currentId)! + Phaser.Math.Distance.Between(current.x, current.y, neighbor.x, neighbor.y);
        if (candidate < distances.get(neighborId)!) {
          distances.set(neighborId, candidate);
          previous.set(neighborId, currentId);
        }
      });
    }

    if (previous.get(goalNode.id) === null) {
      return [goal];
    }

    const path: WorldPosition[] = [];
    let cursor: string | null = goalNode.id;
    while (cursor && cursor !== startNode.id) {
      const node = nodes.find((candidate) => candidate.id === cursor)!;
      path.unshift({ x: node.x, y: node.y });
      cursor = previous.get(cursor) ?? null;
    }
    return path;
  }
}
