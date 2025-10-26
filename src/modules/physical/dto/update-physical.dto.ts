import { PartialType } from '@nestjs/swagger';
import { CreatePhysicalDto } from './create-physical.dto';

export class UpdatePhysicalDto extends PartialType(CreatePhysicalDto) {}
