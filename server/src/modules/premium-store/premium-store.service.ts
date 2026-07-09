import { Injectable } from "@nestjs/common";

@Injectable()
export class PremiumStoreService {
  getStatus() {
    return {
      module: "premium-store",
      implemented: false,
      realPaymentsEnabled: false
    };
  }
}
