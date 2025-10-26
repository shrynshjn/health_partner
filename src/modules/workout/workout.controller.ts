import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';

@ApiTags('workout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workout')
export class WorkoutController {
  constructor(private readonly workout: WorkoutService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateWorkoutDto) {
    return this.workout.create(user.userId, dto);
  }

  @Post('bulk')
  bulk(@CurrentUser() user: any, @Body('items') items: CreateWorkoutDto[]) {
    return this.workout.createBulk(user.userId, items);
  }

  @Get()
  list(@CurrentUser() user: any, @Query() q: QueryWorkoutDto) {
    const start = new Date(q.start);
    const end = new Date(q.end);
    return this.workout.findByRange(user.userId, start, end, q.limit, q.cursor);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateWorkoutDto) {
    return this.workout.update(user.userId, id, dto);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.workout.remove(user.userId, id);
  }
}
