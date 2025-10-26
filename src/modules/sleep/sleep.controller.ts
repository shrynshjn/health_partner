import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { SleepService } from './sleep.service';
import { CreateSleepDto } from './dto/create-sleep.dto';
import { UpdateSleepDto } from './dto/update-sleep.dto';
import { QuerySleepDto } from './dto/query-sleep.dto';

@ApiTags('sleep')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sleep')
export class SleepController {
  constructor(private readonly sleep: SleepService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateSleepDto) {
    return this.sleep.create(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: any, @Query() q: QuerySleepDto) {
    const start = new Date(q.start);
    const end = new Date(q.end);
    return this.sleep.findByRange(user.userId, start, end, q.limit, q.cursor);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateSleepDto) {
    return this.sleep.update(user.userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.sleep.remove(user.userId, id);
  }
}
