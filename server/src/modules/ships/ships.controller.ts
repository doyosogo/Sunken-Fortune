import { Controller, Get } from "@nestjs/common";
import { ShipsService } from "./ships.service";

@Controller("ships")
export class ShipsController {
  constructor(private readonly shipsService: ShipsService) {}

  @Get("status")
  status() {
    return this.shipsService.getStatus();
  }
}
