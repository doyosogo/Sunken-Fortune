import { Injectable } from "@nestjs/common";

@Injectable()
export class PlayersService {
  getStatus() {
    return {
      module: "players",
      implemented: false
    };
  }
}
