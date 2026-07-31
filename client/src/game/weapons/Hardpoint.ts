export type Broadside = "port" | "starboard";

export interface HardpointDefinition {
  id: string;
  side: Broadside;
  localX: number;
  localY: number;
}

export const STARTER_SHIP_HARDPOINTS: HardpointDefinition[] = [
  { id: "port-forward", side: "port", localX: 24, localY: -32 },
  { id: "port-aft", side: "port", localX: -24, localY: -32 },
  { id: "starboard-forward", side: "starboard", localX: 24, localY: 32 },
  { id: "starboard-aft", side: "starboard", localX: -24, localY: 32 }
];

export function getBroadsideAngle(shipRotation: number, side: Broadside) {
  return shipRotation + (side === "port" ? -Math.PI / 2 : Math.PI / 2);
}

