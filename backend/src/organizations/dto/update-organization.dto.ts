import {
  IsString,
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

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{9}$/, { message: 'INN must be exactly 9 digits' })
  inn?: string;

  @IsString()
  @IsOptional()
  @IsIn(['education', 'medical', 'service', 'retail', 'manufacturing', 'it', 'other'])
  type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['education', 'healthcare', 'finance', 'retail', 'manufacturing', 'it', 'other'])
  industry?: string;

  @IsBoolean()
  @IsOptional()
  isGovernment?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  region?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  subdomain?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  customDomain?: string;

  @IsString()
  @IsOptional()
  @IsIn(['basic', 'pro', 'enterprise'])
  plan?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  logo?: string;

  // Features
  @IsBoolean()
  @IsOptional()
  hasClients?: boolean;

  @IsBoolean()
  @IsOptional()
  hasPayments?: boolean;

  @IsBoolean()
  @IsOptional()
  hasReports?: boolean;

  @IsBoolean()
  @IsOptional()
  hasBankIntegration?: boolean;

  @IsBoolean()
  @IsOptional()
  hasTelegramBot?: boolean;

  @IsBoolean()
  @IsOptional()
  hasSmsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  hasExcelImport?: boolean;

  @IsBoolean()
  @IsOptional()
  hasPdfReports?: boolean;

  @IsBoolean()
  @IsOptional()
  allowSubOrganizations?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  clientLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => parseInt(value))
  departmentLimit?: number;
}