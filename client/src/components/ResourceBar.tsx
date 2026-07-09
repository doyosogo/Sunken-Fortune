interface ResourceItem {
  label: string;
  value: string;
  tone: "gold" | "gem" | "ammo" | "wood" | "iron" | "rum";
}

const resources: ResourceItem[] = [
  { label: "Gold", value: "12,480", tone: "gold" },
  { label: "Gems", value: "145", tone: "gem" },
  { label: "Cannonballs", value: "820", tone: "ammo" },
  { label: "Timber", value: "64", tone: "wood" },
  { label: "Iron", value: "38", tone: "iron" },
  { label: "Rum", value: "27", tone: "rum" }
];

export function ResourceBar() {
  return (
    <div className="resource-bar" aria-label="Resources">
      {resources.map((resource) => (
        <div className={`resource-chip ${resource.tone}`} key={resource.label}>
          <span className="resource-icon" aria-hidden="true" />
          <span>{resource.label}</span>
          <strong>{resource.value}</strong>
        </div>
      ))}
    </div>
  );
}
