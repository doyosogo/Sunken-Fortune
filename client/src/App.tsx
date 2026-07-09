import { lazy, Suspense, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { CaptainCabinPage } from "./pages/CaptainCabinPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShipyardPage } from "./pages/ShipyardPage";
import { ShopPage } from "./pages/ShopPage";

const SeaMapPage = lazy(() =>
  import("./pages/SeaMapPage").then((module) => ({ default: module.SeaMapPage }))
);

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
      {route === "sea-map" && (
        <Suspense fallback={<SeaMapLoading />}>
          <SeaMapPage />
        </Suspense>
      )}
      {route === "shipyard" && <ShipyardPage />}
      {route === "shop" && <ShopPage />}
      {route === "captain-cabin" && <CaptainCabinPage />}
      {route === "settings" && <SettingsPage />}
    </AppShell>
  );
}

function SeaMapLoading() {
  return (
    <section className="route-loading" aria-live="polite">
      <div className="loading-compass" aria-hidden="true" />
      <strong>Charting the waters...</strong>
      <span>Preparing the Emerald Coast sea map</span>
    </section>
  );
}
