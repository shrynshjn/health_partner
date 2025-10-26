import { ApiProperty } from '@nestjs/swagger';
import { GoalItemDto } from './goal-item.dto';

export class GetGoalsResponseDto {
  @ApiProperty({ type: [GoalItemDto] })
  goals: GoalItemDto[];

  @ApiProperty({ example: '2025-10-26T10:10:00.000Z' })
  updatedAt: string;
}
