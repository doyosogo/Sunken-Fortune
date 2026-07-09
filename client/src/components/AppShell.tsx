import type { PropsWithChildren } from "react";
import type { AppRoute } from "../App";

interface NavigationItem {
  route: AppRoute;
  label: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  { route: "sea-map", label: "Sea", icon: "S" },
  { route: "dashboard", label: "Deck", icon: "D" },
  { route: "shipyard", label: "Yard", icon: "Y" },
  { route: "shop", label: "Market", icon: "M" },
  { route: "captain-cabin", label: "Cabin", icon: "C" },
  { route: "settings", label: "Options", icon: "O" },
  { route: "landing", label: "Login", icon: "L" }
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
            <span>Emerald Coast</span>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => (
            <button
              className={item.route === currentRoute ? "nav-item active" : "nav-item"}
              aria-current={item.route === currentRoute ? "page" : undefined}
              key={item.route}
              onClick={() => onNavigate(item.route)}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Open Sea Command</span>
            <h1>{title}</h1>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
