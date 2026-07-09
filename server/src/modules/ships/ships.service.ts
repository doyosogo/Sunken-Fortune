import { Injectable } from "@nestjs/common";

@Injectable()
export class ShipsService {
  getStatus() {
    return {
      module: "ships",
      implemented: false
    };
  }
}
