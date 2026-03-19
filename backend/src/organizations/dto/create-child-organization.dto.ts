import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsBoolean,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateChildOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  inn: string;

  @IsString()
  @IsIn(['education', 'medical', 'service', 'retail', 'manufacturing', 'it', 'other'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsIn(['education', 'healthcare', 'finance', 'retail', 'manufacturing', 'it', 'other'])
  @IsOptional()
  industry?: string;

  @IsBoolean()
  @IsOptional()
  isGovernment?: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  region: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string;
}