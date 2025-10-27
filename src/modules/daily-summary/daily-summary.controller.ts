import {
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { DailySummaryService } from "./daily-summary.service";
import { GetSummaryDto } from "./dto/get-summary.dto";

@ApiTags("daily-summary")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("daily-summary")
export class DailySummaryController {
  constructor(private readonly service: DailySummaryService) {}

  @Get()
  async getSummary(
    @CurrentUser() user: any,
    @Query() query: GetSummaryDto
  ) {
    const startDate = new Date(query.start);
    const endDate = new Date(query.end);
    return this.service.getSummary(user.userId, startDate, endDate);
  }
}
