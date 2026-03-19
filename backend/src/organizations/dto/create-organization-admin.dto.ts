import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrganizationAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @IsIn(['admin', 'accountant', 'manager', 'operator'])
  @IsOptional()
  role?: string = 'admin';
}