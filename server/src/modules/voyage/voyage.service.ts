import { Injectable } from "@nestjs/common";

@Injectable()
export class VoyageService {
  getStatus() {
    return {
      module: "voyage",
      implemented: false
    };
  }
}
