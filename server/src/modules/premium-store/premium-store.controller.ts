import { Controller, Get } from "@nestjs/common";
import { PremiumStoreService } from "./premium-store.service";

@Controller("premium-store")
export class PremiumStoreController {
  constructor(private readonly premiumStoreService: PremiumStoreService) {}

  @Get("status")
  status() {
    return this.premiumStoreService.getStatus();
  }
}
