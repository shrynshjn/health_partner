import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { HealthService } from './health.service';
import { CreateHealthDto } from './dto/create-health.dto';
import { BulkHealthDto } from './dto/bulk-health.dto';
import { QueryHealthTrendsDto } from './dto/query-health-trends.dto';

@ApiTags('health')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateHealthDto) {
    return this.service.create(user.userId, dto);
  }

  @Post('bulk')
  bulk(@CurrentUser() user: any, @Body() dto: BulkHealthDto) {
    return this.service.bulk(user.userId, dto.items, dto.idempotencyKey);
  }

  @Get('list')
  list(@CurrentUser() user: any) {
    return this.service.listNames(user.userId);
  }

  @Get(':name')
  latest(@CurrentUser() user: any, @Param('name') name: string) {
    return this.service.getLatest(user.userId, name);
  }

  @Get('trends/all')
  trends(@CurrentUser() user: any, @Query() q: QueryHealthTrendsDto) {
    const start = new Date(q.start);
    const end = new Date(q.end);
    return this.service.trends(user.userId, q.names, start, end, q.interval ?? 'day');
  }
}
