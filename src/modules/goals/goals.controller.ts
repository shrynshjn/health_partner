import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { GoalsService } from './goals.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';
import { GetGoalsResponseDto } from './dto/get-goals-response.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  @Get()
  @ApiOkResponse({ type: GetGoalsResponseDto })
  get(@CurrentUser() user: any) {
    return this.service.get(user.userId);
  }

  @Put()
  update(@CurrentUser() user: any, @Body() dto: UpdateGoalsDto) {
    return this.service.update(user.userId, dto);
  }
}
