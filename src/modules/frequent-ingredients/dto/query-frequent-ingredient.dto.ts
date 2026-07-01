import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryFrequentIngredientDto {
  @ApiPropertyOptional({ description: 'Full-text search across name, aliases, brand' })
  @IsOptional() @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsNumberString() limit?: string;
  @ApiPropertyOptional({ description: 'Cursor (last document _id) for pagination' })
  @IsOptional() @IsString()
  cursor?: string;
}
