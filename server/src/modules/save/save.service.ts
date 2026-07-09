import { Injectable } from "@nestjs/common";

@Injectable()
export class SaveService {
  getStatus() {
    return {
      module: "save",
      implemented: false
    };
  }
}
