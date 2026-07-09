import { Controller, Get } from "@nestjs/common";
import { EconomyService } from "./economy.service";

@Controller("economy")
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Get("status")
  status() {
    return this.economyService.getStatus();
  }
}
