export type CurrencyType = "gold" | "premium" | "material" | "xp";

export interface PlayerProfile {
  id: string;
  displayName: string;
  captainLevel: number;
  currentShipId: string | null;
}

export interface ShipSummary {
  id: string;
  name: string;
  tier: number;
  role: string;
  isOwned: boolean;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "failed";

export interface VoyageReportSummary {
  timeAwayMinutes: number;
  cappedAtMinutes: number;
  wasCapped: boolean;
  enemiesDefeated: number;
  goldEarned: number;
  captainXpEarned: number;
  crewXpEarned: number;
  lootFound: string[];
  ammoUsed: number;
  hullDamageTaken: number;
  repairsNeeded: boolean;
}
