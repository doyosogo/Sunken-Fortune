import { GamePanel } from "./GamePanel";

const logItems = [
  "Recovered driftwood near Saltglass Reef.",
  "Spotted a hostile cutter to the east.",
  "Crew marked a possible treasure route.",
  "Lanterns sighted at Tidefall Port."
];

export function VoyageLog() {
  return (
    <GamePanel title="Voyage Log">
      <ol className="voyage-log">
        {logItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </GamePanel>
  );
}
