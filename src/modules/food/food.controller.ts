import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FoodService } from "./food.service";
import { CreateFoodDto } from "./dto/create-food.dto";
import { UpdateFoodDto } from "./dto/update-food.dto";
import { QueryFoodDto } from "./dto/query-food.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/user.decorator";
import { LogMealBulkDto } from "./dto/log-meal-bulk.dto";

@ApiTags("food")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("food")
export class FoodController {
  constructor(private readonly food: FoodService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateFoodDto) {
    return this.food.create(user.userId, dto);
  }

  @Get()
  async list(@CurrentUser() user: any, @Query() q: QueryFoodDto) {
    const start = new Date(q.start);
    const end = new Date(q.end);
    return this.food.findByRange(
      user.userId,
      start,
      end,
      q.mealType,
      q.limit,
      q.cursor
    );
  }

  @Patch(":id")
  update(
    @CurrentUser() user: any,
    @Param("id") id: string,
    @Body() dto: UpdateFoodDto
  ) {
    return this.food.update(user.userId, id, dto);
  }

  @Delete(":id")
  delete(@CurrentUser() user: any, @Param("id") id: string) {
    return this.food.remove(user.userId, id);
  }

  @Post("bulk")
  logMealBulk(@CurrentUser() user: any, @Body() body: LogMealBulkDto) {
    return this.food.logMealBulk(
      user.userId,
      body.items,
      body.idempotencyKey
    );
  }
}
