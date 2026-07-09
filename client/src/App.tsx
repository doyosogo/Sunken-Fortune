import { useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CaptainCabinPage } from "./pages/CaptainCabinPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { SeaMapPage } from "./pages/SeaMapPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShipyardPage } from "./pages/ShipyardPage";
import { ShopPage } from "./pages/ShopPage";

export type AppRoute =
  | "landing"
  | "dashboard"
  | "sea-map"
  | "shipyard"
  | "shop"
  | "captain-cabin"
  | "settings";

const pageTitles: Record<AppRoute, string> = {
  landing: "Landing / Login",
  dashboard: "Dashboard",
  "sea-map": "Sea Map",
  shipyard: "Shipyard",
  shop: "Shop",
  "captain-cabin": "Captain Cabin",
  settings: "Settings"
};

export function App() {
  const [route, setRoute] = useState<AppRoute>("sea-map");
  const title = useMemo(() => pageTitles[route], [route]);

  return (
    <AppShell currentRoute={route} title={title} onNavigate={setRoute}>
      {route === "landing" && <LandingPage />}
      {route === "dashboard" && <DashboardPage />}
      {route === "sea-map" && <SeaMapPage />}
      {route === "shipyard" && <ShipyardPage />}
      {route === "shop" && <ShopPage />}
      {route === "captain-cabin" && <CaptainCabinPage />}
      {route === "settings" && <SettingsPage />}
    </AppShell>
  );
}
