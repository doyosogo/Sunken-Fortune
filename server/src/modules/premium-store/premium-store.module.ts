import { Module } from "@nestjs/common";
import { PremiumStoreController } from "./premium-store.controller";
import { PremiumStoreService } from "./premium-store.service";

@Module({
  controllers: [PremiumStoreController],
  providers: [PremiumStoreService]
})
export class PremiumStoreModule {}
