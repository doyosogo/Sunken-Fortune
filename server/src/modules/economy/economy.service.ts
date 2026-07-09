import { Injectable } from "@nestjs/common";

@Injectable()
export class EconomyService {
  getStatus() {
    return {
      module: "economy",
      implemented: false
    };
  }
}
