
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class GetSummaryDto {
  @ApiProperty({ example: '2025-10-25T00:00:00Z', description: 'Start date for the summary range' })
  @IsDateString()
  start: string;

  @ApiProperty({ example: '2025-10-27T00:00:00Z', description: 'End date for the summary range' })
  @IsDateString()
  end: string;
}
