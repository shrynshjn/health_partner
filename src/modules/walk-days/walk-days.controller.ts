import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { WalkDaysService } from './walk-days.service';
import { UpsertSlotDto } from './dto/upsert-slot.dto';

@ApiTags('walk-days')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('walk-days')
export class WalkDaysController {
  constructor(private readonly service: WalkDaysService) {}

  @Get()
  findByRange(
    @CurrentUser() user: any,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.service.findByRange(user.userId, start, end);
  }

  @Put(':date/:hour')
  upsertSlot(
    @CurrentUser() user: any,
    @Param('date') date: string,
    @Param('hour', ParseIntPipe) hour: number,
    @Body() dto: UpsertSlotDto,
  ) {
    return this.service.upsertSlot(user.userId, date, hour, dto);
  }

  @Delete(':date/:hour')
  deleteSlot(
    @CurrentUser() user: any,
    @Param('date') date: string,
    @Param('hour', ParseIntPipe) hour: number,
  ) {
    return this.service.deleteSlot(user.userId, date, hour);
  }
}
