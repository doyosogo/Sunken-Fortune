import { Controller, Get } from "@nestjs/common";
import { SaveService } from "./save.service";

@Controller("save")
export class SaveController {
  constructor(private readonly saveService: SaveService) {}

  @Get("status")
  status() {
    return this.saveService.getStatus();
  }
}
