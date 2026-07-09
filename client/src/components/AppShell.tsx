import type { PropsWithChildren } from "react";
import type { AppRoute } from "../App";

interface NavigationItem {
  route: AppRoute;
  label: string;
}

const navigationItems: NavigationItem[] = [
  { route: "landing", label: "Landing" },
  { route: "dashboard", label: "Dashboard" },
  { route: "sea-map", label: "Sea Map" },
  { route: "shipyard", label: "Shipyard" },
  { route: "shop", label: "Shop" },
  { route: "captain-cabin", label: "Captain Cabin" },
  { route: "settings", label: "Settings" }
];

interface AppShellProps {
  currentRoute: AppRoute;
  title: string;
  onNavigate: (route: AppRoute) => void;
}

export function AppShell({
  children,
  currentRoute,
  title,
  onNavigate
}: PropsWithChildren<AppShellProps>) {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">SF</span>
          <div>
            <strong>Sunken Fortune</strong>
            <span>Pirate Naval RPG</span>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => (
            <button
              className={item.route === currentRoute ? "nav-item active" : "nav-item"}
              key={item.route}
              onClick={() => onNavigate(item.route)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Development Scaffold</span>
            <h1>{title}</h1>
          </div>
          <div className="save-cluster">
            <button className="save-button" type="button">
              Save Now
            </button>
            <span className="save-status">Saved just now</span>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
