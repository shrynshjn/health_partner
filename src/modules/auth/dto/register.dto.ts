import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Shreyansh', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ example: 'Jain', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ example: 'shreyansh@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPassword123', minLength: 6, description: 'Password for login' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '10 April 1999',  description: 'Date of birth of user' })
  @IsOptional()
  dob: Date;
}
