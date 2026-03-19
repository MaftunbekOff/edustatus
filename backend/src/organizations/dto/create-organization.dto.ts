import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  Matches,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @Matches(/^\d{9}$/, { message: 'INN must be exactly 9 digits' })
  inn: string;

  @IsString()
  @IsIn(['education', 'medical', 'service', 'retail', 'manufacturing', 'it', 'other'])
  type: string;

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

  @IsString()
  @IsOptional()
  @MaxLength(255)
  subdomain?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  customDomain?: string;

  @IsString()
  @IsIn(['basic', 'pro', 'enterprise'])
  @IsOptional()
  plan?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  logo?: string;

  // Features - with defaults
  @IsBoolean()
  @IsOptional()
  hasClients?: boolean = true;

  @IsBoolean()
  @IsOptional()
  hasPayments?: boolean = true;

  @IsBoolean()
  @IsOptional()
  hasReports?: boolean = true;

  @IsBoolean()
  @IsOptional()
  hasBankIntegration?: boolean = false;

  @IsBoolean()
  @IsOptional()
  hasTelegramBot?: boolean = false;

  @IsBoolean()
  @IsOptional()
  hasSmsNotifications?: boolean = false;

  @IsBoolean()
  @IsOptional()
  hasExcelImport?: boolean = false;

  @IsBoolean()
  @IsOptional()
  hasPdfReports?: boolean = false;

  @IsBoolean()
  @IsOptional()
  allowSubOrganizations?: boolean = false;

  @IsNumber()
  @Min(1)
  @Max(1000)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  clientLimit?: number = 100;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  departmentLimit?: number = 5;
}