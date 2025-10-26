import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() first_name: string;
  @IsString() last_name: string;
  @IsEmail() email: string;
  @IsOptional() dob?: Date;
  @IsString() @MinLength(6) password: string;
}
