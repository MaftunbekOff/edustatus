import { IsString, IsOptional, IsNumber, IsEmail, IsDateString, Min, MaxLength, Matches } from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{14}$/, { message: 'PINFL must be exactly 14 digits' })
  pinfl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contractNumber?: string;

  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'Phone number must be valid' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(active|inactive|archived)$/, { message: 'Status must be active, inactive, or archived' })
  status?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: 'Contact phone must be valid' })
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
