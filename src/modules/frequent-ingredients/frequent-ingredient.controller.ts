import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FrequentIngredientService } from './frequent-ingredient.service';
import { CreateFrequentIngredientDto } from './dto/create-frequent-ingredient.dto';
import { QueryFrequentIngredientDto } from './dto/query-frequent-ingredient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('frequent-ingredients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('frequent-ingredients')
export class FrequentIngredientController {
  constructor(private readonly service: FrequentIngredientService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateFrequentIngredientDto) {
    return this.service.create(user.userId, dto);
  }

  @Get()
  query(@CurrentUser() user: any, @Query() dto: QueryFrequentIngredientDto) {
    return this.service.query(user.userId, dto);
  }

  @Get(':id')
  findById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.findById(user.userId, id);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.delete(user.userId, id);
  }
}
