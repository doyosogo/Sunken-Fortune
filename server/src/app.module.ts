import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { EconomyModule } from "./modules/economy/economy.module";
import { HealthModule } from "./modules/health/health.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { PlayersModule } from "./modules/players/players.module";
import { PremiumStoreModule } from "./modules/premium-store/premium-store.module";
import { SaveModule } from "./modules/save/save.module";
import { ShipsModule } from "./modules/ships/ships.module";
import { VoyageModule } from "./modules/voyage/voyage.module";

@Module({
  imports: [
    HealthModule,
    AuthModule,
    PlayersModule,
    ShipsModule,
    InventoryModule,
    EconomyModule,
    VoyageModule,
    SaveModule,
    PremiumStoreModule
  ]
})
export class AppModule {}
