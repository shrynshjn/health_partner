import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { PhysicalService } from './physical.service';
import { CreatePhysicalDto } from './dto/create-physical.dto';
import { BulkPhysicalDto } from './dto/bulk-physical.dto';
import { UpdatePhysicalDto } from './dto/update-physical.dto';
import { QueryPhysicalTrendsDto } from './dto/query-physical-trends.dto';

@ApiTags('physical')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('physical')
export class PhysicalController {
  constructor(private readonly service: PhysicalService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreatePhysicalDto) {
    return this.service.create(user.userId, dto);
  }

  @Post('bulk')
  bulk(@CurrentUser() user: any, @Body() dto: BulkPhysicalDto) {
    return this.service.bulk(user.userId, dto.items, dto.idempotencyKey);
  }

  @Get(':type')
  latest(@CurrentUser() user: any, @Param('type') type: string) {
    return this.service.getLatest(user.userId, type);
  }

  @Patch('latest/:type')
  updateLatest(@CurrentUser() user: any, @Param('type') type: string, @Body() dto: UpdatePhysicalDto) {
    return this.service.updateLatest(user.userId, type, dto);
  }

  @Delete('latest/:type')
  deleteLatest(@CurrentUser() user: any, @Param('type') type: string) {
    return this.service.deleteLatest(user.userId, type);
  }

  @Get('trends/all')
  trends(@CurrentUser() user: any, @Query() q: QueryPhysicalTrendsDto) {
    const start = new Date(q.start);
    const end = new Date(q.end);
    return this.service.trends(user.userId, q.types, start, end, q.interval ?? 'day');
  }
}
