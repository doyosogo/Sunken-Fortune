import { GamePanel } from "./GamePanel";

const objectives = [
  { label: "Sink enemy ships", progress: "0 / 5" },
  { label: "Defeat sea monsters", progress: "0 / 2" },
  { label: "Collect treasure maps", progress: "0 / 3" }
];

export function ObjectivesPanel() {
  return (
    <GamePanel title="Daily Orders">
      <ul className="objective-list">
        {objectives.map((objective) => (
          <li key={objective.label}>
            <span>{objective.label}</span>
            <strong>{objective.progress}</strong>
          </li>
        ))}
      </ul>
    </GamePanel>
  );
}
