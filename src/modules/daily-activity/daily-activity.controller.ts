import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { DailyActivityService } from './daily-activity.service';
import { UpsertDailyActivityDto } from './dto/upsert-daily-activity.dto';

@ApiTags('daily-activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('daily-activity')
export class DailyActivityController {
  constructor(private readonly service: DailyActivityService) {}

  @Post()
  upsert(@CurrentUser() user: any, @Body() dto: UpsertDailyActivityDto) {
    return this.service.upsert(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: any, @Query('start') start: string, @Query('end') end: string) {
    return this.service.findByDateRange(user.userId, new Date(start), new Date(end));
  }
}
