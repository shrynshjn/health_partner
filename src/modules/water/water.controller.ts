import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { WaterService } from './water.service';
import { CreateWaterDto } from './dto/create-water.dto';
import { UpdateWaterDto } from './dto/update-water.dto';
import { QueryWaterDto } from './dto/query-water.dto';

@ApiTags('water')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('water')
export class WaterController {
  constructor(private readonly water: WaterService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateWaterDto) {
    return this.water.create(user.userId, dto);
  }

  @Get()
  list(@CurrentUser() user: any, @Query() q: QueryWaterDto) {
    const start = new Date(q.start);
    const end = new Date(q.end);
    return this.water.findByRange(user.userId, start, end, q.limit, q.cursor);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateWaterDto) {
    return this.water.update(user.userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.water.remove(user.userId, id);
  }
}
