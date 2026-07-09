import { Controller, Get } from "@nestjs/common";
import { VoyageService } from "./voyage.service";

@Controller("voyage")
export class VoyageController {
  constructor(private readonly voyageService: VoyageService) {}

  @Get("status")
  status() {
    return this.voyageService.getStatus();
  }
}
