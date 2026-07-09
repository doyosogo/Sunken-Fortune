import { Injectable } from "@nestjs/common";

@Injectable()
export class InventoryService {
  getStatus() {
    return {
      module: "inventory",
      implemented: false
    };
  }
}
